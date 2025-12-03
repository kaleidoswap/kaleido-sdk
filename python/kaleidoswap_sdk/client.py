"""
Kaleidoswap SDK Client

This is a thin wrapper around the auto-generated OpenAPI clients,
providing convenience methods, retry logic, and enhanced error handling.

Generated clients used internally:
- Kaleidoswap API client (for Kaleidoswap Maker API)
- RGB Node client (for RGB Lightning Node API)
"""

import asyncio
import logging
import time
from decimal import Decimal
from typing import Any, Dict, List, Optional

from .generated.kaleido.types import Unset

# Import generated clients
from .generated.kaleido.client import Client as KaleidoApiClient
from .generated.rgb_node.client import Client as RgbNodeClient

# Import generated API functions
from .generated.kaleido.api.market import (
    list_assets_api_v1_market_assets_get,
    get_pairs_api_v1_market_pairs_get,
    get_quote_api_v1_market_quote_post,
)
from .generated.kaleido.api.lsps1 import (
    get_info_api_v1_lsps1_get_info_get,
    get_network_info_api_v1_lsps1_network_info_get,
    create_order_api_v1_lsps1_create_order_post,
    get_order_api_v1_lsps1_get_order_post,
    estimate_fees_api_v1_lsps1_estimate_fees_post,
    handle_rate_decision_api_v1_lsps1_rate_decision_post,
    retry_delivery_api_v1_lsps1_retry_delivery_post,
)
from .generated.kaleido.api.swaps import (
    initiate_swap_api_v1_swaps_init_post,
    confirm_swap_api_v1_swaps_execute_post,
    get_swap_status_api_v1_swaps_atomic_status_post,
    get_node_info_api_v1_swaps_nodeinfo_get,
)
from .generated.kaleido.api.swap_orders import (
    create_swap_order_api_v1_swaps_orders_post,
    get_swap_order_status_api_v1_swaps_orders_status_post,
    get_order_history_api_v1_swaps_orders_history_get,
    get_order_stats_api_v1_swaps_orders_analytics_get,
    handle_swap_order_rate_decision_api_v1_swaps_orders_rate_decision_post,
)

# Import all model types from centralized models module
from .models import (
    AssetsResponse,
    PairResponse,
    Asset,
    TradingPair,
    PairQuoteRequest,
    PairQuoteResponse,
    SwapRequest,
    SwapResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    SwapStatusRequest,
    SwapStatusResponse,
    GetInfoResponseModel,
    NetworkInfoResponse,
    NodeInfoResponse,
    CreateOrderRequest,
    OrderResponse,
    GetOrderRequest,
    ChannelFees,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    RateDecisionRequest,
    RateDecisionResponse,
    RetryDeliveryRequest,
    RetryDeliveryResponse,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,
    TakerRequest,
)

# Import legacy HTTP client and models for backward compatibility
from .http import HttpClient
from .websocket import WebSocketClient

logger = logging.getLogger(__name__)


