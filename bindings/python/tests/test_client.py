"""Tests for the Kaleidoswap Python SDK."""

import pytest
from kaleidoswap import (
    PairQuoteResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    NetworkInfoResponse,
)

API_URL = "http://localhost:8000"
API_NODE_URL = "http://localhost:3001"


class TestKaleidoClient:
    """Test cases for KaleidoClient."""

    def test_client_creation(self):
        """Test that a client can be created with valid config."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=None,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        client = KaleidoClient(config)
        assert client is not None

    def test_client_has_node_false(self):
        """Test has_node returns False when no node URL is provided."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=None,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        client = KaleidoClient(config)
        assert client.has_node() is False

    def test_client_has_node_true(self):
        """Test has_node returns True when node URL is provided."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        client = KaleidoClient(config)
        assert client.has_node() is True


class TestKaleidoError:
    """Test cases for KaleidoError."""

    def test_error_import(self):
        """Test that KaleidoError can be imported."""
        from kaleidoswap import KaleidoError

        assert KaleidoError is not None


# Integration tests (require running API)
@pytest.mark.integration
class TestIntegration:
    """Integration tests that require a running Kaleidoswap API."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_list_assets(self, client):
        """Test listing assets from the API."""
        assets = client.list_assets()
        assert isinstance(assets, list)  # Returns List[Asset]
        assert len(assets) > 0
        # Verify it's actually Asset objects
        from kaleidoswap import Asset
        assert isinstance(assets[0], Asset)

    def test_list_pairs(self, client):
        """Test listing trading pairs from the API."""
        pairs = client.list_pairs()
        assert isinstance(pairs, list)  # Returns List[TradingPair]
        assert len(pairs) > 0
        # Verify it's actually TradingPair objects
        from kaleidoswap import TradingPair
        assert isinstance(pairs[0], TradingPair)


class TestClientMethodSignatures:
    """Test that all expected methods exist and have correct signatures."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_has_market_methods(self, client):
        """Test that market methods exist."""
        assert hasattr(client, "list_assets")
        assert hasattr(client, "list_pairs")
        assert hasattr(client, "get_quote_by_pair")

    def test_has_swap_methods(self, client):
        """Test that swap methods exist."""
        assert hasattr(client, "get_node_info")
        assert hasattr(client, "get_swap_status")
        assert hasattr(client, "wait_for_swap_completion")

    def test_has_order_methods(self, client):
        """Test that order methods exist."""
        assert hasattr(client, "get_swap_order_status")
        assert hasattr(client, "get_order_history")
        assert hasattr(client, "get_order_analytics")
        assert hasattr(client, "swap_order_rate_decision")

    def test_has_lsp_methods(self, client):
        """Test that LSP methods exist."""
        assert hasattr(client, "get_lsp_info")
        assert hasattr(client, "get_lsp_network_info")
        assert hasattr(client, "get_lsp_order")
        assert hasattr(client, "estimate_lsp_fees")

    def test_has_rgb_node_methods(self, client):
        """Test that RGB node methods exist."""
        assert hasattr(client, "get_rgb_node_info")
        assert hasattr(client, "list_channels")
        assert hasattr(client, "list_peers")
        assert hasattr(client, "list_node_assets")
        assert hasattr(client, "get_asset_balance")
        assert hasattr(client, "get_onchain_address")
        assert hasattr(client, "get_btc_balance")
        assert hasattr(client, "whitelist_trade")
        assert hasattr(client, "decode_ln_invoice")
        assert hasattr(client, "list_payments")

    def test_has_wallet_methods(self, client):
        """Test that wallet methods exist."""
        assert hasattr(client, "init_wallet")
        assert hasattr(client, "unlock_wallet")
        assert hasattr(client, "lock_wallet")

    def test_has_convenience_methods(self, client):
        """Test that convenience methods exist."""
        assert hasattr(client, "get_asset_by_ticker")
        assert hasattr(client, "get_quote_by_assets")
        assert hasattr(client, "complete_swap_from_quote")
        assert hasattr(client, "get_pair_by_ticker")

    def test_has_new_convenience_methods(self, client):
        """Test that new convenience methods exist."""
        assert hasattr(client, "list_active_assets")
        assert hasattr(client, "list_active_pairs")
        assert hasattr(client, "estimate_swap_fees")
        assert hasattr(client, "get_best_quote")
        assert hasattr(client, "find_asset_by_ticker")
        assert hasattr(client, "find_pair_by_ticker")

    def test_has_websocket_methods(self, client):
        """Test that WebSocket streaming methods exist."""
        assert hasattr(client, "create_quote_stream")

    def test_method_count(self, client):
        """Test that client has expected number of public methods."""
        # All the methods we expose (29+ methods now with WebSocket streaming)
        public_methods = [m for m in dir(client) if not m.startswith("_")]
        assert (
            len(public_methods) >= 29
        ), f"Expected at least 29 methods, got {len(public_methods)}"


# Additional integration tests for new methods
@pytest.mark.integration
class TestExtendedIntegration:
    """Extended integration tests for new SDK methods."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_get_order_history(self, client):
        """Test getting order history."""
        history = client.get_order_history()
        assert isinstance(history, OrderHistoryResponse)

    def test_get_order_analytics(self, client):
        """Test getting order analytics."""
        analytics = client.get_order_analytics()
        assert isinstance(analytics, OrderStatsResponse)

    def test_get_lsp_info(self, client):
        """Test getting LSP info."""
        info = client.get_lsp_info()
        assert isinstance(info, str)

    def test_get_lsp_network_info(self, client):
        """Test getting LSP network info."""
        info = client.get_lsp_network_info()
        assert isinstance(info, NetworkInfoResponse)


