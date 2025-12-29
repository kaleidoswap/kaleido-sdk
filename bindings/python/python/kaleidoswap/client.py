import json
from typing import Any, Iterator, List, Optional, Union

from .exceptions import (
    APIError,
    AssetNotFoundError,
    AuthenticationError,
    ChannelNotFoundError,
    InsufficientBalanceError,
    KaleidoError,
    LspError,
    NetworkError,
    NodeLockedError,
    NodeNotConfiguredError,
    OrderNotFoundError,
    QuoteExpiredError,
    RateLimitError,
    ResourceNotFoundError,
    TradingPairNotFoundError,
    ValidationError,
)
from .generated_models import (
    Asset,
    NetworkInfoResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    PairQuoteResponse,
    SwapNodeInfoResponse,
    SwapOrderRateDecisionResponse,
    SwapOrderStatusResponse,
    SwapStatusResponse,
    TradingPair,
)
from .kaleidoswap import PyKaleidoClient, PyKaleidoConfig
from .sub_clients import LspClient, MarketClient, NodeClient, OrdersClient, SwapsClient


class QuoteStreamContext:
    """Context manager for WebSocket quote streaming.

    Usage:
        with client.subscribe_quotes("BTC/USDT") as stream:
            for quote in stream.iter_quotes(timeout=5.0, max_quotes=10):
                print(f"Price: {quote.price}")
    """

    def __init__(self, client: "KaleidoClient", pair_ticker: str):
        self._client = client
        self._pair_ticker = pair_ticker
        self._stream = None

    def __enter__(self) -> "QuoteStreamContext":
        self._stream = self._client.create_quote_stream(self._pair_ticker)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._stream:
            self._stream.close()
        return None

    def recv(self, timeout: float = 5.0) -> Optional[PairQuoteResponse]:
        """Receive the next quote.

        Args:
            timeout: Timeout in seconds

        Returns:
            PairQuoteResponse object or None if timeout
        """
        if not self._stream:
            raise RuntimeError("Stream not initialized. Use within 'with' block.")

        quote_json = self._stream.recv(timeout)
        if quote_json is None:
            return None
        return self._client._parse_quote(quote_json)

    def iter_quotes(
        self, timeout: float = 5.0, max_quotes: Optional[int] = None
    ) -> Iterator[PairQuoteResponse]:
        """Iterate over quotes from the stream.

        Args:
            timeout: Timeout in seconds for each quote
            max_quotes: Maximum number of quotes (None for until timeout)

        Yields:
            PairQuoteResponse objects as they arrive
        """
        if not self._stream:
            raise RuntimeError("Stream not initialized. Use within 'with' block.")

        count = 0
        while max_quotes is None or count < max_quotes:
            quote = self.recv(timeout)
            if quote is None:
                break
            yield quote
            count += 1

    def is_connected(self) -> bool:
        """Check if the stream is connected."""
        return self._stream is not None and self._stream.is_connected()


