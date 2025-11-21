"""Tests for advanced client functionality."""

import pytest
from unittest.mock import MagicMock, patch
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import (
    SwapStatus,
)


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_with_request_object(client: KaleidoClient):
    """Test get_quote using request object."""
    from kaleidoswap_sdk.models import PairQuoteRequest

    assets = await client.list_assets()
    if len(assets.assets) >= 2:
        request = PairQuoteRequest(
            from_asset=assets.assets[0].asset_id,
            to_asset=assets.assets[1].asset_id,
            from_amount=100000000,
        )

        quote = await client.get_quote(request=request)
        assert quote is not None
        assert hasattr(quote, "to_amount")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_with_individual_params(client: KaleidoClient):
    """Test get_quote using individual parameters."""
    assets = await client.list_assets()
    if len(assets.assets) >= 2:
        quote = await client.get_quote(
            from_asset=assets.assets[0].asset_id,
            to_asset=assets.assets[1].asset_id,
            from_amount=100000000,
        )
        assert quote is not None
        assert hasattr(quote, "to_amount")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_swap_status_with_request(client: KaleidoClient):
    """Test get_swap_status using request object."""
    from kaleidoswap_sdk.models import SwapStatusRequest

    request = SwapStatusRequest(payment_hash="test_hash")

    # This will likely return None or error for invalid hash, but tests the method
    try:
        await client.get_swap_status(request=request)
    except Exception:
        # Expected for invalid hash
        pass


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_swap_status_with_payment_hash(client: KaleidoClient):
    """Test get_swap_status using payment_hash parameter."""
    # This will likely return None or error for invalid hash, but tests the method
    try:
        await client.get_swap_status(payment_hash="test_hash")
    except Exception:
        # Expected for invalid hash
        pass


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_order_with_request(client: KaleidoClient):
    """Test get_order using request object."""
    from kaleidoswap_sdk.models import GetOrderRequest

    request = GetOrderRequest(order_id="test_order_id")

    try:
        await client.get_order(request=request)
    except Exception:
        # Expected for invalid order ID
        pass


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_order_with_order_id(client: KaleidoClient):
    """Test get_order using order_id parameter."""
    try:
        await client.get_order(order_id="test_order_id")
    except Exception:
        # Expected for invalid order ID
        pass


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_swap_order_status_with_request(client: KaleidoClient):
    """Test get_swap_order_status using request object."""
    from kaleidoswap_sdk.models import SwapOrderStatusRequest

    request = SwapOrderStatusRequest(order_id="test_order_id")

    try:
        await client.get_swap_order_status(request=request)
    except Exception:
        # Expected for invalid order ID
        pass


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_swap_order_status_with_order_id(client: KaleidoClient):
    """Test get_swap_order_status using order_id parameter."""
    try:
        await client.get_swap_order_status(order_id="test_order_id")
    except Exception:
        # Expected for invalid order ID
        pass


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_order_history_with_filters(client: KaleidoClient):
    """Test get_order_history with status filter."""
    history = await client.get_order_history(status="FILLED", limit=10, skip=0)
    assert history is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_order_history_without_filters(client: KaleidoClient):
    """Test get_order_history without filters."""
    history = await client.get_order_history(limit=5, skip=0)
    assert history is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_by_assets_not_found(client: KaleidoClient):
    """Test get_quote_by_assets with non-existent assets."""
    with pytest.raises(ValueError, match="Could not find assets"):
        await client.get_quote_by_assets(
            "NONEXISTENT1", "NONEXISTENT2", from_amount=100.0
        )


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_by_pair_not_found(client: KaleidoClient):
    """Test get_quote_by_pair with non-existent pair."""
    with pytest.raises(ValueError, match="Pair not found"):
        await client.get_quote_by_pair("NONEXIST/NOTFOUND", from_amount=100.0)


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_quote_by_pair_assets_not_found(client: KaleidoClient):
    """Test get_quote_by_pair when pair exists but assets are missing."""
    # Mock a pair without corresponding assets
    with patch.object(client, "get_pair_by_ticker") as mock_get_pair:
        mock_pair = MagicMock()
        mock_pair.base_asset = "UNKNOWN1"
        mock_pair.quote_asset = "UNKNOWN2"
        mock_get_pair.return_value = mock_pair

        with pytest.raises(ValueError, match="Could not find assets for pair"):
            await client.get_quote_by_pair("UNKNOWN1/UNKNOWN2", from_amount=100.0)


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_node_operations_require_node_url():
    """Test that node operations raise error without node_url."""
    client = KaleidoClient(base_url="https://api.test.com")

    with pytest.raises(ValueError, match="RGB Lightning Node is not configured"):
        await client.whitelist_trade(swapstring="test")

    with pytest.raises(ValueError, match="RGB Lightning Node is not configured"):
        await client.get_onchain_address()

    with pytest.raises(ValueError, match="RGB Lightning Node is not configured"):
        await client.list_peers()

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_whitelist_trade_with_request():
    """Test whitelist_trade requires node URL."""
    from kaleidoswap_sdk.models import TakerRequest

    # Test that it validates node requirement
    client_no_node = KaleidoClient(base_url="https://api.test.com")

    request = TakerRequest(swapstring="test_swapstring")

    with pytest.raises(ValueError, match="RGB Lightning Node is not configured"):
        await client_no_node.whitelist_trade(request=request)

    await client_no_node.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_whitelist_trade_with_swapstring():
    """Test whitelist_trade with swapstring parameter requires node URL."""
    # Test that it validates node requirement
    client_no_node = KaleidoClient(base_url="https://api.test.com")

    with pytest.raises(ValueError, match="RGB Lightning Node is not configured"):
        await client_no_node.whitelist_trade(swapstring="test_swapstring")

    await client_no_node.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_lsp_connection_url(client: KaleidoClient):
    """Test get_lsp_connection_url helper method."""
    url = await client.get_lsp_connection_url()
    assert url is not None
    assert isinstance(url, str)


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_node_pubkey(client: KaleidoClient):
    """Test get_node_pubkey helper method."""
    pubkey = await client.get_node_pubkey()
    assert pubkey is not None
    assert isinstance(pubkey, str)


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_node_info_without_node(client: KaleidoClient):
    """Test get_node_info returns basic info without RGB node."""
    # Client fixture might have node_url, so create one without
    client_no_node = KaleidoClient(base_url=client.base_url)

    info = await client_no_node.get_node_info()
    assert info is not None
    assert hasattr(info, "pubkey")

    await client_no_node.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_swap_node_info_without_node(client: KaleidoClient):
    """Test get_swap_node_info returns basic info without RGB node."""
    # Client fixture might have node_url, so create one without
    client_no_node = KaleidoClient(base_url=client.base_url)

    info = await client_no_node.get_swap_node_info()
    assert info is not None

    await client_no_node.close()


