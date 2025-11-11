import asyncio
import logging
import time
from datetime import datetime
from typing import Any, Dict, Optional

from .http import HttpClient
from .models import (
    AddressResponse,
    AssetMetadataResponse,
    ChannelFees,
    ConnectPeerRequest,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    ExecuteMakerSwapRequest,
    ExecuteMakerSwapResponse,
    GetAssetMetadataRequest,
    GetLspInfoResponse,
    GetOrderRequest,
    GetSwapStatusRequest,
    GetSwapStatusResponse,
    InitMakerSwapRequest,
    InitMakerSwapResponse,
    ListAssetsResponse,
    ListPairsResponse,
    ListPeersResponse,
    NetworkInfoResponse,
    NodeInfoResponse,
    OrderHistoryRequest,
    OrderHistoryResponse,
    OrderResponse,
    OrderStatsResponse,
    QuoteRequest,
    QuoteResponse,
    RateDecisionRequest,
    RateDecisionResponse,
    RetryDeliveryRequest,
    RetryDeliveryResponse,
    SwapNodeInfo,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    SwapStatus,
    TradingPair,
    WhitelistTradeRequest,
)
from .websocket import WebSocketClient

logger = logging.getLogger(__name__)


class KaleidoClient:
    """Main client for interacting with the Kaleidoswap API and node."""

    def __init__(
        self,
        api_url: str,
        node_url: str,
        api_key: Optional[str] = None,
        ping_interval: int = 30,
        ping_timeout: int = 10,
        close_timeout: int = 10,
        max_size: int = 2**20,
        max_queue: int = 32,
        compression: Optional[str] = None,
    ):
        """Initialize the Kaleido client.

        Args:
            api_url: Base URL for the API proxy
            node_url: Base URL for the node
            api_key: Optional API key for authentication
            ping_interval: WebSocket ping interval in seconds
            ping_timeout: WebSocket ping timeout in seconds
            close_timeout: WebSocket close timeout in seconds
            max_size: Maximum message size in bytes
            max_queue: Maximum message queue size
            compression: Optional compression method
        """
        self.api_client = HttpClient(api_url, api_key)
        self.node_client = HttpClient(node_url, api_key)
        self.ws_client = WebSocketClient(
            api_url.replace("http", "ws"),
            self.api_client,
            ping_interval=ping_interval,
            ping_timeout=ping_timeout,
            close_timeout=close_timeout,
            max_size=max_size,
            max_queue=max_queue,
            compression=compression,
        )

    async def close(self):
        """Closes any open connections (HTTP client sessions, WebSocket)."""
        await self.api_client.close()
        await self.node_client.close()
        await self.ws_client.disconnect()

    async def complete_maker_swap(
        self,
        request: InitMakerSwapRequest,
        timeout: int = 3600,
    ) -> SwapStatus:
        """Complete a maker swap in one call.

        Args:
            request: InitMakerSwapRequest containing swap:
                from_asset: Source asset ID
                to_asset: Destination asset ID
                from_amount: Amount of source asset in millisats
                to_amount: Amount of destination asset in millisats
                rfq_id: RFQ ID from quote
            timeout: Swap timeout in seconds

        Returns:
            Final swap status
        """
        try:
            # Initialize swap
            try:
                request = InitMakerSwapRequest(
                    rfq_id=request.rfq_id,
                    from_asset=request.from_asset,
                    to_asset=request.to_asset,
                    from_amount=request.from_amount,
                    to_amount=request.to_amount,
                )
                init_result = await self.init_maker_swap(request)
            except Exception as e:
                logger.error(f"Error initializing swap: {e}")
                raise e

            # Whitelist trade from taker
            try:
                whitelist_request = WhitelistTradeRequest(
                    swapstring=init_result.swapstring
                )
                await self.whitelist_trade(whitelist_request)
            except Exception as e:
                logger.error(f"Error whitelisting trade: {e}")
                raise e

            # Execute swap from maker
            taker_pubkey = await self.get_node_pubkey()
            try:
                await self.execute_maker_swap(
                    request=ExecuteMakerSwapRequest(
                        swapstring=init_result.swapstring,
                        payment_hash=init_result.payment_hash,
                        taker_pubkey=taker_pubkey,
                    )
                )
            except Exception as e:
                logger.error(f"Error executing swap: {e}")
                raise e

            # Wait for swap to complete
            try:
                swap_status_request = GetSwapStatusRequest(
                    payment_hash=init_result.payment_hash
                )
                swap_status = await self.wait_for_swap_completion(
                    swap_status_request, timeout=timeout
                )
                if swap_status.status == "Succeeded":
                    return swap_status
                else:
                    raise Exception(f"Swap failed with status: {swap_status.status}")
            except Exception as e:
                logger.error(f"Error waiting for swap completion: {e}")
                raise e
        except Exception as e:
            logger.error(f"Error completing swap: {e}")
            raise e

    async def connect(self) -> None:
        """Connect to WebSocket server."""
        await self.ws_client.connect()

    async def connect_peer(self, request: ConnectPeerRequest) -> Dict[str, Any]:
        """Connect to a peer.

        Args:
            request: ConnectPeerRequest containing peer:
                peer_pubkey_and_addr: Peer public key and address
        """
        return await self.node_client.post("/connectpeer", request.model_dump())

    async def create_order(self, request: CreateOrderRequest) -> OrderResponse:
        """Create an order.

        Args:
            request: CreateOrderRequest containing order:
                order_id: Order ID
                order_type: Order type
                order_status: Order status
                order_amount: Order amount
                order_price: Order price
                order_currency: Order currency

        Returns:
            OrderResponse containing order creation response
        """
        response = await self.api_client.post(
            "/lsps1/create_order", request.model_dump(exclude_none=True)
        )
        return OrderResponse.model_validate(response)

    async def create_swap_order(
        self, request: CreateSwapOrderRequest
    ) -> CreateSwapOrderResponse:
        """Create a swap order.

        Args:
            request: CreateSwapOrderRequest containing:
                rfq_id: RFQ ID from quote
                from_type: Input settlement type (LIGHTNING or ONCHAIN)
                to_type: Output settlement type (LIGHTNING or ONCHAIN)
                min_onchain_conf: Minimum onchain confirmations (optional)
                dest_bolt11: Destination Lightning invoice (optional)
                dest_onchain_address: Destination onchain address (optional)
                dest_rgb_invoice: Destination RGB invoice (optional)
                refund_address: Refund address for failed orders (optional)
                email: Email for notifications (optional)

        Returns:
            CreateSwapOrderResponse containing order creation details
        """
        response = await self.api_client.post(
            "/swaps/orders", request.model_dump(exclude_none=True)
        )
        return CreateSwapOrderResponse.model_validate(response)

    async def disconnect(self) -> None:
        """Disconnect from WebSocket server."""
        await self.ws_client.disconnect()

    async def estimate_fees(self, request: CreateOrderRequest) -> ChannelFees:
        """Estimate fees for an order without creating it.

        Args:
            request: CreateOrderRequest containing order parameters:
                client_pubkey: Client's public key
                lsp_balance_sat: LSP balance in satoshis
                client_balance_sat: Client balance in satoshis
                required_channel_confirmations: Required confirmations
                funding_confirms_within_blocks: Funding confirms within blocks
                channel_expiry_blocks: Channel expiry blocks
                token: Optional discount token
                refund_onchain_address: Refund address
                announce_channel: Whether to announce channel
                asset_id: Optional asset ID
                lsp_asset_amount: Optional LSP asset amount
                client_asset_amount: Optional client asset amount
                rfq_id: Optional RFQ ID (required when client_asset_amount > 0)

        Returns:
            ChannelFees containing fee breakdown
        """
        response = await self.api_client.post(
            "/lsps1/estimate_fees", request.model_dump(exclude_none=True)
        )
        return ChannelFees.model_validate(response)

    async def execute_maker_swap(
        self,
        request: ExecuteMakerSwapRequest,
    ) -> ExecuteMakerSwapResponse:
        """Execute a maker swap.

        Args:
            request: ExecuteMakerSwapRequest containing swap:
                swapstring: Swap string from initialization
                payment_hash: Payment hash from initialization
                taker_pubkey: Taker's public key

        Returns:
            ExecuteMakerSwapResponse containing execution status
        """
        response = await self.api_client.post("/swaps/execute", request.model_dump())
        return ExecuteMakerSwapResponse.model_validate(response)

    async def get_asset_metadata(
        self, request: GetAssetMetadataRequest
    ) -> AssetMetadataResponse:
        """Get asset metadata.

        Args:
            request: GetAssetMetadataRequest containing asset:
                asset_id: Asset ID

        Returns:
            AssetMetadataResponse containing asset metadata
        """
        response = await self.node_client.post("/assetmetadata", request.model_dump())
        return AssetMetadataResponse.model_validate(response)

    async def get_lsp_connection_url(self) -> str:
        """Get LSP connection URL.

        Returns:
            LSP connection URL
        """
        lsp_info = await self.get_lsp_info()
        return lsp_info.lsp_connection_url

    async def get_lsp_info(self) -> GetLspInfoResponse:
        """Get LSP information.
        Returns:
            Dict containing LSP info
        """
        response = await self.api_client.get("/lsps1/get_info")
        return GetLspInfoResponse.model_validate(response)

    async def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information.

        Returns:
            NetworkInfoResponse containing LSP network info
        """
        response = await self.api_client.get("/lsps1/network_info")
        return NetworkInfoResponse.model_validate(response)

    async def get_lsp_node_info(self) -> NodeInfoResponse:
        """Get full node information directly from the node.

        Returns:
            NodeInfoResponse containing detailed node info
        """
        response = await self.node_client.get("/nodeinfo")
        return NodeInfoResponse.model_validate(response)

    async def get_node_info(self) -> NodeInfoResponse:
        """Get node information including pubkey.

        Returns:
            NodeInfoResponse containing node info including pubkey
        """
        response = await self.node_client.get("/nodeinfo")
        return NodeInfoResponse.model_validate(response)

    async def get_node_pubkey(self) -> str:
        """Get node public key.

        Returns:
            Node public key
        """
        node_info = await self.get_node_info()
        if not node_info.pubkey:
            raise ValueError("Could not get node pubkey")
        return node_info.pubkey

    async def get_onchain_address(self) -> AddressResponse:
        """Get onchain address.

        Returns:
            AddressResponse containing onchain address
        """
        response = await self.node_client.post("/address", {})
        return AddressResponse.model_validate(response)

    async def get_order(self, request: GetOrderRequest) -> OrderResponse:
        """Get an order by ID.

        Args:
            request: GetOrderRequest containing order:
                order_id: Order ID

        Returns:
            OrderResponse containing order details
        """
        response = await self.api_client.post("/lsps1/get_order", request.model_dump())
        return OrderResponse.model_validate(response)

    async def get_order_analytics(self) -> OrderStatsResponse:
        """Get order statistics and analytics.

        Returns:
            OrderStatsResponse containing order statistics
        """
        response = await self.api_client.get("/swaps/orders/analytics")
        return OrderStatsResponse.model_validate(response)

    async def get_order_history(
        self, request: OrderHistoryRequest = None
    ) -> OrderHistoryResponse:
        """Get order history with optional filtering.

        Args:
            request: OrderHistoryRequest containing (optional):
                status: Filter by order status
                limit: Maximum number of orders to return (default 50)
                skip: Number of orders to skip for pagination (default 0)

        Returns:
            OrderHistoryResponse containing order history
        """
        params = {}
        if request:
            if request.status:
                params["status"] = request.status.value
            if request.limit:
                params["limit"] = request.limit
            if request.skip:
                params["skip"] = request.skip

        response = await self.api_client.get("/swaps/orders/history", params=params)
        return OrderHistoryResponse.model_validate(response)

    async def get_pair_by_assets(
        self, base_asset: str, quote_asset: str
    ) -> Optional[TradingPair]:
        """Get trading pair by base and quote assets.

        Args:
            base_asset: Base asset ID
            quote_asset: Quote asset ID

        Returns:
            TradingPair containing pair information or None if not found
        """
        pairs_response = await self.list_pairs()
        for pair in pairs_response.pairs:
            if pair.base_asset_id == base_asset and pair.quote_asset_id == quote_asset:
                return pair
            if pair.quote_asset_id == base_asset and pair.base_asset_id == quote_asset:
                return pair
        return None

    async def get_quote(
        self,
        request: QuoteRequest,
    ) -> QuoteResponse:
        """Get a quote for swapping assets.

        Args:
            request: QuoteRequest containing quote:
                from_asset: Source asset ID
                to_asset: Destination asset ID
                from_amount: Amount in millisats

        Returns:
            QuoteResponse containing quote information
        """
        response = await self.api_client.post("/market/quote", request.model_dump())
        return QuoteResponse.model_validate(response)

    async def get_quote_websocket(
        self,
        request: QuoteRequest,
    ) -> QuoteResponse:
        """Get a quote for swapping assets using websocket.

        Args:
            request: QuoteRequest containing quote:
                from_asset: Source asset ID
                to_asset: Destination asset ID
                from_amount: Amount in millisats

        Returns:
            QuoteResponse containing quote information

        Raises:
            Exception: If there is an error in the quote response
            RuntimeError: If WebSocket is not connected
        """
        # Ensure WebSocket is connected
        if not self.ws_client._ws:
            await self.connect()

        # Create a future to wait for the response
        response_future = asyncio.Future()

        # Create the quote message
        quote_message = {
            "action": "quote_request",
            "from_asset": request.from_asset,
            "to_asset": request.to_asset,
            "from_amount": request.from_amount,
            "timestamp": int(time.time()),
        }

        # Register a one-time handler for the quote response
        async def quote_handler(response: Dict[str, Any]) -> None:
            if not response_future.done():
                if "error" in response and response["error"]:
                    response_future.set_exception(
                        Exception(f"WebSocket quote error: {response['error']}")
                    )
                else:
                    response_future.set_result(response.get("data", {}))

        # Register the handler
        self.ws_client.on("quote_response", quote_handler)

        try:
            # Send the quote request
            await self.ws_client.send(quote_message)

            # Wait for the response with a timeout
            quote_data = await asyncio.wait_for(response_future, timeout=30)
            return QuoteResponse.model_validate(quote_data)

        finally:
            # Clean up the handler
            self.ws_client.off("quote_response", quote_handler)

    async def get_swap_node_info(self) -> SwapNodeInfo:
        """Get simplified node information via the swaps API.

        Returns:
            SwapNodeInfo containing pubkey, network, and block_height
        """
        response = await self.api_client.get("/swaps/nodeinfo")
        return SwapNodeInfo.model_validate(response)

    async def get_swap_order_status(
        self, request: SwapOrderStatusRequest
    ) -> SwapOrderStatusResponse:
        """Get the status of a swap order.

        Args:
            request: SwapOrderStatusRequest containing:
                order_id: Order ID

        Returns:
            SwapOrderStatusResponse containing order status
        """
        response = await self.api_client.post(
            "/swaps/orders/status", request.model_dump()
        )
        return SwapOrderStatusResponse.model_validate(response)

    async def get_swap_status(
        self, request: GetSwapStatusRequest
    ) -> GetSwapStatusResponse:
        """Get the status of a swap.

        Args:
            request: GetSwapStatusRequest containing swap:
                payment_hash: Payment hash from whitelist

        Returns:
            GetSwapStatusResponse containing swap status information
        """
        response = await self.api_client.post(
            "/swaps/atomic/status", request.model_dump()
        )
        return GetSwapStatusResponse.model_validate(response)

    async def init_maker_swap(
        self,
        request: InitMakerSwapRequest,
    ) -> InitMakerSwapResponse:
        """Initialize a maker swap.

        Args:
            request: InitMakerSwapRequest containing swap:
                rfq_id: Request for Quote ID
                from_asset: Source asset ID
                to_asset: Destination asset ID
                from_amount: Amount of source asset in millisats
                to_amount: Amount of destination asset in millisats

        Returns:
            InitMakerSwapResponse containing swap initialization details
        """
        response = await self.api_client.post("/swaps/init", request.model_dump())
        return InitMakerSwapResponse.model_validate(response)

    async def list_assets(self) -> ListAssetsResponse:
        """List available assets.

        Returns:
            ListAssetsResponse containing list of assets
        """
        response = await self.api_client.get("/market/assets")
        return ListAssetsResponse.model_validate(response)

    async def list_pairs(self) -> ListPairsResponse:
        """List available trading pairs.

        Returns:
            ListPairsResponse containing list of trading pairs
        """
        response = await self.api_client.get("/market/pairs")
        return ListPairsResponse.model_validate(response)

    async def list_peers(self) -> ListPeersResponse:
        """List connected peers.

        Returns:
            ListPeersResponse containing list of connected peers
        """
        response = await self.node_client.get("/listpeers")
        return ListPeersResponse.model_validate(response)

    def on(self, action: str, handler: Any) -> None:
        """Register handler for WebSocket events.

        Args:
            action: Action to handle
            handler: Async function to handle the action
        """
        self.ws_client.on(action, handler)

    async def rate_decision(self, request: RateDecisionRequest) -> RateDecisionResponse:
        """Rate a decision for an order.

        Args:
            request: RateDecisionRequest containing order:
                order_id: Order ID
                accept_new_rate: Whether to accept the new rate

        Returns:
            RateDecisionResponse containing rated decision
        """
        response = await self.api_client.post(
            "/lsps1/rate_decision", request.model_dump(exclude_none=True)
        )
        return RateDecisionResponse.model_validate(response)

    async def retry_delivery(
        self, request: RetryDeliveryRequest
    ) -> RetryDeliveryResponse:
        """Retry asset delivery for an order.

        Args:
            request: RetryDeliveryRequest containing order:
                order_id: Order ID to retry asset delivery for

        Returns:
            RetryDeliveryResponse containing retry status
        """
        response = await self.api_client.post(
            "/lsps1/retry_delivery", request.model_dump(exclude_none=True)
        )
        return RetryDeliveryResponse.model_validate(response)

    async def swap_order_rate_decision(
        self, request: SwapOrderRateDecisionRequest
    ) -> SwapOrderRateDecisionResponse:
        """Handle rate decision for a swap order.

        Args:
            request: SwapOrderRateDecisionRequest containing:
                order_id: Swap order ID
                accept_new_rate: True to accept new rate, False to request refund

        Returns:
            SwapOrderRateDecisionResponse containing decision result
        """
        response = await self.api_client.post(
            "/swaps/orders/rate_decision", request.model_dump()
        )
        return SwapOrderRateDecisionResponse.model_validate(response)

    async def wait_for_swap_completion(
        self, request: GetSwapStatusRequest, timeout: int = 3600, poll_interval: int = 5
    ) -> SwapStatus:
        """Wait for a swap to complete.

        Args:
            request: GetSwapStatusRequest containing swap:
                payment_hash: Payment hash from whitelist

        Returns:
            Final swap status

        Raises:
            TimeoutError: If swap doesn't complete within timeout
        """
        start_time = datetime.now()
        while True:
            swap_status_response = await self.get_swap_status(request)
            if swap_status_response.swap.status in ["Succeeded", "Failed", "Expired"]:
                return swap_status_response.swap

            if (datetime.now() - start_time).total_seconds() > timeout:
                raise TimeoutError(f"Swap did not complete within {timeout} seconds")

            await asyncio.sleep(poll_interval)

    async def whitelist_trade(self, request: WhitelistTradeRequest) -> Dict[str, Any]:
        """Whitelist a trade by swapstring.

        Args:
            request: WhitelistTradeRequest containing trade:
                swapstring: Swap string from maker

        Returns:
            Dict containing whitelist status
        """
        return await self.node_client.post("/taker", request.model_dump())

    # Context manager support
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.close()
