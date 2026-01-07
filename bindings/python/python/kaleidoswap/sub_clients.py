"""
Sub-client modules for organized API access.
"""

from typing import TYPE_CHECKING, Any, List, Optional

if TYPE_CHECKING:
    from .generated_models import (Asset, NetworkInfoResponse,
                                   OrderHistoryResponse, OrderStatsResponse,
                                   PairQuoteResponse, SwapNodeInfoResponse,
                                   SwapOrderRateDecisionResponse,
                                   SwapOrderStatusResponse, SwapStatusResponse,
                                   TradingPair)
    from .rgb_node_models import (AddressResponse, AssetBalanceResponse,
                                  BtcBalanceResponse, Channel,
                                  DecodeLNInvoiceResponse, EmptyResponse,
                                  InitResponse, NodeInfoResponse, Payment,
                                  Peer)


class MarketClient:
    """Client for market operations (assets, pairs, quotes)."""

    def __init__(self, inner, parse_fn, execute_fn):
        self._inner = inner
        self._parse = parse_fn
        self._execute = execute_fn

    def list_assets(self) -> List["Asset"]:
        """List all available assets.

        Returns:
            List of Asset objects
        """
        from .generated_models import Asset

        py_obj = self._execute(self._inner.list_assets)
        return self._parse(py_obj, Asset)

    def list_pairs(self) -> List["TradingPair"]:
        """List all available trading pairs.

        Returns:
            List of TradingPair objects
        """
        from .generated_models import TradingPair

        py_obj = self._execute(self._inner.list_pairs)
        return self._parse(py_obj, TradingPair)

    def get_quote_by_pair(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
        from_layer: str = "BTC_LN",
        to_layer: str = "RGB_LN",
    ) -> "PairQuoteResponse":
        """Get quote for a trading pair with explicit layers.

        Args:
            ticker: Trading pair ticker (e.g., "BTC/USDT")
            from_amount: Amount to swap from (in smallest unit)
            to_amount: Amount to receive (in smallest unit)
            from_layer: Layer for from asset (e.g., "BTC_LN", "BTC_L1")
            to_layer: Layer for to asset (e.g., "RGB_LN", "RGB_L1")

        Returns:
            PairQuoteResponse object
        """
        from .generated_models import PairQuoteResponse

        py_obj = self._execute(
            self._inner.get_quote_by_pair,
            ticker,
            from_amount,
            to_amount,
            from_layer,
            to_layer,
        )
        return self._parse(py_obj, PairQuoteResponse)

    def list_active_assets(self) -> List["Asset"]:
        """List only active assets.

        Returns:
            List of Asset objects
        """
        from .generated_models import Asset

        py_obj = self._execute(self._inner.list_active_assets)
        return self._parse(py_obj, Asset)

    def list_active_pairs(self) -> List["TradingPair"]:
        """List only active trading pairs.

        Returns:
            List of TradingPair objects
        """
        from .generated_models import TradingPair

        py_obj = self._execute(self._inner.list_active_pairs)
        return self._parse(py_obj, TradingPair)

    def find_asset_by_ticker(self, ticker: str) -> "Asset":
        """Find asset by ticker.

        Returns:
            Asset object
        """
        from .generated_models import Asset

        py_obj = self._execute(self._inner.find_asset_by_ticker, ticker)
        return self._parse(py_obj, Asset)

    def find_pair_by_ticker(self, ticker: str) -> "TradingPair":
        """Find trading pair by ticker.

        Returns:
            TradingPair object
        """
        from .generated_models import TradingPair

        py_obj = self._execute(self._inner.find_pair_by_ticker, ticker)
        return self._parse(py_obj, TradingPair)

    # LEGACY: Deprecated methods (for backwards compatibility)
    def get_asset_by_ticker(self, ticker: str) -> "Asset":
        """Get asset by ticker (LEGACY - use find_asset_by_ticker)."""
        return self.find_asset_by_ticker(ticker)

    def get_pair_by_ticker(self, ticker: str) -> "TradingPair":
        """Get trading pair by ticker (LEGACY - use find_pair_by_ticker)."""
        return self.find_pair_by_ticker(ticker)

    def get_quote_by_assets(
        self,
        from_ticker: str,
        to_ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
        from_layer: str = "BTC_LN",
        to_layer: str = "RGB_LN",
    ) -> "PairQuoteResponse":
        """Get quote by asset tickers.

        Returns:
            PairQuoteResponse object
        """
        # Construct pair ticker from assets
        ticker = f"{from_ticker}/{to_ticker}"
        return self.get_quote_by_pair(
            ticker, from_amount, to_amount, from_layer, to_layer
        )

    # Additional methods that need to be exposed
    def get_node_info(self) -> "SwapNodeInfoResponse":
        """Get swap node information."""
        from .generated_models import SwapNodeInfoResponse

        py_obj = self._execute(self._inner.get_node_info)
        return self._parse(py_obj, SwapNodeInfoResponse)

    def get_swap_status(self, payment_hash: str) -> "SwapStatusResponse":
        """Get status of a swap."""
        from .generated_models import SwapStatusResponse

        py_obj = self._execute(self._inner.get_swap_status, payment_hash)
        return self._parse(py_obj, SwapStatusResponse)

    def wait_for_swap_completion(
        self, payment_hash: str, timeout_secs: float, poll_interval_secs: float
    ) -> Any:
        """Wait for swap completion."""
        return self._execute(
            self._inner.wait_for_swap_completion,
            payment_hash,
            timeout_secs,
            poll_interval_secs,
        )

    def get_swap_order_status(self, order_id: str) -> "SwapOrderStatusResponse":
        """Get swap order status."""
        from .generated_models import SwapOrderStatusResponse

        py_obj = self._execute(self._inner.get_swap_order_status, order_id)
        return self._parse(py_obj, SwapOrderStatusResponse)

    def get_order_history(
        self, status: Optional[str] = None, limit: int = 10, skip: int = 0
    ) -> "OrderHistoryResponse":
        """Get order history."""
        from .generated_models import OrderHistoryResponse

        py_obj = self._execute(self._inner.get_order_history, status, limit, skip)
        return self._parse(py_obj, OrderHistoryResponse)

    def get_order_analytics(self) -> "OrderStatsResponse":
        """Get order analytics/stats."""
        from .generated_models import OrderStatsResponse

        py_obj = self._execute(self._inner.get_order_analytics)
        return self._parse(py_obj, OrderStatsResponse)

    def swap_order_rate_decision(
        self, order_id: str, accept: bool
    ) -> "SwapOrderRateDecisionResponse":
        """Make rate decision for a swap order."""
        from .generated_models import SwapOrderRateDecisionResponse

        py_obj = self._execute(self._inner.swap_order_rate_decision, order_id, accept)
        return self._parse(py_obj, SwapOrderRateDecisionResponse)

    def get_lsp_info(self) -> Any:
        """Get LSP information."""
        return self._execute(self._inner.get_lsp_info)

    def get_lsp_network_info(self) -> "NetworkInfoResponse":
        """Get LSP network information."""
        from .generated_models import NetworkInfoResponse

        py_obj = self._execute(self._inner.get_lsp_network_info)
        return self._parse(py_obj, NetworkInfoResponse)

    def get_lsp_order(self, order_id: str) -> Any:
        """Get LSP order."""
        return self._execute(self._inner.get_lsp_order, order_id)

    def estimate_lsp_fees(self, channel_size: int) -> Any:
        """Estimate LSP fees."""
        return self._execute(self._inner.estimate_lsp_fees, channel_size)

    # LEGACY methods for backwards compatibility
    def create_order(self, request_json: str) -> Any:
        """Create LSP order (LEGACY)."""
        return self._execute(self._inner.create_order, request_json)

    def create_swap_order(self, request_json: str) -> Any:
        """Create swap order (LEGACY)."""
        return self._execute(self._inner.create_swap_order, request_json)

    def init_maker_swap(self, request_json: str) -> Any:
        """Initialize maker swap (LEGACY)."""
        return self._execute(self._inner.init_maker_swap, request_json)

    def execute_maker_swap(self, request_json: str) -> Any:
        """Execute maker swap (LEGACY)."""
        return self._execute(self._inner.execute_maker_swap, request_json)

    def retry_delivery(self, order_id: str) -> Any:
        """Retry asset delivery (LEGACY)."""
        return self._execute(self._inner.retry_delivery, order_id)


