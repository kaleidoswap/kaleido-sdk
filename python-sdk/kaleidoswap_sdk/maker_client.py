"""
Maker Client - Market Operations

Type-safe client for Kaleidoswap Market API.
All methods correspond directly to actual API endpoints.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Callable

from .errors import SwapError
from .types import (
    AssetsResponse,
    ChannelFees,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateLspOrderRequest,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    GetLspInfoResponse,
    Layer,
    NetworkInfoResponse,
    OrderHistoryResponse,
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
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    SwapRequest,
    SwapResponse,
    SwapRoute,
    SwapStatusRequest,
    SwapStatusResponse,
    TradingPairsResponse,
)
from .utils import to_display_amount, to_raw_amount

if TYPE_CHECKING:
    from .http_client import HttpClient
    from .ws_client import WSClient, QuoteResponse


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

    def __init__(self, http: "HttpClient") -> None:
        """
        Initialize MakerClient.

        Args:
            http: HTTP client for API communication
        """
        self._http = http
        self._ws: "WSClient | None" = None

    # =========================================================================
    # WebSocket Support
    # =========================================================================

    def enable_websocket(self, ws_url: str) -> "WSClient":
        """
        Enable WebSocket for real-time updates.

        Args:
            ws_url: WebSocket server URL

        Returns:
            WSClient instance
        """
        from .ws_client import WSClient

        self._ws = WSClient(url=ws_url)
        return self._ws

    async def stream_quotes(
        self,
        from_asset: str,
        to_asset: str,
        from_amount: int | None,
        from_layer: Layer | None,
        to_layer: Layer | None,
        on_update: Callable[["QuoteResponse"], None],
    ) -> Callable[[], None]:
        """
        Stream real-time quote updates.

        Args:
            from_asset: Source asset ticker
            to_asset: Destination asset ticker
            from_amount: Amount to convert (in smallest units)
            from_layer: Source layer
            to_layer: Destination layer
            on_update: Callback for quote updates

        Returns:
            Unsubscribe function

        Raises:
            RuntimeError: If WebSocket not enabled
        """
        if not self._ws:
            raise RuntimeError("WebSocket not enabled. Call enable_websocket() first.")

        if not self._ws.is_connected():
            await self._ws.connect()

        # Subscribe to quote updates
        self._ws.on("quote_response", on_update)

        # Send initial quote request
        self._ws.request_quote({
            "from_asset": from_asset,
            "to_asset": to_asset,
            "from_amount": from_amount,
            "to_amount": None,
            "from_layer": from_layer.value if from_layer else None,
            "to_layer": to_layer.value if to_layer else None,
        })

        # Return unsubscribe function
        def unsubscribe() -> None:
            if self._ws:
                self._ws.off("quote_response", on_update)

        return unsubscribe

    async def get_available_routes(
        self,
        from_ticker: str,
        to_ticker: str,
    ) -> list[dict[str, str]]:
        """
        Get available routes for a trading pair by ticker symbols.

        Args:
            from_ticker: Source asset ticker (e.g., 'BTC')
            to_ticker: Destination asset ticker (e.g., 'USDT')

        Returns:
            List of routes with from_layer and to_layer
        """
        pairs_response = await self.list_pairs()

        # Find matching pair (case-insensitive) - try direct match first
        from_upper = from_ticker.upper()
        to_upper = to_ticker.upper()

        pair = None
        for p in pairs_response.pairs:
            if (
                p.base.ticker.upper() == from_upper
                and p.quote.ticker.upper() == to_upper
            ):
                pair = p
                break

        # If not found, try inverse pair
        if not pair:
            for p in pairs_response.pairs:
                if (
                    p.base.ticker.upper() == to_upper
                    and p.quote.ticker.upper() == from_upper
                ):
                    # Inverse pair found, swap the layers in routes
                    if p.routes:
                        return [
                            {"from_layer": r.to_layer, "to_layer": r.from_layer}
                            for r in p.routes
                        ]
                    return []

        if not pair or not pair.routes:
            return []

        return [{"from_layer": r.from_layer, "to_layer": r.to_layer} for r in pair.routes]

    async def stream_quotes_by_ticker(
        self,
        from_ticker: str,
        to_ticker: str,
        amount: int,
        on_update: Callable[["QuoteResponse"], None],
        preferred_from_layer: Layer | None = None,
        preferred_to_layer: Layer | None = None,
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

        Returns:
            Unsubscribe function

        Raises:
            ValueError: If no routes found for the pair
        """
        routes = await self.get_available_routes(from_ticker, to_ticker)

        if not routes:
            raise ValueError(
                f"No routes found for {from_ticker}/{to_ticker}. "
                "Pair may not exist or is not active."
            )

        # Find preferred route or use first available
        selected_route = routes[0]
        if preferred_from_layer and preferred_to_layer:
            for route in routes:
                if (
                    route["from_layer"] == preferred_from_layer.value
                    and route["to_layer"] == preferred_to_layer.value
                ):
                    selected_route = route
                    break

        # Stream quotes using the selected route
        return await self.stream_quotes(
            from_ticker.upper(),
            to_ticker.upper(),
            amount,
            Layer(selected_route["from_layer"]),
            Layer(selected_route["to_layer"]),
            on_update,
        )

    async def stream_quotes_for_all_routes(
        self,
        from_ticker: str,
        to_ticker: str,
        amount: int,
        on_update: Callable[[str, "QuoteResponse"], None],
    ) -> dict[str, Callable[[], None]]:
        """
        Stream quotes for all available routes of a trading pair.

        Args:
            from_ticker: Source asset ticker
            to_ticker: Destination asset ticker
            amount: Amount to convert (in smallest units)
            on_update: Callback receiving (route_key, quote)

        Returns:
            Dict mapping route keys to unsubscribe functions

        Raises:
            ValueError: If no routes found for the pair
        """
        routes = await self.get_available_routes(from_ticker, to_ticker)

        if not routes:
            raise ValueError(
                f"No routes found for {from_ticker}/{to_ticker}. "
                "Pair may not exist or is not active."
            )

        unsubscribers: dict[str, Callable[[], None]] = {}

        # Subscribe to each route
        for route in routes:
            route_key = f"{route['from_layer']}->{route['to_layer']}"

            def make_callback(key: str) -> Callable[["QuoteResponse"], None]:
                return lambda quote: on_update(key, quote)

            unsubscribe = await self.stream_quotes(
                from_ticker.upper(),
                to_ticker.upper(),
                amount,
                Layer(route["from_layer"]),
                Layer(route["to_layer"]),
                make_callback(route_key),
            )

            unsubscribers[route_key] = unsubscribe

        return unsubscribers

    # =========================================================================
    # Market API - /api/v1/market/*
    # =========================================================================

    async def list_assets(self) -> AssetsResponse:
        """List all available assets."""
        data = await self._http.maker_get("/api/v1/market/assets")
        return AssetsResponse.model_validate(data)

    async def list_pairs(self) -> TradingPairsResponse:
        """List all trading pairs."""
        data = await self._http.maker_get("/api/v1/market/pairs")
        return TradingPairsResponse.model_validate(data)

    async def get_quote(self, body: PairQuoteRequest) -> PairQuoteResponse:
        """
        Get a quote for a trading pair.

        Args:
            body: Quote request with from/to asset details
        """
        data = await self._http.maker_post("/api/v1/market/quote", body)
        return PairQuoteResponse.model_validate(data)

    async def get_pair_routes(
        self, body: dict[str, Any]
    ) -> list[SwapRoute]:
        """
        Get available routes for a trading pair.

        Args:
            body: Request with pair_id or ticker information
        """
        data = await self._http.maker_post("/api/v1/market/pairs/routes", body)
        return [SwapRoute.model_validate(r) for r in data]

    async def get_market_routes(self, body: RoutesRequest) -> RoutesResponse:
        """
        Discover routes between assets.

        Args:
            body: Routes discovery request
        """
        data = await self._http.maker_post("/api/v1/market/routes", body)
        return RoutesResponse.model_validate(data)

    # =========================================================================
    # Swap Orders API - /api/v1/swaps/orders/*
    # =========================================================================

    async def create_swap_order(
        self, body: CreateSwapOrderRequest
    ) -> CreateSwapOrderResponse:
        """
        Create a new swap order.

        Args:
            body: Swap order creation request
        """
        data = await self._http.maker_post("/api/v1/swaps/orders", body)
        return CreateSwapOrderResponse.model_validate(data)

    async def get_swap_order_status(
        self, body: SwapOrderStatusRequest
    ) -> SwapOrderStatusResponse:
        """
        Get the status of a swap order.

        Args:
            body: Request with order_id
        """
        data = await self._http.maker_post("/api/v1/swaps/orders/status", body)
        return SwapOrderStatusResponse.model_validate(data)

    async def get_order_history(
        self,
        status: str | None = None,
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
        if status:
            params["status"] = status
        if limit:
            params["limit"] = limit
        if skip:
            params["skip"] = skip

        data = await self._http.maker_get(
            "/api/v1/swaps/orders/history",
            params=params if params else None,
        )
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
        data = await self._http.maker_post("/api/v1/swaps/orders/rate_decision", body)
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
        data = await self._http.maker_post("/api/v1/swaps/init", body)
        return SwapResponse.model_validate(data)

    async def execute_swap(self, body: ConfirmSwapRequest) -> ConfirmSwapResponse:
        """
        Execute/confirm an atomic swap.

        Args:
            body: Swap execution request
        """
        data = await self._http.maker_post("/api/v1/swaps/execute", body)
        return ConfirmSwapResponse.model_validate(data)

    async def get_atomic_swap_status(
        self, body: SwapStatusRequest
    ) -> SwapStatusResponse:
        """
        Get the status of an atomic swap.

        Args:
            body: Request with payment_hash
        """
        data = await self._http.maker_post("/api/v1/swaps/atomic/status", body)
        return SwapStatusResponse.model_validate(data)

    async def get_swap_node_info(self) -> SwapNodeInfoResponse:
        """Get swap node information."""
        data = await self._http.maker_get("/api/v1/swaps/nodeinfo")
        return SwapNodeInfoResponse.model_validate(data)

    # =========================================================================
    # LSPS1 API - /api/v1/lsps1/*
    # =========================================================================

    async def get_lsp_info(self) -> GetLspInfoResponse:
        """Get LSP information and options."""
        data = await self._http.maker_get("/api/v1/lsps1/get_info")
        return GetLspInfoResponse.model_validate(data)

    async def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information."""
        data = await self._http.maker_get("/api/v1/lsps1/network_info")
        return NetworkInfoResponse.model_validate(data)

    async def create_lsp_order(
        self, body: CreateLspOrderRequest
    ) -> ChannelOrderResponse:
        """
        Create an LSP order for channel opening.

        Args:
            body: LSP order creation request
        """
        data = await self._http.maker_post("/api/v1/lsps1/create_order", body)
        return ChannelOrderResponse.model_validate(data)

    async def get_lsp_order(self, body: dict[str, str]) -> ChannelOrderResponse:
        """
        Get LSP order details.

        Args:
            body: Request with order_id
        """
        data = await self._http.maker_post("/api/v1/lsps1/get_order", body)
        return ChannelOrderResponse.model_validate(data)

    async def estimate_lsp_fees(self, body: CreateLspOrderRequest) -> ChannelFees:
        """
        Estimate fees for an LSP order.

        Args:
            body: LSP order request for fee estimation
        """
        data = await self._http.maker_post("/api/v1/lsps1/estimate_fees", body)
        return ChannelFees.model_validate(data)

    async def submit_lsp_rate_decision(
        self, body: RateDecisionRequest
    ) -> RateDecisionResponse:
        """
        Submit rate decision for LSP order.

        Args:
            body: Rate decision request
        """
        data = await self._http.maker_post("/api/v1/lsps1/rate_decision", body)
        return RateDecisionResponse.model_validate(data)

    async def retry_asset_delivery(
        self, body: RetryDeliveryRequest
    ) -> RetryDeliveryResponse:
        """
        Retry asset delivery for a failed order.

        Args:
            body: Retry delivery request
        """
        data = await self._http.maker_post("/api/v1/lsps1/retry_delivery", body)
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

        while asyncio.get_event_loop().time() - start_time < opts.timeout:
            try:
                status_response = await self.get_swap_order_status(
                    SwapOrderStatusRequest(order_id=order_id)
                )
                order = status_response.order

                if order and opts.on_status_update:
                    opts.on_status_update(order.status.value)

                if order and order.status.value in (
                    "FILLED",
                    "FAILED",
                    "EXPIRED",
                    "CANCELLED",
                ):
                    return order

            except Exception as e:
                # Log warning but continue polling
                pass

            await asyncio.sleep(opts.poll_interval)

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