@pytest.mark.asyncio
async def test_wait_for_swap_completion_timeout():
    """Test wait_for_swap_completion timeout."""
    client = KaleidoClient()

    # Mock get_swap_status to return pending status
    async def mock_get_swap_status(payment_hash):
        mock_swap = MagicMock()
        mock_swap.status = "Pending"
        mock_response = MagicMock()
        mock_response.swap = mock_swap
        return mock_response

    with patch.object(client, "get_swap_status", side_effect=mock_get_swap_status):
        with pytest.raises(TimeoutError, match="did not complete"):
            await client.wait_for_swap_completion(
                payment_hash="test_hash",
                timeout=0.5,
                poll_interval=0.1,
            )

    await client.close()


@pytest.mark.asyncio
async def test_wait_for_swap_completion_success():
    """Test wait_for_swap_completion succeeds."""
    client = KaleidoClient()

    # Mock get_swap_status to return succeeded status
    mock_swap = MagicMock()
    mock_swap.status = SwapStatus.SUCCEEDED
    mock_response = MagicMock()
    mock_response.swap = mock_swap

    with patch.object(client, "get_swap_status", return_value=mock_response):
        result = await client.wait_for_swap_completion(
            payment_hash="test_hash",
            timeout=5.0,
            poll_interval=0.1,
        )
        assert result == mock_swap

    await client.close()


