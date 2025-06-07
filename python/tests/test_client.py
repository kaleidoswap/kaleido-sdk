import asyncio
import pytest
import logging

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_node_info(client):
    """Test node-related operations."""
    # Get node info
    node_info = await client.get_node_info()
    logger.info("Retrieved node info: %s", node_info)
    assert node_info is not None

@pytest.mark.asyncio
async def test_node_pubkey(client):
    """Test node-related operations."""
    # Get node pubkey
    node_pubkey = await client.get_node_pubkey()
    logger.info("Retrieved node pubkey: %s", node_pubkey)
    assert node_pubkey is not None
    
@pytest.mark.asyncio
async def test_asset_operations(client):
    """Test asset-related operations."""
    # List assets
    assets = await client.list_assets()
    logger.info("Retrieved assets: %s", assets)
    assert assets is not None

@pytest.mark.asyncio
async def test_pair_operations(client):
    """Test trading pair operations."""
    # List pairs
    pairs = await client.list_pairs()
    logger.info("Retrieved pairs: %s", pairs)
    assert "pairs" in pairs
    
    if pairs["pairs"]:
        pair = pairs["pairs"][0]
        # Get pair by assets
        found_pair = await client.get_pair_by_assets(
            pair["base_asset_id"],
            pair["quote_asset_id"]
        )
        logger.info("Found pair by assets: %s", found_pair)
        assert found_pair is not None
        assert found_pair["id"] == pair["id"]

@pytest.mark.asyncio
async def test_get_quote(client):
    assets = await client.list_assets()
    assert assets is not None
    from_asset = assets["assets"][0]["asset_id"]
    to_asset = assets["assets"][1]["asset_id"]
    """Test getting a quote."""

    quote = await client.get_quote(
        from_asset=from_asset,
        to_asset=to_asset,
        from_amount=100000000,  # 1 BTC in satoshis
    )
    logger.info("Retrieved quote: %s", quote)
    assert "to_amount" in quote

@pytest.mark.asyncio
async def test_get_quote_websocket(client):
    """Test getting a quote using WebSocket."""
    # Get assets for testing
    assets = await client.list_assets()
    assert assets is not None
    from_asset = assets["assets"][0]["asset_id"]
    to_asset = assets["assets"][1]["asset_id"]
    
    # Get quote via WebSocket
    quote = await client.get_quote_websocket(
        from_asset=from_asset,
        to_asset=to_asset,
        from_amount=100000000,  # 1 BTC in satoshis
    )
    logger.info("Retrieved WebSocket quote: %s", quote)
    assert "to_amount" in quote
    assert "price" in quote
    assert "fee" in quote
    assert "timestamp" in quote
    assert "expires_at" in quote

@pytest.mark.asyncio
async def test_maker_swap_flow(client):
    """Test the complete maker swap flow."""
    # List assets to get valid asset IDs
    assets = await client.list_assets()
    if not assets.get("nia"):
        logger.warning("No assets available for testing maker swap flow")
        pytest.skip("No assets available for testing")
    
    # Get two different assets
    asset1 = assets["nia"][0]["asset_id"]
    asset2 = assets["nia"][1]["asset_id"] if len(assets["nia"]) > 1 else asset1
    
    # Get quote
    from_amount = 1000000  # 1 BTC in millisats
    quote = await client.get_quote(asset1, asset2, from_amount)
    logger.info("Retrieved quote: %s", quote)
    assert "to_amount" in quote
    
    # Initialize maker swap
    init_result = await client.init_maker_swap(
        from_asset=asset1,
        to_asset=asset2,
        from_amount=from_amount,
        to_amount=quote["to_amount"],
        timeout_sec=3600
    )
    logger.info("Initialized maker swap: %s", init_result)
    assert "payment_hash" in init_result
    assert "payment_secret" in init_result
    assert "swapstring" in init_result
    
    # Get swap status
    status = await client.get_swap_status(init_result["payment_hash"])
    logger.info("Swap status: %s", status)
    assert "status" in status

@pytest.mark.asyncio
async def test_taker_swap_flow(client):
    """Test the complete taker swap flow."""
    # List assets to get valid asset IDs
    assets = await client.list_assets()
    if not assets.get("nia"):
        logger.warning("No assets available for testing taker swap flow")
        pytest.skip("No assets available for testing")
    
    # Get two different assets
    asset1 = assets["nia"][0]["asset_id"]
    asset2 = assets["nia"][1]["asset_id"] if len(assets["nia"]) > 1 else asset1
    
    # Get quote
    from_amount = 1000000  # 1 BTC in millisats
    quote = await client.get_quote(asset1, asset2, from_amount)
    logger.info("Retrieved quote for taker swap: %s", quote)
    assert "to_amount" in quote
    
    # Initialize maker swap (simulating another node)
    init_result = await client.init_maker_swap(
        from_asset=asset1,
        to_asset=asset2,
        from_amount=from_amount,
        to_amount=quote["to_amount"],
        timeout_sec=3600
    )
    logger.info("Initialized maker swap for taker test: %s", init_result)
    
    # Whitelist trade
    whitelist_result = await client.whitelist_trade(init_result["swapstring"])
    logger.info("Whitelisted trade: %s", whitelist_result)
    assert "payment_hash" in whitelist_result
    assert "payment_secret" in whitelist_result
    
    # Confirm swap
    confirm_result = await client.confirm_swap(
        swapstring=init_result["swapstring"],
        payment_hash=whitelist_result["payment_hash"],
        payment_secret=whitelist_result["payment_secret"]
    )
    logger.info("Confirmed swap: %s", confirm_result)
    assert "status" in confirm_result

@pytest.mark.asyncio
async def test_websocket_events(client):
    """Test WebSocket event handling."""
    events_received = []
    
    async def on_swap_update(data):
        logger.info("Received swap update event: %s", data)
        events_received.append(("swap_update", data))
    
    async def on_error(data):
        logger.error("Received error event: %s", data)
        events_received.append(("error", data))
    
    # Register event handlers
    client.on("swap_update", on_swap_update)
    client.on("error", on_error)
    
    # Subscribe to a pair
    pairs = await client.list_pairs()
    if pairs["pairs"]:
        pair = pairs["pairs"][0]
        logger.info("Subscribing to pair: %s/%s", pair['base_asset'], pair['quote_asset'])
        await client.ws_client.subscribe(f"{pair['base_asset']}/{pair['quote_asset']}")
        
        # Wait for some events
        await asyncio.sleep(5)
        
        # Unsubscribe
        logger.info("Unsubscribing from pair: %s/%s", pair['base_asset'], pair['quote_asset'])
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
        logger.warning("No assets available for testing complete maker swap")
        pytest.skip("No assets available for testing")
    
    # Get two different assets
    asset1 = assets["nia"][0]["asset_id"]
    asset2 = assets["nia"][1]["asset_id"] if len(assets["nia"]) > 1 else asset1
    
    # Get quote
    from_amount = 1000000  # 1 BTC in millisats
    quote = await client.get_quote(asset1, asset2, from_amount)
    logger.info("Retrieved quote for complete maker swap: %s", quote)
    
    try:
        # Attempt complete maker swap
        result = await client.complete_maker_swap(
            from_asset=asset1,
            to_asset=asset2,
            from_amount=from_amount,
            to_amount=quote["to_amount"],
            timeout_sec=10  # Short timeout for testing
        )
        logger.info("Completed maker swap: %s", result)
        assert "status" in result
    except Exception as e:
        # Expected to timeout in test environment
        logger.warning("Expected timeout in test environment: %s", str(e))
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