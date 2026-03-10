"""
WebSocket Client for Real-time Updates

Provides WebSocket connectivity with automatic reconnection
and event-based message handling.

Protocol matches kaleidoswap-maker WebSocket implementation.
"""

from __future__ import annotations

import asyncio
import json
import time
import uuid
from collections.abc import Callable
from dataclasses import dataclass
from enum import Enum
from typing import Any, TypedDict
from urllib.parse import urlparse, urlunparse

import websockets
from websockets.asyncio.client import ClientConnection
from websockets.protocol import State

from ._logging import get_logger
from .errors import WebSocketError

_log = get_logger("ws")

# =============================================================================
# WebSocket Types
# =============================================================================


class WSAction(str, Enum):
    """WebSocket message actions."""

    PING = "ping"
    PONG = "pong"
    QUOTE_REQUEST = "quote_request"
    QUOTE_RESPONSE = "quote_response"
    CONNECTION_ESTABLISHED = "connection_established"
    ERROR = "error"


class Fee(TypedDict):
    """Fee structure in quote response."""

    fee_asset: str
    fee_precision: int
    base_fee: int
    variable_fee: int
    fee_rate: float
    final_fee: int


class SwapLegData(TypedDict):
    """Swap leg data in quote response."""

    asset_id: str
    name: str
    ticker: str
    layer: str
    amount: int
    precision: int


class QuoteResponse(TypedDict):
    """Quote response data with full SwapLeg objects."""

    action: str
    from_asset: SwapLegData
    to_asset: SwapLegData
    price: int
    rfq_id: str
    timestamp: int
    expires_at: int
    fee: Fee


class QuoteRequest(TypedDict, total=False):
    """Quote request parameters."""

    action: str
    from_asset: str
    to_asset: str
    from_amount: int | None
    to_amount: int | None
    from_layer: str | None
    to_layer: str | None
    timestamp: int


class WebSocketMessage(TypedDict, total=False):
    """Incoming WebSocket message from client."""

    action: str
    timestamp: int
    from_asset: str
    to_asset: str
    from_amount: int | None
    to_amount: int | None
    from_layer: str | None
    to_layer: str | None


class WebSocketResponse(TypedDict, total=False):
    """Outgoing WebSocket response from server."""

    action: str
    error: str
    timestamp: int
    data: Any
    success: bool


class ConnectionEstablishedData(TypedDict):
    """Connection established message data."""

    client_id: str
    server_time: int
    timestamp: int
    message: str


# =============================================================================
# WebSocket Client
# =============================================================================


@dataclass
class WSClientConfig:
    """WebSocket client configuration."""

    url: str
    max_reconnect_attempts: int = 5
    reconnect_delay: float = 1.0
    ping_interval: float = 30.0


EventCallback = Callable[..., None]