class TestQuoteStream:
    """Test cases for QuoteStream WebSocket streaming."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=None,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_quote_stream_class_exists(self):
        """Test that PyQuoteStream class can be imported."""
        from kaleidoswap import PyQuoteStream

        assert PyQuoteStream is not None


@pytest.mark.integration
class TestQuoteStreamIntegration:
    """Integration tests for QuoteStream (require live WebSocket server)."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=None,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_create_quote_stream(self, client):
        """Test creating a quote stream."""
        stream = client.create_quote_stream("BTC/USDT")

        assert stream is not None
        assert hasattr(stream, "recv")
        assert hasattr(stream, "is_connected")
        assert hasattr(stream, "close")

        stream.close()

    def test_quote_stream_connection_status(self, client):
        """Test that connection status is tracked correctly."""
        stream = client.create_quote_stream("BTC/USDT")

        assert stream.is_connected() is True

        stream.close()

        assert stream.is_connected() is False

    def test_quote_stream_recv_timeout(self, client):
        """Test that recv returns None on timeout."""
        stream = client.create_quote_stream("NONEXISTENT/PAIR")

        # Very short timeout should return None
        quote = stream.recv(0.1)
        assert quote is None

        stream.close()


# ============================================================================
# Quote Operations Tests
# ============================================================================


class TestQuoteOperations:
    """Test cases for quote operations."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
            max_retries=3,
            cache_ttl=60,
        )
        return KaleidoClient(config)

    def test_has_get_quote_by_pair_method(self, client):
        """Test that get_quote_by_pair method exists."""
        assert hasattr(client, "get_quote_by_pair")

    def test_has_get_quote_by_assets_method(self, client):
        """Test that get_quote_by_assets method exists."""
        assert hasattr(client, "get_quote_by_assets")


@pytest.mark.integration
class TestQuoteOperationsIntegration:
    """Integration tests for quote operations."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_get_quote_by_pair_with_from_amount(self, client):
        """Test getting a quote with from_amount."""
        # 1M sats > 500k min
        quote = client.get_best_quote("BTC/USDT", 1_000_000, None)
        assert isinstance(quote, PairQuoteResponse)

    def test_get_quote_by_pair_with_to_amount(self, client):
        """Test getting a quote with to_amount."""
        # 10 USDT > 1 USDT min
        quote = client.get_best_quote("BTC/USDT", None, 10_000_000)
        assert isinstance(quote, PairQuoteResponse)


# ============================================================================
# Swap Flow Tests
# ============================================================================


