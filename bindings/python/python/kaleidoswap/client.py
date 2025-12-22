import json
from typing import Any, List, Optional, Union

from .kaleidoswap import PyKaleidoClient, PyKaleidoConfig


class KaleidoClient:
    """
    Python wrapper for the Kaleidoswap SDK Rust client.
    Handles serialization of Pydantic models or dicts to JSON strings for the native binding.
    """

    def __init__(self, config: PyKaleidoConfig):
        self._inner = PyKaleidoClient(config)

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

    def has_node(self) -> bool:
        return self._inner.has_node()

    # === Market Operations ===

    def list_assets(self) -> str:
        return self._inner.list_assets()

    def list_pairs(self) -> str:
        return self._inner.list_pairs()

    def get_quote_by_pair(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> str:
        return self._inner.get_quote_by_pair(ticker, from_amount, to_amount)

    def get_best_quote(
        self,
        ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> str:
        return self._inner.get_best_quote(ticker, from_amount, to_amount)

    # === Swap Operations ===

    def get_node_info(self) -> str:
        return self._inner.get_node_info()

    def get_swap_status(self, payment_hash: str) -> str:
        return self._inner.get_swap_status(payment_hash)

    def wait_for_swap_completion(
        self, payment_hash: str, timeout_secs: float, poll_interval_secs: float
    ) -> str:
        return self._inner.wait_for_swap_completion(
            payment_hash, timeout_secs, poll_interval_secs
        )

    # === Order Operations ===

    def get_swap_order_status(self, order_id: str) -> str:
        return self._inner.get_swap_order_status(order_id)

    def get_order_history(
        self, status: Optional[str] = None, limit: int = 10, skip: int = 0
    ) -> str:
        return self._inner.get_order_history(status, limit, skip)

    def get_order_analytics(self) -> str:
        return self._inner.get_order_analytics()

    def swap_order_rate_decision(self, order_id: str, accept: bool) -> str:
        return self._inner.swap_order_rate_decision(order_id, accept)

    # === LSP Operations ===

    def get_lsp_info(self) -> str:
        return self._inner.get_lsp_info()

    def get_lsp_network_info(self) -> str:
        return self._inner.get_lsp_network_info()

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

    def get_asset_by_ticker(self, ticker: str) -> str:
        return self._inner.get_asset_by_ticker(ticker)

    def get_quote_by_assets(
        self,
        from_ticker: str,
        to_ticker: str,
        from_amount: Optional[int] = None,
        to_amount: Optional[int] = None,
    ) -> str:
        return self._inner.get_quote_by_assets(
            from_ticker, to_ticker, from_amount, to_amount
        )

    def complete_swap_from_quote(self, quote: Any) -> str:
        """Accepts a Quote model or JSON string"""
        return self._inner.complete_swap_from_quote(self._to_json(quote))

    def get_pair_by_ticker(self, ticker: str) -> str:
        return self._inner.get_pair_by_ticker(ticker)

    def list_active_assets(self) -> str:
        return self._inner.list_active_assets()

    def list_active_pairs(self) -> str:
        return self._inner.list_active_pairs()

    def estimate_swap_fees(self, ticker: str, amount: int) -> int:
        return self._inner.estimate_swap_fees(ticker, amount)

    def find_asset_by_ticker(self, ticker: str) -> str:
        return self._inner.find_asset_by_ticker(ticker)

    def find_pair_by_ticker(self, ticker: str) -> str:
        return self._inner.find_pair_by_ticker(ticker)

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
