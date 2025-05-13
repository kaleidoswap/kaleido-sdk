import asyncio
import pytest
from kaleidoswap_sdk.client import KaleidoClient

# Test configuration
API_URL = "http://localhost:3000"
NODE_URL = "http://localhost:3001"
API_KEY = "test_api_key"

@pytest.fixture
async def client():
    """Create a test client instance."""
    client = KaleidoClient(
        api_url=API_URL,
        node_url=NODE_URL,
        api_key=API_KEY
    )
    await client.connect()
    yield client
    await client.close()

@pytest.mark.asyncio
async def test_node_operations(client):
    """Test node-related operations."""
    # Get node info
    node_info = await client.get_node_info()
    assert "pubkey" in node_info
    
    # Get node pubkey
    pubkey = await client.get_node_pubkey()
    assert pubkey == node_info["pubkey"]

@pytest.mark.asyncio
async def test_asset_operations(client):
    """Test asset-related operations."""
    # List assets
    assets = await client.list_assets()
    assert "nia" in assets or "uda" in assets or "cfa" in assets
    
    # Get asset metadata
    if "nia" in assets and assets["nia"]:
        asset_id = assets["nia"][0]["asset_id"]
        metadata = await client.get_asset_metadata(asset_id)
        assert "asset_iface" in metadata
        assert "asset_schema" in metadata

@pytest.mark.asyncio
async def test_pair_operations(client):
    """Test trading pair operations."""
    # List pairs
    pairs = await client.list_pairs()
    assert "pairs" in pairs
    
    if pairs["pairs"]:
        pair = pairs["pairs"][0]
        # Get pair by assets
        found_pair = await client.get_pair_by_assets(
            pair["base_asset_id"],
            pair["quote_asset_id"]
        )
        assert found_pair is not None
        assert found_pair["id"] == pair["id"]

@pytest.mark.asyncio
async def test_maker_swap_flow(client):
    """Test the complete maker swap flow."""
    # List assets to get valid asset IDs
    assets = await client.list_assets()
    if not assets.get("nia"):
        pytest.skip("No assets available for testing")
    
    # Get two different assets
    asset1 = assets["nia"][0]["asset_id"]
    asset2 = assets["nia"][1]["asset_id"] if len(assets["nia"]) > 1 else asset1
    
    # Get quote
    from_amount = 1000000  # 1 BTC in millisats
    quote = await client.get_quote(asset1, asset2, from_amount)
    assert "to_amount" in quote
    
    # Initialize maker swap
    init_result = await client.init_maker_swap(
        from_asset=asset1,
        to_asset=asset2,
        from_amount=from_amount,
        to_amount=quote["to_amount"],
        timeout_sec=3600
    )
    assert "payment_hash" in init_result
    assert "payment_secret" in init_result
    assert "swapstring" in init_result
    
    # Get swap status
    status = await client.get_swap_status(init_result["payment_hash"])
    assert "status" in status

@pytest.mark.asyncio
async def test_taker_swap_flow(client):
    """Test the complete taker swap flow."""
    # List assets to get valid asset IDs
    assets = await client.list_assets()
    if not assets.get("nia"):
        pytest.skip("No assets available for testing")
    
    # Get two different assets
    asset1 = assets["nia"][0]["asset_id"]
    asset2 = assets["nia"][1]["asset_id"] if len(assets["nia"]) > 1 else asset1
    
    # Get quote
    from_amount = 1000000  # 1 BTC in millisats
    quote = await client.get_quote(asset1, asset2, from_amount)
    assert "to_amount" in quote
    
    # Initialize maker swap (simulating another node)
    init_result = await client.init_maker_swap(
        from_asset=asset1,
        to_asset=asset2,
        from_amount=from_amount,
        to_amount=quote["to_amount"],
        timeout_sec=3600
    )
    
    # Whitelist trade
    whitelist_result = await client.whitelist_trade(init_result["swapstring"])
    assert "payment_hash" in whitelist_result
    assert "payment_secret" in whitelist_result
    
    # Confirm swap
    confirm_result = await client.confirm_swap(
        swapstring=init_result["swapstring"],
        payment_hash=whitelist_result["payment_hash"],
        payment_secret=whitelist_result["payment_secret"]
    )
    assert "status" in confirm_result

@pytest.mark.asyncio
async def test_websocket_events(client):
    """Test WebSocket event handling."""
    events_received = []
    
    async def on_swap_update(data):
        events_received.append(("swap_update", data))
    
    async def on_error(data):
        events_received.append(("error", data))
    
    # Register event handlers
    client.on("swap_update", on_swap_update)
    client.on("error", on_error)
    
    # Subscribe to a pair
    pairs = await client.list_pairs()
    if pairs["pairs"]:
        pair = pairs["pairs"][0]
        await client.ws_client.subscribe(f"{pair['base_asset']}/{pair['quote_asset']}")
        
        # Wait for some events
        await asyncio.sleep(5)
        
        # Unsubscribe
        await client.ws_client.unsubscribe(f"{pair['base_asset']}/{pair['quote_asset']}")
    
    # Clean up handlers
    client.ws_client.off("swap_update", on_swap_update)
    client.ws_client.off("error", on_error)

@pytest.mark.asyncio
async def test_complete_maker_swap(client):
    """Test the complete_maker_swap convenience method."""
    # List assets to get valid asset IDs
    assets = await client.list_assets()
    if not assets.get("nia"):
        pytest.skip("No assets available for testing")
    
    # Get two different assets
    asset1 = assets["nia"][0]["asset_id"]
    asset2 = assets["nia"][1]["asset_id"] if len(assets["nia"]) > 1 else asset1
    
    # Get quote
    from_amount = 1000000  # 1 BTC in millisats
    quote = await client.get_quote(asset1, asset2, from_amount)
    
    try:
        # Attempt complete maker swap
        result = await client.complete_maker_swap(
            from_asset=asset1,
            to_asset=asset2,
            from_amount=from_amount,
            to_amount=quote["to_amount"],
            timeout_sec=10  # Short timeout for testing
        )
        assert "status" in result
    except Exception as e:
        # Expected to timeout in test environment
        assert "timeout" in str(e).lower()

if __name__ == "__main__":
    # Run tests
    asyncio.run(test_node_operations())
    asyncio.run(test_asset_operations())
    asyncio.run(test_pair_operations())
    asyncio.run(test_maker_swap_flow())
    asyncio.run(test_taker_swap_flow())
    asyncio.run(test_websocket_events())
    asyncio.run(test_complete_maker_swap()) 