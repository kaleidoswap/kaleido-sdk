import pytest
import pytest_asyncio
import asyncio
import json
import websockets
from kaleidoswap_sdk.websocket import WebSocketClient
from kaleidoswap_sdk.generated.kaleidoswap_pb2 import (
    WebSocketResponse,
    PriceUpdate,
    SubscriptionConfirmation,
    UnsubscriptionConfirmation,
    Pong,
    Error
)

# Configuration for the mock WebSocket server
MOCK_WS_URL = "ws://localhost:8001"

class MockWebSocketServer:
    """Mock WebSocket server for testing."""
    
    def __init__(self):
        self.clients = set()
        self.subscriptions = {}
        self.price_updates = {
            "BTC/USDT": {
                "price": 50000.0,
                "timestamp": 1630296243,
                "expires_at": 1630296248
            }
        }
        
    async def start(self):
        """Start the mock WebSocket server."""
        async def handler(websocket, path):
            client_id = path.split('/')[-1]
            self.clients.add(client_id)
            
            try:
                async for message in websocket:
                    # Parse message
                    request = json.loads(message)
                    
                    if request["action"] == "subscribe":
                        pair = request["pair"]
                        self.subscriptions[client_id] = pair
                        
                        # Send subscription confirmation
                        response = WebSocketResponse(
                            sub_confirm=SubscriptionConfirmation(
                                pair_id=pair,
                                success=True
                            )
                        )
                        await websocket.send(response.SerializeToString())
                        
                        # Send initial price update
                        if pair in self.price_updates:
                            price_data = self.price_updates[pair]
                            price_update = WebSocketResponse(
                                price_update=PriceUpdate(
                                    pair_id=pair,
                                    data=price_data
                                )
                            )
                            await websocket.send(price_update.SerializeToString())
                            
                    elif request["action"] == "unsubscribe":
                        pair = request["pair"]
                        if client_id in self.subscriptions:
                            del self.subscriptions[client_id]
                            
                        # Send unsubscription confirmation
                        response = WebSocketResponse(
                            unsub_confirm=UnsubscriptionConfirmation(
                                pair_id=pair,
                                success=True
                            )
                        )
                        await websocket.send(response.SerializeToString())
                        
                    elif request["action"] == "ping":
                        # Send pong response
                        response = WebSocketResponse(
                            pong=Pong(
                                client_timestamp_ms=request["timestamp"]
                            )
                        )
                        await websocket.send(response.SerializeToString())
                        
            except websockets.exceptions.ConnectionClosed:
                pass
            finally:
                self.clients.remove(client_id)
                if client_id in self.subscriptions:
                    del self.subscriptions[client_id]
                    
        self.server = await websockets.serve(handler, "localhost", 8001)
        
    async def stop(self):
        """Stop the mock WebSocket server."""
        self.server.close()
        await self.server.wait_closed()

@pytest_asyncio.fixture
async def mock_server():
    """Fixture that provides a mock WebSocket server."""
    server = MockWebSocketServer()
    await server.start()
    yield server
    await server.stop()

@pytest_asyncio.fixture
async def ws_client():
    """Fixture that provides a WebSocket client instance."""
    client = WebSocketClient(ws_base_url=MOCK_WS_URL)
    yield client
    await client.disconnect()

@pytest.mark.asyncio
async def test_connect_disconnect(ws_client: WebSocketClient):
    """Test WebSocket connection and disconnection."""
    # Connect
    await ws_client.connect()
    assert ws_client.connected
    assert ws_client.ws is not None
    
    # Disconnect
    await ws_client.disconnect()
    assert not ws_client.connected
    assert ws_client.ws is None

@pytest.mark.asyncio
async def test_subscribe_unsubscribe(ws_client: WebSocketClient):
    """Test subscribing to and unsubscribing from a trading pair."""
    # Connect
    await ws_client.connect()
    
    # Track subscription confirmation
    sub_confirmed = asyncio.Event()
    async def on_sub_confirm(confirmation: SubscriptionConfirmation):
        assert confirmation.pair_id == "BTC/USDT"
        assert confirmation.success
        sub_confirmed.set()
    ws_client.on_subscription_confirmation(on_sub_confirm)
    
    # Track unsubscription confirmation
    unsub_confirmed = asyncio.Event()
    async def on_unsub_confirm(confirmation: UnsubscriptionConfirmation):
        assert confirmation.pair_id == "BTC/USDT"
        assert confirmation.success
        unsub_confirmed.set()
    ws_client.on_unsubscription_confirmation(on_unsub_confirm)
    
    # Subscribe
    await ws_client.subscribe("BTC/USDT")
    assert "BTC/USDT" in ws_client.subscribed_pairs
    
    # Wait for subscription confirmation
    await asyncio.wait_for(sub_confirmed.wait(), timeout=5.0)
    
    # Unsubscribe
    await ws_client.unsubscribe("BTC/USDT")
    assert "BTC/USDT" not in ws_client.subscribed_pairs
    
    # Wait for unsubscription confirmation
    await asyncio.wait_for(unsub_confirmed.wait(), timeout=5.0)

@pytest.mark.asyncio
async def test_price_updates(ws_client: WebSocketClient):
    """Test receiving price updates."""
    # Connect
    await ws_client.connect()
    
    # Track price updates
    price_updates = []
    async def on_price_update(update: PriceUpdate):
        price_updates.append(update)
    ws_client.on_price_update(on_price_update)
    
    # Subscribe to pair
    await ws_client.subscribe("BTC/USDT")
    
    # Wait for price update
    await asyncio.sleep(1.0)  # Give time for initial price update
    
    assert len(price_updates) > 0
    update = price_updates[0]
    assert update.pair_id == "BTC/USDT"
    assert update.data["price"] == 50000.0
    assert "timestamp" in update.data
    assert "expires_at" in update.data

@pytest.mark.asyncio
async def test_ping_pong(ws_client: WebSocketClient):
    """Test ping-pong heartbeat mechanism."""
    # Connect
    await ws_client.connect()
    
    # Wait for ping-pong cycle
    await asyncio.sleep(ws_client.ping_interval + 1.0)
    
    assert ws_client.last_ping_time > 0
    assert ws_client.last_pong_time > 0
    assert ws_client.last_pong_time >= ws_client.last_ping_time

@pytest.mark.asyncio
async def test_reconnection(ws_client: WebSocketClient, mock_server: MockWebSocketServer):
    """Test automatic reconnection after disconnection."""
    # Connect
    await ws_client.connect()
    
    # Subscribe to pair
    await ws_client.subscribe("BTC/USDT")
    
    # Track reconnection
    reconnected = asyncio.Event()
    async def on_connect():
        reconnected.set()
    ws_client.on_connect(on_connect)
    
    # Stop server to simulate disconnection
    await mock_server.stop()
    await asyncio.sleep(1.0)
    
    # Restart server
    await mock_server.start()
    
    # Wait for reconnection
    await asyncio.wait_for(reconnected.wait(), timeout=10.0)
    
    # Verify subscription is restored
    assert "BTC/USDT" in ws_client.subscribed_pairs

@pytest.mark.asyncio
async def test_error_handling(ws_client: WebSocketClient):
    """Test error handling."""
    # Connect
    await ws_client.connect()
    
    # Track errors
    errors = []
    async def on_error(error: Error):
        errors.append(error)
    ws_client.on_error(on_error)
    
    # Subscribe to invalid pair
    await ws_client.subscribe("INVALID_PAIR")
    
    # Wait for error
    await asyncio.sleep(1.0)
    
    assert len(errors) > 0
    assert "Invalid pair" in errors[0].message 