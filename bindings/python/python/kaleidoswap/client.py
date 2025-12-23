import json
from typing import Any, List, Optional

from .kaleidoswap import PyKaleidoClient, PyKaleidoConfig
from .generated_models import (
    Asset,
    TradingPair,
    PairQuoteResponse,
    SwapNodeInfoResponse,
    SwapStatusResponse,
    SwapOrderStatusResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    SwapOrderRateDecisionResponse,
    NetworkInfoResponse,
)
from .sub_clients import (
    MarketClient,
    OrdersClient,
    SwapsClient,
    LspClient,
    NodeClient,
)


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

    @property
    def market(self) -> MarketClient:
        """Get the Market API client for assets, pairs, and quotes."""
        if self._market_client is None:
            self._market_client = MarketClient(self._inner, self._parse_response)
        return self._market_client

    @property
    def orders(self) -> OrdersClient:
        """Get the Orders API client for order management."""
        if self._orders_client is None:
            self._orders_client = OrdersClient(self._inner, self._parse_response)
        return self._orders_client

    @property
    def swaps(self) -> SwapsClient:
        """Get the Swaps API client for swap operations."""
        if self._swaps_client is None:
            self._swaps_client = SwapsClient(self._inner, self._parse_response)
        return self._swaps_client

    @property
    def lsp(self) -> LspClient:
        """Get the LSP API client for Lightning Service Provider operations."""
        if self._lsp_client is None:
            self._lsp_client = LspClient(self._inner, self._parse_response)
        return self._lsp_client

    @property
    def node(self) -> Optional[NodeClient]:
        """Get the RGB Node API client (if configured)."""
        if not self.has_node():
            return None
        if self._node_client is None:
            self._node_client = NodeClient(self._inner, self._parse_response)
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
        json_str = self._inner.list_assets()
        return self._parse_response(json_str, Asset)

    def list_pairs(self) -> List[TradingPair]:
        """List all available trading pairs.
        
        Returns:
            List of TradingPair objects
        """
        json_str = self._inner.list_pairs()
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
        json_str = self._inner.get_quote_by_pair(ticker, from_amount, to_amount)
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
        json_str = self._inner.get_best_quote(ticker, from_amount, to_amount)
        return self._parse_response(json_str, PairQuoteResponse)

    # === Swap Operations ===

    def get_node_info(self) -> SwapNodeInfoResponse:
        """Get swap node information.
        
        Returns:
            SwapNodeInfoResponse object
        """
        json_str = self._inner.get_node_info()
        return self._parse_response(json_str, SwapNodeInfoResponse)

    def get_swap_status(self, payment_hash: str) -> SwapStatusResponse:
        """Get status of a swap.
        
        Returns:
            SwapStatusResponse object
        """
        json_str = self._inner.get_swap_status(payment_hash)
        return self._parse_response(json_str, SwapStatusResponse)

    def wait_for_swap_completion(
        self, payment_hash: str, timeout_secs: float, poll_interval_secs: float
    ) -> str:
        return self._inner.wait_for_swap_completion(
            payment_hash, timeout_secs, poll_interval_secs
        )

    # === Order Operations ===

    def get_swap_order_status(self, order_id: str) -> SwapOrderStatusResponse:
        """Get swap order status.
        
        Returns:
            SwapOrderStatusResponse object
        """
        json_str = self._inner.get_swap_order_status(order_id)
        return self._parse_response(json_str, SwapOrderStatusResponse)

    def get_order_history(
        self, status: Optional[str] = None, limit: int = 10, skip: int = 0
    ) -> OrderHistoryResponse:
        """Get order history.
        
        Returns:
            OrderHistoryResponse object
        """
        json_str = self._inner.get_order_history(status, limit, skip)
        return self._parse_response(json_str, OrderHistoryResponse)

    def get_order_analytics(self) -> OrderStatsResponse:
        """Get order analytics/stats.
        
        Returns:
            OrderStatsResponse object
        """
        json_str = self._inner.get_order_analytics()
        return self._parse_response(json_str, OrderStatsResponse)

    def swap_order_rate_decision(self, order_id: str, accept: bool) -> SwapOrderRateDecisionResponse:
        """Make rate decision for a swap order.
        
        Returns:
            SwapOrderRateDecisionResponse object
        """
        json_str = self._inner.swap_order_rate_decision(order_id, accept)
        return self._parse_response(json_str, SwapOrderRateDecisionResponse)

    # === LSP Operations ===

    def get_lsp_info(self) -> str:
        return self._inner.get_lsp_info()

    def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information.
        
        Returns:
            NetworkInfoResponse object
        """
        json_str = self._inner.get_lsp_network_info()
        return self._parse_response(json_str, NetworkInfoResponse)

    def get_lsp_order(self, order_id: str) -> str:
        return self._inner.get_lsp_order(order_id)

    def estimate_lsp_fees(self, channel_size: int) -> str:
        return self._inner.estimate_lsp_fees(channel_size)

    # === RGB Node Operations ===

    def get_rgb_node_info(self) -> str:
        return self._inner.get_rgb_node_info()

    def list_channels(self) -> str:
        return self._inner.list_channels()

    def list_peers(self) -> str:
        return self._inner.list_peers()

    def list_node_assets(self) -> str:
        return self._inner.list_node_assets()

    def get_asset_balance(self, asset_id: str) -> str:
        return self._inner.get_asset_balance(asset_id)

    def get_onchain_address(self) -> str:
        return self._inner.get_onchain_address()

    def get_btc_balance(self) -> str:
        return self._inner.get_btc_balance()

    def whitelist_trade(self, swapstring: str) -> str:
        return self._inner.whitelist_trade(swapstring)

    def decode_ln_invoice(self, invoice: str) -> str:
        return self._inner.decode_ln_invoice(invoice)

    def list_payments(self) -> str:
        return self._inner.list_payments()

    def init_wallet(self, password: str) -> str:
        return self._inner.init_wallet(password)

    def unlock_wallet(self, password: str) -> str:
        return self._inner.unlock_wallet(password)

    def lock_wallet(self) -> str:
        return self._inner.lock_wallet()

    # === Convenience Methods ===

    def get_asset_by_ticker(self, ticker: str) -> Asset:
        """Get asset by ticker.
        
        Returns:
            Asset object
        """
        json_str = self._inner.get_asset_by_ticker(ticker)
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
        json_str = self._inner.get_quote_by_assets(
            from_ticker, to_ticker, from_amount, to_amount
        )
        return self._parse_response(json_str, PairQuoteResponse)

    def complete_swap_from_quote(self, quote: Any) -> str:
        """Accepts a Quote model or JSON string"""
        return self._inner.complete_swap_from_quote(self._to_json(quote))

    def get_pair_by_ticker(self, ticker: str) -> TradingPair:
        """Get trading pair by ticker.
        
        Returns:
            TradingPair object
        """
        json_str = self._inner.get_pair_by_ticker(ticker)
        return self._parse_response(json_str, TradingPair)

    def list_active_assets(self) -> List[Asset]:
        """List only active assets.
        
        Returns:
            List of Asset objects
        """
        json_str = self._inner.list_active_assets()
        return self._parse_response(json_str, Asset)

    def list_active_pairs(self) -> List[TradingPair]:
        """List only active trading pairs.
        
        Returns:
            List of TradingPair objects
        """
        json_str = self._inner.list_active_pairs()
        return self._parse_response(json_str, TradingPair)

    def estimate_swap_fees(self, ticker: str, amount: int) -> int:
        return self._inner.estimate_swap_fees(ticker, amount)

    def find_asset_by_ticker(self, ticker: str) -> Asset:
        """Find asset by ticker.
        
        Returns:
            Asset object
        """
        json_str = self._inner.find_asset_by_ticker(ticker)
        return self._parse_response(json_str, Asset)

    def find_pair_by_ticker(self, ticker: str) -> TradingPair:
        """Find trading pair by ticker.
        
        Returns:
            TradingPair object
        """
        json_str = self._inner.find_pair_by_ticker(ticker)
        return self._parse_response(json_str, TradingPair)

    # === Legacy Methods (Strongly Typed Support) ===

    def create_order(self, request: Any) -> str:
        """
        Create LSP order.
        Args:
           request: CreateOrderRequest model or dict
        """
        return self._inner.create_order(self._to_json(request))

    def create_swap_order(self, request: Any) -> str:
        return self._inner.create_swap_order(self._to_json(request))

    def init_swap(self, request: Any) -> str:
        return self._inner.init_maker_swap(self._to_json(request))

    def execute_swap(self, request: Any) -> str:
        return self._inner.execute_maker_swap(self._to_json(request))

    def retry_delivery(self, order_id: str) -> str:
        return self._inner.retry_delivery(order_id)

    def connect_peer(self, request: Any) -> str:
        return self._inner.connect_peer(self._to_json(request))

    def create_quote_stream(self, pair_ticker: str) -> Any:
        return self._inner.create_quote_stream(pair_ticker)
