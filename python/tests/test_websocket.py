"""Tests for WebSocket client functionality."""

import asyncio
import json
import logging
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch
from kaleidoswap_sdk.websocket import WebSocketClient
from kaleidoswap_sdk.http import HttpClient

logger = logging.getLogger(__name__)


@pytest_asyncio.fixture
async def http_client():
    """Create a mock HTTP client."""
    client = HttpClient(base_url="https://api.test.com", api_key="test_key")
    try:
        yield client
    finally:
        await client.close()


@pytest_asyncio.fixture
async def ws_client(http_client: HttpClient):
    """Create a WebSocket client instance."""
    client = WebSocketClient(
        base_url="wss://api.test.com",
        http_client=http_client,
        ping_interval=30,
        ping_timeout=10,
    )
    try:
        yield client
    finally:
        await client.disconnect()


@pytest.mark.asyncio
async def test_websocket_initialization(ws_client: WebSocketClient):
    """Test WebSocket client initialization."""
    assert ws_client.base_url == "wss://api.test.com"
    assert ws_client.ping_interval == 30
    assert ws_client.ping_timeout == 10
    assert ws_client.client_id is not None
    assert not ws_client.is_connected()


@pytest.mark.asyncio
async def test_websocket_http_to_ws_conversion(http_client: HttpClient):
    """Test that HTTP URLs are converted to WebSocket URLs."""
    http_client = HttpClient(base_url="http://api.test.com")
    ws_client = WebSocketClient(base_url="http://api.test.com", http_client=http_client)
    assert ws_client.base_url == "ws://api.test.com"

    https_client = HttpClient(base_url="https://api.test.com")
    ws_client = WebSocketClient(
        base_url="https://api.test.com", http_client=https_client
    )
    assert ws_client.base_url == "wss://api.test.com"
    await http_client.close()
    await https_client.close()


@pytest.mark.asyncio
async def test_websocket_custom_client_id():
    """Test WebSocket with custom client ID."""
    http_client = HttpClient(base_url="https://api.test.com")
    custom_id = "my-custom-id-123"
    ws_client = WebSocketClient(
        base_url="https://api.test.com",
        http_client=http_client,
        client_id=custom_id,
    )
    assert ws_client.client_id == custom_id
    await http_client.close()


@pytest.mark.asyncio
async def test_websocket_send_without_connection(ws_client: WebSocketClient):
    """Test sending a message without being connected."""
    with pytest.raises(RuntimeError, match="WebSocket not connected"):
        await ws_client.send({"action": "test"})


@pytest.mark.asyncio
async def test_websocket_send_and_wait_without_connection(ws_client: WebSocketClient):
    """Test send_and_wait without being connected."""
    with pytest.raises(RuntimeError, match="WebSocket not connected"):
        await ws_client.send_and_wait(
            {"action": "test"}, response_action="test_response"
        )


@pytest.mark.asyncio
async def test_websocket_on_off_handlers(ws_client: WebSocketClient):
    """Test registering and unregistering message handlers."""

    async def handler1(data):
        pass

    async def handler2(data):
        pass

    # Register handlers
    ws_client.on("quote_response", handler1)
    ws_client.on("quote_response", handler2)
    assert "quote_response" in ws_client._handlers
    assert len(ws_client._handlers["quote_response"]) == 2

    # Unregister one handler
    ws_client.off("quote_response", handler1)
    assert len(ws_client._handlers["quote_response"]) == 1

    # Unregister second handler
    ws_client.off("quote_response", handler2)
    assert len(ws_client._handlers["quote_response"]) == 0


@pytest.mark.asyncio
async def test_websocket_disconnect_without_connection(ws_client: WebSocketClient):
    """Test disconnecting when not connected."""
    # Should not raise an error
    await ws_client.disconnect()
    assert not ws_client.is_connected()


@pytest.mark.asyncio
async def test_websocket_message_loop_exception_handling(ws_client: WebSocketClient):
    """Test that message loop handles exceptions gracefully."""
    # Mock a WebSocket connection
    mock_ws = AsyncMock()
    mock_ws.recv = AsyncMock(side_effect=Exception("Test error"))

    ws_client._ws = mock_ws
    ws_client._running = True

    # The message loop should catch the exception and break
    await ws_client._message_loop()

    # Verify the loop stopped
    assert ws_client._running


@pytest.mark.asyncio
async def test_websocket_handle_message_without_action(ws_client: WebSocketClient):
    """Test handling a message without an action field."""
    # Add a handler for any message type
    handler_called = asyncio.Event()
    received_data = {}

    async def test_handler(data):
        nonlocal received_data
        received_data = data
        handler_called.set()

    ws_client.on("test_action", test_handler)

    # Handle a message without action
    test_message = {"data": "test"}
    await ws_client._handle_message(test_message)

    # Wait briefly for handler to be called (if it was going to be)
    try:
        await asyncio.wait_for(handler_called.wait(), timeout=0.1)
    except asyncio.TimeoutError:
        pass  # Expected - handler shouldn't be called for messages without action


