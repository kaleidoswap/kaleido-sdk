"""
Sub-client modules for organized API access.
"""

from typing import Any, List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
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
    from .rgb_node_models import (
        NodeInfoResponse,
        Channel,
        Peer,
        AssetBalanceResponse,
        AddressResponse,
        BtcBalanceResponse,
        DecodeLNInvoiceResponse,
        Payment,
        InitResponse,
        EmptyResponse,
    )


class MarketClient:
    """Client for market operations (assets, pairs, quotes)."""
    
    def __init__(self, inner, parse_fn):
        self._inner = inner
        self._parse = parse_fn
    
    def list_assets(self) -> List["Asset"]:
        """List all available assets.
        
        Returns:
            List of Asset objects
        """
        from .generated_models import Asset
        json_str = self._inner.list_assets()
        return self._parse(json_str, Asset)
    
    def list_pairs(self) -> List["TradingPair"]:
        """List all available trading pairs.
        
        Returns:
            List of TradingPair objects
        """
        from .generated_models import TradingPair
        json_str = self._inner.list_pairs()
        return self._parse(json_str, TradingPair)
    
    def get_quote_by_pair(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> "PairQuoteResponse":
        """Get quote for a trading pair.
        
        Returns:
            PairQuoteResponse object
        """
        from .generated_models import PairQuoteResponse
        json_str = self._inner.get_quote_by_pair(ticker, from_amount, to_amount)
        return self._parse(json_str, PairQuoteResponse)
    
    def get_best_quote(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> "PairQuoteResponse":
        """Get best quote for an asset.
        
        Returns:
            PairQuoteResponse object
        """
        from .generated_models import PairQuoteResponse
        json_str = self._inner.get_best_quote(ticker, from_amount, to_amount)
        return self._parse(json_str, PairQuoteResponse)
    
    def list_active_assets(self) -> List["Asset"]:
        """List only active assets.
        
        Returns:
            List of Asset objects
        """
        from .generated_models import Asset
        json_str = self._inner.list_active_assets()
        return self._parse(json_str, Asset)
    
    def list_active_pairs(self) -> List["TradingPair"]:
        """List only active trading pairs.
        
        Returns:
            List of TradingPair objects
        """
        from .generated_models import TradingPair
        json_str = self._inner.list_active_pairs()
        return self._parse(json_str, TradingPair)
    
    def get_asset_by_ticker(self, ticker: str) -> "Asset":
        """Get asset by ticker.
        
        Returns:
            Asset object
        """
        from .generated_models import Asset
        json_str = self._inner.get_asset_by_ticker(ticker)
        return self._parse(json_str, Asset)
    
    def get_pair_by_ticker(self, ticker: str) -> "TradingPair":
        """Get trading pair by ticker.
        
        Returns:
            TradingPair object
        """
        from .generated_models import TradingPair
        json_str = self._inner.get_pair_by_ticker(ticker)
        return self._parse(json_str, TradingPair)
    
    def get_quote_by_assets(
        self,
        from_ticker: str,
        to_ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> "PairQuoteResponse":
        """Get quote by asset tickers.
        
        Returns:
            PairQuoteResponse object
        """
        from .generated_models import PairQuoteResponse
        json_str = self._inner.get_quote_by_assets(
            from_ticker, to_ticker, from_amount, to_amount
        )
        return self._parse(json_str, PairQuoteResponse)


class OrdersClient:
    """Client for order management operations."""
    
    def __init__(self, inner, parse_fn):
        self._inner = inner
        self._parse = parse_fn
    
    def get_swap_order_status(self, order_id: str) -> "SwapOrderStatusResponse":
        """Get swap order status.
        
        Returns:
            SwapOrderStatusResponse object
        """
        from .generated_models import SwapOrderStatusResponse
        json_str = self._inner.get_swap_order_status(order_id)
        return self._parse(json_str, SwapOrderStatusResponse)
    
    def get_order_history(
        self, status: Optional[str] = None, limit: int = 10, skip: int = 0
    ) -> "OrderHistoryResponse":
        """Get order history.
        
        Returns:
            OrderHistoryResponse object
        """
        from .generated_models import OrderHistoryResponse
        json_str = self._inner.get_order_history(status, limit, skip)
        return self._parse(json_str, OrderHistoryResponse)
    
    def get_order_analytics(self) -> "OrderStatsResponse":
        """Get order analytics/stats.
        
        Returns:
            OrderStatsResponse object
        """
        from .generated_models import OrderStatsResponse
        json_str = self._inner.get_order_analytics()
        return self._parse(json_str, OrderStatsResponse)
    
    def swap_order_rate_decision(self, order_id: str, accept: bool) -> "SwapOrderRateDecisionResponse":
        """Make rate decision for a swap order.
        
        Returns:
            SwapOrderRateDecisionResponse object
        """
        from .generated_models import SwapOrderRateDecisionResponse
        json_str = self._inner.swap_order_rate_decision(order_id, accept)
        return self._parse(json_str, SwapOrderRateDecisionResponse)


class SwapsClient:
    """Client for swap operations."""
    
    def __init__(self, inner, parse_fn):
        self._inner = inner
        self._parse = parse_fn
    
    def get_node_info(self) -> "SwapNodeInfoResponse":
        """Get swap node information.
        
        Returns:
            SwapNodeInfoResponse object
        """
        from .generated_models import SwapNodeInfoResponse
        json_str = self._inner.get_node_info()
        return self._parse(json_str, SwapNodeInfoResponse)
    
    def get_swap_status(self, payment_hash: str) -> "SwapStatusResponse":
        """Get status of a swap.
        
        Returns:
            SwapStatusResponse object
        """
        from .generated_models import SwapStatusResponse
        json_str = self._inner.get_swap_status(payment_hash)
        return self._parse(json_str, SwapStatusResponse)
    
    def wait_for_swap_completion(
        self, payment_hash: str, timeout_secs: float, poll_interval_secs: float
    ) -> str:
        """Wait for swap completion."""
        return self._inner.wait_for_swap_completion(
            payment_hash, timeout_secs, poll_interval_secs
        )


class LspClient:
    """Client for Lightning Service Provider operations."""
    
    def __init__(self, inner, parse_fn):
        self._inner = inner
        self._parse = parse_fn
    
    def get_lsp_info(self) -> str:
        """Get LSP information (returns raw JSON for now)."""
        return self._inner.get_lsp_info()
    
    def get_lsp_network_info(self) -> "NetworkInfoResponse":
        """Get LSP network information.
        
        Returns:
            NetworkInfoResponse object
        """
        from .generated_models import NetworkInfoResponse
        json_str = self._inner.get_lsp_network_info()
        return self._parse(json_str, NetworkInfoResponse)
    
    def get_lsp_order(self, order_id: str) -> str:
        """Get LSP order (returns raw JSON for now)."""
        return self._inner.get_lsp_order(order_id)
    
    def estimate_lsp_fees(self, channel_size: int) -> str:
        """Estimate LSP fees (returns raw JSON for now)."""
        return self._inner.estimate_lsp_fees(channel_size)


class NodeClient:
    """Client for RGB Lightning Node operations."""
    
    def __init__(self, inner, parse_fn):
        self._inner = inner
        self._parse = parse_fn
    
    def get_rgb_node_info(self) -> "NodeInfoResponse":
        """Get RGB node info.
        
        Returns:
            NodeInfoResponse object
        """
        from .rgb_node_models import NodeInfoResponse
        json_str = self._inner.get_rgb_node_info()
        return self._parse(json_str, NodeInfoResponse)
    
    def list_channels(self) -> List["Channel"]:
        """List channels.
        
        Returns:
            List of Channel objects
        """
        from .rgb_node_models import Channel
        json_str = self._inner.list_channels()
        return self._parse(json_str, Channel)
    
    def list_peers(self) -> List["Peer"]:
        """List peers.
        
        Returns:
            List of Peer objects
        """
        from .rgb_node_models import Peer
        json_str = self._inner.list_peers()
        return self._parse(json_str, Peer)
    
    def list_node_assets(self) -> List[Any]:
        """List node assets.
        
        Returns:
            List of asset objects (can be AssetNIA, AssetUDA, or AssetCFA)
        """
        json_str = self._inner.list_node_assets()
        return self._parse(json_str, list)
    
    def get_asset_balance(self, asset_id: str) -> "AssetBalanceResponse":
        """Get asset balance.
        
        Returns:
            AssetBalanceResponse object
        """
        from .rgb_node_models import AssetBalanceResponse
        json_str = self._inner.get_asset_balance(asset_id)
        return self._parse(json_str, AssetBalanceResponse)
    
    def get_onchain_address(self) -> "AddressResponse":
        """Get onchain address.
        
        Returns:
            AddressResponse object
        """
        from .rgb_node_models import AddressResponse
        json_str = self._inner.get_onchain_address()
        return self._parse(json_str, AddressResponse)
    
    def get_btc_balance(self) -> "BtcBalanceResponse":
        """Get BTC balance.
        
        Returns:
            BtcBalanceResponse object
        """
        from .rgb_node_models import BtcBalanceResponse
        json_str = self._inner.get_btc_balance()
        return self._parse(json_str, BtcBalanceResponse)
    
    def decode_ln_invoice(self, invoice: str) -> "DecodeLNInvoiceResponse":
        """Decode Lightning invoice.
        
        Returns:
            DecodeLNInvoiceResponse object
        """
        from .rgb_node_models import DecodeLNInvoiceResponse
        json_str = self._inner.decode_ln_invoice(invoice)
        return self._parse(json_str, DecodeLNInvoiceResponse)
    
    def list_payments(self) -> List["Payment"]:
        """List payments.
        
        Returns:
            List of Payment objects
        """
        from .rgb_node_models import Payment
        json_str = self._inner.list_payments()
        return self._parse(json_str, Payment)
    
    def init_wallet(self, password: str) -> "InitResponse":
        """Initialize wallet.
        
        Returns:
            InitResponse object with mnemonic
        """
        from .rgb_node_models import InitResponse
        json_str = self._inner.init_wallet(password)
        return self._parse(json_str, InitResponse)
    
    def unlock_wallet(self, password: str) -> "EmptyResponse":
        """Unlock wallet.
        
        Returns:
            EmptyResponse object
        """
        from .rgb_node_models import EmptyResponse
        json_str = self._inner.unlock_wallet(password)
        return self._parse(json_str, EmptyResponse)
    
    def lock_wallet(self) -> "EmptyResponse":
        """Lock wallet.
        
        Returns:
            EmptyResponse object
        """
        from .rgb_node_models import EmptyResponse
        json_str = self._inner.lock_wallet()
        return self._parse(json_str, EmptyResponse)
