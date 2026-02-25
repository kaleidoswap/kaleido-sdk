"""
Maker Client - Market Operations

Type-safe client for Kaleidoswap Market API.
All methods correspond directly to actual API endpoints.

This is a wrapper around the auto-generated HTTP client that provides
convenience methods and backward compatibility.
"""

from __future__ import annotations

import asyncio
import json
from collections.abc import Callable
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

import httpx
from httpx import Timeout

from .errors import NetworkError, SwapError, TimeoutError, map_http_error

# Fallback to old generated types for models that weren't generated
from ._generated.api_types import (
    SwapRoute,
    TradingPair,
    TradingPairsResponse,
)
from ._generated.maker_client_generated.api.lsps1 import (
    create_order as create_lsp_order,
)
from ._generated.maker_client_generated.api.lsps1 import (
    estimate_fees as estimate_lsp_fees,
)
from ._generated.maker_client_generated.api.lsps1 import (
    get_info as get_lsp_info,
)
from ._generated.maker_client_generated.api.lsps1 import (
    get_network_info as get_lsp_network_info,
)
from ._generated.maker_client_generated.api.lsps1 import (
    get_order as get_lsp_order,
)
from ._generated.maker_client_generated.api.lsps1 import (
    handle_rate_decision as handle_lsp_rate_decision,
)
from ._generated.maker_client_generated.api.lsps1 import (
    retry_delivery as retry_lsp_delivery,
)

# Import API endpoint functions directly from their modules
from ._generated.maker_client_generated.api.market import (
    discover_routes,
    get_pair_routes,
    get_pairs,
    list_assets,
)
from ._generated.maker_client_generated.api.market import (
    get_quote as get_quote_endpoint,
)
from ._generated.maker_client_generated.api.swap_orders import (
    create_swap_order,
    get_order_history,
    get_order_stats,
    get_swap_order_status,
    handle_swap_order_rate_decision,
)
from ._generated.maker_client_generated.api.swaps import (
    confirm_swap,
    get_swap_status,
    initiate_swap,
)
from ._generated.maker_client_generated.api.swaps import (
    get_node_info as get_swap_node_info,
)
from ._generated.maker_client_generated.client import Client as GeneratedMakerClient
from ._generated.maker_client_generated.models import (
    AssetsResponse,
    ChannelFees,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    GetInfoResponseModel,
    GetOrderRequest,
    HTTPValidationError,
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
    SwapOrderStatus,
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    SwapRequest,
    SwapResponse,
    SwapStatusRequest,
    SwapStatusResponse,
)
from ._generated.maker_client_generated.models import (
    Body as PairRoutesBody,
)
from .types import Layer
from ._utils import to_display_amount, to_raw_amount

if TYPE_CHECKING:
    from ._ws_client import QuoteResponse, WSClient


def _to_attrs(body: Any, attrs_cls: Any) -> Any:
    """Convert a Pydantic model to the corresponding generated attrs model.

    The generated client expects attrs models (with ``.to_dict()``), but the
    public SDK API exposes Pydantic models (with ``.model_dump()``).  This
    helper bridges the two: if *body* is already an attrs instance it is
    returned unchanged; otherwise the Pydantic dict is fed through
    ``attrs_cls.from_dict()``.
    """
    if hasattr(body, "to_dict"):
        return body
    if hasattr(body, "model_dump"):
        return attrs_cls.from_dict(body.model_dump(mode="json"))
    return body


def _unwrap_maker_response(response: Any) -> Any:
    """
    Return parsed success body or raise a mapped error with server message.

    Raises KaleidoError (ValidationError, APIError, etc.) with the server's
    message and response_body for debugging when the response is not successful.
    """
    # Success: return parsed body
    if response.parsed is not None and not isinstance(response.parsed, HTTPValidationError):
        return response.parsed

    # Error: extract response data and raise mapped exception
    status_code = int(response.status_code)

    # Extract error data from HTTPValidationError or raw response content
    error_data: dict[str, Any] | str | None
    if isinstance(response.parsed, HTTPValidationError):
        error_data = response.parsed.to_dict() if hasattr(response.parsed, "to_dict") else {}
    elif response.content:
        try:
            error_data = json.loads(response.content.decode("utf-8"))
        except Exception:
            error_data = response.content.decode("utf-8", errors="replace").strip() or None
    else:
        error_data = None

    reason_phrase = getattr(response.status_code, "phrase", None) or f"HTTP {status_code}"
    raise map_http_error(status_code, reason_phrase, error_data)