class OrdersClient:
    """Client for order management operations."""

    def __init__(self, inner, parse_fn, execute_fn):
        self._inner = inner
        self._parse = parse_fn
        self._execute = execute_fn

    def get_swap_order_status(self, order_id: str) -> "SwapOrderStatusResponse":
        """Get swap order status.

        Returns:
            SwapOrderStatusResponse object
        """
        from .generated_models import SwapOrderStatusResponse

        py_obj = self._execute(self._inner.get_swap_order_status, order_id)
        return self._parse(py_obj, SwapOrderStatusResponse)

    def get_order_history(
        self, status: Optional[str] = None, limit: int = 10, skip: int = 0
    ) -> "OrderHistoryResponse":
        """Get order history.

        Returns:
            OrderHistoryResponse object
        """
        from .generated_models import OrderHistoryResponse

        py_obj = self._execute(self._inner.get_order_history, status, limit, skip)
        return self._parse(py_obj, OrderHistoryResponse)

    def get_order_analytics(self) -> "OrderStatsResponse":
        """Get order analytics/stats.

        Returns:
            OrderStatsResponse object
        """
        from .generated_models import OrderStatsResponse

        py_obj = self._execute(self._inner.get_order_analytics)
        return self._parse(py_obj, OrderStatsResponse)

    def swap_order_rate_decision(
        self, order_id: str, accept: bool
    ) -> "SwapOrderRateDecisionResponse":
        """Make rate decision for a swap order.

        Returns:
            SwapOrderRateDecisionResponse object
        """
        from .generated_models import SwapOrderRateDecisionResponse

        py_obj = self._execute(self._inner.swap_order_rate_decision, order_id, accept)
        return self._parse(py_obj, SwapOrderRateDecisionResponse)


