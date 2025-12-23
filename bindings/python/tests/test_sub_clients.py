"""
Test sub-client access and organization.
"""

import pytest
from kaleidoswap import KaleidoClient, KaleidoConfig, MarketClient, OrdersClient, LspClient, NodeClient


def test_sub_client_properties_exist():
    """Test that sub-client properties exist on KaleidoClient."""
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        timeout=30.0,
        max_retries=3,
        cache_ttl=60,
    )
    client = KaleidoClient(config)
    
    # Check that properties exist and return correct types
    assert isinstance(client.market, MarketClient)
    assert isinstance(client.orders, OrdersClient)
    assert isinstance(client.lsp, LspClient)
    
    # Node should be None when not configured
    assert client.node is None


def test_sub_client_with_node():
    """Test that node client is available when configured."""
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        node_url="http://localhost:3001",
        timeout=30.0,
        max_retries=3,
        cache_ttl=60,
    )
    client = KaleidoClient(config)
    
    # Node should be available
    assert client.has_node()
    assert isinstance(client.node, NodeClient)


@pytest.mark.integration
def test_market_client_list_assets():
    """Test market client asset listing."""
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        timeout=30.0,
        max_retries=3,
        cache_ttl=60,
    )
    client = KaleidoClient(config)
    
    # Use the new market client
    assets = client.market.list_assets()
    assert isinstance(assets, list)
    assert len(assets) > 0


@pytest.mark.integration
def test_market_client_get_quote():
    """Test market client quote generation."""
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        timeout=30.0,
        max_retries=3,
        cache_ttl=60,
    )
    client = KaleidoClient(config)
    
    # Use the new market client
    quote = client.market.get_best_quote("BTC/USDT", 1_000_000, None)
    assert quote is not None


@pytest.mark.integration  
def test_orders_client_get_history():
    """Test orders client history retrieval."""
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        timeout=30.0,
        max_retries=3,
        cache_ttl=60,
    )
    client = KaleidoClient(config)
    
    # Use the new orders client
    history = client.orders.get_order_history()
    assert history is not None


def test_lazy_initialization():
    """Test that sub-clients are lazy-initialized."""
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        timeout=30.0,
        max_retries=3,
        cache_ttl=60,
    )
    client = KaleidoClient(config)
    
    # Sub-clients should not be initialized yet
    assert client._market_client is None
    assert client._orders_client is None
    
    # Access market - should initialize
    market = client.market
    assert client._market_client is not None
    
    # Second access should return same instance
    market2 = client.market
    assert market is market2
