"""
Tests for MakerClient.
"""

import pytest
from kaleidoswap_sdk import (
    KaleidoClient,
    MakerClient,
    SwapCompletionOptions,
)


class TestMakerClient:
    """Tests for MakerClient."""

    def test_maker_client_exists(self, client: KaleidoClient) -> None:
        """Test that maker client is accessible."""
        assert client.maker is not None
        assert isinstance(client.maker, MakerClient)

    def test_to_raw_conversion(self, client: KaleidoClient) -> None:
        """Test to_raw convenience method."""
        raw = client.maker.to_raw(1.5, 8)
        assert raw == 150_000_000

    def test_to_display_conversion(self, client: KaleidoClient) -> None:
        """Test to_display convenience method."""
        display = client.maker.to_display(150_000_000, 8)
        assert display == 1.5


class TestSwapCompletionOptions:
    """Tests for SwapCompletionOptions."""

    def test_default_values(self) -> None:
        """Test default option values."""
        options = SwapCompletionOptions()
        assert options.timeout == 300.0
        assert options.poll_interval == 2.0
        assert options.on_status_update is None

    def test_custom_values(self) -> None:
        """Test custom option values."""
        callback_called = False

        def callback(status: str) -> None:
            nonlocal callback_called
            callback_called = True

        options = SwapCompletionOptions(
            timeout=600.0,
            poll_interval=5.0,
            on_status_update=callback,
        )
        assert options.timeout == 600.0
        assert options.poll_interval == 5.0
        assert options.on_status_update is not None

        # Test callback
        options.on_status_update("test")
        assert callback_called


# Integration tests would require mocking or a live API
class TestMakerClientIntegration:
    """Integration tests for MakerClient (requires API)."""

    @pytest.mark.integration
    async def test_list_assets(self, client: KaleidoClient) -> None:
        """Test listing assets from API."""
        assets = await client.maker.list_assets()
        assert assets is not None
        assert hasattr(assets, "assets")

    @pytest.mark.integration
    async def test_list_pairs(self, client: KaleidoClient) -> None:
        """Test listing trading pairs from API."""
        pairs = await client.maker.list_pairs()
        assert pairs is not None
        assert hasattr(pairs, "pairs")
