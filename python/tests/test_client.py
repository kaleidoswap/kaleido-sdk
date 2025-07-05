import asyncio
import pytest
import logging
import time
from kaleidoswap_sdk.models import CreateOrderRequest

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_lsp_info(client):
    """Test LSP information."""
    lsp_info = await client.get_lsp_info()
    logger.info("Retrieved LSP info: %s", lsp_info)
    assert lsp_info is not None
    assert hasattr(lsp_info, 'lsp_connection_url')

@pytest.mark.asyncio
async def test_lsp_connection_url(client):
    """Test LSP connection URL."""
    lsp_connection_url = await client.get_lsp_connection_url()
    logger.info("Retrieved LSP connection URL: %s", lsp_connection_url)
    assert lsp_connection_url is not None

@pytest.mark.asyncio
async def test_lsp_network_info(client):
    """Test LSP network information."""
    lsp_network_info = await client.get_lsp_network_info()
    logger.info("Retrieved LSP network info: %s", lsp_network_info)
    assert lsp_network_info is not None
    assert hasattr(lsp_network_info, 'network')

@pytest.mark.asyncio
async def test_create_order(client):
    """Test creating an order."""
    pubkey = await client.get_node_pubkey()
    onchain_address = await client.get_onchain_address()
    order = CreateOrderRequest(
        client_pubkey=pubkey,
        lsp_balance_sat=80000,
        client_balance_sat=20000,
        required_channel_confirmations=1,
        funding_confirms_within_blocks=1,
        channel_expiry_blocks=1000,
        token="BTC",
        refund_onchain_address=onchain_address.address,
        announce_channel=True
        )
    order_result = await client.create_order(order)
    logger.info("Created order: %s", order_result)
    assert order_result is not None
    return order_result

@pytest.mark.asyncio
async def test_get_order(client):
    """Test getting an order."""
    order_result = await test_create_order(client)
    order_id = order_result["order_id"]  # Access as dict key
    order_result = await client.get_order(order_id)
    logger.info("Retrieved order: %s", order_result)
    assert order_result is not None

@pytest.mark.asyncio
async def test_list_assets(client):
    """Test asset-related operations."""
    # List assets
    assets = await client.list_assets()
    logger.info("Retrieved assets: %s", assets)
    assert assets is not None

@pytest.mark.asyncio
async def test_list_pairs(client):
    """Test trading pair operations."""
    # List pairs
    pairs = await client.list_pairs()
    logger.info("Retrieved pairs: %s", pairs)
    assert hasattr(pairs, 'pairs')
    
    if pairs.pairs:
        pair = pairs.pairs[0]
        # Get pair by assets - use base_asset and quote_asset if available, otherwise skip
        if pair.base_asset_id and pair.quote_asset_id:
            found_pair = await client.get_pair_by_assets(
                pair.base_asset_id,
                pair.quote_asset_id
            )
            logger.info("Found pair by assets: %s", found_pair)
            assert found_pair is not None
            assert found_pair.id == pair.id
        else:
            logger.info("Skipping pair lookup - missing asset IDs")

@pytest.mark.asyncio
async def test_get_quote(client):
    assets = await client.list_assets()
    assert assets is not None
    from_asset = assets.assets[0].asset_id
    to_asset = assets.assets[1].asset_id
    """Test getting a quote."""

    quote = await client.get_quote(
        from_asset=from_asset,
        to_asset=to_asset,
        from_amount=100000000,  # 1 BTC in satoshis
    )
    logger.info("Retrieved quote: %s", quote)
    assert hasattr(quote, 'to_amount')

@pytest.mark.asyncio
async def test_get_quote_websocket(client):
    """Test getting a quote using WebSocket."""
    # Get assets for testing
    assets = await client.list_assets()
    assert assets is not None
    assets_list = assets.assets
    for asset in assets_list:
        if asset.ticker and asset.ticker == "USDT":
            to_asset = asset.asset_id
            break
    else:
        # If no USDT asset found, use the first asset
        to_asset = assets_list[0].asset_id
    
    # Get quote via WebSocket
    quote = await client.get_quote_websocket(
        from_asset="BTC",
        to_asset=to_asset,
        from_amount=10000000,  # 1 BTC in satoshis
    )
    logger.info("Retrieved WebSocket quote: %s", quote)
    assert "to_amount" in quote
    assert "price" in quote
    assert "fee" in quote
    assert "timestamp" in quote
    assert "expires_at" in quote
    return quote

@pytest.mark.asyncio
async def test_get_pair_by_assets(client):
    """Test getting a pair by assets."""
    assets = await client.list_assets()
    assert assets is not None

    first_asset = assets.assets[0].asset_id
    second_asset = assets.assets[1].asset_id
    logger.info("First asset: %s", first_asset)
    logger.info("Second asset: %s", second_asset)
    
    pair = await client.get_pair_by_assets(first_asset, second_asset)
    logger.info("Retrieved pair: %s", pair)
    assert pair is not None

