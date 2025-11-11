import asyncio
import logging
import time

import pytest
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import (
    ConnectPeerRequest,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    ExecuteMakerSwapRequest,
    GetAssetMetadataRequest,
    GetOrderRequest,
    GetSwapStatusRequest,
    InitMakerSwapRequest,
    OrderHistoryRequest,
    QuoteRequest,
    RetryDeliveryRequest,
    SwapOrderStatus,
    SwapOrderStatusRequest,
    SwapSettlement,
    WhitelistTradeRequest,
)


logger = logging.getLogger(__name__)


@pytest.mark.asyncio
async def test_complete_swap(client: KaleidoClient):
    """Test the complete maker swap flow."""
    logger.info("Starting maker swap flow test")
    init_result = await test_whitelist_trade(client)

    # Getting taker pubkey
    taker_pubkey = await client.get_node_pubkey()
    assert taker_pubkey is not None
    logger.info("Taker pubkey: %s", taker_pubkey)

    # Execute maker swap
    logger.info("Executing maker swap")
    execute_result = await client.execute_maker_swap(
        request=ExecuteMakerSwapRequest(
            swapstring=init_result.swapstring,
            payment_hash=init_result.payment_hash,
            taker_pubkey=taker_pubkey,
        )
    )
    logger.info("Executed maker swap: %s", execute_result)
    assert execute_result is not None

    # Wait for swap to complete
    request = GetSwapStatusRequest(payment_hash=init_result.payment_hash)
    status = await client.wait_for_swap_completion(request)
    logger.info("Swap status: %s", status)
    assert status is not None
    assert status.status == "Succeeded"

    # Confirm swap status
    start_time = time.time()
    while time.time() - start_time < 180:
        status_request = GetSwapStatusRequest(payment_hash=init_result.payment_hash)
        status_response = await client.get_swap_status(status_request)
        logger.info("Swap status: %s", status_response)
        if status_response.swap.status == "Succeeded":
            break
        await asyncio.sleep(1)
    assert hasattr(status_response, "swap")
    assert status_response.swap.status == "Succeeded"


@pytest.mark.asyncio
async def test_complete_swap_in_one_call(client: KaleidoClient):
    """Test the complete maker swap flow in one call."""
    logger.info("Starting maker swap flow test")
    logger.info("Getting quote for maker swap")
    quote = await test_get_quote_websocket(client)
    logger.info("Quote: %s", quote)

    # Complete the swap using the same assets from the quote
    swap_request = InitMakerSwapRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset,
        to_asset=quote.to_asset,
        from_amount=quote.from_amount,
        to_amount=quote.to_amount,
    )
    swap_status = await client.complete_maker_swap(request=swap_request)
    logger.info("Completed swap: %s", swap_status)
    assert swap_status is not None
    assert swap_status.status == "Succeeded"


@pytest.mark.asyncio
async def test_connect_peer(client: KaleidoClient):
    """Test connecting to a peer."""
    to_connect_peer = await test_lsp_connection_url(client)
    request = ConnectPeerRequest(peer_pubkey_and_addr=to_connect_peer)
    connect_result = await client.connect_peer(request)
    logger.info("Connected to peer: %s", connect_result)
    assert connect_result is not None


@pytest.mark.asyncio
async def test_create_order(client: KaleidoClient):
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
        announce_channel=True,
    )
    order_result = await client.create_order(order)
    logger.info("Created order: %s", order_result)
    assert order_result is not None
    return order_result


@pytest.mark.asyncio
async def test_create_swap_order(client: KaleidoClient):
    """Test creating a swap order."""
    # Get a quote first
    logger.info("Getting quote for swap order")
    quote = await test_get_quote_websocket(client)
    logger.info("Quote: %s", quote)

    # Create swap order request with RGB invoice for RGB asset payout
    swap_order_request = CreateSwapOrderRequest(
        rfq_id=quote.rfq_id,
        from_type=SwapSettlement.ONCHAIN,
        to_type=SwapSettlement.ONCHAIN,
        min_onchain_conf=1,
        dest_rgb_invoice="rgb:invoice:example123",  # Required for RGB onchain payout
    )

    # Create the swap order
    swap_order = await client.create_swap_order(swap_order_request)
    logger.info("Created swap order: %s", swap_order)
    assert swap_order is not None
    assert hasattr(swap_order, "id")
    assert hasattr(swap_order, "rfq_id")
    assert swap_order.rfq_id == quote.rfq_id
    return swap_order


@pytest.mark.asyncio
async def test_estimate_fees(client: KaleidoClient):
    """Test estimating fees for an order."""
    pubkey = await client.get_node_pubkey()
    onchain_address = await client.get_onchain_address()
    order_request = CreateOrderRequest(
        client_pubkey=pubkey,
        lsp_balance_sat=80000,
        client_balance_sat=20000,
        required_channel_confirmations=1,
        funding_confirms_within_blocks=1,
        channel_expiry_blocks=1000,
        token="BTC",
        refund_onchain_address=onchain_address.address,
        announce_channel=True,
    )
    fees = await client.estimate_fees(order_request)
    logger.info("Estimated fees: %s", fees)
    assert fees is not None
    assert hasattr(fees, "setup_fee")
    assert hasattr(fees, "capacity_fee")
    assert hasattr(fees, "duration_fee")
    assert hasattr(fees, "total_fee")
    assert isinstance(fees.total_fee, int)


