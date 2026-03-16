"""
Maker Client - Market Operations

Type-safe client for Kaleidoswap Market API.
All methods correspond directly to actual API endpoints.
Uses HttpClient + Pydantic models directly (no generated attrs client).
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from ._generated.api_types import (
    AssetsResponse,
    ChannelFees,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    LspInfoResponse,
    NetworkInfoResponse,
    OrderHistoryResponse,
    OrderRequest,
    OrderStatsResponse,
    PairQuoteRequest,
    PairQuoteResponse,
    RateDecisionRequest,
    RateDecisionResponse,
    RetryDeliveryRequest,
    RetryDeliveryResponse,
    RoutesRequest,
    RoutesResponse,
    SwapNodeInfoResponse,
    SwapOrder,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,
    SwapOrderStatus,
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    SwapRequest,
    SwapResponse,
    SwapRoute,
    SwapStatusRequest,
    SwapStatusResponse,
    TradingPair,
    TradingPairsResponse,
)
from ._http_client import HttpClient
from ._logging import get_logger
from ._utils import to_display_amount, to_raw_amount
from .errors import SwapError
from .types import Layer

if TYPE_CHECKING:
    from ._ws_client import QuoteResponse, WSClient

_log = get_logger("maker")


@dataclass
class SwapCompletionOptions:
    """Options for waiting for swap completion."""

    timeout: float = 300.0  # 5 minutes
    poll_interval: float = 2.0  # 2 seconds
    on_status_update: Callable[[str], None] | None = None


class MakerClient:
    """
    Market operations client for Kaleidoswap.

    Provides methods for:
    - Listing assets and trading pairs
    - Getting quotes
    - Creating and managing swap orders
    - Atomic swaps
    - LSP (Lightning Service Provider) operations
    - WebSocket streaming for real-time quotes
    """

    def __init__(self, http: HttpClient) -> None:
        """
        Initialize MakerClient.

        Args:
            http: Shared HttpClient instance
        """
        self._http = http
        self._ws: WSClient | None = None

    # =========================================================================
    # WebSocket Support
    # =========================================================================

    def enable_websocket(self, ws_url: str, user_id: str | None = None) -> WSClient:
        """
        Enable WebSocket for real-time updates.

        Args:
            ws_url: WebSocket server URL (e.g. ws://localhost:8000/ws)
            user_id: Optional client/user UUID for the path .../ws/<user_id>. If not provided, the client generates one.

        Returns:
            WSClient instance (use ws.client_id to read the UUID used)
        """
        from ._ws_client import WSClient

        self._ws = WSClient(url=ws_url, user_id=user_id)
        return self._ws

    async def stream_quotes(
        self,
        from_asset: str,
        to_asset: str,
        from_amount: int | None,
        from_layer: Layer | None,
        to_layer: Layer | None,
        on_update: Callable[[QuoteResponse], None],
        poll_interval: float = 2.0,
    ) -> Callable[[], None]:
        """
        Stream continuous quote updates via WebSocket (with automatic polling).

        Use this for monitoring price changes over time. For a single one-time quote,
        use `get_quote()` instead (simpler HTTP request, no WebSocket needed).

        The server sends one quote per request, so this function automatically
        requests new quotes at the specified interval to provide continuous updates.

        Args:
            from_asset: Source asset ticker
            to_asset: Destination asset ticker
            from_amount: Amount to convert (in smallest units)
            from_layer: Source layer
            to_layer: Destination layer
            on_update: Callback for quote updates
            poll_interval: Seconds between quote requests (default: 2.0)

        Returns:
            Stop function (stops polling and unsubscribes from updates)

        Raises:
            RuntimeError: If WebSocket not enabled

        Example:
            ```python
            def on_quote(quote):
                print(f"New price: {quote['price']}")

            stop = await client.maker.stream_quotes(
                from_asset="bitcoin", to_asset="rgb20:tether",
                from_amount=100000, from_layer=Layer.BTC_LN, to_layer=Layer.RGB_LN,
                on_update=on_quote, poll_interval=2.0,
            )

            # Quotes arrive every 2 seconds via callback
            await asyncio.sleep(30)

            # Stop streaming
            stop()
            ```
        """
        if not self._ws:
            raise RuntimeError("WebSocket not enabled. Call enable_websocket() first.")

        if not self._ws.is_connected():
            await self._ws.connect()

        self._ws.on("quote_response", on_update)

        quote_params = {
            "from_asset": from_asset,
            "to_asset": to_asset,
            "from_amount": from_amount,
            "to_amount": None,
            "from_layer": from_layer.value if from_layer else None,
            "to_layer": to_layer.value if to_layer else None,
        }

        _log.info(
            "maker.stream_quotes() started: %s -> %s poll_interval=%.1fs",
            from_asset,
            to_asset,
            poll_interval,
        )
        self._ws.request_quote(quote_params)

        polling_task: asyncio.Task[None] | None = None
        should_stop = False

        async def _poll_quotes() -> None:
            nonlocal should_stop
            while not should_stop:
                await asyncio.sleep(poll_interval)
                if not should_stop and self._ws and self._ws.is_connected():
                    self._ws.request_quote(quote_params)

        polling_task = asyncio.create_task(_poll_quotes())

        def stop() -> None:
            nonlocal should_stop, polling_task
            should_stop = True
            if polling_task and not polling_task.done():
                polling_task.cancel()
            if self._ws:
                self._ws.off("quote_response", on_update)
            _log.info("maker.stream_quotes() stopped: %s -> %s", from_asset, to_asset)

        return stop

    async def get_available_routes(
        self,
        from_ticker: str,
        to_ticker: str,
    ) -> list[SwapRoute]:
        """
        Get available routes for a trading pair by ticker symbols.

        Args:
            from_ticker: Source asset ticker (e.g., 'BTC')
            to_ticker: Destination asset ticker (e.g., 'USDT')

        Returns:
            List of SwapRoute models with from_layer and to_layer
        """
        pairs_response = await self.list_pairs()

        from_upper = from_ticker.upper()
        to_upper = to_ticker.upper()

        pair = None
        for p in pairs_response.pairs:
            if p.base.ticker.upper() == from_upper and p.quote.ticker.upper() == to_upper:
                pair = p
                break

        if not pair:
            for p in pairs_response.pairs:
                if p.base.ticker.upper() == to_upper and p.quote.ticker.upper() == from_upper:
                    if p.routes:
                        return [
                            SwapRoute(from_layer=r.to_layer, to_layer=r.from_layer)
                            for r in p.routes
                        ]
                    return []

        if not pair or not pair.routes:
            return []

        return list(pair.routes)

    async def stream_quotes_by_ticker(
        self,
        from_ticker: str,
        to_ticker: str,
        amount: int,
        on_update: Callable[[QuoteResponse], None],
        preferred_from_layer: Layer | None = None,
        preferred_to_layer: Layer | None = None,
        poll_interval: float = 2.0,
    ) -> Callable[[], None]:
        """
        Stream quotes using ticker symbols with automatic route discovery.

        Args:
            from_ticker: Source asset ticker
            to_ticker: Destination asset ticker
            amount: Amount to convert (in smallest units)
            on_update: Callback for quote updates
            preferred_from_layer: Optional preferred source layer
            preferred_to_layer: Optional preferred destination layer
            poll_interval: Seconds between quote requests (default: 2.0)

        Returns:
            Stop function

        Raises:
            ValueError: If no routes found for the pair
        """
        routes = await self.get_available_routes(from_ticker, to_ticker)

        if not routes:
            raise ValueError(
                f"No routes found for {from_ticker}/{to_ticker}. "
                "Pair may not exist or is not active."
            )

        selected_route = routes[0]
        if preferred_from_layer and preferred_to_layer:
            for route in routes:
                if (
                    route.from_layer == preferred_from_layer.value
                    and route.to_layer == preferred_to_layer.value
                ):
                    selected_route = route
                    break

        return await self.stream_quotes(
            from_ticker.upper(),
            to_ticker.upper(),
            amount,
            Layer(selected_route.from_layer),
            Layer(selected_route.to_layer),
            on_update,
            poll_interval=poll_interval,
        )

    async def stream_quotes_for_all_routes(
        self,
        from_ticker: str,
        to_ticker: str,
        amount: int,
        on_update: Callable[[str, QuoteResponse], None],
        poll_interval: float = 2.0,
    ) -> dict[str, Callable[[], None]]:
        """
        Stream quotes for all available routes of a trading pair.

        Args:
            from_ticker: Source asset ticker
            to_ticker: Destination asset ticker
            amount: Amount to convert (in smallest units)
            on_update: Callback receiving (route_key, quote)
            poll_interval: Seconds between quote requests (default: 2.0)

        Returns:
            Dict mapping route keys to stop functions

        Raises:
            ValueError: If no routes found for the pair
        """
        routes = await self.get_available_routes(from_ticker, to_ticker)

        if not routes:
            raise ValueError(
                f"No routes found for {from_ticker}/{to_ticker}. "
                "Pair may not exist or is not active."
            )

        stoppers: dict[str, Callable[[], None]] = {}

        for route in routes:
            route_key = f"{route.from_layer}->{route.to_layer}"

            def make_callback(key: str) -> Callable[[QuoteResponse], None]:
                return lambda quote: on_update(key, quote)

            stop = await self.stream_quotes(
                from_ticker.upper(),
                to_ticker.upper(),
                amount,
                Layer(route.from_layer),
                Layer(route.to_layer),
                make_callback(route_key),
                poll_interval=poll_interval,
            )

            stoppers[route_key] = stop

        return stoppers

    # =========================================================================
    # Market API - /api/v1/market/*
    # =========================================================================

    async def list_assets(self) -> AssetsResponse:
        """List all available assets."""
        _log.debug("maker.list_assets()")
        data = await self._http.maker_get("/api/v1/market/assets")
        result = AssetsResponse.model_validate(data)
        _log.debug("maker.list_assets() -> %d assets", len(result.assets))
        return result

    async def list_pairs(self) -> TradingPairsResponse:
        """List all trading pairs."""
        _log.debug("maker.list_pairs()")
        data = await self._http.maker_get("/api/v1/market/pairs")
        pairs_list = data.get("pairs") or []
        normalized_pairs = [TradingPair.model_validate(p) for p in pairs_list]
        return TradingPairsResponse(
            pairs=normalized_pairs,
            total=data.get("total", len(normalized_pairs)),
            limit=data.get("limit", len(normalized_pairs)),
            offset=data.get("offset", 0),
            timestamp=data.get("timestamp", 0),
        )

    async def get_quote(self, body: PairQuoteRequest) -> PairQuoteResponse:
        """
        Get a single quote for a trading pair (HTTP request).

        Use this for one-time quotes. For continuous price updates, use `stream_quotes()`.

        Args:
            body: Quote request with from/to asset details

        Returns:
            Quote with pricing, fees, and RFQ ID (valid for a limited time)

        Raises:
            NetworkError: On connection errors
            SwapError: On quote validation or server errors

        Example:
            ```python
            quote = await client.maker.get_quote(PairQuoteRequest(
                from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=100000),
                to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN),
            ))
            print(f"Price: {quote.price}, RFQ: {quote.rfq_id}")
            ```
        """
        data = await self._http.maker_post("/api/v1/market/quote", data=body)
        result = PairQuoteResponse.model_validate(data)
        _log.info(
            "maker.get_quote() -> rfq_id=%s price=%s expires_at=%s",
            result.rfq_id,
            result.price,
            result.expires_at,
        )
        return result

    async def get_pair_routes(self, pair_ticker: str) -> list[SwapRoute]:
        """
        Get available routes for a trading pair.

        Args:
            pair_ticker: Pair ticker string (e.g. "BTC/USDT")

        Returns:
            List of available swap routes for the pair
        """
        data = await self._http.maker_post(
            "/api/v1/market/pairs/routes",
            data={"pair_ticker": pair_ticker},
        )
        if isinstance(data, list):
            return [SwapRoute.model_validate(r) for r in data]
        return []

    async def get_market_routes(self, body: RoutesRequest) -> RoutesResponse:
        """
        Discover routes between assets.

        Args:
            body: Routes discovery request
        """
        data = await self._http.maker_post("/api/v1/market/routes", data=body)
        return RoutesResponse.model_validate(data)

    # =========================================================================
    # Swap Orders API - /api/v1/swaps/orders/*
    # =========================================================================

    async def create_swap_order(self, body: CreateSwapOrderRequest) -> CreateSwapOrderResponse:
        """
        Create a new swap order.

        Args:
            body: Swap order creation request
        """
        _log.info("maker.create_swap_order(): rfq_id=%s", body.rfq_id)
        data = await self._http.maker_post("/api/v1/swaps/orders", data=body)
        result = CreateSwapOrderResponse.model_validate(data)
        _log.info("maker.create_swap_order() -> order_id=%s", result.id)
        return result

    async def get_swap_order_status(self, body: SwapOrderStatusRequest) -> SwapOrderStatusResponse:
        """
        Get the status of a swap order.

        Args:
            body: Request with order_id
        """
        data = await self._http.maker_post("/api/v1/swaps/orders/status", data=body)
        return SwapOrderStatusResponse.model_validate(data)

    async def get_order_history(
        self,
        status: SwapOrderStatus | str | None = None,
        limit: int | None = None,
        skip: int | None = None,
    ) -> OrderHistoryResponse:
        """
        Get order history with optional filtering.

        Args:
            status: Filter by order status
            limit: Maximum number of results
            skip: Number of results to skip
        """
        params: dict[str, Any] = {}
        if status is not None:
            params["status"] = status.value if isinstance(status, SwapOrderStatus) else status
        if limit is not None:
            params["limit"] = limit
        if skip is not None:
            params["skip"] = skip
        data = await self._http.maker_get("/api/v1/swaps/orders/history", params=params or None)
        return OrderHistoryResponse.model_validate(data)

    async def get_order_analytics(self) -> OrderStatsResponse:
        """Get order analytics and statistics."""
        data = await self._http.maker_get("/api/v1/swaps/orders/analytics")
        return OrderStatsResponse.model_validate(data)

    async def submit_rate_decision(
        self, body: SwapOrderRateDecisionRequest
    ) -> SwapOrderRateDecisionResponse:
        """
        Submit a rate decision for a pending order.

        Args:
            body: Rate decision request
        """
        data = await self._http.maker_post("/api/v1/swaps/orders/rate_decision", data=body)
        return SwapOrderRateDecisionResponse.model_validate(data)

    # =========================================================================
    # Atomic Swaps API - /api/v1/swaps/*
    # =========================================================================

    async def init_swap(self, body: SwapRequest) -> SwapResponse:
        """
        Initialize an atomic swap.

        Args:
            body: Swap initialization request
        """
        _log.info("maker.init_swap(): rfq_id=%s", body.rfq_id)
        data = await self._http.maker_post("/api/v1/swaps/init", data=body)
        result = SwapResponse.model_validate(data)
        _log.info("maker.init_swap() -> payment_hash=%s", result.payment_hash)
        return result

    async def execute_swap(self, body: ConfirmSwapRequest) -> ConfirmSwapResponse:
        """
        Execute/confirm an atomic swap.

        Args:
            body: Swap execution request
        """
        _log.info("maker.execute_swap(): payment_hash=%s", body.payment_hash)
        data = await self._http.maker_post("/api/v1/swaps/execute", data=body)
        result = ConfirmSwapResponse.model_validate(data)
        _log.info("maker.execute_swap() -> status=%s", result.status)
        return result

    async def get_atomic_swap_status(self, body: SwapStatusRequest) -> SwapStatusResponse:
        """
        Get the status of an atomic swap.

        Args:
            body: Request with payment_hash
        """
        data = await self._http.maker_post("/api/v1/swaps/atomic/status", data=body)
        return SwapStatusResponse.model_validate(data)

    async def get_swap_node_info(self) -> SwapNodeInfoResponse:
        """Get swap node information."""
        data = await self._http.maker_get("/api/v1/swaps/nodeinfo")
        return SwapNodeInfoResponse.model_validate(data)

    # =========================================================================
    # LSPS1 API - /api/v1/lsps1/*
    # =========================================================================

    async def get_lsp_info(self) -> LspInfoResponse:
        """Get LSP information and options."""
        data = await self._http.maker_get("/api/v1/lsps1/get_info")
        return LspInfoResponse.model_validate(data)

    async def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information."""
        data = await self._http.maker_get("/api/v1/lsps1/network_info")
        return NetworkInfoResponse.model_validate(data)

    async def create_lsp_order(self, body: CreateOrderRequest) -> ChannelOrderResponse:
        """
        Create an LSP order for channel opening.

        Args:
            body: LSP order creation request
        """
        data = await self._http.maker_post("/api/v1/lsps1/create_order", data=body)
        return ChannelOrderResponse.model_validate(data)

    async def get_lsp_order(self, body: OrderRequest) -> ChannelOrderResponse:
        """
        Get LSP order details.

        Args:
            body: Request with order_id
        """
        data = await self._http.maker_post("/api/v1/lsps1/get_order", data=body)
        return ChannelOrderResponse.model_validate(data)

    async def estimate_lsp_fees(self, body: CreateOrderRequest) -> ChannelFees:
        """
        Estimate fees for an LSP order.

        Args:
            body: LSP order request for fee estimation
        """
        data = await self._http.maker_post("/api/v1/lsps1/estimate_fees", data=body)
        return ChannelFees.model_validate(data)

    async def submit_lsp_rate_decision(self, body: RateDecisionRequest) -> RateDecisionResponse:
        """
        Submit rate decision for LSP order.

        Args:
            body: Rate decision request
        """
        data = await self._http.maker_post("/api/v1/lsps1/rate_decision", data=body)
        return RateDecisionResponse.model_validate(data)

    async def retry_asset_delivery(self, body: RetryDeliveryRequest) -> RetryDeliveryResponse:
        """
        Retry asset delivery for a failed order.

        Args:
            body: Retry delivery request
        """
        data = await self._http.maker_post("/api/v1/lsps1/retry_delivery", data=body)
        return RetryDeliveryResponse.model_validate(data)

    # =========================================================================
    # Convenience Methods
    # =========================================================================

    async def wait_for_swap_completion(
        self,
        order_id: str,
        options: SwapCompletionOptions | None = None,
    ) -> SwapOrder:
        """
        Wait for a swap order to complete.

        Args:
            order_id: Order ID to monitor
            options: Polling options

        Returns:
            Final swap order

        Raises:
            SwapError: If timeout exceeded
        """
        opts = options or SwapCompletionOptions()
        start_time = asyncio.get_event_loop().time()
        _log.info(
            "maker.wait_for_swap_completion(): order_id=%s timeout=%.0fs",
            order_id,
            opts.timeout,
        )

        while asyncio.get_event_loop().time() - start_time < opts.timeout:
            try:
                status_response = await self.get_swap_order_status(
                    SwapOrderStatusRequest(order_id=order_id)
                )
                order = status_response.order

                if order:
                    status_obj = getattr(order, "status", None)
                    if isinstance(status_obj, SwapOrderStatus):
                        status_value = status_obj.value
                    elif status_obj is not None:
                        status_value = str(status_obj)
                    else:
                        status_value = None

                    _log.debug("Swap order %s status poll: %s", order_id, status_value)

                    if status_value and opts.on_status_update:
                        opts.on_status_update(status_value)

                    if status_value in {"FILLED", "FAILED", "EXPIRED", "CANCELLED"}:
                        _log.info(
                            "maker.wait_for_swap_completion(): order_id=%s terminal state=%s",
                            order_id,
                            status_value,
                        )
                        return order

            except Exception:
                pass

            await asyncio.sleep(opts.poll_interval)

        _log.error(
            "maker.wait_for_swap_completion(): order_id=%s timed out after %.0fs",
            order_id,
            opts.timeout,
        )
        raise SwapError(
            f"Swap completion timeout after {opts.timeout}s for order {order_id}",
            swap_id=order_id,
        )

    def to_raw(self, amount: float, precision: int) -> int:
        """
        Convert display amount to raw units.

        Args:
            amount: Display amount
            precision: Asset precision

        Returns:
            Raw amount in smallest units
        """
        return to_raw_amount(amount, precision)

    def to_display(self, raw_amount: int, precision: int) -> float:
        """
        Convert raw units to display amount.

        Args:
            raw_amount: Amount in smallest units
            precision: Asset precision

        Returns:
            Display amount
        """
        return to_display_amount(raw_amount, precision)
