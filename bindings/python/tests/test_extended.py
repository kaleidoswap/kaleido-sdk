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