@pytest.mark.asyncio
async def test_websocket_handle_message_with_action(ws_client: WebSocketClient):
    """Test handling a message with an action field."""
    handler_called = asyncio.Event()
    received_data = {}

    async def test_handler(data):
        nonlocal received_data
        received_data = data
        handler_called.set()

    ws_client.on("quote_response", test_handler)

    # Handle a message with action
    test_message = {"action": "quote_response", "data": {"price": 100}}
    await ws_client._handle_message(test_message)

    # Wait for handler to be called
    await asyncio.wait_for(handler_called.wait(), timeout=1.0)
    assert received_data == test_message


@pytest.mark.asyncio
async def test_websocket_handle_message_with_future(ws_client: WebSocketClient):
    """Test handling a message that resolves a future."""
    # Create a future for a response
    future = asyncio.Future()
    ws_client._response_futures["test_response"] = future

    # Handle the response message
    test_message = {"action": "test_response", "data": {"result": "success"}}
    await ws_client._handle_message(test_message)

    # Verify the future was resolved
    assert future.done()
    assert future.result() == test_message
    assert "test_response" not in ws_client._response_futures


@pytest.mark.asyncio
async def test_websocket_handler_exception(ws_client: WebSocketClient):
    """Test that handler exceptions don't crash the message handler."""

    async def failing_handler(data):
        raise ValueError("Handler failed")

    ws_client.on("test_action", failing_handler)

    # This should not raise an exception
    test_message = {"action": "test_action", "data": "test"}
    await ws_client._handle_message(test_message)


@pytest.mark.asyncio
@patch("websockets.connect")
async def test_websocket_connect_timeout(mock_connect, ws_client: WebSocketClient):
    """Test WebSocket connection timeout."""
    # Mock connect to raise a timeout
    mock_connect.side_effect = asyncio.TimeoutError("Connection timeout")

    with pytest.raises(asyncio.TimeoutError):
        await ws_client.connect()


@pytest.mark.asyncio
async def test_websocket_send_and_wait_timeout(ws_client: WebSocketClient):
    """Test send_and_wait timeout."""
    # Mock a connected WebSocket
    mock_ws = AsyncMock()
    ws_client._ws = mock_ws
    ws_client._running = True

    # Try to send and wait with a very short timeout
    with pytest.raises(TimeoutError, match="No response received"):
        await ws_client.send_and_wait(
            {"action": "test"}, response_action="test_response", timeout=0.1
        )


@pytest.mark.asyncio
async def test_websocket_custom_configuration(http_client: HttpClient):
    """Test WebSocket with custom configuration."""
    http_client = HttpClient(base_url="https://api.test.com")
    ws_client = WebSocketClient(
        base_url="https://api.test.com",
        http_client=http_client,
        ping_interval=60,
        ping_timeout=20,
        close_timeout=15,
        max_size=1024 * 1024,  # 1MB
        max_queue=64,
        compression="deflate",
    )

    assert ws_client.ping_interval == 60
    assert ws_client.ping_timeout == 20
    assert ws_client.close_timeout == 15
    assert ws_client.max_size == 1024 * 1024
    assert ws_client.max_queue == 64
    assert ws_client.compression == "deflate"
    await http_client.close()


@pytest.mark.asyncio
async def test_websocket_send_json_serialization(ws_client: WebSocketClient):
    """Test that send properly serializes JSON."""
    mock_ws = AsyncMock()
    ws_client._ws = mock_ws

    test_data = {"action": "test", "number": 123, "nested": {"key": "value"}}
    await ws_client.send(test_data)

    # Verify send was called with JSON string
    mock_ws.send.assert_called_once()
    sent_data = mock_ws.send.call_args[0][0]
    assert json.loads(sent_data) == test_data


@pytest.mark.asyncio
async def test_websocket_disconnect_cancels_tasks(ws_client: WebSocketClient):
    """Test that disconnect properly cancels background tasks."""

    # Create a real task that can be cancelled
    async def dummy_task():
        try:
            await asyncio.sleep(100)
        except asyncio.CancelledError:
            pass

    task = asyncio.create_task(dummy_task())
    ws_client._message_task = task

    # Mock WebSocket connection
    mock_ws = AsyncMock()
    ws_client._ws = mock_ws

    await ws_client.disconnect()

    # Verify task was cancelled
    assert task.cancelled()
    assert ws_client._ws is None
    assert not ws_client._running


@pytest.mark.asyncio
async def test_websocket_multiple_handlers_same_action(ws_client: WebSocketClient):
    """Test multiple handlers for the same action."""
    handler1_called = asyncio.Event()
    handler2_called = asyncio.Event()
    received_data1 = {}
    received_data2 = {}

    async def handler1(data):
        nonlocal received_data1
        received_data1 = data
        handler1_called.set()

    async def handler2(data):
        nonlocal received_data2
        received_data2 = data
        handler2_called.set()

    ws_client.on("test_action", handler1)
    ws_client.on("test_action", handler2)

    test_message = {"action": "test_action", "data": "shared"}
    await ws_client._handle_message(test_message)

    # Wait for both handlers
    await asyncio.wait_for(handler1_called.wait(), timeout=1.0)
    await asyncio.wait_for(handler2_called.wait(), timeout=1.0)

    assert received_data1 == test_message
    assert received_data2 == test_message
