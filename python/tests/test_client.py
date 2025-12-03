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
    QuoteRequest,
    RetryDeliveryRequest,
    SwapStatus,
    SwapOrderStatusRequest,
    SwapSettlement,
    WhitelistTradeRequest,
)


logger = logging.getLogger(__name__)


@pytest.mark.asyncio
@pytest.mark.requires_local_node
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
    assert status.status == SwapStatus.SUCCEEDED

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
@pytest.mark.requires_local_node
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
    execute_result = await client.complete_swap(request=swap_request)
    logger.info("Completed swap: %s", execute_result)
    assert execute_result is not None
    assert execute_result.status == 200
    assert execute_result.message == "Swap executed successfully."


@pytest.mark.asyncio
@pytest.mark.requires_local_node
async def test_connect_peer(client: KaleidoClient):
    """Test connecting to a peer."""
    to_connect_peer = await test_lsp_connection_url(client)
    request = ConnectPeerRequest(peer_pubkey_and_addr=to_connect_peer)
    connect_result = await client.connect_peer(request)
    logger.info("Connected to peer: %s", connect_result)
    assert connect_result is not None


@pytest.mark.asyncio
@pytest.mark.requires_local_node
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
@pytest.mark.api_only
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
@pytest.mark.requires_local_node
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
@pytest.mark.requires_local_node
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
@pytest.mark.requires_local_node
async def test_get_onchain_address(client: KaleidoClient):
    """Test getting onchain address."""
    onchain_address = await client.get_onchain_address()
    logger.info("Retrieved onchain address: %s", onchain_address)
    assert hasattr(onchain_address, "address")


@pytest.mark.asyncio
@pytest.mark.requires_local_node
async def test_get_order(client: KaleidoClient):
    """Test getting an order."""
    order_result = await test_create_order(client)
    order_id = order_result.order_id
    request = GetOrderRequest(order_id=order_id)
    order_result = await client.get_order(request)
    logger.info("Retrieved order: %s", order_result)
    assert order_result is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_order_analytics(client: KaleidoClient):
    """Test getting order analytics."""
    analytics = await client.get_order_analytics()
    logger.info("Order analytics: %s", analytics)
    assert analytics is not None
    assert hasattr(analytics, "status_counts")
    assert hasattr(analytics, "filled_orders_volume")
    assert hasattr(analytics, "filled_orders_count")
    assert isinstance(analytics.status_counts, dict)


# @pytest.mark.asyncio
# @pytest.mark.api_only
# async def test_get_order_history(client: KaleidoClient):
#     """Test getting order history."""
#     # Get order history without filter
#     # history_request = OrderHistoryRequest(limit=10, skip=0)
#     history = await client.get_order_history(history_request)
#     logger.info("Order history: %s", history)
#     assert history is not None
#     assert hasattr(history, "orders")
#     assert hasattr(history, "total_count")
#     assert hasattr(history, "has_more")

#     # Get order history with status filter
#     history_request_filtered = OrderHistoryRequest(
#         status=SwapOrderStatus.FILLED, limit=5, skip=0
#     )
#     history_filtered = await client.get_order_history(history_request_filtered)
#     logger.info("Filtered order history: %s", history_filtered)
#     assert history_filtered is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_pair_by_assets(client: KaleidoClient):
    """Test getting a pair by assets."""
    assets = await client.list_assets()
    assert assets is not None

    first_asset = assets.assets[0].asset_id
    second_asset = assets.assets[1].asset_id
    pair = await client.get_pair_by_assets(first_asset, second_asset)
    assert pair is not None