class TestSwapFlowOperations:
    """Test cases for swap flow operations."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_get_swap_status_method(self, client):
        """Test that get_swap_status method exists."""
        assert hasattr(client, "get_swap_status")

    def test_has_wait_for_swap_completion_method(self, client):
        """Test that wait_for_swap_completion method exists."""
        assert hasattr(client, "wait_for_swap_completion")

    def test_has_complete_swap_from_quote_method(self, client):
        """Test that complete_swap_from_quote method exists."""
        assert hasattr(client, "complete_swap_from_quote")

    def test_has_whitelist_trade_method(self, client):
        """Test that whitelist_trade method exists."""
        assert hasattr(client, "whitelist_trade")


# ============================================================================
# Order Management Tests
# ============================================================================


class TestOrderManagement:
    """Test cases for order management."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_get_swap_order_status_method(self, client):
        """Test that get_swap_order_status method exists."""
        assert hasattr(client, "get_swap_order_status")

    def test_has_get_order_history_method(self, client):
        """Test that get_order_history method exists."""
        assert hasattr(client, "get_order_history")

    def test_has_get_order_analytics_method(self, client):
        """Test that get_order_analytics method exists."""
        assert hasattr(client, "get_order_analytics")

    def test_has_swap_order_rate_decision_method(self, client):
        """Test that swap_order_rate_decision method exists."""
        assert hasattr(client, "swap_order_rate_decision")


@pytest.mark.integration
class TestOrderManagementIntegration:
    """Integration tests for order management."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_get_order_history(self, client):
        """Test getting order history."""
        history = client.get_order_history(None, 10, 0)
        assert isinstance(history, OrderHistoryResponse)

    def test_get_order_analytics(self, client):
        """Test getting order analytics."""
        analytics = client.get_order_analytics()
        assert isinstance(analytics, OrderStatsResponse)


# ============================================================================
# LSP Operations Tests
# ============================================================================


class TestLspOperations:
    """Test cases for LSP operations."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_get_lsp_info_method(self, client):
        """Test that get_lsp_info method exists."""
        assert hasattr(client, "get_lsp_info")

    def test_has_get_lsp_network_info_method(self, client):
        """Test that get_lsp_network_info method exists."""
        assert hasattr(client, "get_lsp_network_info")

    def test_has_get_lsp_order_method(self, client):
        """Test that get_lsp_order method exists."""
        assert hasattr(client, "get_lsp_order")

    def test_has_estimate_lsp_fees_method(self, client):
        """Test that estimate_lsp_fees method exists."""
        assert hasattr(client, "estimate_lsp_fees")


@pytest.mark.integration
class TestLspOperationsIntegration:
    """Integration tests for LSP operations."""

    @pytest.fixture
    def client(self):
        """Create a client for integration tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="https://api.regtest.kaleidoswap.com",
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_get_lsp_info(self, client):
        """Test getting LSP info."""
        info = client.get_lsp_info()
        assert isinstance(info, str)

    def test_get_lsp_network_info(self, client):
        """Test getting LSP network info."""
        info = client.get_lsp_network_info()
        assert isinstance(info, NetworkInfoResponse)


# ============================================================================
# Node Operations Tests
# ============================================================================


class TestNodeOperations:
    """Test cases for node operations."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_get_rgb_node_info_method(self, client):
        """Test that get_rgb_node_info method exists."""
        assert hasattr(client, "get_rgb_node_info")

    def test_has_list_channels_method(self, client):
        """Test that list_channels method exists."""
        assert hasattr(client, "list_channels")

    def test_has_list_peers_method(self, client):
        """Test that list_peers method exists."""
        assert hasattr(client, "list_peers")

    def test_has_list_node_assets_method(self, client):
        """Test that list_node_assets method exists."""
        assert hasattr(client, "list_node_assets")

    def test_has_get_asset_balance_method(self, client):
        """Test that get_asset_balance method exists."""
        assert hasattr(client, "get_asset_balance")

    def test_has_get_onchain_address_method(self, client):
        """Test that get_onchain_address method exists."""
        assert hasattr(client, "get_onchain_address")

    def test_has_get_btc_balance_method(self, client):
        """Test that get_btc_balance method exists."""
        assert hasattr(client, "get_btc_balance")

    def test_has_decode_ln_invoice_method(self, client):
        """Test that decode_ln_invoice method exists."""
        assert hasattr(client, "decode_ln_invoice")

    def test_has_list_payments_method(self, client):
        """Test that list_payments method exists."""
        assert hasattr(client, "list_payments")


# ============================================================================
# Helper Methods Tests
# ============================================================================