@pytest.mark.asyncio
async def test_wait_for_swap_completion_with_request():
    """Test wait_for_swap_completion with request object."""
    from kaleidoswap_sdk.models import SwapStatusRequest

    client = KaleidoClient()

    request = SwapStatusRequest(payment_hash="test_hash")

    # Mock get_swap_status to return succeeded status
    mock_swap = MagicMock()
    mock_swap.status = SwapStatus.SUCCEEDED
    mock_response = MagicMock()
    mock_response.swap = mock_swap

    with patch.object(client, "get_swap_status", return_value=mock_response):
        result = await client.wait_for_swap_completion(
            request=request,
            timeout=5.0,
            poll_interval=0.1,
        )
        assert result == mock_swap

    await client.close()


@pytest.mark.asyncio
async def test_complete_maker_swap_integration():
    """Test complete_maker_swap combines init and execute."""
    client = KaleidoClient()

    # Mock the init and execute responses
    mock_init_response = MagicMock()
    mock_init_response.swapstring = "test_swapstring"
    mock_init_response.payment_hash = "test_hash"

    mock_execute_response = MagicMock()
    mock_execute_response.status = 200
    mock_execute_response.message = "Success"

    with (
        patch.object(client, "init_maker_swap", return_value=mock_init_response),
        patch.object(client, "execute_maker_swap", return_value=mock_execute_response),
    ):
        result = await client.complete_maker_swap(
            rfq_id="test_rfq",
            from_asset="BTC",
            to_asset="USDT",
            from_amount=100000000,
            to_amount=50000000,
            taker_pubkey="test_pubkey",
        )

        assert result["swapstring"] == "test_swapstring"
        assert result["payment_hash"] == "test_hash"
        assert result["status"] == 200
        assert result["message"] == "Success"

    await client.close()


@pytest.mark.asyncio
async def test_execute_swap_without_node():
    """Test execute_swap without RGB node configured."""
    client = KaleidoClient(base_url="https://api.test.com")

    # Mock the responses
    mock_init_response = MagicMock()
    mock_init_response.swapstring = "test_swapstring"
    mock_init_response.payment_hash = "test_hash"

    mock_execute_response = MagicMock()

    with (
        patch.object(client, "init_maker_swap", return_value=mock_init_response),
        patch.object(client, "execute_maker_swap", return_value=mock_execute_response),
        patch.object(client, "get_node_pubkey", return_value="test_pubkey"),
    ):
        # Should work without calling whitelist_trade since no node
        result = await client.execute_swap(
            rfq_id="test_rfq",
            from_asset="BTC",
            to_asset="USDT",
            from_amount=100000000,
            to_amount=50000000,
            taker_pubkey="test_pubkey",
            wait_for_completion=False,
        )

        assert result["swapstring"] == "test_swapstring"
        assert result["payment_hash"] == "test_hash"

    await client.close()


@pytest.mark.asyncio
async def test_execute_swap_with_node():
    """Test execute_swap with RGB node configured."""
    client = KaleidoClient(
        base_url="https://api.test.com",
        node_url="http://localhost:3001",
    )

    # Mock the responses
    mock_init_response = MagicMock()
    mock_init_response.swapstring = "test_swapstring"
    mock_init_response.payment_hash = "test_hash"

    mock_execute_response = MagicMock()

    with (
        patch.object(client, "init_maker_swap", return_value=mock_init_response),
        patch.object(client, "execute_maker_swap", return_value=mock_execute_response),
        patch.object(client, "whitelist_trade", return_value={}),
    ):
        result = await client.execute_swap(
            rfq_id="test_rfq",
            from_asset="BTC",
            to_asset="USDT",
            from_amount=100000000,
            to_amount=50000000,
            taker_pubkey="test_pubkey",
            wait_for_completion=False,
        )

        assert result["swapstring"] == "test_swapstring"
        assert result["payment_hash"] == "test_hash"

    await client.close()


@pytest.mark.asyncio
async def test_execute_swap_wait_for_completion():
    """Test execute_swap with wait_for_completion."""
    client = KaleidoClient()

    # Mock all the responses
    mock_init_response = MagicMock()
    mock_init_response.swapstring = "test_swapstring"
    mock_init_response.payment_hash = "test_hash"

    mock_execute_response = MagicMock()

    mock_swap = MagicMock()
    mock_swap.status = SwapStatus.SUCCEEDED

    with (
        patch.object(client, "init_maker_swap", return_value=mock_init_response),
        patch.object(client, "execute_maker_swap", return_value=mock_execute_response),
        patch.object(client, "wait_for_swap_completion", return_value=mock_swap),
    ):
        result = await client.execute_swap(
            rfq_id="test_rfq",
            from_asset="BTC",
            to_asset="USDT",
            from_amount=100000000,
            to_amount=50000000,
            taker_pubkey="test_pubkey",
            wait_for_completion=True,
            timeout=5.0,
            poll_interval=0.1,
        )

        assert "swap" in result
        assert result["swap"] == mock_swap

    await client.close()