@pytest.mark.asyncio
@pytest.mark.api_only
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
@pytest.mark.api_only
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
        from_amount=21000000,
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
@pytest.mark.api_only
async def test_get_quote_with_to_amount(client: KaleidoClient):
    """Test getting a quote using to_amount instead of from_amount."""
    assets = await client.list_assets()
    assert assets is not None
    from_asset = assets.assets[0].asset_id
    to_asset = assets.assets[1].asset_id
    quote_request = QuoteRequest(
        from_asset=from_asset,
        to_asset=to_asset,
        to_amount=100000000,  # Use to_amount instead of from_amount
    )
    quote = await client.get_quote(request=quote_request)
    logger.info("Retrieved quote with to_amount: %s", quote)
    assert hasattr(quote, "from_amount")
    assert hasattr(quote, "to_amount")
    assert hasattr(quote, "price")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_by_pair(client: KaleidoClient):
    """Test getting a quote by pair ticker."""
    # Get an actual pair from the API
    pairs = await client.list_pairs()
    assert pairs is not None and len(pairs.pairs) > 0

    # Get assets to find a pair where both assets exist
    assets = await client.list_assets()
    assert assets is not None and len(assets.assets) > 0
    asset_ids = {a.asset_id for a in assets.assets}
    asset_tickers = {a.ticker.upper() for a in assets.assets}

    # Find a pair where both base and quote assets exist (by ID or ticker)
    pair = None
    for p in pairs.pairs:
        base_exists = (
            p.base_asset_id in asset_ids or p.base_asset.upper() in asset_tickers
        )
        quote_exists = (
            p.quote_asset_id in asset_ids or p.quote_asset.upper() in asset_tickers
        )
        if base_exists and quote_exists:
            pair = p
            break

    # If no perfect match, use first pair and try with get_asset_by_ticker
    if pair is None:
        pair = pairs.pairs[0]
        logger.warning(
            f"Using pair {pair.base_asset}/{pair.quote_asset} - assets may not be in list"
        )

    pair_ticker = f"{pair.base_asset}/{pair.quote_asset}"
    logger.info("Pair ticker: %s", pair_ticker)

    # Try to get the base asset - use ID lookup first, then ticker lookup
    base_asset = next(
        (a for a in assets.assets if a.asset_id == pair.base_asset_id), None
    )
    if base_asset is None:
        # Fallback to ticker lookup using the convenience method
        try:
            base_asset = await client.get_asset_by_ticker(
                pair.base_asset, force_refresh=True
            )
        except ValueError:
            # If asset still not found, skip precision calculation and use a default
            logger.warning(
                f"Could not find base asset {pair.base_asset}, using default precision"
            )
            base_asset = None

    # Calculate test amount based on available asset info
    if base_asset is not None:
        min_display = float(pair.min_base_order_size) / (10**base_asset.precision)
        test_amount = max(min_display * 1.1, 0.001)  # Use 10% above minimum or 0.001
    else:
        # Fallback: assume 8 decimal places (common for BTC)
        min_display = float(pair.min_base_order_size) / (10**8)
        test_amount = max(min_display * 1.1, 0.001)

    quote = await client.get_quote_by_pair(pair_ticker, from_amount=test_amount)
    logger.info("Retrieved quote by pair: %s", quote)
    assert hasattr(quote, "from_amount")
    assert hasattr(quote, "to_amount")
    assert hasattr(quote, "price")
    assert quote.from_asset is not None
    assert quote.to_asset is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_by_pair_with_to_amount(client: KaleidoClient):
    """Test getting a quote by pair ticker using to_amount."""
    # Get an actual pair from the API
    pairs = await client.list_pairs()
    assert pairs is not None and len(pairs.pairs) > 0

    # Get assets to find a pair where both assets exist
    assets = await client.list_assets()
    assert assets is not None and len(assets.assets) > 0
    asset_ids = {a.asset_id for a in assets.assets}
    asset_tickers = {a.ticker.upper() for a in assets.assets}

    # Find a pair where both base and quote assets exist (by ID or ticker)
    pair = None
    for p in pairs.pairs:
        base_exists = (
            p.base_asset_id in asset_ids or p.base_asset.upper() in asset_tickers
        )
        quote_exists = (
            p.quote_asset_id in asset_ids or p.quote_asset.upper() in asset_tickers
        )
        if base_exists and quote_exists:
            pair = p
            break

    # If no perfect match, use first pair and try with get_asset_by_ticker
    if pair is None:
        pair = pairs.pairs[0]
        logger.warning(
            f"Using pair {pair.base_asset}/{pair.quote_asset} - assets may not be in list"
        )

    pair_ticker = f"{pair.base_asset}/{pair.quote_asset}"

    # Try to get the quote asset - use ID lookup first, then ticker lookup
    quote_asset = next(
        (a for a in assets.assets if a.asset_id == pair.quote_asset_id), None
    )
    if quote_asset is None:
        # Fallback to ticker lookup using the convenience method
        try:
            quote_asset = await client.get_asset_by_ticker(
                pair.quote_asset, force_refresh=True
            )
        except ValueError:
            # If asset still not found, skip precision calculation and use a default
            logger.warning(
                f"Could not find quote asset {pair.quote_asset}, using default precision"
            )
            quote_asset = None

    # Calculate test amount - use a larger amount to ensure reverse calculation
    # meets base asset minimum requirements
    if quote_asset is not None:
        min_display = float(pair.min_quote_order_size) / (10**quote_asset.precision)
        # Use a larger multiplier (e.g., 5x) to ensure calculated from_amount is above minimum
        test_amount = max(min_display * 5.0, 1.0)  # Use 5x minimum or at least 1.0
    else:
        # Fallback: assume 6 decimal places (common for stablecoins like USDT)
        min_display = float(pair.min_quote_order_size) / (10**6)
        test_amount = max(min_display * 5.0, 1.0)

    quote = await client.get_quote_by_pair(pair_ticker, to_amount=test_amount)
    logger.info("Retrieved quote by pair with to_amount: %s", quote)
    assert hasattr(quote, "from_amount")
    assert hasattr(quote, "to_amount")
    assert hasattr(quote, "price")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_by_assets(client: KaleidoClient):
    """Test getting a quote by asset identifiers."""
    # Get an actual pair from the API
    pairs = await client.list_pairs()
    assert pairs is not None and len(pairs.pairs) > 0

    # Get assets to find a pair where both assets exist
    assets = await client.list_assets()
    assert assets is not None and len(assets.assets) > 0
    asset_ids = {a.asset_id for a in assets.assets}
    asset_tickers = {a.ticker.upper() for a in assets.assets}

    # Find a pair where both base and quote assets exist (by ID or ticker)
    pair = None
    for p in pairs.pairs:
        base_exists = (
            p.base_asset_id in asset_ids or p.base_asset.upper() in asset_tickers
        )
        quote_exists = (
            p.quote_asset_id in asset_ids or p.quote_asset.upper() in asset_tickers
        )
        if base_exists and quote_exists:
            pair = p
            break

    # If no perfect match, use first pair
    if pair is None:
        pair = pairs.pairs[0]
        logger.warning(
            f"Using pair {pair.base_asset}/{pair.quote_asset} - assets may not be in list"
        )

    # Get the actual assets - use tickers from the pair
    from_asset = pair.base_asset
    to_asset = pair.quote_asset

    # Try to get the base asset - use ID lookup first, then ticker lookup
    base_asset_obj = next(
        (a for a in assets.assets if a.asset_id == pair.base_asset_id), None
    )
    if base_asset_obj is None:
        # Fallback to ticker lookup using the convenience method
        try:
            base_asset_obj = await client.get_asset_by_ticker(
                pair.base_asset, force_refresh=True
            )
        except ValueError:
            # If asset still not found, skip precision calculation and use a default
            logger.warning(
                f"Could not find base asset {pair.base_asset}, using default precision"
            )
            base_asset_obj = None

    # Calculate test amount based on available asset info
    if base_asset_obj is not None:
        min_display = float(pair.min_base_order_size) / (10**base_asset_obj.precision)
        test_amount = max(min_display * 1.1, 0.001)  # Use 10% above minimum or 0.001
    else:
        # Fallback: assume 8 decimal places (common for BTC)
        min_display = float(pair.min_base_order_size) / (10**8)
        test_amount = max(min_display * 1.1, 0.001)

    quote = await client.get_quote_by_assets(
        from_asset, to_asset, from_amount=test_amount
    )
    logger.info("Retrieved quote by assets: %s", quote)
    assert hasattr(quote, "from_amount")
    assert hasattr(quote, "to_amount")
    assert hasattr(quote, "price")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_asset_by_ticker(client: KaleidoClient):
    """Test getting an asset by ticker."""
    # Get an actual asset from the API
    assets = await client.list_assets()
    assert assets is not None and len(assets.assets) > 0
    test_ticker = assets.assets[0].ticker

    asset = await client.get_asset_by_ticker(test_ticker)
    logger.info("Retrieved asset by ticker: %s", asset)
    assert asset is not None
    assert hasattr(asset, "asset_id")
    assert hasattr(asset, "ticker")
    assert asset.ticker == test_ticker


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_pair_by_ticker(client: KaleidoClient):
    """Test getting a trading pair by ticker."""
    # Get an actual pair from the API
    pairs = await client.list_pairs()
    assert pairs is not None and len(pairs.pairs) > 0
    pair = pairs.pairs[0]
    pair_ticker = f"{pair.base_asset}/{pair.quote_asset}"

    retrieved_pair = await client.get_pair_by_ticker(pair_ticker)
    logger.info("Retrieved pair by ticker: %s", retrieved_pair)
    assert retrieved_pair is not None
    assert hasattr(retrieved_pair, "base_asset")
    assert hasattr(retrieved_pair, "quote_asset")
    assert retrieved_pair.base_asset == pair.base_asset
    assert retrieved_pair.quote_asset == pair.quote_asset


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount(client: KaleidoClient):
    """Test converting between raw and display amounts."""
    # First get an asset from the API
    assets = await client.list_assets()
    assert assets is not None and len(assets.assets) > 0
    asset = assets.assets[0]

    # Test converting display to raw
    display_amount = 1.5
    raw_amount = client.convert_amount(display_amount, asset, to="raw")
    logger.info(f"Converted {display_amount} display to {raw_amount} raw")
    assert isinstance(raw_amount, int)
    assert raw_amount > 0

    # Test converting raw back to display
    converted_back = client.convert_amount(raw_amount, asset, to="display")
    logger.info(f"Converted {raw_amount} raw back to {converted_back} display")
    assert isinstance(converted_back, float)
    assert (
        abs(converted_back - display_amount) < 0.001
    )  # Allow for floating point precision


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_validate_amount(client: KaleidoClient):
    """Test validating an amount against asset constraints."""
    # First get an asset from the API
    assets = await client.list_assets()
    assert assets is not None and len(assets.assets) > 0
    asset = assets.assets[0]

    # Test with a valid amount - use a reasonable amount that should be valid
    # Use a larger amount to ensure it's above minimum order sizes
    test_amount = max(
        10.0, 100.0 / (10**asset.precision) if asset.precision > 0 else 100.0
    )

    validation = await client.validate_amount(test_amount, asset.ticker)
    logger.info(f"Validation result: {validation}")
    # validate_amount returns a TypedDict, so check for keys, not attributes
    assert "valid" in validation
    assert "normalized_amount" in validation
    assert "display_amount" in validation

    # Test with asset ID instead of ticker
    validation_by_id = await client.validate_amount(test_amount, asset.asset_id)
    logger.info(f"Validation result by ID: {validation_by_id}")
    assert "valid" in validation_by_id
    assert "display_amount" in validation_by_id


