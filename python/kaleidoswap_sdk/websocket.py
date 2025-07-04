import asyncio
import json
import logging
import uuid
from typing import Any, Callable, Dict, Optional, Set
from datetime import datetime

import websockets
from websockets.exceptions import ConnectionClosed

from .http import HttpClient

logger = logging.getLogger(__name__)

class WebSocketClient:
    """WebSocket client for Kaleidoswap that handles real-time updates."""
    
    def __init__(
        self,
        base_url: str,
        http_client: HttpClient,
        ping_interval: int = 30,
        ping_timeout: int = 10,
        close_timeout: int = 10,
        max_size: int = 2**20,  # 1MB
        max_queue: int = 32,
        compression: Optional[str] = None,
        client_id: Optional[str] = None,
    ):
        """Initialize WebSocket client.
        
        Args:
            base_url: Base WebSocket URL
            http_client: HTTP client instance
            ping_interval: Interval between pings in seconds
            ping_timeout: Timeout for pings in seconds
            close_timeout: Timeout for close operations in seconds
            max_size: Maximum message size in bytes
            max_queue: Maximum queue size for messages
            compression: Optional compression method
            client_id: Optional client ID for connection
        """
        self.base_url = base_url.replace('http', 'ws')
        self.http_client = http_client
        self.ping_interval = ping_interval
        self.ping_timeout = ping_timeout
        self.close_timeout = close_timeout
        self.max_size = max_size
        self.max_queue = max_queue
        self.compression = compression
        self.client_id = client_id or str(uuid.uuid4())
        
        self._ws: Optional[websockets.WebSocketClientProtocol] = None
        self._running = False
        self._handlers: Dict[str, Set[Callable]] = {}
        self._response_futures: Dict[str, asyncio.Future] = {}
        self._message_queue: asyncio.Queue = asyncio.Queue(maxsize=max_queue)
        self._last_ping: Optional[datetime] = None
        self._last_pong: Optional[datetime] = None
        self._message_task: Optional[asyncio.Task] = None

    async def connect(self) -> None:
        """Connect to WebSocket server."""
        if self._ws:
            return

        try:
            # Construct the full WebSocket URL with client ID
            ws_url = f"{self.base_url}/market/ws/{self.client_id}"
            
            # Connect using the websockets library
            self._ws = await websockets.connect(
                ws_url,
                max_size=self.max_size,
                max_queue=self.max_queue,
                compression=self.compression,
                ping_interval=self.ping_interval,
                ping_timeout=self.ping_timeout,
                close_timeout=self.close_timeout
            )
            self._running = True
            self._last_ping = datetime.now()
            self._last_pong = datetime.now()
            
            # Start background tasks
            self._message_task = asyncio.create_task(self._message_loop())
            
            logger.info(f"WebSocket connected to {ws_url}")
            
        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}")
            raise

    async def disconnect(self) -> None:
        """Disconnect from WebSocket server."""
        self._running = False
        
        # Cancel message task
        if self._message_task:
            self._message_task.cancel()
            try:
                await self._message_task
            except asyncio.CancelledError:
                pass
            
        # Close WebSocket connection
        if self._ws:
            await self._ws.close()
            self._ws = None
            logger.info("WebSocket disconnected")
            
    async def _message_loop(self) -> None:
        """Process incoming WebSocket messages."""
        while self._running and self._ws:
            try:
                message = await self._ws.recv()
                await self._handle_message(json.loads(message))
            except ConnectionClosed:
                logger.info("WebSocket connection closed")
                break
            except Exception as e:
                logger.error(f"Error in message loop: {e}")
                break

    async def _handle_message(self, data: Dict[str, Any]) -> None:
        """Handle incoming WebSocket message.
        
        Args:
            data: Message data
        """
        logger.debug(f"Received WebSocket message: {data}")
        
        action = data.get("action")
        if not action:
            logger.warning(f"Received message without action: {data}")
            # Still try to handle it by calling all registered handlers
            for handler_set in self._handlers.values():
                for handler in handler_set:
                    try:
                        await handler(data)
                    except Exception as e:
                        logger.error(f"Error in message handler: {e}")
            return
            
        # Handle response futures
        if action in self._response_futures:
            future = self._response_futures.pop(action)
            if not future.done():
                future.set_result(data)
                
        # Call registered handlers
        if action in self._handlers:
            for handler in self._handlers[action]:
                try:
                    await handler(data)
                except Exception as e:
                    logger.error(f"Error in message handler: {e}")

    def on(self, action: str, handler: Callable) -> None:
        """Register handler for message type.
        
        Args:
            action: Message action to handle
            handler: Async function to handle message
        """
        if action not in self._handlers:
            self._handlers[action] = set()
        self._handlers[action].add(handler)

    def off(self, action: str, handler: Callable) -> None:
        """Unregister handler for message type.
        
        Args:
            action: Message action
            handler: Handler to remove
        """
        if action in self._handlers:
            self._handlers[action].discard(handler)

    async def send(self, data: Dict[str, Any]) -> None:
        """Send message to WebSocket server.
        
        Args:
            data: Message data to send
        """
        if not self._ws:
            raise RuntimeError("WebSocket not connected")

        try:
            await self._ws.send(json.dumps(data))
            logger.debug(f"Sent message: {data}")
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise

    async def subscribe(self, pair: str) -> None:
        """Subscribe to updates for a trading pair.
        
        Args:
            pair: Trading pair identifier (e.g., 'BTC/USDT')
        """
        if not self._running:
            raise RuntimeError("WebSocket not connected")
            
        await self.send({
            "action": "subscribe",
            "pair": pair
        })
        logger.info(f"Subscribed to {pair}")
        
    async def unsubscribe(self, pair: str) -> None:
        """Unsubscribe from updates for a trading pair.
        
        Args:
            pair: Trading pair identifier (e.g., 'BTC/USDT')
        """
        if not self._running:
            raise RuntimeError("WebSocket not connected")
            
        await self.send({
            "action": "unsubscribe",
            "pair": pair
        })
        logger.info(f"Unsubscribed from {pair}")
        
    def on_swap_update(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Register callback for swap updates.
        
        Args:
            callback: Async function that takes a swap update message as argument.
        """
        self._handlers['swap_update'] = {callback}
        
    def on_error(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Register callback for error messages.
        
        Args:
            callback: Async function that takes an error message as argument.
        """
        self._handlers['error'] = {callback}
        
    def on_connect(self, callback: Callable[[], None]) -> None:
        """Register callback for connection events.
        
        Args:
            callback: Async function that takes no arguments.
        """
        self._handlers['connect'] = {callback}
        
    def on_disconnect(self, callback: Callable[[], None]) -> None:
        """Register callback for disconnection events.
        
        Args:
            callback: Async function that takes no arguments.
        """
        self._handlers['disconnect'] = {callback} 