class SwapsClient:
    """Client for swap operations."""

    def __init__(self, inner, parse_fn, execute_fn):
        self._inner = inner
        self._parse = parse_fn
        self._execute = execute_fn

    def get_node_info(self) -> "SwapNodeInfoResponse":
        """Get swap node information.

        Returns:
            SwapNodeInfoResponse object
        """
        from .generated_models import SwapNodeInfoResponse

        py_obj = self._execute(self._inner.get_node_info)
        return self._parse(py_obj, SwapNodeInfoResponse)

    def get_swap_status(self, payment_hash: str) -> "SwapStatusResponse":
        """Get status of a swap.

        Returns:
            SwapStatusResponse object
        """
        from .generated_models import SwapStatusResponse

        py_obj = self._execute(self._inner.get_swap_status, payment_hash)
        return self._parse(py_obj, SwapStatusResponse)

    def wait_for_swap_completion(
        self, payment_hash: str, timeout_secs: float, poll_interval_secs: float
    ) -> Any:
        """Wait for swap completion."""
        return self._execute(
            self._inner.wait_for_swap_completion,
            payment_hash,
            timeout_secs,
            poll_interval_secs,
        )


class LspClient:
    """Client for Lightning Service Provider operations."""

    def __init__(self, inner, parse_fn, execute_fn):
        self._inner = inner
        self._parse = parse_fn
        self._execute = execute_fn

    def get_lsp_info(self) -> Any:
        """Get LSP information (returns dict)."""
        return self._execute(self._inner.get_lsp_info)

    def get_lsp_network_info(self) -> "NetworkInfoResponse":
        """Get LSP network information.

        Returns:
            NetworkInfoResponse object
        """
        from .generated_models import NetworkInfoResponse

        py_obj = self._execute(self._inner.get_lsp_network_info)
        return self._parse(py_obj, NetworkInfoResponse)

    def get_lsp_order(self, order_id: str) -> Any:
        """Get LSP order (returns dict)."""
        return self._execute(self._inner.get_lsp_order, order_id)

    def estimate_lsp_fees(self, channel_size: int) -> Any:
        """Estimate LSP fees (returns dict)."""
        return self._execute(self._inner.estimate_lsp_fees, channel_size)