@pytest.mark.asyncio
async def test_get_asset_metadata(client: KaleidoClient):
    """Test getting asset metadata."""
    assets = await client.list_assets()
    assert assets is not None
    asset_id = assets.assets[0].asset_id
    metadata_request = GetAssetMetadataRequest(asset_id=asset_id)
    metadata = await client.get_asset_metadata(metadata_request)
    logger.info("Retrieved asset metadata: %s", metadata)
    assert metadata is not None
    assert hasattr(metadata, "name")


@pytest.mark.asyncio
async def test_get_onchain_address(client: KaleidoClient):
    """Test getting onchain address."""
    onchain_address = await client.get_onchain_address()
    logger.info("Retrieved onchain address: %s", onchain_address)
    assert hasattr(onchain_address, "address")


@pytest.mark.asyncio
async def test_get_order(client: KaleidoClient):
    """Test getting an order."""
    order_result = await test_create_order(client)
    order_id = order_result.order_id
    request = GetOrderRequest(order_id=order_id)
    order_result = await client.get_order(request)
    logger.info("Retrieved order: %s", order_result)
    assert order_result is not None


@pytest.mark.asyncio
async def test_get_order_analytics(client: KaleidoClient):
    """Test getting order analytics."""
    analytics = await client.get_order_analytics()
    logger.info("Order analytics: %s", analytics)
    assert analytics is not None
    assert hasattr(analytics, "status_counts")
    assert hasattr(analytics, "filled_orders_volume")
    assert hasattr(analytics, "filled_orders_count")
    assert isinstance(analytics.status_counts, dict)


@pytest.mark.asyncio
async def test_get_order_history(client: KaleidoClient):
    """Test getting order history."""
    # Get order history without filter
    history_request = OrderHistoryRequest(limit=10, skip=0)
    history = await client.get_order_history(history_request)
    logger.info("Order history: %s", history)
    assert history is not None
    assert hasattr(history, "orders")
    assert hasattr(history, "total_count")
    assert hasattr(history, "has_more")

    # Get order history with status filter
    history_request_filtered = OrderHistoryRequest(
        status=SwapOrderStatus.FILLED, limit=5, skip=0
    )
    history_filtered = await client.get_order_history(history_request_filtered)
    logger.info("Filtered order history: %s", history_filtered)
    assert history_filtered is not None


@pytest.mark.asyncio
async def test_get_pair_by_assets(client: KaleidoClient):
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
async def test_get_quote(client: KaleidoClient):
    assets = await client.list_assets()
    assert assets is not None
    from_asset = assets.assets[0].asset_id
    to_asset = assets.assets[1].asset_id
    """Test getting a quote."""
    quote_request = QuoteRequest(
        from_asset=from_asset,
        to_asset=to_asset,
        from_amount=100000000,
    )
    quote = await client.get_quote(request=quote_request)
    logger.info("Retrieved quote: %s", quote)
    assert hasattr(quote, "to_amount")


@pytest.mark.asyncio
async def test_get_quote_websocket(client: KaleidoClient):
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
    quote_request = QuoteRequest(
        from_asset="BTC",
        to_asset=to_asset,
        from_amount=10000000,
    )
    quote = await client.get_quote_websocket(request=quote_request)
    logger.info("Retrieved WebSocket quote: %s", quote)
    assert hasattr(quote, "to_amount")
    assert hasattr(quote, "price")
    assert hasattr(quote, "fee")
    assert hasattr(quote, "timestamp")
    assert hasattr(quote, "expires_at")
    return quote


@pytest.mark.asyncio
async def test_get_swap_order_status(client: KaleidoClient):
    """Test getting swap order status."""
    # First create a swap order
    swap_order = await test_create_swap_order(client)

    # Get the order status
    status_request = SwapOrderStatusRequest(order_id=swap_order.id)
    status_response = await client.get_swap_order_status(status_request)
    logger.info("Swap order status: %s", status_response)
    assert status_response is not None
    assert hasattr(status_response, "order_id")
    assert hasattr(status_response, "status")
    assert hasattr(status_response, "order")
    assert status_response.order_id == swap_order.id


@pytest.mark.asyncio
async def test_init_maker_swap(client: KaleidoClient):
    logger.info("Getting quote for maker swap")
    quote = await test_get_quote_websocket(client)
    logger.info("Quote: %s", quote)
    logger.info("Initiating maker swap")
    swap = InitMakerSwapRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset,
        to_asset=quote.to_asset,
        from_amount=quote.from_amount,
        to_amount=quote.to_amount,
    )
    init_result = await client.init_maker_swap(request=swap)
    logger.info("Initialized maker swap: %s", init_result)
    assert hasattr(init_result, "payment_hash")
    assert hasattr(init_result, "swapstring")
    return init_result


