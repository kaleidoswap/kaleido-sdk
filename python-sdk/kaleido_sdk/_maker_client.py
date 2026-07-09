"""
Maker Client - Market Operations

Type-safe client for Kaleidoswap Market API.
All methods correspond directly to actual API endpoints.
Uses HttpClient + Pydantic models directly (no generated attrs client).
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import TYPE_CHECKING

from ._generated.api_types import (
    AssetsResponse,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateOrderRequest,
    EstimateFeesRequest,
    EstimateFeesResponse,
    LspInfoResponse,
    NetworkInfoResponse,
    OrderRequest,
    PairQuoteRequest,
    PairQuoteResponse,
    RateDecisionRequest,
    RateDecisionResponse,
    RoutesRequest,
    RoutesResponse,
    SwapNodeInfoResponse,
    SwapRequest,
    SwapResponse,
    SwapRoute,
    SwapStatusRequest,
    SwapStatusResponse,
    TradingPairResponseModel,
    TradingPairsResponse,
)
from ._http_client import HttpClient
from ._logging import get_logger
from ._utils import parse_raw_amount, to_display_amount
from .types import Layer

if TYPE_CHECKING:
    from ._ws_client import QuoteResponse, WSClient

_log = get_logger("maker")


class MakerClient:
    """
    Market operations client for Kaleidoswap.

    Provides methods for:
    - Listing assets and trading pairs
    - Getting quotes
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
        normalized_pairs = [TradingPairResponseModel.model_validate(p) for p in pairs_list]
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

    async def estimate_lsp_fees(self, body: EstimateFeesRequest) -> EstimateFeesResponse:
        """
        Estimate fees for an LSP order.

        Args:
            body: LSP order request for fee estimation
        """
        data = await self._http.maker_post("/api/v1/lsps1/estimate_fees", data=body)
        return EstimateFeesResponse.model_validate(data)

    async def submit_lsp_rate_decision(self, body: RateDecisionRequest) -> RateDecisionResponse:
        """
        Submit rate decision for LSP order.

        Args:
            body: Rate decision request
        """
        data = await self._http.maker_post("/api/v1/lsps1/rate_decision", data=body)
        return RateDecisionResponse.model_validate(data)

    # =========================================================================
    # Convenience Methods
    # =========================================================================

    def to_raw(self, amount: float, precision: int) -> int:
        """
        Convert display amount to raw units.

        Args:
            amount: Display amount
            precision: Asset precision

        Returns:
            Raw amount in smallest units
        """
        return parse_raw_amount(amount, precision)

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