class NodeClient:
    """Client for RGB Lightning Node operations."""

    def __init__(self, inner, parse_fn, execute_fn):
        self._inner = inner
        self._parse = parse_fn
        self._execute = execute_fn

    def get_rgb_node_info(self) -> "NodeInfoResponse":
        """Get RGB node info.

        Returns:
            NodeInfoResponse object
        """
        from .rgb_node_models import NodeInfoResponse

        py_obj = self._execute(self._inner.get_rgb_node_info)
        return self._parse(py_obj, NodeInfoResponse)

    def list_channels(self) -> List["Channel"]:
        """List channels.

        Returns:
            List of Channel objects
        """
        from .rgb_node_models import Channel

        py_obj = self._execute(self._inner.list_channels)
        return self._parse(py_obj, Channel)

    def list_peers(self) -> List["Peer"]:
        """List peers.

        Returns:
            List of Peer objects
        """
        from .rgb_node_models import Peer

        py_obj = self._execute(self._inner.list_peers)
        return self._parse(py_obj, Peer)

    def connect_peer(self, request_json: str) -> Any:
        """Connect to a peer."""
        return self._execute(self._inner.connect_peer, request_json)

    def list_node_assets(self) -> List[Any]:
        """List node assets.

        Returns:
            List of asset objects (can be AssetNIA, AssetUDA, or AssetCFA)
        """
        py_obj = self._execute(self._inner.list_node_assets)
        return self._parse(py_obj, list)

    def get_asset_balance(self, asset_id: str) -> "AssetBalanceResponse":
        """Get asset balance.

        Returns:
            AssetBalanceResponse object
        """
        from .rgb_node_models import AssetBalanceResponse

        py_obj = self._execute(self._inner.get_asset_balance, asset_id)
        return self._parse(py_obj, AssetBalanceResponse)

    def get_onchain_address(self) -> "AddressResponse":
        """Get onchain address.

        Returns:
            AddressResponse object
        """
        from .rgb_node_models import AddressResponse

        py_obj = self._execute(self._inner.get_onchain_address)
        return self._parse(py_obj, AddressResponse)

    def get_btc_balance(self) -> "BtcBalanceResponse":
        """Get BTC balance.

        Returns:
            BtcBalanceResponse object
        """
        from .rgb_node_models import BtcBalanceResponse

        py_obj = self._execute(self._inner.get_btc_balance)
        return self._parse(py_obj, BtcBalanceResponse)

    def whitelist_trade(self, swapstring: str) -> Any:
        """Whitelist a trade."""
        return self._execute(self._inner.whitelist_trade, swapstring)

    def decode_ln_invoice(self, invoice: str) -> "DecodeLNInvoiceResponse":
        """Decode Lightning invoice.

        Returns:
            DecodeLNInvoiceResponse object
        """
        from .rgb_node_models import DecodeLNInvoiceResponse

        py_obj = self._execute(self._inner.decode_ln_invoice, invoice)
        return self._parse(py_obj, DecodeLNInvoiceResponse)

    def list_payments(self) -> List["Payment"]:
        """List payments.

        Returns:
            List of Payment objects
        """
        from .rgb_node_models import Payment

        py_obj = self._execute(self._inner.list_payments)
        return self._parse(py_obj, Payment)

    def init_wallet(self, password: str) -> "InitResponse":
        """Initialize wallet.

        Returns:
            InitResponse object with mnemonic
        """
        from .rgb_node_models import InitResponse

        py_obj = self._execute(self._inner.init_wallet, password)
        return self._parse(py_obj, InitResponse)

    def unlock_wallet(self, password: str) -> "EmptyResponse":
        """Unlock wallet.

        Returns:
            EmptyResponse object
        """
        from .rgb_node_models import EmptyResponse

        py_obj = self._execute(self._inner.unlock_wallet, password)
        return self._parse(py_obj, EmptyResponse)

    def lock_wallet(self) -> "EmptyResponse":
        """Lock wallet.

        Returns:
            EmptyResponse object
        """
        from .rgb_node_models import EmptyResponse

        py_obj = self._execute(self._inner.lock_wallet)
        return self._parse(py_obj, EmptyResponse)
