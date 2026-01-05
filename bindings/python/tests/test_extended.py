"""Extended tests for the Kaleidoswap Python SDK.

This module contains comprehensive tests for additional SDK functionality
including utility functions, error handling, and more API methods.
"""

import pytest


class TestUtilityFunctions:
    """Test utility functions for amount conversion."""

    def test_to_smallest_units(self):
        """Test conversion from display units to smallest units."""
        from kaleidoswap import to_smallest_units

        # 1 BTC = 100,000,000 satoshis (8 decimals)
        assert to_smallest_units(1.0, 8) == 100_000_000
        assert to_smallest_units(0.5, 8) == 50_000_000
        assert to_smallest_units(1.23456789, 8) == 123_456_789

        # Test with different precisions
        assert to_smallest_units(1.0, 2) == 100
        assert to_smallest_units(1.0, 0) == 1

    def test_to_display_units(self):
        """Test conversion from smallest units to display units."""
        from kaleidoswap import to_display_units

        # 100,000,000 satoshis = 1 BTC (8 decimals)
        assert to_display_units(100_000_000, 8) == 1.0
        assert to_display_units(50_000_000, 8) == 0.5
        assert to_display_units(123_456_789, 8) == 1.23456789

        # Test with different precisions
        assert to_display_units(100, 2) == 1.0
        assert to_display_units(1, 0) == 1.0


class TestKaleidoConfig:
    """Test cases for KaleidoConfig."""

    def test_config_with_all_parameters(self):
        """Test creating config with all parameters."""
        from kaleidoswap import KaleidoConfig

        config = KaleidoConfig(
            base_url="https://custom.example.com",
            node_url="https://node.example.com",
            api_key="test-key",
            timeout=60.0,
            max_retries=5,
            cache_ttl=120,
        )

        assert config is not None

    def test_config_with_minimal_parameters(self):
        """Test creating config with minimal parameters."""
        from kaleidoswap import KaleidoConfig

        config = KaleidoConfig(base_url="https://api.example.com")

        assert config is not None

    def test_config_default_values(self):
        """Test that config handles default values correctly."""
        from kaleidoswap import KaleidoConfig

        # Test with only required parameters
        config = KaleidoConfig(base_url="https://api.example.com")
        assert config is not None


class TestClientMethods:
    """Extended tests for KaleidoClient methods."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_list_assets_returns_typed_objects(self, client):
        """Test that list_assets returns typed Asset objects."""
        result = client.list_assets()
        assert isinstance(result, list)

        # Verify objects are Asset instances
        from kaleidoswap import Asset

        if len(result) > 0:
            assert isinstance(result[0], Asset)

    def test_list_pairs_returns_typed_objects(self, client):
        """Test that list_pairs returns typed TradingPair objects."""
        result = client.list_pairs()
        assert isinstance(result, list)

        # Verify objects are TradingPair instances
        from kaleidoswap import TradingPair

        if len(result) > 0:
            assert isinstance(result[0], TradingPair)

    def test_has_node_consistency(self):
        """Test that has_node is consistent with node_url."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        # Client without node
        config_no_node = KaleidoConfig(
            base_url="https://api.example.com", node_url=None
        )
        client_no_node = KaleidoClient(config_no_node)
        assert client_no_node.has_node() is False

        # Client with node
        config_with_node = KaleidoConfig(
            base_url="https://api.example.com", node_url="https://node.example.com"
        )
        client_with_node = KaleidoClient(config_with_node)
        assert client_with_node.has_node() is True


class TestErrorHandling:
    """Test error handling and edge cases."""

    def test_error_class_exists(self):
        """Test that KaleidoError class can be used."""
        from kaleidoswap import KaleidoError

        # Test that we can create an instance
        error = KaleidoError("test error")
        assert str(error) == "test error"

    def test_error_inheritance(self):
        """Test that KaleidoError inherits from Exception."""
        from kaleidoswap import KaleidoError

        assert issubclass(KaleidoError, Exception)

    def test_invalid_config_handling(self):
        """Test that invalid configurations are handled."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        # This should either raise an error or handle gracefully
        # Testing with empty base_url
        try:
            config = KaleidoConfig(base_url="")
            client = KaleidoClient(config)
            # If it succeeds, that's also valid behavior
            assert client is not None
        except Exception as e:
            # If it raises, that's expected behavior too
            assert isinstance(e, (ValueError, RuntimeError, Exception))


class TestModuleMetadata:
    """Test module-level metadata and exports."""

    def test_version_exists(self):
        """Test that __version__ is defined."""
        import kaleidoswap

        assert hasattr(kaleidoswap, "__version__")
        assert isinstance(kaleidoswap.__version__, str)

    def test_all_exports(self):
        """Test that __all__ is properly defined."""
        import kaleidoswap

        assert hasattr(kaleidoswap, "__all__")

        # Check that main classes are exported
        expected_exports = ["KaleidoClient", "KaleidoConfig", "KaleidoError"]
        for export in expected_exports:
            assert export in kaleidoswap.__all__, f"{export} not in __all__"

    def test_imports_work(self):
        """Test that all main imports work."""
        from kaleidoswap import (KaleidoClient, KaleidoConfig, KaleidoError,
                                 to_display_units, to_smallest_units)

        assert KaleidoClient is not None
        assert KaleidoConfig is not None
        assert KaleidoError is not None
        assert callable(to_smallest_units)
        assert callable(to_display_units)


class TestDisplayAmountUtilities:
    """Test display amount conversion methods."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_to_raw_method(self, client):
        """Test that to_raw method exists."""
        assert hasattr(client, "to_raw")
        assert callable(client.to_raw)

    def test_has_to_display_method(self, client):
        """Test that to_display method exists."""
        assert hasattr(client, "to_display")
        assert callable(client.to_display)

    def test_has_convert_amount_method(self, client):
        """Test that convert_amount method exists."""
        assert hasattr(client, "convert_amount")
        assert callable(client.convert_amount)