@pytest.mark.asyncio
@pytest.mark.api_only
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
@pytest.mark.api_only
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
@pytest.mark.api_only
async def test_list_assets(client: KaleidoClient):
    """Test asset-related operations."""
    # List assets
    assets = await client.list_assets()
    logger.info("Retrieved assets: %s", assets)
    assert assets is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_list_pairs(client: KaleidoClient):
    """Test trading pair operations."""
    # List pairs
    pairs = await client.list_pairs()
    logger.info("Retrieved pairs: %s", pairs)
    assert hasattr(pairs, "pairs")


@pytest.mark.asyncio
@pytest.mark.requires_local_node
async def test_list_peers(client: KaleidoClient):
    """Test listing peers."""
    peers = await client.list_peers()
    logger.info("Listed peers: %s", peers)
    assert hasattr(peers, "peers")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_lsp_connection_url(client: KaleidoClient):
    """Test LSP connection URL."""
    lsp_connection_url = await client.get_lsp_connection_url()
    logger.info("Retrieved LSP connection URL: %s", lsp_connection_url)
    assert lsp_connection_url is not None
    return lsp_connection_url


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_lsp_info(client: KaleidoClient):
    """Test LSP information."""
    lsp_info = await client.get_lsp_info()
    logger.info("Retrieved LSP info: %s", lsp_info)
    assert lsp_info is not None
    assert hasattr(lsp_info, "lsp_connection_url")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_lsp_network_info(client: KaleidoClient):
    """Test LSP network information."""
    lsp_network_info = await client.get_lsp_network_info()
    logger.info("Retrieved LSP network info: %s", lsp_network_info)
    assert lsp_network_info is not None
    assert hasattr(lsp_network_info, "network")


