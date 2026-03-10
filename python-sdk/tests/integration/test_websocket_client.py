"""
Integration tests for WSClient.

These tests require a reachable WebSocket server.
"""

import pytest

from kaleidoswap_sdk import WSClient


class TestWSClientIntegration:
    """Integration tests for WSClient (requires WebSocket server)."""

    @pytest.mark.integration
    async def test_connect_disconnect(self) -> None:
        """Test connecting and disconnecting against local test server."""
        client = WSClient(url="ws://localhost:8000/api/v1/market/ws")
        await client.connect()
        assert client.is_connected()

        client.disconnect()
        # Note: disconnect is not immediate due to async