async def _safe_api_call(coro: Any) -> Any:
    """
    Wrap API calls to catch httpx exceptions and convert to SDK exceptions.

    Args:
        coro: Coroutine from generated API client

    Returns:
        Response from the API call

    Raises:
        NetworkError: On connection/DNS errors
        TimeoutError: On request timeout
        KaleidoError: Other mapped errors
    """
    try:
        return await coro
    except httpx.ConnectError as e:
        # DNS resolution, connection refused, etc.
        raise NetworkError(f"Failed to connect to API: {e}") from e
    except httpx.TimeoutException as e:
        raise TimeoutError(f"Request timed out: {e}") from e
    except httpx.RequestError as e:
        # Other request errors (network issues, etc.)
        raise NetworkError(f"Network error: {e}") from e


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

    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float | Timeout | None = 30.0,
    ) -> None:
        """
        Initialize MakerClient.

        Args:
            base_url: Base URL for the Kaleidoswap API
            api_key: Optional API key for authentication
            timeout: Request timeout in seconds
        """
        # Create generated client
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        timeout_config: Timeout | None
        if isinstance(timeout, Timeout):
            timeout_config = timeout
        elif timeout is None:
            timeout_config = None
        else:
            timeout_config = Timeout(timeout)

        self._client = GeneratedMakerClient(
            base_url=base_url,
            headers=headers,
            timeout=timeout_config,
        )
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

        # Subscribe to quote updates
        self._ws.on("quote_response", on_update)

        # Quote request parameters
        quote_params = {
            "from_asset": from_asset,
            "to_asset": to_asset,
            "from_amount": from_amount,
            "to_amount": None,
            "from_layer": from_layer.value if from_layer else None,
            "to_layer": to_layer.value if to_layer else None,
        }

        # Send initial quote request
        self._ws.request_quote(quote_params)

        # Background task for periodic quote requests
        polling_task: asyncio.Task[None] | None = None
        should_stop = False

        async def _poll_quotes() -> None:
            """Periodically request new quotes."""
            nonlocal should_stop
            while not should_stop:
                await asyncio.sleep(poll_interval)
                if not should_stop and self._ws and self._ws.is_connected():
                    self._ws.request_quote(quote_params)

        # Start polling in background
        polling_task = asyncio.create_task(_poll_quotes())

        # Return stop function
        def stop() -> None:
            """Stop polling and unsubscribe from quote updates."""
            nonlocal should_stop, polling_task
            should_stop = True
            if polling_task and not polling_task.done():
                polling_task.cancel()
            if self._ws:
                self._ws.off("quote_response", on_update)

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

        # Find matching pair (case-insensitive) - try direct match first
        from_upper = from_ticker.upper()
        to_upper = to_ticker.upper()

        pair = None
        for p in pairs_response.pairs:
            if p.base.ticker.upper() == from_upper and p.quote.ticker.upper() == to_upper:
                pair = p
                break

        # If not found, try inverse pair
        if not pair:
            for p in pairs_response.pairs:
                if p.base.ticker.upper() == to_upper and p.quote.ticker.upper() == from_upper:
                    # Inverse pair found, swap the layers in routes
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

        # Find preferred route or use first available
        selected_route = routes[0]
        if preferred_from_layer and preferred_to_layer:
            for route in routes:
                if (
                    route.from_layer == preferred_from_layer.value
                    and route.to_layer == preferred_to_layer.value
                ):
                    selected_route = route
                    break

        # Stream quotes using the selected route
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

        # Subscribe to each route
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
        resp = await _safe_api_call(list_assets.asyncio_detailed(client=self._client))
        return _unwrap_maker_response(resp)

    async def list_pairs(self) -> TradingPairsResponse:
        """List all trading pairs."""
        # Generated get_pairs only parses 422; 200 is returned as None. Parse 200 manually.
        response = await _safe_api_call(get_pairs.asyncio_detailed(client=self._client))
        if response.status_code == 200:
            data = json.loads(response.content.decode())
            pairs_list = data.get("pairs") or []
            normalized_pairs = [self._normalize_pair(p) for p in pairs_list]
            return TradingPairsResponse(
                pairs=normalized_pairs,
                total=data.get("total", len(normalized_pairs)),
                limit=data.get("limit", len(normalized_pairs)),
                offset=data.get("offset", 0),
                timestamp=data.get("timestamp", 0),
            )
        _unwrap_maker_response(response)  # raises with server message
        raise AssertionError("Unreachable: _unwrap_maker_response should have raised")

    @staticmethod
    def _normalize_pair(raw: dict[str, Any]) -> TradingPair:
        """Parse a single pair dict from the API into a TradingPair model."""
        return TradingPair.model_validate(raw)

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
        resp = await _safe_api_call(
            get_quote_endpoint.asyncio_detailed(
                client=self._client,
                body=_to_attrs(body, PairQuoteRequest),
            )
        )
        return _unwrap_maker_response(resp)

    async def get_pair_routes(self, pair_ticker: str) -> list[SwapRoute]:
        """
        Get available routes for a trading pair.

        Args:
            pair_ticker: Pair ticker string (e.g. "BTC/USDT")

        Returns:
            List of available swap routes for the pair
        """
        api_body = PairRoutesBody.from_dict({"pair_ticker": pair_ticker})
        resp = await _safe_api_call(
            get_pair_routes.asyncio_detailed(client=self._client, body=api_body)
        )
        response = _unwrap_maker_response(resp)
        # Response is list of generated (attrs) SwapRoute; convert to SDK (Pydantic) SwapRoute
        return (
            [SwapRoute.model_validate(r.to_dict()) for r in response]
            if isinstance(response, list)
            else []
        )

    async def get_market_routes(self, body: RoutesRequest) -> RoutesResponse:
        """
        Discover routes between assets.

        Args:
            body: Routes discovery request
        """
        resp = await _safe_api_call(
            discover_routes.asyncio_detailed(
                client=self._client, body=_to_attrs(body, RoutesRequest)
            )
        )
        return _unwrap_maker_response(resp)

    # =========================================================================
    # Swap Orders API - /api/v1/swaps/orders/*
    # =========================================================================

    async def create_swap_order(self, body: CreateSwapOrderRequest) -> CreateSwapOrderResponse:
        """
        Create a new swap order.

        Args:
            body: Swap order creation request
        """
        resp = await _safe_api_call(
            create_swap_order.asyncio_detailed(
                client=self._client, body=_to_attrs(body, CreateSwapOrderRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def get_swap_order_status(self, body: SwapOrderStatusRequest) -> SwapOrderStatusResponse:
        """
        Get the status of a swap order.

        Args:
            body: Request with order_id
        """
        resp = await _safe_api_call(
            get_swap_order_status.asyncio_detailed(
                client=self._client, body=_to_attrs(body, SwapOrderStatusRequest)
            )
        )
        return _unwrap_maker_response(resp)

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
        # Note: Generated client uses query parameters (skip, not offset)
        status_param: SwapOrderStatus | None
        if isinstance(status, SwapOrderStatus):
            status_param = status
        elif isinstance(status, str):
            try:
                status_param = SwapOrderStatus(status)
            except ValueError as exc:
                raise ValueError(f"Invalid swap order status: {status}") from exc
        else:
            status_param = None

        resp = await _safe_api_call(
            get_order_history.asyncio_detailed(
                client=self._client,
                status=status_param,
                limit=limit or 50,
                skip=skip or 0,
            )
        )
        return _unwrap_maker_response(resp)

    async def get_order_analytics(self) -> OrderStatsResponse:
        """Get order analytics and statistics."""
        resp = await _safe_api_call(get_order_stats.asyncio_detailed(client=self._client))
        return _unwrap_maker_response(resp)

    async def submit_rate_decision(
        self, body: SwapOrderRateDecisionRequest
    ) -> SwapOrderRateDecisionResponse:
        """
        Submit a rate decision for a pending order.

        Args:
            body: Rate decision request
        """
        resp = await _safe_api_call(
            handle_swap_order_rate_decision.asyncio_detailed(
                client=self._client,
                body=_to_attrs(body, SwapOrderRateDecisionRequest),
            )
        )
        return _unwrap_maker_response(resp)

    # =========================================================================
    # Atomic Swaps API - /api/v1/swaps/*
    # =========================================================================

    async def init_swap(self, body: SwapRequest) -> SwapResponse:
        """
        Initialize an atomic swap.

        Args:
            body: Swap initialization request
        """
        resp = await _safe_api_call(
            initiate_swap.asyncio_detailed(client=self._client, body=_to_attrs(body, SwapRequest))
        )
        return _unwrap_maker_response(resp)

    async def execute_swap(self, body: ConfirmSwapRequest) -> ConfirmSwapResponse:
        """
        Execute/confirm an atomic swap.

        Args:
            body: Swap execution request
        """
        resp = await _safe_api_call(
            confirm_swap.asyncio_detailed(
                client=self._client, body=_to_attrs(body, ConfirmSwapRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def get_atomic_swap_status(self, body: SwapStatusRequest) -> SwapStatusResponse:
        """
        Get the status of an atomic swap.

        Args:
            body: Request with payment_hash
        """
        resp = await _safe_api_call(
            get_swap_status.asyncio_detailed(
                client=self._client, body=_to_attrs(body, SwapStatusRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def get_swap_node_info(self) -> SwapNodeInfoResponse:
        """Get swap node information."""
        resp = await _safe_api_call(get_swap_node_info.asyncio_detailed(client=self._client))
        return _unwrap_maker_response(resp)

    # =========================================================================
    # LSPS1 API - /api/v1/lsps1/*
    # =========================================================================

    async def get_lsp_info(self) -> GetInfoResponseModel:
        """Get LSP information and options."""
        resp = await _safe_api_call(get_lsp_info.asyncio_detailed(client=self._client))
        return _unwrap_maker_response(resp)

    async def get_lsp_network_info(self) -> NetworkInfoResponse:
        """Get LSP network information."""
        resp = await _safe_api_call(get_lsp_network_info.asyncio_detailed(client=self._client))
        return _unwrap_maker_response(resp)

    async def create_lsp_order(self, body: CreateOrderRequest) -> ChannelOrderResponse:
        """
        Create an LSP order for channel opening.

        Args:
            body: LSP order creation request
        """
        resp = await _safe_api_call(
            create_lsp_order.asyncio_detailed(
                client=self._client, body=_to_attrs(body, CreateOrderRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def get_lsp_order(self, body: GetOrderRequest) -> ChannelOrderResponse:
        """
        Get LSP order details.

        Args:
            body: Request with order_id
        """
        resp = await _safe_api_call(
            get_lsp_order.asyncio_detailed(
                client=self._client, body=_to_attrs(body, GetOrderRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def estimate_lsp_fees(self, body: CreateOrderRequest) -> ChannelFees:
        """
        Estimate fees for an LSP order.

        Args:
            body: LSP order request for fee estimation
        """
        resp = await _safe_api_call(
            estimate_lsp_fees.asyncio_detailed(
                client=self._client, body=_to_attrs(body, CreateOrderRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def submit_lsp_rate_decision(self, body: RateDecisionRequest) -> RateDecisionResponse:
        """
        Submit rate decision for LSP order.

        Args:
            body: Rate decision request
        """
        resp = await _safe_api_call(
            handle_lsp_rate_decision.asyncio_detailed(
                client=self._client, body=_to_attrs(body, RateDecisionRequest)
            )
        )
        return _unwrap_maker_response(resp)

    async def retry_asset_delivery(self, body: RetryDeliveryRequest) -> RetryDeliveryResponse:
        """
        Retry asset delivery for a failed order.

        Args:
            body: Retry delivery request
        """
        resp = await _safe_api_call(
            retry_lsp_delivery.asyncio_detailed(
                client=self._client, body=_to_attrs(body, RetryDeliveryRequest)
            )
        )
        return _unwrap_maker_response(resp)

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

                if order:
                    status_obj = getattr(order, "status", None)
                    if isinstance(status_obj, SwapOrderStatus):
                        status_value = status_obj.value
                    elif status_obj is not None:
                        status_value = str(status_obj)
                    else:
                        status_value = None

                    if status_value and opts.on_status_update:
                        opts.on_status_update(status_value)

                    if status_value in {"FILLED", "FAILED", "EXPIRED", "CANCELLED"}:
                        return order

            except Exception:
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