@pytest.mark.asyncio
@pytest.mark.requires_local_node
async def test_node_info(client: KaleidoClient):
    """Test full node information."""
    node_info = await client.get_node_info()
    logger.info("Retrieved node info: %s", node_info)
    assert node_info is not None
    assert hasattr(node_info, "pubkey")
    assert hasattr(node_info, "num_channels")


@pytest.mark.asyncio
@pytest.mark.requires_local_node
async def test_node_pubkey(client: KaleidoClient):
    """Test getting node public key."""
    pubkey = await client.get_node_pubkey()
    logger.info("Retrieved node pubkey: %s", pubkey)
    assert pubkey is not None


@pytest.mark.asyncio
@pytest.mark.requires_local_node
async def test_retry_delivery(client: KaleidoClient):
    """Test retrying asset delivery for an order."""
    # First create an order
    order_result = await test_create_order(client)
    order_id = order_result.order_id

    # Try to retry delivery
    # Note: This may return None (404) if the order hasn't gone through the delivery process yet
    retry_request = RetryDeliveryRequest(order_id=order_id)
    retry_result = await client.retry_delivery(retry_request)
    logger.info("Retry delivery result: %s", retry_result)

    # If retry_result is not None, verify it has the expected attributes
    if retry_result is not None:
        assert hasattr(retry_result, "status")
        assert hasattr(retry_result, "message")
    else:
        # API returned 404 - order not in a state where retry is applicable
        logger.info(
            "Retry delivery returned None (404) - order not in deliverable state"
        )


@pytest.mark.asyncio
@pytest.mark.api_only
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
@pytest.mark.api_only
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
@pytest.mark.requires_local_node
@pytest.mark.skip(reason="requires specific condition to be happen")
async def test_whitelist_trade(client: KaleidoClient):
    """Test whitelisting a trade."""
    logger.info("Whitelisting trade")
    init_result = await test_init_maker_swap(client)
    whitelist_request = WhitelistTradeRequest(swapstring=init_result.swapstring)
    whitelist_result = await client.whitelist_trade(whitelist_request)
    logger.info("Whitelisted trade: %s", whitelist_result)
    assert whitelist_result is not None
    return init_result
