"""
Tests for WebSocket client.
"""


from kaleidoswap_sdk import (
    WSAction,
    WSClient,
)


class TestWSClient:
    """Tests for WSClient."""

    def test_create_client(self) -> None:
        """Test creating WebSocket client."""
        client = WSClient(url="wss://api.kaleidoswap.com/ws")
        assert client is not None
        assert not client.is_connected()

    def test_default_config(self) -> None:
        """Test default configuration values."""
        client = WSClient(url="wss://test.com/ws")
        assert client._max_reconnect_attempts == 5
        assert client._reconnect_delay == 1.0
        assert client._ping_interval == 30.0

    def test_custom_config(self) -> None:
        """Test custom configuration values."""
        client = WSClient(
            url="wss://test.com/ws",
            max_reconnect_attempts=10,
            reconnect_delay=2.0,
            ping_interval=60.0,
        )
        assert client._max_reconnect_attempts == 10
        assert client._reconnect_delay == 2.0
        assert client._ping_interval == 60.0


class TestWSClientEvents:
    """Tests for WSClient event handling."""

    def test_on_off_events(self) -> None:
        """Test subscribing and unsubscribing from events."""
        client = WSClient(url="wss://test.com/ws")
        callback_called = False

        def callback(data: dict) -> None:
            nonlocal callback_called
            callback_called = True

        # Subscribe
        client.on("test_event", callback)
        assert "test_event" in client._listeners
        assert callback in client._listeners["test_event"]

        # Emit
        client._emit("test_event", {"test": "data"})
        assert callback_called

        # Unsubscribe
        client.off("test_event", callback)
        assert callback not in client._listeners["test_event"]

    def test_multiple_listeners(self) -> None:
        """Test multiple listeners for same event."""
        client = WSClient(url="wss://test.com/ws")
        calls = []

        def callback1(data: dict) -> None:
            calls.append(1)

        def callback2(data: dict) -> None:
            calls.append(2)

        client.on("event", callback1)
        client.on("event", callback2)

        client._emit("event", {})

        assert 1 in calls
        assert 2 in calls


class TestWSAction:
    """Tests for WSAction enum."""

    def test_action_values(self) -> None:
        """Test WSAction enum values."""
        assert WSAction.PING.value == "ping"
        assert WSAction.PONG.value == "pong"
        assert WSAction.QUOTE_REQUEST.value == "quote_request"
        assert WSAction.QUOTE_RESPONSE.value == "quote_response"
        assert WSAction.CONNECTION_ESTABLISHED.value == "connection_established"
        assert WSAction.ERROR.value == "error"