class KaleidoClient:
    """
    Kaleidoswap SDK Client

    A high-level client for interacting with Kaleidoswap Maker API and RGB Lightning Node.

    This client wraps auto-generated OpenAPI clients with convenience methods,
    caching, retry logic, and enhanced error handling.

    The RGB Lightning Node (node_url) is OPTIONAL. Many operations only require
    the Maker API:
    - Market data (list_assets, list_pairs, get_quote)
    - Swap operations (init_maker_swap, execute_maker_swap, get_swap_status)
    - Swap orders (create_swap_order, get_swap_order_status)
    - LSPS1 operations (get_lsp_info, create_order)

    RGB Node is required only for:
    - Direct node operations (whitelist_trade, connect_peer, list_peers)
    - On-chain operations (get_onchain_address, get_asset_metadata)

    Args:
        base_url: Base URL for the Kaleidoswap Maker API (default: regtest)
        node_url: Optional URL for the RGB Lightning Node (default: None)
        api_key: Optional API key for authentication (default: None)
        timeout: Request timeout in seconds (default: 30)
        max_retries: Maximum number of retries for failed requests (default: 3)
        **kwargs: Additional arguments passed to the underlying HTTP client

    Example:
        # Maker-only operations (no node required)
        client = KaleidoClient(base_url="https://api.staging.kaleidoswap.com")
        assets = await client.list_assets()
        quote = await client.get_quote("btc", "usdt", from_amount=100000)

        # With RGB Node for additional operations
        client = KaleidoClient(
            base_url="https://api.staging.kaleidoswap.com",
            node_url="http://localhost:3001"
        )
        address = await client.get_onchain_address()
    """

    def __init__(
        self,
        base_url: Optional[str] = "https://api.regtest.kaleidoswap.com",
        node_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        **kwargs: Any,
    ):
        """Initialize the Kaleidoswap client."""
        self.base_url = base_url
        self.node_url = node_url
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries

        # Initialize generated clients
        self._kaleido_api: Optional[KaleidoApiClient] = None
        if base_url:
            self._kaleido_api = KaleidoApiClient(base_url=base_url)

        self._rgb_node_api: Optional[RgbNodeClient] = None
        if node_url:
            self._rgb_node_api = RgbNodeClient(base_url=node_url)

        # Legacy HTTP clients (for backward compatibility)
        self._http_client: Optional[HttpClient] = None
        if base_url:
            self._http_client = HttpClient(base_url=base_url, api_key=api_key)
        self._node_http_client: Optional[HttpClient] = None
        if node_url:
            self._node_http_client = HttpClient(base_url=node_url)

        # WebSocket client
        self._ws_client: Optional[WebSocketClient] = None
        if base_url and self._http_client:
            ws_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
            self._ws_client = WebSocketClient(
                base_url=ws_url, http_client=self._http_client
            )

        # Caching
        self._assets_cache: List[Asset] = []
        self._assets_cache_timestamp: Optional[float] = None
        self._pairs_cache: List[TradingPair] = []
        self._pairs_cache_timestamp: Optional[float] = None
        self._cache_ttl = 300.0  # 5 minutes

    async def close(self):
        """Close all open connections."""
        if self._kaleido_api and hasattr(self._kaleido_api, "get_async_httpx_client"):
            await self._kaleido_api.get_async_httpx_client().aclose()
        if self._rgb_node_api and hasattr(self._rgb_node_api, "get_async_httpx_client"):
            await self._rgb_node_api.get_async_httpx_client().aclose()
        if self._ws_client:
            try:
                await self._ws_client.disconnect()
            except Exception as exc:
                logger.warning("Error disconnecting WebSocket client: %s", exc)
        if self._http_client:
            await self._http_client.close()
        if self._node_http_client:
            try:
                await self._node_http_client.close()
            except Exception as exc:
                logger.warning("Error closing node HTTP client: %s", exc)

    def _cache_valid(self, timestamp: Optional[float]) -> bool:
        """Check if cache timestamp is still valid."""
        return timestamp is not None and (time.time() - timestamp) < self._cache_ttl

    @property
    def has_node(self) -> bool:
        """Check if RGB Lightning Node is configured."""
        return self._rgb_node_api is not None

    async def _refresh_assets_cache(self) -> List[Asset]:
        """Refresh the assets cache from the API."""
        self._ensure_api_client()
        response = await list_assets_api_v1_market_assets_get.asyncio(
            client=self._kaleido_api
        )
        if response and hasattr(response, "assets"):
            # Convert generated models to legacy Asset format
            assets = []
            for asset_data in response.assets:
                asset_dict = (
                    asset_data.to_dict()
                    if hasattr(asset_data, "to_dict")
                    else asset_data
                )
                assets.append(asset_dict)
            self._assets_cache = assets
            self._assets_cache_timestamp = time.time()
        return self._assets_cache

    async def _get_cached_assets(self, force_refresh: bool = False) -> List[Asset]:
        """Get assets from cache or refresh if needed."""
        if force_refresh or not self._cache_valid(self._assets_cache_timestamp):
            return await self._refresh_assets_cache()
        return self._assets_cache

    async def _refresh_pairs_cache(self) -> List[TradingPair]:
        """Refresh the pairs cache from the API."""
        self._ensure_api_client()
        response = await get_pairs_api_v1_market_pairs_get.asyncio(
            client=self._kaleido_api
        )
        if response and hasattr(response, "pairs"):
            # Convert generated models to legacy TradingPair format
            pairs = []
            for pair_data in response.pairs:
                pair_dict = (
                    pair_data.to_dict() if hasattr(pair_data, "to_dict") else pair_data
                )
                pairs.append(pair_dict)
            self._pairs_cache = pairs
            self._pairs_cache_timestamp = time.time()
        return self._pairs_cache

    async def _get_cached_pairs(self, force_refresh: bool = False) -> List[TradingPair]:
        """Get pairs from cache or refresh if needed."""
        if force_refresh or not self._cache_valid(self._pairs_cache_timestamp):
            return await self._refresh_pairs_cache()
        return self._pairs_cache

    def _ensure_api_client(self):
        """Ensure API client is initialized.

        Raises:
            RuntimeError: If base_url was not provided during initialization.
        """
        if not self._kaleido_api:
            raise RuntimeError(
                "API client is not initialized. Please provide 'base_url' when creating KaleidoClient."
            )

    def _ensure_node_client(self):
        """Ensure RGB node client is initialized.

        Raises:
            ValueError: If node_url was not provided during initialization.
        """
        if not self._rgb_node_api:
            raise ValueError(
                "RGB Lightning Node is not configured. This operation requires a node. "
                "Please provide node_url when initializing the client:\n"
                "  client = KaleidoClient(base_url='...', node_url='http://localhost:3001')"
            )

    # ============================================================
    # Market Data Methods
    # ============================================================

    async def list_assets(self) -> AssetsResponse:
        """List all available assets."""
        self._ensure_api_client()
        response = await list_assets_api_v1_market_assets_get.asyncio(
            client=self._kaleido_api
        )
        # Update cache
        if response:
            await self._refresh_assets_cache()
        return response

    async def list_pairs(self) -> PairResponse:
        """List all available trading pairs."""
        self._ensure_api_client()
        response = await get_pairs_api_v1_market_pairs_get.asyncio(
            client=self._kaleido_api
        )
        # Update cache
        if response:
            await self._refresh_pairs_cache()
        return response

    async def get_quote(
        self,
        request: Optional[PairQuoteRequest] = None,
        from_asset: Optional[str] = None,
        to_asset: Optional[str] = None,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> PairQuoteResponse:
        """
        Get a quote for swapping assets.

        Either from_amount or to_amount must be provided, but not both.

        Args:
            request: QuoteRequest object (preferred)
            from_asset: Asset ID to swap from (alternative to request)
            to_asset: Asset ID to swap to (alternative to request)
            from_amount: Amount of from_asset (in atomic units)
            to_amount: Amount of to_asset (in atomic units)

        Returns:
            Quote response with price and fee information
        """
        self._ensure_api_client()
        if request is None:
            request = PairQuoteRequest(
                from_asset=from_asset,
                to_asset=to_asset,
                from_amount=from_amount,
                to_amount=to_amount,
            )
        return await get_quote_api_v1_market_quote_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def get_quote_websocket(
        self,
        request: Optional[PairQuoteRequest] = None,
        from_asset: Optional[str] = None,
        to_asset: Optional[str] = None,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> PairQuoteResponse:
        """Get a quote via WebSocket for real-time updates."""
        if not self._ws_client:
            raise RuntimeError(
                "WebSocket client is not initialized. Please provide 'base_url' when creating KaleidoClient."
            )
        # Use legacy WebSocket client
        if not self._ws_client.is_connected():
            await self._ws_client.connect()

        # Handle both request object and individual parameters
        if request is not None:
            # Get values from request, handling Unset values
            if hasattr(request, "from_asset"):
                val = getattr(request, "from_asset")
                if not isinstance(val, Unset):
                    from_asset = val
            if hasattr(request, "to_asset"):
                val = getattr(request, "to_asset")
                if not isinstance(val, Unset):
                    to_asset = val
            if hasattr(request, "from_amount"):
                val = getattr(request, "from_amount")
                if not isinstance(val, Unset):
                    from_amount = val
            if hasattr(request, "to_amount"):
                val = getattr(request, "to_amount")
                if not isinstance(val, Unset):
                    to_amount = val

        # Build message, excluding None and Unset values
        if not self._ws_client:
            raise RuntimeError(
                "WebSocket client is not initialized. Please provide 'base_url' when creating KaleidoClient."
            )
        message = {
            "action": "quote_request",
            "timestamp": int(time.time()),
        }

        if from_asset is not None and not isinstance(from_asset, Unset):
            message["from_asset"] = from_asset
        if to_asset is not None and not isinstance(to_asset, Unset):
            message["to_asset"] = to_asset
        if from_amount is not None and not isinstance(from_amount, Unset):
            message["from_amount"] = from_amount
        if to_amount is not None and not isinstance(to_amount, Unset):
            message["to_amount"] = to_amount

        response = await self._ws_client.send_and_wait(
            message, "quote_response", timeout=30.0
        )

        # Extract quote data from WebSocket response and convert to PairQuoteResponse
        if isinstance(response, dict) and "data" in response:
            quote_data = response["data"]
            return PairQuoteResponse.from_dict(quote_data)

        # If response is already in the right format, convert it directly
        return PairQuoteResponse.from_dict(response)

    # ============================================================
    # Swap Methods
    # ============================================================

    async def init_maker_swap(self, request: SwapRequest) -> SwapResponse:
        """Initialize a maker swap."""
        self._ensure_api_client()
        return await initiate_swap_api_v1_swaps_init_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def execute_maker_swap(
        self, request: ConfirmSwapRequest
    ) -> ConfirmSwapResponse:
        """Execute a maker swap."""
        self._ensure_api_client()
        return await confirm_swap_api_v1_swaps_execute_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def get_swap_status(
        self,
        request: Optional[SwapStatusRequest] = None,
        payment_hash: Optional[str] = None,
    ) -> SwapStatusResponse:
        """Get the status of a swap."""
        self._ensure_api_client()
        if request is None:
            request = SwapStatusRequest(payment_hash=payment_hash)
        return await get_swap_status_api_v1_swaps_atomic_status_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def complete_maker_swap(
        self,
        rfq_id: str,
        from_asset: str,
        to_asset: str,
        from_amount: int,
        to_amount: int,
        taker_pubkey: str,
    ) -> Dict[str, Any]:
        """
        Complete a maker swap in one call (init + execute).

        This is a convenience method that combines init and execute steps.
        """
        # Initialize swap
        init_req = SwapRequest(
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=from_amount,
            to_amount=to_amount,
        )
        init_response = await self.init_maker_swap(init_req)

        # Execute swap
        execute_req = ConfirmSwapRequest(
            swapstring=init_response.swapstring,
            payment_hash=init_response.payment_hash,
            taker_pubkey=taker_pubkey,
        )
        execute_response = await self.execute_maker_swap(execute_req)

        return {
            "swapstring": init_response.swapstring,
            "payment_hash": init_response.payment_hash,
            "status": (
                execute_response.status if hasattr(execute_response, "status") else None
            ),
            "message": (
                execute_response.message
                if hasattr(execute_response, "message")
                else None
            ),
        }

    async def complete_swap(self, request: SwapRequest) -> ConfirmSwapResponse:
        """
        Complete a swap in one call (init + execute).

        This is an alias for the complete_maker_swap flow that takes a SwapRequest.
        """
        # Get taker pubkey
        taker_pubkey = await self.get_node_pubkey()

        # Initialize swap
        init_response = await self.init_maker_swap(request)

        # Execute swap
        execute_req = ConfirmSwapRequest(
            swapstring=init_response.swapstring,
            payment_hash=init_response.payment_hash,
            taker_pubkey=taker_pubkey,
        )
        return await self.execute_maker_swap(execute_req)

    async def wait_for_swap_completion(
        self,
        request: Optional[SwapStatusRequest] = None,
        payment_hash: Optional[str] = None,
        timeout: float = 300.0,
        poll_interval: float = 2.0,
    ):
        """Wait for a swap to complete and return the Swap object."""
        if request is not None:
            payment_hash = (
                request.payment_hash
                if hasattr(request, "payment_hash")
                else payment_hash
            )

        start_time = time.time()

        while (time.time() - start_time) < timeout:
            status_response = await self.get_swap_status(payment_hash=payment_hash)

            if (
                status_response
                and hasattr(status_response, "swap")
                and status_response.swap
            ):
                swap = status_response.swap
                if hasattr(swap, "status"):
                    # Check if status is a string or SwapStatus enum
                    status_value = (
                        swap.status.value
                        if hasattr(swap.status, "value")
                        else swap.status
                    )
                    if status_value in ["Succeeded", "Failed", "Expired"]:
                        return swap

            await asyncio.sleep(poll_interval)

        raise TimeoutError(f"Swap did not complete within {timeout} seconds")

    # ============================================================
    # Swap Orders
    # ============================================================

    async def create_swap_order(
        self, request: CreateSwapOrderRequest
    ) -> CreateSwapOrderResponse:
        """Create a new swap order."""
        self._ensure_api_client()
        return await create_swap_order_api_v1_swaps_orders_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def get_swap_order_status(
        self,
        request: Optional[SwapOrderStatusRequest] = None,
        order_id: Optional[str] = None,
    ) -> SwapOrderStatusResponse:
        """Get the status of a swap order."""
        self._ensure_api_client()
        if request is None:
            request = SwapOrderStatusRequest(order_id=order_id)
        return await get_swap_order_status_api_v1_swaps_orders_status_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def get_order_history(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> OrderHistoryResponse:
        """Get order history with optional filtering."""
        self._ensure_api_client()
        return await get_order_history_api_v1_swaps_orders_history_get.asyncio(
            client=self._kaleido_api,
            status=status,
            limit=limit,
            skip=skip,
        )

    async def get_order_analytics(self) -> OrderStatsResponse:
        """Get order analytics and statistics."""
        self._ensure_api_client()
        response = await get_order_stats_api_v1_swaps_orders_analytics_get.asyncio(
            client=self._kaleido_api
        )
        # Convert status_counts to dict if it has additional_properties
        if response and hasattr(response, "status_counts"):
            status_counts = response.status_counts
            if hasattr(status_counts, "additional_properties"):
                # Create a wrapper that makes status_counts behave like a dict
                class StatsWrapper:
                    def __init__(self, orig_response, status_dict):
                        self._orig = orig_response
                        self.status_counts = status_dict
                        self.filled_orders_volume = getattr(
                            orig_response, "filled_orders_volume", 0
                        )
                        self.filled_orders_count = getattr(
                            orig_response, "filled_orders_count", 0
                        )

                    def __getattr__(self, name):
                        return getattr(self._orig, name)

                return StatsWrapper(response, status_counts.additional_properties)
        return response

    async def swap_order_rate_decision(
        self, request: SwapOrderRateDecisionRequest
    ) -> SwapOrderRateDecisionResponse:
        """Handle rate decision for a swap order."""
        self._ensure_api_client()
        return await handle_swap_order_rate_decision_api_v1_swaps_orders_rate_decision_post.asyncio(
            client=self._kaleido_api, body=request
        )

    # ============================================================
    # LSPS1 / LSP Methods
    # ============================================================

    async def get_lsp_info(self) -> GetInfoResponseModel:
        """Get LSP information."""
        self._ensure_api_client()
        return await get_info_api_v1_lsps1_get_info_get.asyncio(
            client=self._kaleido_api
        )

    async def get_lsp_connection_url(self) -> str:
        """Get the LSP connection URL."""
        info = await self.get_lsp_info()
        return info.lsp_connection_url if hasattr(info, "lsp_connection_url") else ""

    async def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information."""
        self._ensure_api_client()
        return await get_network_info_api_v1_lsps1_network_info_get.asyncio(
            client=self._kaleido_api
        )

    async def create_order(self, request: CreateOrderRequest) -> OrderResponse:
        """Create a new LSPS1 order."""
        self._ensure_api_client()
        return await create_order_api_v1_lsps1_create_order_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def get_order(
        self, request: Optional[GetOrderRequest] = None, order_id: Optional[str] = None
    ) -> OrderResponse:
        """Get an LSPS1 order by ID."""
        self._ensure_api_client()
        if request is None:
            request = GetOrderRequest(order_id=order_id)
        return await get_order_api_v1_lsps1_get_order_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def estimate_fees(self, request: CreateOrderRequest) -> ChannelFees:
        """Estimate fees for an LSPS1 order."""
        self._ensure_api_client()
        return await estimate_fees_api_v1_lsps1_estimate_fees_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def rate_decision(self, request: RateDecisionRequest) -> RateDecisionResponse:
        """Handle rate decision for an LSPS1 order."""
        self._ensure_api_client()
        return await handle_rate_decision_api_v1_lsps1_rate_decision_post.asyncio(
            client=self._kaleido_api, body=request
        )

    async def retry_delivery(
        self, request: RetryDeliveryRequest
    ) -> RetryDeliveryResponse:
        """Retry asset delivery for an order."""
        self._ensure_api_client()
        return await retry_delivery_api_v1_lsps1_retry_delivery_post.asyncio(
            client=self._kaleido_api, body=request
        )

    # ============================================================
    # Node Info
    # ============================================================

    async def get_node_info(self) -> NodeInfoResponse:
        """Get node information.

        If RGB Lightning Node is configured, returns full node information
        including channels and other details. Otherwise, returns basic node
        information from the Kaleidoswap API (pubkey, network, block_height).

        Returns:
            Node information (full or basic depending on configuration)
        """
        # If we have a node configured, get full details from it
        if self.has_node:
            return await self.get_swap_node_info()
        # Otherwise get basic info from API
        self._ensure_api_client()
        return await get_node_info_api_v1_swaps_nodeinfo_get.asyncio(
            client=self._kaleido_api
        )

    async def get_node_pubkey(self) -> str:
        """Get the node's public key."""
        info = await self.get_node_info()
        return info.pubkey if hasattr(info, "pubkey") else ""

    # ============================================================
    # RGB Lightning Node Methods
    # ============================================================
    # NOTE: All methods below require node_url to be configured.
    # Use client.has_node to check if node is available.
    # ============================================================

    async def whitelist_trade(
        self, request: Optional[TakerRequest] = None, swapstring: Optional[str] = None
    ) -> Dict[str, Any]:
        """Whitelist a trade on the RGB Lightning Node.

        Requires: RGB Lightning Node (node_url must be configured)

        Args:
            request: TakerRequest object (preferred)
            swapstring: The swap string to whitelist (alternative)

        Returns:
            Response from the node

        Raises:
            ValueError: If node_url is not configured
        """
        self._ensure_node_client()
        # Import the specific API function when needed
        from .generated.rgb_node.api.swaps import post_taker

        if request is None:
            request = TakerRequest(swapstring=swapstring)
        return await post_taker.asyncio(client=self._rgb_node_api, body=request)

    async def connect_peer(self, request):
        """Connect to a peer on the RGB Lightning Node.

        Requires: RGB Lightning Node (node_url must be configured)

        Raises:
            ValueError: If node_url is not configured
        """
        self._ensure_node_client()
        from .generated.rgb_node.api.peers import post_connectpeer

        return await post_connectpeer.asyncio(client=self._rgb_node_api, body=request)

    async def list_peers(self):
        """List peers on the RGB Lightning Node.

        Requires: RGB Lightning Node (node_url must be configured)

        Raises:
            ValueError: If node_url is not configured
        """
        self._ensure_node_client()
        from .generated.rgb_node.api.peers import get_listpeers

        return await get_listpeers.asyncio(client=self._rgb_node_api)

    async def get_onchain_address(self):
        """Get an onchain address from the RGB Lightning Node.

        Requires: RGB Lightning Node (node_url must be configured)

        Raises:
            ValueError: If node_url is not configured
        """
        self._ensure_node_client()
        from .generated.rgb_node.api.on_chain import post_address

        return await post_address.asyncio(client=self._rgb_node_api)

    async def get_asset_metadata(self, request):
        """Get asset metadata from the RGB Lightning Node.

        Requires: RGB Lightning Node (node_url must be configured)

        Raises:
            ValueError: If node_url is not configured
        """
        self._ensure_node_client()
        from .generated.rgb_node.api.rgb import post_assetmetadata

        return await post_assetmetadata.asyncio(client=self._rgb_node_api, body=request)

    async def get_swap_node_info(self):
        """Get node information for swap operations.

        If RGB Lightning Node is configured, returns full node information
        including channels and other details. Otherwise, returns basic node
        information from the Kaleidoswap API (pubkey, network, block_height).

        This is similar to get_node_info() but can be used specifically for
        swap-related operations.

        Returns:
            Node information (full or basic depending on configuration)
        """
        # If we have a node configured, get full details from it
        if self.has_node:
            from .generated.rgb_node.api.other import get_nodeinfo

            return await get_nodeinfo.asyncio(client=self._rgb_node_api)
        # Otherwise get basic info from API
        self._ensure_api_client()
        return await get_node_info_api_v1_swaps_nodeinfo_get.asyncio(
            client=self._kaleido_api
        )

    # ============================================================
    # Convenience/Utility Methods
    # ============================================================

    async def get_asset_by_ticker(
        self, ticker: str, force_refresh: bool = False
    ) -> Optional[Asset]:
        """Get an asset by its ticker symbol."""
        assets = await self._get_cached_assets(force_refresh=force_refresh)
        ticker_normalized = ticker.upper()
        for asset in assets:
            asset_ticker = (
                asset.get("ticker")
                if isinstance(asset, dict)
                else getattr(asset, "ticker", None)
            )
            if asset_ticker and asset_ticker.upper() == ticker_normalized:
                # Return as object with attributes
                if isinstance(asset, dict):

                    class AssetObj:
                        def __init__(self, data):
                            for k, v in data.items():
                                setattr(self, k, v)

                    return AssetObj(asset)
                return asset
        return None

    async def get_asset_by_id(self, asset_id: str) -> Optional[Asset]:
        """Get an asset by its ID."""
        assets = await self._get_cached_assets()
        for asset in assets:
            if asset.get("asset_id") == asset_id:
                return asset
        return None

    async def get_pair_by_ticker(self, pair_ticker: str) -> Optional[TradingPair]:
        """Get a trading pair by ticker string (e.g., 'BTC/USDT')."""
        # Parse the pair ticker
        if "/" not in pair_ticker:
            raise ValueError(
                f"Invalid pair ticker format: {pair_ticker}. Expected format: 'BASE/QUOTE'"
            )

        base_ticker, quote_ticker = pair_ticker.split("/", 1)
        pairs = await self._get_cached_pairs()
        base_norm = base_ticker.upper()
        quote_norm = quote_ticker.upper()

        for pair in pairs:
            pair_base = (
                pair.get("base_asset")
                if isinstance(pair, dict)
                else getattr(pair, "base_asset", None)
            )
            pair_quote = (
                pair.get("quote_asset")
                if isinstance(pair, dict)
                else getattr(pair, "quote_asset", None)
            )

            if pair_base and pair_quote:
                if pair_base.upper() == base_norm and pair_quote.upper() == quote_norm:
                    # Return as object with attributes
                    if isinstance(pair, dict):

                        class PairObj:
                            def __init__(self, data):
                                for k, v in data.items():
                                    setattr(self, k, v)

                        return PairObj(pair)
                    return pair
        return None

    def _to_raw(self, amount: float, asset: Asset) -> int:
        """Convert display amount to raw atomic units."""
        precision = (
            asset.get("precision", 0)
            if isinstance(asset, dict)
            else getattr(asset, "precision", 0)
        )
        multiplier = 10**precision
        return int(Decimal(str(amount)) * Decimal(str(multiplier)))

    def _to_display(self, amount: int, asset: Asset) -> float:
        """Convert raw atomic units to display amount."""
        precision = (
            asset.get("precision", 0)
            if isinstance(asset, dict)
            else getattr(asset, "precision", 0)
        )
        divisor = 10**precision
        return float(Decimal(str(amount)) / Decimal(str(divisor)))

    async def get_pair_by_assets(
        self, from_asset: str, to_asset: str
    ) -> Optional[TradingPair]:
        """Get a trading pair by asset identifiers (ticker or ID)."""
        pairs = await self._get_cached_pairs()
        assets = await self._get_cached_assets()

        # Normalize input - could be ticker or asset_id
        from_norm = from_asset.upper()
        to_norm = to_asset.upper()

        # Try to find asset IDs if tickers were provided, or confirm IDs
        from_asset_id = from_asset  # Could already be an ID
        to_asset_id = to_asset  # Could already be an ID

        for asset in assets:
            asset_id = (
                asset.get("asset_id")
                if isinstance(asset, dict)
                else getattr(asset, "asset_id", None)
            )
            ticker = (
                asset.get("ticker")
                if isinstance(asset, dict)
                else getattr(asset, "ticker", None)
            )

            # Check if input matches ticker
            if ticker and ticker.upper() == from_norm:
                from_asset_id = asset_id
            # Check if input matches asset_id
            if asset_id == from_asset:
                from_asset_id = asset_id

            # Check if input matches ticker
            if ticker and ticker.upper() == to_norm:
                to_asset_id = asset_id
            # Check if input matches asset_id
            if asset_id == to_asset:
                to_asset_id = asset_id

        # Search for matching pair (try both directions)
        for pair in pairs:
            pair_base = (
                pair.get("base_asset")
                if isinstance(pair, dict)
                else getattr(pair, "base_asset", None)
            )
            pair_quote = (
                pair.get("quote_asset")
                if isinstance(pair, dict)
                else getattr(pair, "quote_asset", None)
            )
            pair_base_id = (
                pair.get("base_asset_id")
                if isinstance(pair, dict)
                else getattr(pair, "base_asset_id", None)
            )
            pair_quote_id = (
                pair.get("quote_asset_id")
                if isinstance(pair, dict)
                else getattr(pair, "quote_asset_id", None)
            )

            # Check by ticker or ID - forward direction (from->to = base->quote)
            base_matches = (
                (pair_base and pair_base.upper() == from_norm)
                or (pair_base_id == from_asset)
                or (pair_base_id == from_asset_id)
            )
            quote_matches = (
                (pair_quote and pair_quote.upper() == to_norm)
                or (pair_quote_id == to_asset)
                or (pair_quote_id == to_asset_id)
            )

            # Also check reverse direction (from->to = quote->base)
            base_matches_rev = (
                (pair_base and pair_base.upper() == to_norm)
                or (pair_base_id == to_asset)
                or (pair_base_id == to_asset_id)
            )
            quote_matches_rev = (
                (pair_quote and pair_quote.upper() == from_norm)
                or (pair_quote_id == from_asset)
                or (pair_quote_id == from_asset_id)
            )

            if (base_matches and quote_matches) or (
                base_matches_rev and quote_matches_rev
            ):
                # Return as object with attributes
                if isinstance(pair, dict):

                    class PairObj:
                        def __init__(self, data):
                            for k, v in data.items():
                                setattr(self, k, v)

                    return PairObj(pair)
                return pair
        return None

    async def get_quote_by_pair(
        self,
        pair_ticker: str,
        from_amount: Optional[float] = None,
        to_amount: Optional[float] = None,
    ) -> PairQuoteResponse:
        """
        Get a quote by pair ticker string.

        Args:
            pair_ticker: Pair ticker string (e.g., 'BTC/USDT')
            from_amount: Amount in display units (not atomic)
            to_amount: Amount in display units (not atomic)

        Returns:
            Quote response
        """
        # Get the pair
        pair = await self.get_pair_by_ticker(pair_ticker)
        if not pair:
            raise ValueError(f"Pair not found: {pair_ticker}")

        # Get assets to convert amounts
        base_asset = await self.get_asset_by_ticker(pair.base_asset)
        quote_asset = await self.get_asset_by_ticker(pair.quote_asset)

        if not base_asset or not quote_asset:
            raise ValueError(f"Could not find assets for pair: {pair_ticker}")

        # Convert display amounts to raw atomic units
        raw_from_amount = None
        raw_to_amount = None

        if from_amount is not None:
            raw_from_amount = self._to_raw(from_amount, base_asset)
        if to_amount is not None:
            raw_to_amount = self._to_raw(to_amount, quote_asset)

        # Get asset IDs
        from_asset_id = (
            base_asset.asset_id
            if hasattr(base_asset, "asset_id")
            else base_asset.get("asset_id")
        )
        to_asset_id = (
            quote_asset.asset_id
            if hasattr(quote_asset, "asset_id")
            else quote_asset.get("asset_id")
        )

        # Get quote
        return await self.get_quote(
            from_asset=from_asset_id,
            to_asset=to_asset_id,
            from_amount=raw_from_amount,
            to_amount=raw_to_amount,
        )

    async def get_quote_by_assets(
        self,
        from_asset: str,
        to_asset: str,
        from_amount: Optional[float] = None,
        to_amount: Optional[float] = None,
    ) -> PairQuoteResponse:
        """
        Get a quote by asset identifiers (ticker or ID).

        Args:
            from_asset: Asset ticker or ID
            to_asset: Asset ticker or ID
            from_amount: Amount in display units (not atomic)
            to_amount: Amount in display units (not atomic)

        Returns:
            Quote response
        """
        # Try to get assets
        from_asset_obj = await self.get_asset_by_ticker(from_asset)
        if not from_asset_obj:
            # Maybe it's an ID
            from_asset_obj = await self.get_asset_by_id(from_asset)

        to_asset_obj = await self.get_asset_by_ticker(to_asset)
        if not to_asset_obj:
            # Maybe it's an ID
            to_asset_obj = await self.get_asset_by_id(to_asset)

        if not from_asset_obj or not to_asset_obj:
            raise ValueError(f"Could not find assets: {from_asset}, {to_asset}")

        # Convert display amounts to raw atomic units
        raw_from_amount = None
        raw_to_amount = None

        if from_amount is not None:
            raw_from_amount = self._to_raw(from_amount, from_asset_obj)
        if to_amount is not None:
            raw_to_amount = self._to_raw(to_amount, to_asset_obj)

        # Get asset IDs
        from_asset_id = (
            from_asset_obj.asset_id
            if hasattr(from_asset_obj, "asset_id")
            else from_asset_obj.get("asset_id")
        )
        to_asset_id = (
            to_asset_obj.asset_id
            if hasattr(to_asset_obj, "asset_id")
            else to_asset_obj.get("asset_id")
        )

        # Get quote
        return await self.get_quote(
            from_asset=from_asset_id,
            to_asset=to_asset_id,
            from_amount=raw_from_amount,
            to_amount=raw_to_amount,
        )

    def convert_amount(
        self, amount: float | int, asset: Asset, to: str = "raw"
    ) -> int | float:
        """
        Convert amount between raw atomic units and display units.

        Args:
            amount: Amount to convert
            asset: Asset object or dict
            to: Target format - "raw" (atomic units) or "display" (human-readable)

        Returns:
            Converted amount (int for raw, float for display)
        """
        if to == "raw":
            return self._to_raw(float(amount), asset)
        elif to == "display":
            return self._to_display(int(amount), asset)
        else:
            raise ValueError(f"Invalid target format: {to}. Must be 'raw' or 'display'")

    async def validate_amount(
        self, amount: float, asset_identifier: str
    ) -> Dict[str, Any]:
        """
        Validate an amount against asset constraints.

        Args:
            amount: Amount in display units
            asset_identifier: Asset ticker or ID

        Returns:
            Dict with validation result:
            - valid: bool
            - normalized_amount: int (raw atomic units)
            - display_amount: float
            - errors: List[str] (if any)
        """
        # Get asset
        asset = await self.get_asset_by_ticker(asset_identifier)
        if not asset:
            asset = await self.get_asset_by_id(asset_identifier)

        if not asset:
            return {
                "valid": False,
                "normalized_amount": 0,
                "display_amount": amount,
                "errors": [f"Asset not found: {asset_identifier}"],
            }

        # Convert to raw atomic units
        raw_amount = self._to_raw(amount, asset)

        # Convert back to display to get normalized value
        display_amount = self._to_display(raw_amount, asset)

        errors = []

        # Basic validation - check if amount is positive
        if raw_amount <= 0:
            errors.append("Amount must be positive")

        # Check minimum amount if available in asset
        min_amount = None
        if isinstance(asset, dict):
            min_amount = asset.get("min_amount")
        elif hasattr(asset, "min_amount"):
            min_amount = asset.min_amount

        if min_amount and raw_amount < min_amount:
            errors.append(
                f"Amount below minimum: {self._to_display(min_amount, asset)}"
            )

        return {
            "valid": len(errors) == 0,
            "normalized_amount": raw_amount,
            "display_amount": display_amount,
            "errors": errors,
        }

    async def refresh_cache(self) -> None:
        """Refresh internal caches for assets and pairs.

        Useful when you know the market data has changed.
        """
        await self._refresh_assets_cache()
        await self._refresh_pairs_cache()

    async def can_trade(self, base_ticker: str, quote_ticker: str) -> bool:
        """Check if a trading pair exists and is tradeable.

        Args:
            base_ticker: Base asset ticker
            quote_ticker: Quote asset ticker

        Returns:
            True if the pair can be traded, False otherwise
        """
        try:
            pair = await self.get_pair_by_ticker(f"{base_ticker}/{quote_ticker}")
            return pair is not None
        except Exception:
            return False

    async def create_swap_order_by_pair(
        self,
        pair_ticker: str,
        amount: float,
        from_type: str,
        to_type: str,
        dest_bolt11: Optional[str] = None,
        dest_rgb_invoice: Optional[str] = None,
        dest_onchain_address: Optional[str] = None,
        refund_address: Optional[str] = None,
        min_onchain_conf: Optional[int] = None,
    ) -> CreateSwapOrderResponse:
        """Create a swap order using a pair ticker.

        Args:
            pair_ticker: Trading pair (e.g., "BTC/USDT")
            amount: Amount in display units
            from_type: Settlement type for from asset (e.g., "LIGHTNING", "ONCHAIN")
            to_type: Settlement type for to asset
            dest_bolt11: Destination Lightning invoice (if to_type is LIGHTNING)
            dest_rgb_invoice: Destination RGB invoice (if needed)
            dest_onchain_address: Destination onchain address (if to_type is ONCHAIN)
            refund_address: Refund address for failed swaps
            min_onchain_conf: Minimum onchain confirmations

        Returns:
            Swap order response
        """
        # Get quote first
        quote = await self.get_quote_by_pair(pair_ticker, from_amount=amount)

        # Create the swap order
        request = CreateSwapOrderRequest(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset,
            to_asset=quote.to_asset,
            from_amount=quote.from_amount,
            from_type=from_type,
            to_type=to_type,
            dest_bolt11=dest_bolt11,
            dest_rgb_invoice=dest_rgb_invoice,
            dest_onchain_address=dest_onchain_address,
            refund_address=refund_address,
            min_onchain_conf=min_onchain_conf,
        )

        return await self.create_swap_order(request)

    async def execute_swap(
        self,
        rfq_id: str,
        from_asset: str,
        to_asset: str,
        from_amount: int,
        to_amount: int,
        taker_pubkey: str,
        wait_for_completion: bool = False,
        timeout: float = 300.0,
        poll_interval: float = 2.0,
    ) -> Dict[str, Any]:
        """Execute a complete atomic swap (init + execute + optionally wait).

        Args:
            rfq_id: Request for quote ID
            from_asset: From asset ID
            to_asset: To asset ID
            from_amount: From amount (raw atomic units)
            to_amount: To amount (raw atomic units)
            taker_pubkey: Taker's public key
            wait_for_completion: Whether to wait for swap completion
            timeout: Timeout in seconds for waiting
            poll_interval: Poll interval in seconds

        Returns:
            Dict with swapstring, payment_hash, and optionally swap status
        """
        # Step 1: Initialize the swap
        init_req = SwapRequest(
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=from_amount,
            to_amount=to_amount,
        )
        init_response = await self.init_maker_swap(init_req)

        # Step 2: Whitelist the trade (if node available)
        if self.has_node:
            await self.whitelist_trade(swapstring=init_response.swapstring)

        # Step 3: Execute the swap
        execute_req = ConfirmSwapRequest(
            swapstring=init_response.swapstring,
            payment_hash=init_response.payment_hash,
            taker_pubkey=taker_pubkey,
        )
        await self.execute_maker_swap(execute_req)

        result = {
            "swapstring": init_response.swapstring,
            "payment_hash": init_response.payment_hash,
        }

        # Step 4: Optionally wait for completion
        if wait_for_completion:
            swap = await self.wait_for_swap_completion(
                payment_hash=init_response.payment_hash,
                timeout=timeout,
                poll_interval=poll_interval,
            )
            result["swap"] = swap

        return result

    async def execute_swap_by_pair(
        self,
        pair_ticker: str,
        amount: float,
        side: str,
        taker_pubkey: str,
        wait_for_completion: bool = False,
        timeout: float = 300.0,
        poll_interval: float = 2.0,
    ) -> Dict[str, Any]:
        """Execute a swap using a pair ticker.

        Args:
            pair_ticker: Trading pair (e.g., "BTC/USDT")
            amount: Amount in display units
            side: "buy" or "sell" from base asset perspective
            taker_pubkey: Taker's public key
            wait_for_completion: Whether to wait for swap completion
            timeout: Timeout in seconds for waiting
            poll_interval: Poll interval in seconds

        Returns:
            Dict with swapstring, payment_hash, and optionally swap status
        """
        # Get quote based on the side
        if side.lower() == "sell":
            # Selling base asset
            quote = await self.get_quote_by_pair(pair_ticker, from_amount=amount)
        elif side.lower() == "buy":
            # Buying base asset (amount is what we want to receive)
            quote = await self.get_quote_by_pair(pair_ticker, to_amount=amount)
        else:
            raise ValueError(f"Invalid side: {side}. Must be 'buy' or 'sell'")

        return await self.execute_swap(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset,
            to_asset=quote.to_asset,
            from_amount=quote.from_amount,
            to_amount=quote.to_amount,
            taker_pubkey=taker_pubkey,
            wait_for_completion=wait_for_completion,
            timeout=timeout,
            poll_interval=poll_interval,
        )