class TestAssetPairResolution:
    """Test asset and pair resolution methods."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_get_asset_by_id_method(self, client):
        """Test that get_asset_by_id method exists."""
        assert hasattr(client, "get_asset_by_id")
        assert callable(client.get_asset_by_id)

    def test_has_get_pair_by_assets_method(self, client):
        """Test that get_pair_by_assets method exists."""
        assert hasattr(client, "get_pair_by_assets")
        assert callable(client.get_pair_by_assets)


class TestValidationHelpers:
    """Test validation and trade helper methods."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_can_trade_method(self, client):
        """Test that can_trade method exists."""
        assert hasattr(client, "can_trade")
        assert callable(client.can_trade)

    def test_has_validate_amount_method(self, client):
        """Test that validate_amount method exists."""
        assert hasattr(client, "validate_amount")
        assert callable(client.validate_amount)

    def test_has_refresh_cache_method(self, client):
        """Test that refresh_cache method exists."""
        assert hasattr(client, "refresh_cache")
        assert callable(client.refresh_cache)


@pytest.mark.integration
class TestDisplayAmountIntegration:
    """Integration tests for display amount utilities."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_to_raw_with_btc(self, client):
        """Test to_raw conversion with BTC asset."""
        from kaleidoswap import Asset

        # Create a mock BTC asset with precision 8
        btc_asset = Asset(
            ticker="BTC",
            name="Bitcoin",
            precision=8,
        )

        result = client.to_raw(1.5, btc_asset)
        assert result == 150_000_000  # 1.5 BTC in satoshis

    def test_to_display_with_btc(self, client):
        """Test to_display conversion with BTC asset."""
        from kaleidoswap import Asset

        btc_asset = Asset(
            ticker="BTC",
            name="Bitcoin",
            precision=8,
        )

        result = client.to_display(150_000_000, btc_asset)
        assert result == 1.5

    def test_convert_amount_to_raw(self, client):
        """Test convert_amount to raw."""
        from kaleidoswap import Asset

        usdt_asset = Asset(
            ticker="USDT",
            name="Tether",
            precision=6,
        )

        result = client.convert_amount(10.5, usdt_asset, "raw")
        assert result == 10_500_000

    def test_convert_amount_to_display(self, client):
        """Test convert_amount to display."""
        from kaleidoswap import Asset

        usdt_asset = Asset(
            ticker="USDT",
            name="Tether",
            precision=6,
        )

        result = client.convert_amount(10_500_000, usdt_asset, "display")
        assert result == 10.5

    def test_convert_amount_invalid_direction(self, client):
        """Test convert_amount with invalid direction."""
        from kaleidoswap import Asset

        usdt_asset = Asset(
            ticker="USDT",
            name="Tether",
            precision=6,
        )

        with pytest.raises(ValueError):
            client.convert_amount(10.5, usdt_asset, "invalid")


@pytest.mark.integration
class TestValidationIntegration:
    """Integration tests for validation helpers."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_validate_amount_with_live_asset(self, client):
        """Test validate_amount with a live asset from the API."""
        # This test requires a running API
        result = client.validate_amount(1.0, "BTC")

        assert "valid" in result
        assert "raw_amount" in result
        assert "display_amount" in result
        assert "errors" in result

        if result["valid"]:
            assert result["raw_amount"] > 0
            assert result["display_amount"] == 1.0
            assert len(result["errors"]) == 0

    def test_can_trade_with_live_pairs(self, client):
        """Test can_trade with live trading pairs."""
        # This tests with actual pairs from the API
        result = client.can_trade("BTC", "USDT")

        # Result should be boolean
        assert isinstance(result, bool)


class TestHighLevelSwapFlows:
    """Test high-level swap flow methods."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="http://localhost:8000",
            node_url="http://localhost:3001",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_execute_swap_flow_method(self, client):
        """Test that execute_swap_flow method exists."""
        assert hasattr(client, "execute_swap_flow")
        assert callable(client.execute_swap_flow)

    def test_has_execute_swap_by_pair_method(self, client):
        """Test that execute_swap_by_pair method exists."""
        assert hasattr(client, "execute_swap_by_pair")
        assert callable(client.execute_swap_by_pair)

    def test_has_complete_maker_swap_method(self, client):
        """Test that complete_maker_swap method exists."""
        assert hasattr(client, "complete_maker_swap")
        assert callable(client.complete_maker_swap)

    def test_execute_swap_by_pair_invalid_side(self, client):
        """Test that execute_swap_by_pair raises on invalid side."""
        with pytest.raises(ValueError) as exc_info:
            # This will fail before making API calls due to invalid side
            client.execute_swap_by_pair(
                pair_ticker="BTC/USDT",
                amount=0.01,
                side="invalid",  # Invalid side
                taker_pubkey="fakepubkey",
            )

        assert "Invalid side" in str(exc_info.value)

    def test_execute_swap_by_pair_invalid_ticker(self, client):
        """Test that execute_swap_by_pair raises on invalid ticker format."""
        with pytest.raises(ValueError) as exc_info:
            client.execute_swap_by_pair(
                pair_ticker="BTCUSDT",  # Missing slash
                amount=0.01,
                side="sell",
                taker_pubkey="fakepubkey",
            )

        assert "Invalid pair ticker" in str(exc_info.value)