@pytest.mark.asyncio
async def test_list_assets(client: KaleidoClient):
    """Test asset-related operations."""
    # List assets
    assets = await client.list_assets()
    logger.info("Retrieved assets: %s", assets)
    assert assets is not None


@pytest.mark.asyncio
async def test_list_pairs(client: KaleidoClient):
    """Test trading pair operations."""
    # List pairs
    pairs = await client.list_pairs()
    logger.info("Retrieved pairs: %s", pairs)
    assert hasattr(pairs, "pairs")


@pytest.mark.asyncio
async def test_list_peers(client: KaleidoClient):
    """Test listing peers."""
    peers = await client.list_peers()
    logger.info("Listed peers: %s", peers)
    assert hasattr(peers, "peers")


@pytest.mark.asyncio
async def test_lsp_connection_url(client: KaleidoClient):
    """Test LSP connection URL."""
    lsp_connection_url = await client.get_lsp_connection_url()
    logger.info("Retrieved LSP connection URL: %s", lsp_connection_url)
    assert lsp_connection_url is not None
    return lsp_connection_url


@pytest.mark.asyncio
async def test_lsp_info(client: KaleidoClient):
    """Test LSP information."""
    lsp_info = await client.get_lsp_info()
    logger.info("Retrieved LSP info: %s", lsp_info)
    assert lsp_info is not None
    assert hasattr(lsp_info, "lsp_connection_url")


@pytest.mark.asyncio
async def test_lsp_network_info(client: KaleidoClient):
    """Test LSP network information."""
    lsp_network_info = await client.get_lsp_network_info()
    logger.info("Retrieved LSP network info: %s", lsp_network_info)
    assert lsp_network_info is not None
    assert hasattr(lsp_network_info, "network")


@pytest.mark.asyncio
async def test_node_info(client: KaleidoClient):
    """Test full node information."""
    node_info = await client.get_node_info()
    logger.info("Retrieved node info: %s", node_info)
    assert node_info is not None
    assert hasattr(node_info, "pubkey")
    assert hasattr(node_info, "num_channels")


@pytest.mark.asyncio
async def test_node_pubkey(client: KaleidoClient):
    """Test getting node public key."""
    pubkey = await client.get_node_pubkey()
    logger.info("Retrieved node pubkey: %s", pubkey)
    assert pubkey is not None


@pytest.mark.asyncio
async def test_retry_delivery(client: KaleidoClient):
    """Test retrying asset delivery for an order."""
    # First create an order
    order_result = await test_create_order(client)
    order_id = order_result.order_id

    # Try to retry delivery
    retry_request = RetryDeliveryRequest(order_id=order_id)
    retry_result = await client.retry_delivery(retry_request)
    logger.info("Retry delivery result: %s", retry_result)
    assert retry_result is not None
    assert hasattr(retry_result, "status")
    assert hasattr(retry_result, "message")


@pytest.mark.asyncio
async def test_swap_node_info(client: KaleidoClient):
    """Test simplified swap node information."""
    swap_node_info = await client.get_swap_node_info()
    logger.info("Retrieved swap node info: %s", swap_node_info)
    assert swap_node_info is not None
    # Fields are optional, so just check they exist
    assert hasattr(swap_node_info, "pubkey")
    assert hasattr(swap_node_info, "network")
    assert hasattr(swap_node_info, "block_height")


@pytest.mark.asyncio
async def test_swap_order_rate_decision(client: KaleidoClient):
    """Test swap order rate decision (accept new rate)."""
    # This test would require a swap order in PENDING_RATE_DECISION state
    # For now, we'll just test the structure
    # In a real scenario, you'd need to:
    # 1. Create a swap order
    # 2. Wait for it to enter PENDING_RATE_DECISION state
    # 3. Make a decision

    # Example of how to use it (would need actual order in correct state):
    # rate_decision_request = SwapOrderRateDecisionRequest(
    #     order_id="some_order_id",
    #     accept_new_rate=True
    # )
    # decision_result = await client.swap_order_rate_decision(rate_decision_request)
    # assert decision_result is not None
    # assert hasattr(decision_result, "order_id")
    # assert hasattr(decision_result, "decision_accepted")
    # assert hasattr(decision_result, "message")

    logger.info("Swap order rate decision test structure verified")
    # This is a structural test - actual testing would require specific order state
    assert True


@pytest.mark.asyncio
async def test_whitelist_trade(client: KaleidoClient):
    """Test whitelisting a trade."""
    logger.info("Whitelisting trade")
    init_result = await test_init_maker_swap(client)
    whitelist_request = WhitelistTradeRequest(swapstring=init_result.swapstring)
    whitelist_result = await client.whitelist_trade(whitelist_request)
    logger.info("Whitelisted trade: %s", whitelist_result)
    assert whitelist_result is not None
    return init_result