class KaleidoClient:
    """
    Python wrapper for the Kaleidoswap SDK Rust client.

    All methods return strongly-typed Pydantic v2 models auto-generated from OpenAPI specs.

    Access organized API clients via properties:
    - client.market: Market operations (assets, pairs, quotes)
    - client.orders: Order management
    - client.swaps: Swap operations
    - client.lsp: Lightning Service Provider operations
    - client.node: RGB Node operations (if configured)
    """

    def __init__(self, config: PyKaleidoConfig):
        self._inner = PyKaleidoClient(config)
        # Lazy-initialized sub-clients
        self._market_client = None
        self._orders_client = None
        self._swaps_client = None
        self._lsp_client = None
        self._node_client = None

    def _map_error(self, e: Exception) -> Exception:
        """Map generic Rust runtime errors to specific SDK exceptions."""
        msg = str(e)

        # Check for specific error codes or messages in the error string
        # The Rust bindings currently return errors as strings in RuntimeError

        if "404" in msg or "Not Found" in msg or "not found" in msg:
            if "Asset" in msg or "asset" in msg:
                return AssetNotFoundError(msg)
            if "Pair" in msg or "pair" in msg:
                return TradingPairNotFoundError(msg)
            if "Order" in msg or "order" in msg:
                return OrderNotFoundError(msg)
            if "Channel" in msg:
                return ChannelNotFoundError(msg)
            return ResourceNotFoundError(msg)

        if (
            "401" in msg
            or "403" in msg
            or "Unauthorized" in msg
            or "Forbidden" in msg
            or "Authentication failed" in msg
        ):
            return AuthenticationError(msg)

        if "locked" in msg and "Node is locked" in msg:
            return NodeLockedError(msg)

        if "LSP" in msg or "Client rejected" in msg or "Option mismatch" in msg:
            return LspError(msg)

        if "429" in msg or "Rate limit" in msg:
            # parsing retry_after could be added if available in the msg
            return RateLimitError()

        if "Network" in msg or "Connection" in msg:
            return NetworkError(msg)

        if (
            "Insufficient balance" in msg
            or "Insufficient capacity" in msg
            or "not enough" in msg
        ):
            # We could try to parse required/available if formatted strictly
            return InsufficientBalanceError(0, 0, msg)

        if "Node not configured" in msg or "Wallet has not been initialized" in msg:
            return NodeNotConfiguredError(msg)

        if "Quote expired" in msg:
            return QuoteExpiredError(msg)

        if (
            "Validation" in msg
            or "valid invoice" in msg
            or "Invalid params" in msg
            or "Type validation" in msg
        ):
            return ValidationError(msg)

        # Default fallback to generic APIError if it looks like an API issue
        if "status: " in msg:
            # Try to extract status code
            try:
                # simplistic extraction, assume "status: 4xx"
                import re

                match = re.search(r"status: (\d+)", msg)
                if match:
                    status = int(match.group(1))
                    return APIError(status, msg)
            except (ValueError, AttributeError):
                pass

        # If it's already a specific KaleidoError, return it
        if isinstance(e, KaleidoError):
            return e

        return APIError(500, f"Unknown error: {msg}")

    def _execute(self, func, *args, **kwargs):
        """Execute a function and map any errors."""
        try:
            return func(*args, **kwargs)
        except Exception as e:
            raise self._map_error(e) from e

    @property
    def market(self) -> MarketClient:
        """Get the Market API client for assets, pairs, and quotes."""
        if self._market_client is None:
            self._market_client = MarketClient(
                self._inner, self._parse_response, self._execute
            )
        return self._market_client

    @property
    def orders(self) -> OrdersClient:
        """Get the Orders API client for order management."""
        if self._orders_client is None:
            self._orders_client = OrdersClient(
                self._inner, self._parse_response, self._execute
            )
        return self._orders_client

    @property
    def swaps(self) -> SwapsClient:
        """Get the Swaps API client for swap operations."""
        if self._swaps_client is None:
            self._swaps_client = SwapsClient(
                self._inner, self._parse_response, self._execute
            )
        return self._swaps_client

    @property
    def lsp(self) -> LspClient:
        """Get the LSP API client for Lightning Service Provider operations."""
        if self._lsp_client is None:
            self._lsp_client = LspClient(
                self._inner, self._parse_response, self._execute
            )
        return self._lsp_client

    @property
    def node(self) -> Optional[NodeClient]:
        """Get the RGB Node API client (if configured)."""
        if not self.has_node():
            return None
        if self._node_client is None:
            self._node_client = NodeClient(
                self._inner, self._parse_response, self._execute
            )
        return self._node_client

    def _to_json(self, obj: Any) -> str:
        """Helper to convert object to JSON string"""
        if isinstance(obj, str):
            return obj
        if hasattr(obj, "model_dump_json"):
            return obj.model_dump_json()
        if hasattr(obj, "json") and callable(obj.json):
            # Pydantic v1 or similar
            return obj.json()
        return json.dumps(obj)

    def _parse_response(self, json_str: str, model_class: type):
        """Helper to parse JSON response into Pydantic model.

        Args:
            json_str: JSON string from Rust binding
            model_class: Pydantic model class to parse into

        Returns:
            Parsed Pydantic model instance or list of instances
        """
        data = json.loads(json_str)

        if isinstance(data, list):
            return [model_class.model_validate(item) for item in data]

        return model_class.model_validate(data)

    def has_node(self) -> bool:
        return self._inner.has_node()

    # === Market Operations ===

    def list_assets(self) -> List[Asset]:
        """List all available assets.

        Returns:
            List of Asset objects
        """
        json_str = self._execute(self._inner.list_assets)
        return self._parse_response(json_str, Asset)

    def list_pairs(self) -> List[TradingPair]:
        """List all available trading pairs.

        Returns:
            List of TradingPair objects
        """
        json_str = self._execute(self._inner.list_pairs)
        return self._parse_response(json_str, TradingPair)

    def get_quote_by_pair(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> PairQuoteResponse:
        """Get quote for a trading pair.

        Returns:
            PairQuoteResponse object
        """
        json_str = self._execute(
            self._inner.get_quote_by_pair, ticker, from_amount, to_amount
        )
        return self._parse_response(json_str, PairQuoteResponse)

    def get_best_quote(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> PairQuoteResponse:
        """Get best quote for an asset.

        Returns:
            PairQuoteResponse object
        """
        json_str = self._execute(
            self._inner.get_best_quote, ticker, from_amount, to_amount
        )
        return self._parse_response(json_str, PairQuoteResponse)

    # === Swap Operations ===

    def get_node_info(self) -> SwapNodeInfoResponse:
        """Get swap node information.

        Returns:
            SwapNodeInfoResponse object
        """
        json_str = self._execute(self._inner.get_node_info)
        return self._parse_response(json_str, SwapNodeInfoResponse)

    def get_swap_status(self, payment_hash: str) -> SwapStatusResponse:
        """Get status of a swap.

        Returns:
            SwapStatusResponse object
        """
        json_str = self._execute(self._inner.get_swap_status, payment_hash)
        return self._parse_response(json_str, SwapStatusResponse)

    def wait_for_swap_completion(
        self, payment_hash: str, timeout_secs: float, poll_interval_secs: float
    ) -> str:
        return self._execute(
            self._inner.wait_for_swap_completion,
            payment_hash,
            timeout_secs,
            poll_interval_secs,
        )

    # === Order Operations ===

    def get_swap_order_status(self, order_id: str) -> SwapOrderStatusResponse:
        """Get swap order status.

        Returns:
            SwapOrderStatusResponse object
        """
        json_str = self._execute(self._inner.get_swap_order_status, order_id)
        return self._parse_response(json_str, SwapOrderStatusResponse)

    def get_order_history(
        self, status: Optional[str] = None, limit: int = 10, skip: int = 0
    ) -> OrderHistoryResponse:
        """Get order history.

        Returns:
            OrderHistoryResponse object
        """
        json_str = self._execute(self._inner.get_order_history, status, limit, skip)
        return self._parse_response(json_str, OrderHistoryResponse)

    def get_order_analytics(self) -> OrderStatsResponse:
        """Get order analytics/stats.

        Returns:
            OrderStatsResponse object
        """
        json_str = self._execute(self._inner.get_order_analytics)
        return self._parse_response(json_str, OrderStatsResponse)

    def swap_order_rate_decision(
        self, order_id: str, accept: bool
    ) -> SwapOrderRateDecisionResponse:
        """Make rate decision for a swap order.

        Returns:
            SwapOrderRateDecisionResponse object
        """
        json_str = self._execute(self._inner.swap_order_rate_decision, order_id, accept)
        return self._parse_response(json_str, SwapOrderRateDecisionResponse)

    # === LSP Operations ===

    def get_lsp_info(self) -> str:
        return self._execute(self._inner.get_lsp_info)

    def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information.

        Returns:
            NetworkInfoResponse object
        """
        json_str = self._execute(self._inner.get_lsp_network_info)
        return self._parse_response(json_str, NetworkInfoResponse)

    def get_lsp_order(self, order_id: str) -> str:
        return self._execute(self._inner.get_lsp_order, order_id)

    def estimate_lsp_fees(self, channel_size: int) -> str:
        return self._execute(self._inner.estimate_lsp_fees, channel_size)

    # === RGB Node Operations ===

    def get_rgb_node_info(self) -> str:
        return self._execute(self._inner.get_rgb_node_info)

    def list_channels(self) -> str:
        return self._execute(self._inner.list_channels)

    def list_peers(self) -> str:
        return self._execute(self._inner.list_peers)

    def list_node_assets(self) -> str:
        return self._execute(self._inner.list_node_assets)

    def get_asset_balance(self, asset_id: str) -> str:
        return self._execute(self._inner.get_asset_balance, asset_id)

    def get_onchain_address(self) -> str:
        return self._execute(self._inner.get_onchain_address)

    def get_btc_balance(self) -> str:
        return self._execute(self._inner.get_btc_balance)

    def whitelist_trade(self, swapstring: str) -> str:
        return self._execute(self._inner.whitelist_trade, swapstring)

    def decode_ln_invoice(self, invoice: str) -> str:
        return self._execute(self._inner.decode_ln_invoice, invoice)

    def list_payments(self) -> str:
        return self._execute(self._inner.list_payments)

    def init_wallet(self, password: str) -> str:
        return self._execute(self._inner.init_wallet, password)

    def unlock_wallet(self, password: str) -> str:
        return self._execute(self._inner.unlock_wallet, password)

    def lock_wallet(self) -> str:
        return self._execute(self._inner.lock_wallet)

    # === Convenience Methods ===

    def get_asset_by_ticker(self, ticker: str) -> Asset:
        """Get asset by ticker.

        Returns:
            Asset object
        """
        json_str = self._execute(self._inner.get_asset_by_ticker, ticker)
        return self._parse_response(json_str, Asset)

    def get_quote_by_assets(
        self,
        from_ticker: str,
        to_ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> PairQuoteResponse:
        """Get quote by asset tickers.

        Returns:
            PairQuoteResponse object
        """
        json_str = self._execute(
            self._inner.get_quote_by_assets,
            from_ticker,
            to_ticker,
            from_amount,
            to_amount,
        )
        return self._parse_response(json_str, PairQuoteResponse)

    def complete_swap_from_quote(self, quote: Any) -> str:
        """Accepts a Quote model or JSON string"""
        return self._execute(self._inner.complete_swap_from_quote, self._to_json(quote))

    def get_pair_by_ticker(self, ticker: str) -> TradingPair:
        """Get trading pair by ticker.

        Returns:
            TradingPair object
        """
        json_str = self._execute(self._inner.get_pair_by_ticker, ticker)
        return self._parse_response(json_str, TradingPair)

    def list_active_assets(self) -> List[Asset]:
        """List only active assets.

        Returns:
            List of Asset objects
        """
        json_str = self._execute(self._inner.list_active_assets)
        return self._parse_response(json_str, Asset)

    def list_active_pairs(self) -> List[TradingPair]:
        """List only active trading pairs.

        Returns:
            List of TradingPair objects
        """
        json_str = self._execute(self._inner.list_active_pairs)
        return self._parse_response(json_str, TradingPair)

    def estimate_swap_fees(self, ticker: str, amount: int) -> int:
        return self._execute(self._inner.estimate_swap_fees, ticker, amount)

    def find_asset_by_ticker(self, ticker: str) -> Asset:
        """Find asset by ticker.

        Returns:
            Asset object
        """
        json_str = self._execute(self._inner.find_asset_by_ticker, ticker)
        return self._parse_response(json_str, Asset)

    def find_pair_by_ticker(self, ticker: str) -> TradingPair:
        """Find trading pair by ticker.

        Returns:
            TradingPair object
        """
        json_str = self._execute(self._inner.find_pair_by_ticker, ticker)
        return self._parse_response(json_str, TradingPair)

    # === Legacy Methods (Strongly Typed Support) ===

    def create_order(self, request: Any) -> str:
        """
        Create LSP order.
        Args:
           request: CreateOrderRequest model or dict
        """
        return self._execute(self._inner.create_order, self._to_json(request))

    def create_swap_order(self, request: Any) -> str:
        return self._execute(self._inner.create_swap_order, self._to_json(request))

    def init_swap(self, request: Any) -> str:
        return self._execute(self._inner.init_maker_swap, self._to_json(request))

    def execute_swap(self, request: Any) -> str:
        return self._execute(self._inner.execute_maker_swap, self._to_json(request))

    def retry_delivery(self, order_id: str) -> str:
        return self._execute(self._inner.retry_delivery, order_id)

    def connect_peer(self, request: Any) -> str:
        return self._execute(self._inner.connect_peer, self._to_json(request))

    def create_quote_stream(self, pair_ticker: str) -> Any:
        """Create a real-time quote stream for a trading pair.

        Args:
            pair_ticker: Trading pair ticker (e.g., "BTC/USDT")

        Returns:
            QuoteStream object with recv(), is_connected(), close() methods
        """
        return self._execute(self._inner.create_quote_stream, pair_ticker)

    # === WebSocket Convenience Methods ===

    def subscribe_quotes(self, pair_ticker: str) -> "QuoteStreamContext":
        """Context manager for subscribing to real-time quotes.

        Usage:
            with client.subscribe_quotes("BTC/USDT") as stream:
                for quote in stream.iter_quotes(timeout=5.0, max_quotes=10):
                    print(f"Price: {quote.price}")

        Args:
            pair_ticker: Trading pair ticker (e.g., "BTC/USDT")

        Returns:
            QuoteStreamContext that can be used as a context manager
        """
        return QuoteStreamContext(self, pair_ticker)

    def iter_quotes(
        self, pair_ticker: str, timeout: float = 5.0, max_quotes: Optional[int] = None
    ) -> Iterator[PairQuoteResponse]:
        """Generator that yields quotes from a WebSocket stream.

        Args:
            pair_ticker: Trading pair ticker (e.g., "BTC/USDT")
            timeout: Timeout in seconds for each quote (default: 5.0)
            max_quotes: Maximum number of quotes to yield (None for unlimited)

        Yields:
            PairQuoteResponse objects as they are received

        Example:
            for quote in client.iter_quotes("BTC/USDT", max_quotes=5):
                print(f"Quote: {quote.price}")
        """
        stream = self.create_quote_stream(pair_ticker)
        try:
            count = 0
            while max_quotes is None or count < max_quotes:
                quote_json = stream.recv(timeout)
                if quote_json is None:
                    break  # Timeout, no more quotes

                quote = self._parse_quote(quote_json)
                if quote:
                    yield quote
                    count += 1
        finally:
            stream.close()

    def _parse_quote(self, quote_json: str) -> Optional[PairQuoteResponse]:
        """Parse a quote JSON string into a PairQuoteResponse object.

        Args:
            quote_json: JSON string from WebSocket

        Returns:
            PairQuoteResponse object or None if parsing fails
        """
        try:
            import json

            data = json.loads(quote_json)
            return PairQuoteResponse.model_validate(data)
        except Exception:
            return None

    # === Display Amount Utilities ===

    def to_raw(self, display_amount: float, asset: Union[Asset, str]) -> int:
        """Convert display amount to raw atomic units.

        Args:
            display_amount: Human-readable amount (e.g., 1.5 BTC)
            asset: Asset object or ticker string

        Returns:
            Raw atomic units (e.g., 150000000 satoshis)
        """
        if isinstance(asset, str):
            asset = self.get_asset_by_ticker(asset)
        return int(display_amount * (10**asset.precision))

    def to_display(self, raw_amount: int, asset: Union[Asset, str]) -> float:
        """Convert raw atomic units to display amount.

        Args:
            raw_amount: Raw atomic units (e.g., 150000000 satoshis)
            asset: Asset object or ticker string

        Returns:
            Human-readable amount (e.g., 1.5 BTC)
        """
        if isinstance(asset, str):
            asset = self.get_asset_by_ticker(asset)
        return raw_amount / (10**asset.precision)

    def convert_amount(
        self, amount: Union[float, int], asset: Union[Asset, str], to: str = "raw"
    ) -> Union[int, float]:
        """Convert amount between raw atomic units and display units.

        Args:
            amount: Amount to convert
            asset: Asset object or ticker string
            to: Target format - "raw" (atomic units) or "display" (human-readable)

        Returns:
            Converted amount (int for raw, float for display)

        Raises:
            ValueError: If 'to' is not "raw" or "display"
        """
        if to == "raw":
            return self.to_raw(float(amount), asset)
        elif to == "display":
            return self.to_display(int(amount), asset)
        else:
            raise ValueError(f"Invalid 'to' value: {to}. Must be 'raw' or 'display'.")

    # === Asset/Pair Resolution ===

    def get_asset_by_id(self, asset_id: str) -> Optional[Asset]:
        """Get asset by its unique ID.

        Args:
            asset_id: The unique asset identifier (e.g., RGB contract ID)

        Returns:
            Asset object or None if not found
        """
        assets = self.list_assets()
        for asset in assets:
            if asset.protocol_ids:
                for protocol_id in asset.protocol_ids.values():
                    if protocol_id == asset_id:
                        return asset
            # Check ticker as fallback (for native assets like BTC)
            if asset.ticker == asset_id:
                return asset
        return None

    def get_pair_by_assets(
        self, from_asset: str, to_asset: str
    ) -> Optional[TradingPair]:
        """Get trading pair by asset tickers or IDs.

        Args:
            from_asset: Base asset ticker or ID
            to_asset: Quote asset ticker or ID

        Returns:
            TradingPair object or None if not found
        """
        pairs = self.list_pairs()
        for pair in pairs:
            # Check direct match (from/to in either order)
            # TradingPair model has base/quote as TradableAsset with ticker
            base_ticker = pair.base.ticker if pair.base else None
            quote_ticker = pair.quote.ticker if pair.quote else None
            if (base_ticker == from_asset and quote_ticker == to_asset) or (
                base_ticker == to_asset and quote_ticker == from_asset
            ):
                return pair
        return None

    # === Validation & Trade Helpers ===

    def can_trade(self, base_ticker: str, quote_ticker: str) -> bool:
        """Check if a trading pair exists and is active.

        Args:
            base_ticker: Base asset ticker (e.g., "BTC")
            quote_ticker: Quote asset ticker (e.g., "USDT")

        Returns:
            True if the pair exists and is active, False otherwise
        """
        pair = self.get_pair_by_assets(base_ticker, quote_ticker)
        if pair is None:
            return False
        return getattr(pair, "is_active", True)

    def validate_amount(self, amount: float, asset_identifier: str) -> dict:
        """Validate an amount against asset constraints.

        Args:
            amount: Amount in display units
            asset_identifier: Asset ticker or ID

        Returns:
            Dict with validation result:
            - valid: bool
            - raw_amount: int (raw atomic units)
            - display_amount: float
            - errors: List[str] (if any)
        """
        errors = []

        try:
            asset = self.get_asset_by_ticker(asset_identifier)
        except Exception:
            try:
                asset = self.get_asset_by_id(asset_identifier)
            except Exception:
                return {
                    "valid": False,
                    "raw_amount": 0,
                    "display_amount": 0.0,
                    "errors": [f"Asset not found: {asset_identifier}"],
                }

        if asset is None:
            return {
                "valid": False,
                "raw_amount": 0,
                "display_amount": 0.0,
                "errors": [f"Asset not found: {asset_identifier}"],
            }

        raw_amount = self.to_raw(amount, asset)

        if amount < 0:
            errors.append("Amount cannot be negative")

        if amount == 0:
            errors.append("Amount cannot be zero")

        # Check against endpoints limits if available
        if asset.endpoints:
            for endpoint in asset.endpoints:
                if hasattr(endpoint, "min_amount") and raw_amount < endpoint.min_amount:
                    errors.append(
                        f"Amount below minimum for {endpoint.layer}: "
                        f"{self.to_display(endpoint.min_amount, asset)}"
                    )
                    break
                if hasattr(endpoint, "max_amount") and raw_amount > endpoint.max_amount:
                    errors.append(
                        f"Amount above maximum for {endpoint.layer}: "
                        f"{self.to_display(endpoint.max_amount, asset)}"
                    )
                    break

        return {
            "valid": len(errors) == 0,
            "raw_amount": raw_amount,
            "display_amount": amount,
            "errors": errors,
        }

    # === Caching System ===

    def refresh_cache(self) -> None:
        """Force refresh of internal asset/pair caches.

        This clears any cached data and refreshes it from the API.
        Useful when you know market data has changed.
        """
        # Clear lazy-loaded sub-clients to force re-fetch
        self._market_client = None
        self._orders_client = None
        self._swaps_client = None
        self._lsp_client = None
        self._node_client = None

    # === High-Level Swap Flows ===

    def execute_swap_flow(
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
    ) -> dict:
        """Execute a complete atomic swap (init + execute + optionally wait).

        This is a convenience method that combines multiple swap steps:
        1. Initialize the swap
        2. Whitelist the trade (if node configured)
        3. Execute the swap
        4. Optionally wait for completion

        Args:
            rfq_id: Request for quote ID
            from_asset: From asset ID or ticker
            to_asset: To asset ID or ticker
            from_amount: From amount in raw atomic units
            to_amount: To amount in raw atomic units
            taker_pubkey: Taker's public key
            wait_for_completion: Whether to wait for swap completion
            timeout: Timeout in seconds for waiting
            poll_interval: Poll interval in seconds

        Returns:
            Dict with:
            - swapstring: The swap string
            - payment_hash: Payment hash
            - swap: Swap status (if wait_for_completion=True)
        """
        from .generated_models import ConfirmSwapRequest, SwapRequest

        # Step 1: Initialize the swap
        init_request = SwapRequest(
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=from_amount,
            to_amount=to_amount,
        )
        init_response_str = self.init_swap(init_request)
        init_data = json.loads(init_response_str)

        swapstring = init_data.get("swapstring")
        payment_hash = init_data.get("payment_hash")

        # Step 2: Whitelist the trade (if node available)
        if self.has_node():
            self.whitelist_trade(swapstring)

        # Step 3: Execute the swap
        execute_request = ConfirmSwapRequest(
            swapstring=swapstring,
            payment_hash=payment_hash,
            taker_pubkey=taker_pubkey,
        )
        self.execute_swap(execute_request)

        result = {
            "swapstring": swapstring,
            "payment_hash": payment_hash,
        }

        # Step 4: Optionally wait for completion
        if wait_for_completion:
            swap_result = self.wait_for_swap_completion(
                payment_hash=payment_hash,
                timeout_secs=timeout,
                poll_interval_secs=poll_interval,
            )
            result["swap"] = swap_result

        return result

    def execute_swap_by_pair(
        self,
        pair_ticker: str,
        amount: float,
        side: str,
        taker_pubkey: str,
        wait_for_completion: bool = False,
        timeout: float = 300.0,
        poll_interval: float = 2.0,
    ) -> dict:
        """Execute a swap using a pair ticker and display amount.

        This is a high-level convenience method that:
        1. Gets a quote for the pair
        2. Converts display amount to raw
        3. Executes the complete swap flow

        Args:
            pair_ticker: Trading pair (e.g., "BTC/USDT")
            amount: Amount in display units (human-readable)
            side: "buy" or "sell" from base asset perspective
                  - "sell": you're selling the base asset (BTC in BTC/USDT)
                  - "buy": you're buying the base asset
            taker_pubkey: Taker's public key
            wait_for_completion: Whether to wait for swap completion
            timeout: Timeout in seconds for waiting
            poll_interval: Poll interval in seconds

        Returns:
            Dict with swapstring, payment_hash, and optionally swap status

        Raises:
            ValueError: If side is not 'buy' or 'sell'
        """
        # Parse pair ticker
        parts = pair_ticker.split("/")
        if len(parts) != 2:
            raise ValueError(
                f"Invalid pair ticker: {pair_ticker}. Expected format: BASE/QUOTE"
            )

        base_ticker, quote_ticker = parts

        # Get assets
        base_asset = self.get_asset_by_ticker(base_ticker)
        _ = self.get_asset_by_ticker(quote_ticker)  # Validate quote asset exists

        # Get quote based on the side
        side_lower = side.lower()
        if side_lower == "sell":
            # Selling base asset: from_amount is specified
            raw_amount = self.to_raw(amount, base_asset)
            quote = self.get_quote_by_pair(
                pair_ticker, from_amount=raw_amount, to_amount=None
            )
        elif side_lower == "buy":
            # Buying base asset: to_amount is what we want to receive
            raw_amount = self.to_raw(amount, base_asset)
            quote = self.get_quote_by_pair(
                pair_ticker, from_amount=None, to_amount=raw_amount
            )
        else:
            raise ValueError(f"Invalid side: {side}. Must be 'buy' or 'sell'")

        # Execute the swap flow
        return self.execute_swap_flow(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset.asset_id,
            to_asset=quote.to_asset.asset_id,
            from_amount=quote.from_asset.amount,
            to_amount=quote.to_asset.amount,
            taker_pubkey=taker_pubkey,
            wait_for_completion=wait_for_completion,
            timeout=timeout,
            poll_interval=poll_interval,
        )

    def complete_maker_swap(
        self,
        rfq_id: str,
        from_asset: str,
        to_asset: str,
        from_amount: int,
        to_amount: int,
        taker_pubkey: str,
    ) -> dict:
        """Complete a maker swap in one call (init + execute).

        This is a simplified convenience method that combines init and execute steps
        without waiting for completion.

        Args:
            rfq_id: Request for quote ID
            from_asset: From asset ID
            to_asset: To asset ID
            from_amount: From amount in raw atomic units
            to_amount: To amount in raw atomic units
            taker_pubkey: Taker's public key

        Returns:
            Dict with swapstring and payment_hash
        """
        return self.execute_swap_flow(
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=from_amount,
            to_amount=to_amount,
            taker_pubkey=taker_pubkey,
            wait_for_completion=False,
        )

    # === WebSocket Operations ===

    async def connect_websocket(self) -> None:
        """Connect to WebSocket for real-time updates."""
        self._inner.connect_websocket()

    async def disconnect_websocket(self) -> None:
        """Disconnect from WebSocket."""
        self._inner.disconnect_websocket()

    async def is_websocket_connected(self) -> bool:
        """Check if WebSocket is connected."""
        return self._inner.is_websocket_connected()

    async def subscribe_to_pair(self, pair_id: str) -> None:
        """Subscribe to price updates for a trading pair.

        Args:
            pair_id: Trading pair ID (e.g., "BTC/USDT")
        """
        self._inner.subscribe_to_pair(pair_id)

    async def unsubscribe_from_pair(self, pair_id: str) -> None:
        """Unsubscribe from price updates for a trading pair.

        Args:
            pair_id: Trading pair ID (e.g., "BTC/USDT")
        """
        self._inner.unsubscribe_from_pair(pair_id)

    async def get_quote_websocket(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
        layer: str = "BTC_LN",
    ) -> PairQuoteResponse:
        """Request a quote via WebSocket (faster than HTTP).

        Args:
            ticker: Trading pair ticker (e.g., "BTC/USDT")
            from_amount: Amount to convert from (raw atomic units)
            to_amount: Amount to convert to (raw atomic units)
            layer: Layer to use (default: "BTC_LN")

        Returns:
            PairQuoteResponse with quote details
        """
        result_json = self._inner.get_quote_websocket(
            ticker, from_amount, to_amount, layer
        )
        result = json.loads(result_json)
        return PairQuoteResponse(**result)

    async def on_websocket_event(self, event: str, handler: callable) -> None:
        """Register a WebSocket event handler.

        Args:
            event: Event type (from WsEvent enum)
            handler: Async callback function that receives event data

        Note: This is a simplified version. For full event handling,
              use the Rust SDK directly or implement custom event loop.
        """
        # Note: Due to Python/Rust threading limitations,
        # this stores the handler but doesn't wire it up fully.
        # Users should implement their own event loop for production use.
        import uuid

        handler_id = str(uuid.uuid4())
        self._inner.on_websocket_event(event, handler_id)

    async def reconnect_websocket(self) -> None:
        """Reconnect WebSocket with exponential backoff."""
        self._inner.reconnect_websocket()
