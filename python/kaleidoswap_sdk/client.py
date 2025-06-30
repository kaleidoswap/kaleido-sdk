import asyncio
import logging
from typing import Dict, List, Optional, Union, Any
from .http import HttpClient
from .websocket import WebSocketClient
# from .generated.kaleidoswap_pb2 import PairQuoteRequest as PairQuoteRequestProto # For typing or direct proto use
import uuid
from .generated.kaleidoswap_pb2 import (
    PriceUpdate,
    SubscriptionConfirmation,
    UnsubscriptionConfirmation,
    Error
)
from datetime import datetime
import time

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
        compression: Optional[str] = None
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
            api_url.replace('http', 'ws'),
            self.api_client,
            ping_interval=ping_interval,
            ping_timeout=ping_timeout,
            close_timeout=close_timeout,
            max_size=max_size,
            max_queue=max_queue,
            compression=compression
        )

    async def connect(self) -> None:
        """Connect to WebSocket server."""
        await self.ws_client.connect()

    async def disconnect(self) -> None:
        """Disconnect from WebSocket server."""
        await self.ws_client.disconnect()

    def on(self, action: str, handler: Any) -> None:
        """Register handler for WebSocket events.
        
        Args:
            action: Action to handle
            handler: Async function to handle the action
        """
        self.ws_client.on(action, handler)

    async def get_node_info(self) -> Dict[str, Any]:
        """Get node information including pubkey.
        
        Returns:
            Dict containing node info including pubkey
        """
        return await self.node_client.get("/nodeinfo")

    async def get_node_pubkey(self) -> str:
        """Get node public key.
        
        Returns:
            Node public key
        """
        node_info = await self.get_node_info()
        pubkey = node_info.get("pubkey")
        if not pubkey:
            raise ValueError("Could not get node pubkey")
        return pubkey

    async def list_assets(self) -> Dict[str, Any]:
        """List available assets.
        
        Returns:
            Dict containing list of assets
        """
        return await self.api_client.get("/market/assets")

    # TODO: Must be checked
    async def get_asset_metadata(self, asset_id: str) -> Dict[str, Any]:
        """Get metadata for a specific asset.
        
        Args:
            asset_id: Asset ID to get metadata for
            
        Returns:
            Dict containing asset metadata
        """
        return await self.api_client.post("/assetmetadata", {
            "asset_id": asset_id
        })

    async def list_pairs(self) -> Dict[str, Any]:
        """List available trading pairs.
        
        Returns:
            Dict containing list of trading pairs
        """
        return await self.api_client.get("/market/pairs")

    async def get_pair_by_assets(self, base_asset: str, quote_asset: str) -> Optional[Dict[str, Any]]:
        """Get trading pair by base and quote assets.
        
        Args:
            base_asset: Base asset ID
            quote_asset: Quote asset ID
            
        Returns:
            Dict containing pair information or None if not found
        """
        pairs = await self.list_pairs()
        for pair in pairs.get("pairs", []):
            if (pair["base_asset_id"] == base_asset and 
                pair["quote_asset_id"] == quote_asset):
                return pair
            if (pair["quote_asset_id"] == base_asset and 
                pair["base_asset_id"] == quote_asset):
                return pair
        return None

    async def get_quote(
        self,
        from_asset: str,
        to_asset: str,
        from_amount: int  # in millisats
    ) -> Dict[str, Any]:
        """Get a quote for swapping assets.
        
        Args:
            from_asset: Source asset ID
            to_asset: Destination asset ID
            from_amount: Amount in millisats
            
        Returns:
            Quote information
        """
        return await self.api_client.post("/market/quote", {
            "from_asset": from_asset,
            "from_amount": from_amount,
            "to_asset": to_asset
        })

    async def get_quote_websocket(
        self,
        from_asset: str,
        to_asset: str,
        from_amount: int  # in millisats
    ) -> Dict[str, Any]:
        """Get a quote for swapping assets using websocket.
        
        Args:
            from_asset: Source asset ID
            to_asset: Destination asset ID
            from_amount: Amount in millisats
            
        Returns:
            Quote information
            
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
            "from_asset": from_asset,
            "to_asset": to_asset,
            "from_amount": from_amount,
            "timestamp": int(time.time())
        }
        
        # Register a one-time handler for the quote response
        async def quote_handler(response: Dict[str, Any]) -> None:
            if not response_future.done():
                if "error" in response and response["error"]:
                    response_future.set_exception(Exception(f"WebSocket quote error: {response['error']}"))
                else:
                    response_future.set_result(response.get("data", {}))
        
        # Register the handler
        self.ws_client.on("quote_response", quote_handler)
        
        try:
            # Send the quote request
            await self.ws_client.send(quote_message)
            
            # Wait for the response with a timeout
            quote_data = await asyncio.wait_for(response_future, timeout=30)
            return quote_data
            
        finally:
            # Clean up the handler
            self.ws_client.off("quote_response", quote_handler)

    async def init_maker_swap(
        self,
        rfq_id: str,
        from_asset: str,
        to_asset: str,
        from_amount: int,  # in millisats
        to_amount: int,  # in millisats
        timeout_sec: int = 3600
    ) -> Dict[str, Any]:
        """Initialize a maker swap.
        
        Args:
            from_asset: Source asset ID
            to_asset: Destination asset ID
            from_amount: Amount of source asset in millisats
            to_amount: Amount of destination asset in millisats
            timeout_sec: Swap timeout in seconds
            
        Returns:
            Dict containing swap initialization details
        """
        return await self.api_client.post("/swaps/init", {
            "rfq_id": rfq_id,
            "from_asset": from_asset,
            "to_asset": to_asset,
            "from_amount": from_amount,
            "to_amount": to_amount,
        })

    async def execute_maker_swap(
        self,
        swapstring: str,
        payment_hash: str,
        taker_pubkey: str
    ) -> Dict[str, Any]:
        """Execute a maker swap.
        
        Args:
            swapstring: Swap string from initialization
            payment_secret: Payment secret from initialization
            taker_pubkey: Taker's public key
            
        Returns:
            Dict containing execution status
        """
        return await self.api_client.post("/swaps/execute", {
            "swapstring": swapstring,
            "payment_hash": payment_hash,
            "taker_pubkey": taker_pubkey
        })

    async def whitelist_trade(self, swapstring: str) -> Dict[str, Any]:
        """Whitelist a trade by swapstring.
        
        Args:
            swapstring: Swap string from maker
            
        Returns:
            Dict containing whitelist status
        """
        return await self.node_client.post("/taker", {
            "swapstring": swapstring,
        })

    async def get_swap_status(self, payment_hash: str) -> Dict[str, Any]:
        """Get the status of a swap.
        
        Args:
            payment_hash: Payment hash from whitelist
            
        Returns:
            Swap status information
        """
        return await self.api_client.post("/swaps/status", {
            "payment_hash": payment_hash
        })
        
    async def wait_for_swap_completion(
        self,
        payment_hash: str,
        timeout: int = 3600,
        poll_interval: int = 5
    ) -> Dict[str, Any]:
        """Wait for a swap to complete.
        
        Args:
            payment_hash: Payment hash from whitelist
            timeout: Maximum time to wait in seconds
            poll_interval: Time between status checks in seconds
            
        Returns:
            Final swap status
            
        Raises:
            TimeoutError: If swap doesn't complete within timeout
        """
        start_time = datetime.now()
        while True:
            swap_status = await self.get_swap_status(payment_hash)
            if swap_status["swap"]["status"] in ["Succeeded", "Failed", "Expired"]:
                return swap_status["swap"]
                
            if (datetime.now() - start_time).total_seconds() > timeout:
                raise TimeoutError(f"Swap did not complete within {timeout} seconds")
                
            await asyncio.sleep(poll_interval)

    async def complete_maker_swap(
        self,
        from_asset: str,
        to_asset: str,
        from_amount: int,  # in millisats
        to_amount: int,  # in millisats
        rfq_id: str,
        timeout_sec: int = 3600
    ) -> Dict[str, Any]:
        """Complete a maker swap in one call.
        
        Args:
            from_asset: Source asset ID
            to_asset: Destination asset ID
            from_amount: Amount of source asset in millisats
            to_amount: Amount of destination asset in millisats
            rfq_id: RFQ ID from quote
            timeout_sec: Swap timeout in seconds
            
        Returns:
            Final swap status
        """
        try:
            try:
            # Initialize swap
                init_result = await self.init_maker_swap(
                    rfq_id=rfq_id,
                    from_asset=from_asset,
                    to_asset=to_asset,
                    from_amount=from_amount,
                    to_amount=to_amount,
                )
            except Exception as e:
                logger.error(f"Error initializing swap: {e}")
                raise e
            
            # Whitelist trade from taker
            try:
                whitelist_result = await self.whitelist_trade(init_result["swapstring"])
            except Exception as e:
                logger.error(f"Error whitelisting trade: {e}")
                raise e

            # Execute swap from maker
            taker_pubkey = await self.get_node_pubkey()
            try:
                execute_result = await self.execute_maker_swap(
                    swapstring=init_result["swapstring"],
                    payment_hash=init_result["payment_hash"],
                    taker_pubkey=taker_pubkey
                )
            except Exception as e:
                logger.error(f"Error executing swap: {e}")
                raise e
            
            # Wait for swap to complete
            try:
                swap_status = await self.wait_for_swap_completion(init_result["payment_hash"], timeout=timeout_sec)
                if swap_status["status"] == "Succeeded":
                    return swap_status
                else:
                    raise Exception(f"Swap failed with status: {swap_status['status']}")
            except Exception as e:
                logger.error(f"Error waiting for swap completion: {e}")
                raise e
        except Exception as e:
            logger.error(f"Error completing swap: {e}")
            raise e

    async def close(self):
        """Closes any open connections (HTTP client sessions, WebSocket)."""
        await self.api_client.close()
        await self.node_client.close()
        await self.ws_client.disconnect()

    # Context manager support
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.close() 