@pytest.mark.asyncio
async def test_execute_swap_by_pair_sell():
    """Test execute_swap_by_pair with sell side."""
    client = KaleidoClient()

    mock_quote = MagicMock()
    mock_quote.rfq_id = "test_rfq"
    mock_quote.from_asset = "BTC"
    mock_quote.to_asset = "USDT"
    mock_quote.from_amount = 100000000
    mock_quote.to_amount = 50000000

    with (
        patch.object(client, "get_quote_by_pair", return_value=mock_quote),
        patch.object(
            client,
            "execute_swap",
            return_value={"swapstring": "test", "payment_hash": "hash"},
        ),
    ):
        result = await client.execute_swap_by_pair(
            pair_ticker="BTC/USDT",
            amount=1.0,
            side="sell",
            taker_pubkey="test_pubkey",
        )

        assert "swapstring" in result
        assert "payment_hash" in result

    await client.close()


@pytest.mark.asyncio
async def test_execute_swap_by_pair_buy():
    """Test execute_swap_by_pair with buy side."""
    client = KaleidoClient()

    mock_quote = MagicMock()
    mock_quote.rfq_id = "test_rfq"
    mock_quote.from_asset = "USDT"
    mock_quote.to_asset = "BTC"
    mock_quote.from_amount = 50000000
    mock_quote.to_amount = 100000000

    with (
        patch.object(client, "get_quote_by_pair", return_value=mock_quote),
        patch.object(
            client,
            "execute_swap",
            return_value={"swapstring": "test", "payment_hash": "hash"},
        ),
    ):
        result = await client.execute_swap_by_pair(
            pair_ticker="BTC/USDT",
            amount=1.0,
            side="buy",
            taker_pubkey="test_pubkey",
        )

        assert "swapstring" in result

    await client.close()


@pytest.mark.asyncio
async def test_execute_swap_by_pair_invalid_side():
    """Test execute_swap_by_pair with invalid side."""
    client = KaleidoClient()

    with pytest.raises(ValueError, match="Invalid side"):
        await client.execute_swap_by_pair(
            pair_ticker="BTC/USDT",
            amount=1.0,
            side="invalid",
            taker_pubkey="test_pubkey",
        )

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_create_swap_order_by_pair(client: KaleidoClient):
    """Test create_swap_order_by_pair method exists and validates pair."""
    # Test that invalid pair raises error
    with pytest.raises(ValueError, match="Pair not found"):
        await client.create_swap_order_by_pair(
            pair_ticker="INVALID/PAIR",
            amount=1.0,
            from_type="LIGHTNING",
            to_type="LIGHTNING",
        )


# ============================================================
# Tests for missing base_url error handling
# ============================================================


@pytest.mark.asyncio
async def test_list_assets_without_base_url():
    """Test list_assets raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.list_assets()

    await client.close()


@pytest.mark.asyncio
async def test_list_pairs_without_base_url():
    """Test list_pairs raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.list_pairs()

    await client.close()


@pytest.mark.asyncio
async def test_get_quote_without_base_url():
    """Test get_quote raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import PairQuoteRequest

    client = KaleidoClient(base_url=None)

    request = PairQuoteRequest(
        from_asset="test_asset_1",
        to_asset="test_asset_2",
        from_amount=100000000,
    )

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_quote(request=request)

    await client.close()


@pytest.mark.asyncio
async def test_get_quote_with_params_without_base_url():
    """Test get_quote with individual params raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_quote(
            from_asset="test_asset_1",
            to_asset="test_asset_2",
            from_amount=100000000,
        )

    await client.close()


@pytest.mark.asyncio
async def test_get_lsp_info_without_base_url():
    """Test get_lsp_info raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_lsp_info()

    await client.close()


@pytest.mark.asyncio
async def test_get_lsp_network_info_without_base_url():
    """Test get_lsp_network_info raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_lsp_network_info()

    await client.close()