class WSClient:
    """
    WebSocket client for real-time updates.

    Provides automatic reconnection and event-based message handling.
    """

    def __init__(
        self,
        url: str,
        max_reconnect_attempts: int = 5,
        reconnect_delay: float = 1.0,
        ping_interval: float = 30.0,
        user_id: str | None = None,
    ) -> None:
        """
        Initialize WebSocket client.

        Args:
            url: WebSocket server URL (e.g. ws://localhost:8000/ws)
            max_reconnect_attempts: Maximum reconnection attempts
            reconnect_delay: Base delay between reconnection attempts (exponential backoff)
            ping_interval: Interval between ping messages (seconds)
            user_id: Optional client/user UUID; if not provided, a UUID is generated automatically.
        """
        self._client_id = user_id or str(uuid.uuid4())
        self._url = self._build_url_with_client_id(url, self._client_id)
        self._max_reconnect_attempts = max_reconnect_attempts
        self._reconnect_delay = reconnect_delay
        self._ping_interval = ping_interval

        self._ws: ClientConnection | None = None
        self._reconnect_attempts = 0
        self._is_connecting = False
        self._is_closed = False
        self._ping_task: asyncio.Task[None] | None = None
        self._receive_task: asyncio.Task[None] | None = None

        # Event handlers
        self._listeners: dict[str, list[EventCallback]] = {}

    @property
    def client_id(self) -> str:
        """Client UUID used for the WebSocket path (user-provided or auto-generated)."""
        return self._client_id

    @staticmethod
    def _build_url_with_client_id(url: str, client_id: str) -> str:
        """Append client_id as path segment: .../ws/{client_id}."""
        parsed = urlparse(url)
        path = parsed.path.rstrip("/") + "/" + client_id
        return urlunparse(
            (
                parsed.scheme,
                parsed.netloc,
                path,
                parsed.params,
                parsed.query,
                parsed.fragment,
            )
        )

    # =========================================================================
    # Connection Management
    # =========================================================================

    async def connect(self) -> None:
        """Connect to WebSocket server."""
        if self._is_connecting or (self._ws and self._ws.state is not State.CLOSED):
            return

        self._is_connecting = True
        self._is_closed = False
        _log.debug("Connecting to WebSocket: %s (client_id=%s)", self._url, self._client_id)

        try:
            self._ws = await asyncio.wait_for(
                websockets.connect(self._url),
                timeout=10.0,
            )
            self._is_connecting = False
            self._reconnect_attempts = 0
            _log.info("WebSocket connected: %s (client_id=%s)", self._url, self._client_id)

            # Start background tasks
            self._start_ping()
            self._start_receive()

            self._emit("connected")

        except TimeoutError:
            self._is_connecting = False
            _log.error("WebSocket connection timeout: %s", self._url)
            raise WebSocketError("Connection timeout")
        except Exception as e:
            self._is_connecting = False
            _log.error("WebSocket connection failed: %s — %s", self._url, e)
            raise WebSocketError(f"Connection failed: {e}")

    def disconnect(self) -> None:
        """Disconnect from WebSocket server."""
        _log.info("WebSocket disconnecting: %s (client_id=%s)", self._url, self._client_id)
        self._is_closed = True
        self._stop_ping()
        self._stop_receive()

        if self._ws:
            asyncio.create_task(self._close_ws())

    async def _close_ws(self) -> None:
        """Close WebSocket connection."""
        if self._ws:
            try:
                await self._ws.close()
            except Exception:
                pass
            self._ws = None

    def is_connected(self) -> bool:
        """Check if connected to WebSocket server."""
        return self._ws is not None and self._ws.state is not State.CLOSED

    # =========================================================================
    # Message Handling
    # =========================================================================

    def _start_receive(self) -> None:
        """Start receiving messages."""
        if self._receive_task:
            self._receive_task.cancel()
        self._receive_task = asyncio.create_task(self._receive_loop())

    def _stop_receive(self) -> None:
        """Stop receiving messages."""
        if self._receive_task:
            self._receive_task.cancel()
            self._receive_task = None

    async def _receive_loop(self) -> None:
        """Receive messages from WebSocket."""
        try:
            while self._ws and self._ws.state is not State.CLOSED:
                try:
                    message = await self._ws.recv()
                    try:
                        data: WebSocketResponse = json.loads(message)
                        _log.debug(
                            "WS message received: action=%s", data.get("action", "<unknown>")
                        )
                        self._handle_message(data)
                    except json.JSONDecodeError:
                        _log.warning("WS message parse error (raw: %r)", message)
                        self._emit("error", WebSocketError("Failed to parse message"))
                except websockets.exceptions.ConnectionClosed:
                    _log.info("WebSocket connection closed by server: %s", self._url)
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            _log.error("WS receive loop error: %s", e)
            self._emit("error", WebSocketError(f"Receive error: {e}"))

        # Handle disconnect
        _log.debug("WS receive loop ended (client_id=%s)", self._client_id)
        self._emit("disconnected")
        if not self._is_closed:
            self._attempt_reconnect()

    def _handle_message(self, message: WebSocketResponse) -> None:
        """Handle incoming WebSocket message."""
        action = message.get("action", "")

        if action == "quote_response":
            self._emit("quote_response", message.get("data", message))
        elif action == "connection_established":
            self._emit("connection_established", message.get("data"))
        elif action == "pong":
            self._emit("pong", message)
        elif action == "error":
            error_msg = message.get("error", "Unknown error")
            _log.warning("WS server error: %s", error_msg)
            self._emit("error", WebSocketError(error_msg))

    # =========================================================================
    # Ping/Pong
    # =========================================================================

    def _start_ping(self) -> None:
        """Start ping timer."""
        self._stop_ping()
        self._ping_task = asyncio.create_task(self._ping_loop())

    def _stop_ping(self) -> None:
        """Stop ping timer."""
        if self._ping_task:
            self._ping_task.cancel()
            self._ping_task = None

    async def _ping_loop(self) -> None:
        """Send periodic pings."""
        try:
            while True:
                await asyncio.sleep(self._ping_interval)
                self.ping()
        except asyncio.CancelledError:
            pass

    def ping(self) -> None:
        """Send ping to keep connection alive."""
        _log.debug("WS ping sent (client_id=%s)", self._client_id)
        self._send(
            {
                "action": "ping",
                "timestamp": int(time.time() * 1000),
            }
        )

    # =========================================================================
    # Quote Requests
    # =========================================================================

    def request_quote(self, request: dict[str, Any]) -> None:
        """
        Request a quote.

        Args:
            request: Quote request with from_asset, to_asset, amounts, layers
        """
        _log.debug(
            "WS quote_request: from=%s to=%s from_amount=%s",
            request.get("from_asset"),
            request.get("to_asset"),
            request.get("from_amount"),
        )
        self._send(
            {
                "action": "quote_request",
                **request,
                "timestamp": int(time.time() * 1000),
            }
        )

    # =========================================================================
    # Message Sending
    # =========================================================================

    def _send(self, message: dict[str, Any]) -> None:
        """Send message to WebSocket server."""
        if self._ws and self._ws.state is not State.CLOSED:
            asyncio.create_task(self._ws.send(json.dumps(message)))
        else:
            _log.warning(
                "WS send attempted while disconnected (action=%s, client_id=%s)",
                message.get("action"),
                self._client_id,
            )
            self._emit("error", WebSocketError("WebSocket not connected"))

    # =========================================================================
    # Reconnection
    # =========================================================================

    def _attempt_reconnect(self) -> None:
        """Attempt to reconnect after disconnect."""
        if self._reconnect_attempts < self._max_reconnect_attempts:
            delay = self._reconnect_delay * (2**self._reconnect_attempts)
            self._reconnect_attempts += 1
            _log.info(
                "WS reconnecting (attempt %d/%d) in %.1fs: %s",
                self._reconnect_attempts,
                self._max_reconnect_attempts,
                delay,
                self._url,
            )
            self._emit("reconnecting", self._reconnect_attempts)
            asyncio.create_task(self._delayed_reconnect(delay))
        else:
            _log.warning(
                "WS max reconnect attempts (%d) exceeded: %s",
                self._max_reconnect_attempts,
                self._url,
            )
            self._emit("max_reconnect_exceeded")

    async def _delayed_reconnect(self, delay: float) -> None:
        """Reconnect after delay."""
        await asyncio.sleep(delay)
        try:
            await self.connect()
        except Exception:
            pass  # Will retry in next attempt

    # =========================================================================
    # Event Emitter
    # =========================================================================

    def on(self, event: str, callback: EventCallback) -> None:
        """
        Subscribe to an event.

        Args:
            event: Event name (e.g., 'quote_response', 'connected', 'error')
            callback: Callback function
        """
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(callback)

    def off(self, event: str, callback: EventCallback) -> None:
        """
        Unsubscribe from an event.

        Args:
            event: Event name
            callback: Callback function to remove
        """
        if event in self._listeners:
            try:
                self._listeners[event].remove(callback)
            except ValueError:
                pass

    def _emit(self, event: str, *args: Any) -> None:
        """
        Emit an event to all listeners.

        Args:
            event: Event name
            *args: Arguments to pass to callbacks
        """
        if event in self._listeners:
            for callback in self._listeners[event]:
                try:
                    callback(*args)
                except Exception:
                    pass  # Don't let callback errors break the event loop


__all__ = [
    "WSClient",
    "WSClientConfig",
    "WSAction",
    "Fee",
    "QuoteResponse",
    "QuoteRequest",
    "WebSocketMessage",
    "WebSocketResponse",
    "ConnectionEstablishedData",
]
