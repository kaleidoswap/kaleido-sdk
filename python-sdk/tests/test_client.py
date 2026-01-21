"""
Tests for KaleidoClient.
"""

import pytest
from kaleidoswap_sdk import (
    KaleidoClient,
    KaleidoConfig,
    NodeNotConfiguredError,
    to_smallest_units,
    to_display_units,
    get_version,
    get_sdk_name,
)


class TestKaleidoClient:
    """Tests for KaleidoClient."""

    def test_create_basic(self, base_url: str) -> None:
        """Test basic client creation."""
        client = KaleidoClient.create(base_url=base_url)
        assert client is not None
        assert not client.has_node()

    def test_create_with_node(self, base_url: str, node_url: str) -> None:
        """Test client creation with node URL."""
        client = KaleidoClient.create(base_url=base_url, node_url=node_url)
        assert client is not None
        assert client.has_node()

    def test_create_from_config(self, config: KaleidoConfig) -> None:
        """Test client creation from config object."""
        client = KaleidoClient.from_config(config)
        assert client is not None

    def test_maker_property(self, client: KaleidoClient) -> None:
        """Test maker property returns MakerClient."""
        from kaleidoswap_sdk import MakerClient

        assert isinstance(client.maker, MakerClient)

    def test_rln_property_without_node(self, client: KaleidoClient) -> None:
        """Test rln property raises error without node configured."""
        with pytest.raises(NodeNotConfiguredError):
            _ = client.rln

    def test_rln_property_with_node(self, client_with_node: KaleidoClient) -> None:
        """Test rln property returns RlnClient with node configured."""
        from kaleidoswap_sdk import RlnClient

        assert isinstance(client_with_node.rln, RlnClient)


class TestUtilityFunctions:
    """Tests for utility functions."""

    def test_to_smallest_units(self) -> None:
        """Test converting to smallest units."""
        # BTC to satoshis
        assert to_smallest_units(1.0, 8) == 100_000_000
        assert to_smallest_units(0.5, 8) == 50_000_000
        assert to_smallest_units(1.5, 8) == 150_000_000
        assert to_smallest_units(0.00000001, 8) == 1

        # USDT with precision 6
        assert to_smallest_units(1.0, 6) == 1_000_000
        assert to_smallest_units(100.50, 6) == 100_500_000

    def test_to_display_units(self) -> None:
        """Test converting to display units."""
        # Satoshis to BTC
        assert to_display_units(100_000_000, 8) == 1.0
        assert to_display_units(50_000_000, 8) == 0.5
        assert to_display_units(150_000_000, 8) == 1.5
        assert to_display_units(1, 8) == 0.00000001

        # USDT smallest units to display
        assert to_display_units(1_000_000, 6) == 1.0
        assert to_display_units(100_500_000, 6) == 100.5

    def test_conversion_roundtrip(self) -> None:
        """Test that conversion roundtrips correctly."""
        original = 1.23456789
        precision = 8
        smallest = to_smallest_units(original, precision)
        display = to_display_units(smallest, precision)
        # Note: floating point precision limits
        assert abs(display - 1.23456789) < 1e-8

    def test_get_version(self) -> None:
        """Test get_version returns a string."""
        version = get_version()
        assert isinstance(version, str)
        assert len(version) > 0
        # Check version format (semver-like)
        parts = version.split(".")
        assert len(parts) >= 2

    def test_get_sdk_name(self) -> None:
        """Test get_sdk_name returns expected name."""
        name = get_sdk_name()
        assert name == "kaleidoswap-sdk"