@pytest.mark.asyncio
async def test_init_maker_swap_without_base_url():
    """Test init_maker_swap raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import SwapRequest

    client = KaleidoClient(base_url=None)

    request = SwapRequest(
        rfq_id="test_rfq",
        from_asset="BTC",
        to_asset="USDT",
        from_amount=100000000,
        to_amount=50000000,
    )

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.init_maker_swap(request)

    await client.close()


@pytest.mark.asyncio
async def test_get_node_info_without_base_url():
    """Test get_node_info raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_node_info()

    await client.close()


@pytest.mark.asyncio
async def test_get_swap_node_info_without_base_url():
    """Test get_swap_node_info raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_swap_node_info()

    await client.close()


@pytest.mark.asyncio
async def test_get_quote_websocket_without_base_url():
    """Test get_quote_websocket raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="WebSocket client is not initialized"):
        await client.get_quote_websocket(
            from_asset="test_asset_1",
            to_asset="test_asset_2",
            from_amount=100000000,
        )

    await client.close()


@pytest.mark.asyncio
async def test_create_swap_order_without_base_url():
    """Test create_swap_order raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import CreateSwapOrderRequest, SwapSettlement

    client = KaleidoClient(base_url=None)

    request = CreateSwapOrderRequest(
        rfq_id="test_rfq",
        from_type=SwapSettlement.LIGHTNING,
        to_type=SwapSettlement.LIGHTNING,
    )

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.create_swap_order(request)

    await client.close()


@pytest.mark.asyncio
async def test_get_swap_order_status_without_base_url():
    """Test get_swap_order_status raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import SwapOrderStatusRequest

    client = KaleidoClient(base_url=None)

    request = SwapOrderStatusRequest(order_id="test_order")

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_swap_order_status(request=request)

    await client.close()


@pytest.mark.asyncio
async def test_get_order_history_without_base_url():
    """Test get_order_history raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_order_history()

    await client.close()


@pytest.mark.asyncio
async def test_get_order_analytics_without_base_url():
    """Test get_order_analytics raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_order_analytics()

    await client.close()


@pytest.mark.asyncio
async def test_create_order_without_base_url():
    """Test create_order (LSPS1) raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import CreateOrderRequest

    client = KaleidoClient(base_url=None)

    request = CreateOrderRequest(
        client_pubkey="test_pubkey",
        lsp_balance_sat=1000000,
        client_balance_sat=500000,
        required_channel_confirmations=6,
        funding_confirms_within_blocks=144,
        channel_expiry_blocks=2016,
    )

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.create_order(request)

    await client.close()


@pytest.mark.asyncio
async def test_get_order_without_base_url():
    """Test get_order (LSPS1) raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import GetOrderRequest

    client = KaleidoClient(base_url=None)

    request = GetOrderRequest(order_id="test_order")

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_order(request=request)

    await client.close()


@pytest.mark.asyncio
async def test_estimate_fees_without_base_url():
    """Test estimate_fees raises RuntimeError when base_url is not provided."""
    from kaleidoswap_sdk.models import CreateOrderRequest

    client = KaleidoClient(base_url=None)

    request = CreateOrderRequest(
        client_pubkey="test_pubkey",
        lsp_balance_sat=1000000,
        client_balance_sat=500000,
        required_channel_confirmations=6,
        funding_confirms_within_blocks=144,
        channel_expiry_blocks=2016,
    )

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.estimate_fees(request)

    await client.close()


@pytest.mark.asyncio
async def test_get_quote_by_pair_without_base_url():
    """Test get_quote_by_pair raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_quote_by_pair("BTC/USDT", from_amount=1.0)

    await client.close()


@pytest.mark.asyncio
async def test_get_quote_by_assets_without_base_url():
    """Test get_quote_by_assets raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.get_quote_by_assets("BTC", "USDT", from_amount=1.0)

    await client.close()


@pytest.mark.asyncio
async def test_refresh_cache_without_base_url():
    """Test refresh_cache raises RuntimeError when base_url is not provided."""
    client = KaleidoClient(base_url=None)

    with pytest.raises(RuntimeError, match="API client is not initialized"):
        await client.refresh_cache()

    await client.close()