@pytest.mark.asyncio
async def test_init_maker_swap(client):
    logger.info("Getting quote for maker swap")
    quote = await test_get_quote_websocket(client)
    logger.info("Quote: %s", quote)
    logger.info("Initiating maker swap")
    init_result = await client.init_maker_swap(
        rfq_id=quote["rfq_id"],
        from_asset=quote["from_asset"],
        to_asset=quote["to_asset"],
        from_amount=quote["from_amount"],
        to_amount=quote["to_amount"],
    )
    logger.info("Initialized maker swap: %s", init_result)
    assert hasattr(init_result, 'payment_hash')
    assert hasattr(init_result, 'swapstring')
    return init_result

@pytest.mark.asyncio
async def test_complete_swap(client):
    """Test the complete maker swap flow."""
    # List assets to get valid asset IDs
    logger.info("Starting maker swap flow test")
    init_result = await test_whitelist_trade(client)

    #Getting taker pubkey
    taker_pubkey = await client.get_node_pubkey()
    assert taker_pubkey is not None
    logger.info("Taker pubkey: %s", taker_pubkey)

    logger.info("Executing maker swap")
    execute_result = await client.execute_maker_swap(
        swapstring=init_result.swapstring,
        payment_hash=init_result.payment_hash,
        taker_pubkey=taker_pubkey
    )
    logger.info("Executed maker swap: %s", execute_result)
    assert execute_result is not None

    # Wait for swap to complete
    status = await client.wait_for_swap_completion(init_result.payment_hash)
    logger.info("Swap status: %s", status)
    assert status is not None
    assert status.status == "Succeeded"
    
    # Confirm swap status
    start_time = time.time()
    while time.time() - start_time < 180:
        status_response = await client.get_swap_status(init_result.payment_hash)
        logger.info("Swap status: %s", status_response)
        if status_response.swap.status == "Succeeded":
            break
        await asyncio.sleep(1)
    assert hasattr(status_response, 'swap')
    assert status_response.swap.status == "Succeeded"

@pytest.mark.asyncio
async def test_complete_swap_in_one_call(client):
    """Test the complete maker swap flow in one call."""
    logger.info("Starting maker swap flow test")
    logger.info("Getting quote for maker swap")
    quote = await test_get_quote_websocket(client)
    logger.info("Quote: %s", quote)
    
    # Complete the swap using the same assets from the quote
    swap_status = await client.complete_maker_swap(
        from_asset=quote["from_asset"],
        to_asset=quote["to_asset"],
        from_amount=quote["from_amount"],
        to_amount=quote["to_amount"],
        rfq_id=quote["rfq_id"]
    )
    logger.info("Completed swap: %s", swap_status)
    assert swap_status is not None
    assert swap_status.status == "Succeeded"

@pytest.mark.asyncio
async def test_node_info(client):
    """Test node information."""
    node_info = await client.get_node_info()
    logger.info("Retrieved node info: %s", node_info)
    assert node_info is not None
    assert hasattr(node_info, 'pubkey')

@pytest.mark.asyncio
async def test_node_pubkey(client):
    """Test getting node public key."""
    pubkey = await client.get_node_pubkey()
    logger.info("Retrieved node pubkey: %s", pubkey)
    assert pubkey is not None

@pytest.mark.asyncio
async def test_whitelist_trade(client):
    """Test whitelisting a trade."""
    logger.info("Whitelisting trade")
    init_result = await test_init_maker_swap(client)
    whitelist_result = await client.whitelist_trade(init_result.swapstring)
    logger.info("Whitelisted trade: %s", whitelist_result)
    assert whitelist_result is not None
    return init_result

@pytest.mark.asyncio
async def test_connect_peer(client):
    """Test connecting to a peer."""
    # Get a peer to connect to (this would need a valid peer address)
    # For now, just test that the function exists and doesn't crash
    logger.info("Testing connect peer function")
    # This would need a valid peer address to actually test
    # connect_result = await client.connect_peer("peer_address")
    # assert connect_result is not None

@pytest.mark.asyncio
async def test_list_peers(client):
    """Test listing peers."""
    peers = await client.list_peers()
    logger.info("Listed peers: %s", peers)
    assert hasattr(peers, 'peers')

@pytest.mark.asyncio
async def test_get_onchain_address(client):
    """Test getting onchain address."""
    onchain_address = await client.get_onchain_address()
    logger.info("Retrieved onchain address: %s", onchain_address)
    assert hasattr(onchain_address, 'address')

@pytest.mark.asyncio
async def test_get_asset_metadata(client):
    """Test getting asset metadata."""
    assets = await client.list_assets()
    assert assets is not None
    asset_id = assets.assets[0].asset_id
    metadata = await client.get_asset_metadata(asset_id)
    logger.info("Retrieved asset metadata: %s", metadata)
    assert metadata is not None
    assert hasattr(metadata, 'name')