class TestHelperMethods:
    """Test cases for helper methods."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_get_asset_by_ticker_method(self, client):
        """Test that get_asset_by_ticker method exists."""
        assert hasattr(client, "get_asset_by_ticker")

    def test_has_get_pair_by_ticker_method(self, client):
        """Test that get_pair_by_ticker method exists."""
        assert hasattr(client, "get_pair_by_ticker")


# ============================================================================
# Wallet Operations Tests
# ============================================================================


class TestWalletOperations:
    """Test cases for wallet operations."""

    @pytest.fixture
    def client(self):
        """Create a client for tests."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
        )
        return KaleidoClient(config)

    def test_has_init_wallet_method(self, client):
        """Test that init_wallet method exists."""
        assert hasattr(client, "init_wallet")

    def test_has_unlock_wallet_method(self, client):
        """Test that unlock_wallet method exists."""
        assert hasattr(client, "unlock_wallet")

    def test_has_lock_wallet_method(self, client):
        """Test that lock_wallet method exists."""
        assert hasattr(client, "lock_wallet")


# ============================================================================
# Error Handling Tests
# ============================================================================


class TestErrorHandling:
    """Test cases for error handling."""

    def test_client_creation_with_empty_base_url(self):
        """Test that client handles empty base_url."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(base_url="")
        client = KaleidoClient(config)
        assert client is not None

    def test_client_without_node_url(self):
        """Test that client works without node URL."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(base_url="https://api.example.com", node_url=None)
        client = KaleidoClient(config)
        assert client is not None
        assert client.has_node() is False

    def test_client_with_node_url(self):
        """Test that client works with node URL."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url="https://api.example.com", node_url="http://localhost:3000"
        )
        client = KaleidoClient(config)
        assert client is not None
        assert client.has_node() is True

    def test_has_node_consistency(self):
        """Test that has_node is consistent with configuration."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        # Without node
        config_no_node = KaleidoConfig(
            base_url="https://api.example.com", node_url=None
        )
        client_no_node = KaleidoClient(config_no_node)
        assert client_no_node.has_node() is False

        # With node
        config_with_node = KaleidoConfig(
            base_url="https://api.example.com", node_url="http://localhost:3000"
        )
        client_with_node = KaleidoClient(config_with_node)
        assert client_with_node.has_node() is True


class TestJsonParsing:
    """Test cases for JSON parsing."""

    def test_list_assets_returns_typed_objects(self):
        """Test that list_assets returns typed Asset objects."""
        from kaleidoswap import KaleidoClient, KaleidoConfig, Asset

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        client = KaleidoClient(config)

        result = client.list_assets()
        assert isinstance(result, list)
        if len(result) > 0:
            assert isinstance(result[0], Asset)

    def test_list_pairs_returns_typed_objects(self):
        """Test that list_pairs returns typed TradingPair objects."""
        from kaleidoswap import KaleidoClient, KaleidoConfig, TradingPair

        config = KaleidoConfig(
            base_url=API_URL,
            timeout=30.0,
        )
        client = KaleidoClient(config)

        result = client.list_pairs()
        assert isinstance(result, list)
        if len(result) > 0:
            assert isinstance(result[0], TradingPair)


class TestMethodCount:
    """Test that all expected methods are present."""

    def test_client_has_expected_method_count(self):
        """Test that client has at least the expected number of methods."""
        from kaleidoswap import KaleidoClient, KaleidoConfig

        config = KaleidoConfig(
            base_url=API_URL,
            node_url=API_NODE_URL,
            timeout=30.0,
        )
        client = KaleidoClient(config)

        # Expected methods (29+)
        expected_methods = [
            "has_node",
            "list_assets",
            "list_pairs",
            "get_quote_by_pair",
            "get_node_info",
            "get_swap_status",
            "wait_for_swap_completion",
            "get_swap_order_status",
            "get_order_history",
            "get_order_analytics",
            "swap_order_rate_decision",
            "get_lsp_info",
            "get_lsp_network_info",
            "get_lsp_order",
            "estimate_lsp_fees",
            "get_rgb_node_info",
            "list_channels",
            "list_peers",
            "list_node_assets",
            "get_asset_balance",
            "get_onchain_address",
            "get_btc_balance",
            "whitelist_trade",
            "decode_ln_invoice",
            "list_payments",
            "init_wallet",
            "unlock_wallet",
            "lock_wallet",
            "get_asset_by_ticker",
            "get_quote_by_assets",
            "complete_swap_from_quote",
            "get_pair_by_ticker",
            "create_quote_stream",
        ]

        missing_methods = [m for m in expected_methods if not hasattr(client, m)]
        assert len(missing_methods) == 0, f"Missing methods: {missing_methods}"
