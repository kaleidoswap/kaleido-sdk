"""Tests for utility methods and edge cases."""

import pytest
from kaleidoswap_sdk.client import KaleidoClient


@pytest.fixture
def mock_asset():
    """Create a mock asset for testing."""
    return {
        "asset_id": "test_asset_id",
        "ticker": "TEST",
        "name": "Test Asset",
        "precision": 8,
        "min_amount": 1000,
    }


@pytest.fixture
def mock_asset_low_precision():
    """Create a mock asset with low precision."""
    return {
        "asset_id": "usdt_id",
        "ticker": "USDT",
        "name": "Tether",
        "precision": 6,
    }


@pytest.fixture
def mock_pair():
    """Create a mock trading pair."""
    return {
        "base_asset": "BTC",
        "quote_asset": "USDT",
        "base_asset_id": "btc_id",
        "quote_asset_id": "usdt_id",
        "min_base_order_size": 100000,
        "min_quote_order_size": 1000000,
    }


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_client_initialization_with_defaults():
    """Test client initialization with default values."""
    client = KaleidoClient()
    assert client.base_url == "https://api.regtest.kaleidoswap.com"
    assert client.node_url is None
    assert client.api_key is None
    assert client.timeout == 30.0
    assert client.max_retries == 3
    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_client_initialization_with_custom_values():
    """Test client initialization with custom values."""
    client = KaleidoClient(
        base_url="https://custom.api.com",
        node_url="http://localhost:3001",
        api_key="custom_key",
        timeout=60.0,
        max_retries=5,
    )
    assert client.base_url == "https://custom.api.com"
    assert client.node_url == "http://localhost:3001"
    assert client.api_key == "custom_key"
    assert client.timeout == 60.0
    assert client.max_retries == 5
    assert client.has_node is True
    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_client_has_node_property():
    """Test has_node property."""
    client_with_node = KaleidoClient(
        base_url="https://api.test.com",
        node_url="http://localhost:3001",
    )
    assert client_with_node.has_node is True
    await client_with_node.close()

    client_without_node = KaleidoClient(base_url="https://api.test.com")
    assert client_without_node.has_node is False
    await client_without_node.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_to_raw(mock_asset):
    """Test converting display amount to raw atomic units."""
    client = KaleidoClient()

    # Convert 1.5 with precision 8
    raw = client._to_raw(1.5, mock_asset)
    assert raw == 150000000

    # Convert 0.00000001 with precision 8
    raw = client._to_raw(0.00000001, mock_asset)
    assert raw == 1

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_to_display(mock_asset):
    """Test converting raw atomic units to display amount."""
    client = KaleidoClient()

    # Convert 150000000 with precision 8
    display = client._to_display(150000000, mock_asset)
    assert display == 1.5

    # Convert 1 with precision 8
    display = client._to_display(1, mock_asset)
    assert display == 0.00000001

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_round_trip(mock_asset):
    """Test converting display to raw and back."""
    client = KaleidoClient()

    original = 2.5
    raw = client._to_raw(original, mock_asset)
    display = client._to_display(raw, mock_asset)

    assert abs(display - original) < 0.00000001

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_with_different_precisions(
    mock_asset, mock_asset_low_precision
):
    """Test amount conversion with different precisions."""
    client = KaleidoClient()

    # High precision (8 decimals)
    raw_high = client._to_raw(1.0, mock_asset)
    assert raw_high == 100000000

    # Low precision (6 decimals)
    raw_low = client._to_raw(1.0, mock_asset_low_precision)
    assert raw_low == 1000000

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_method_to_raw(mock_asset):
    """Test convert_amount method with to='raw'."""
    client = KaleidoClient()

    result = client.convert_amount(1.5, mock_asset, to="raw")
    assert result == 150000000
    assert isinstance(result, int)

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_method_to_display(mock_asset):
    """Test convert_amount method with to='display'."""
    client = KaleidoClient()

    result = client.convert_amount(150000000, mock_asset, to="display")
    assert result == 1.5
    assert isinstance(result, float)

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_convert_amount_invalid_direction(mock_asset):
    """Test convert_amount with invalid direction."""
    client = KaleidoClient()

    with pytest.raises(ValueError, match="Invalid target format"):
        client.convert_amount(100, mock_asset, to="invalid")

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_cache_valid_method():
    """Test _cache_valid method."""
    client = KaleidoClient()

    # None timestamp should be invalid
    assert not client._cache_valid(None)

    # Very old timestamp should be invalid
    import time

    old_timestamp = time.time() - 1000
    assert not client._cache_valid(old_timestamp)

    # Recent timestamp should be valid
    recent_timestamp = time.time()
    assert client._cache_valid(recent_timestamp)

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_ensure_node_client_without_node():
    """Test _ensure_node_client raises error when node not configured."""
    client = KaleidoClient(base_url="https://api.test.com")

    with pytest.raises(
        ValueError,
        match="RGB Lightning Node is not configured",
    ):
        client._ensure_node_client()

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_ensure_node_client_with_node():
    """Test _ensure_node_client succeeds when node is configured."""
    client = KaleidoClient(
        base_url="https://api.test.com",
        node_url="http://localhost:3001",
    )

    # Should not raise
    client._ensure_node_client()

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_asset_by_id_not_found(client: KaleidoClient):
    """Test get_asset_by_id when asset not found."""
    # Populate cache with assets
    await client.list_assets()

    # Try to get non-existent asset
    asset = await client.get_asset_by_id("non_existent_id")
    assert asset is None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_refresh_cache(client: KaleidoClient):
    """Test refresh_cache method."""
    # Clear existing cache
    client._assets_cache = []
    client._pairs_cache = []
    client._assets_cache_timestamp = None
    client._pairs_cache_timestamp = None

    # Refresh cache
    await client.refresh_cache()

    # Verify cache is populated
    assert len(client._assets_cache) > 0
    assert len(client._pairs_cache) > 0
    assert client._assets_cache_timestamp is not None
    assert client._pairs_cache_timestamp is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_can_trade_existing_pair(client: KaleidoClient):
    """Test can_trade for an existing pair."""
    # Get an actual pair from the API
    pairs = await client.list_pairs()
    if len(pairs.pairs) > 0:
        pair = pairs.pairs[0]
        can_trade = await client.can_trade(pair.base_asset, pair.quote_asset)
        assert can_trade is True


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_can_trade_non_existent_pair(client: KaleidoClient):
    """Test can_trade for a non-existent pair."""
    can_trade = await client.can_trade("NONEXISTENT1", "NONEXISTENT2")
    assert can_trade is False


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_pair_by_ticker_invalid_format(client: KaleidoClient):
    """Test get_pair_by_ticker with invalid format."""
    with pytest.raises(ValueError, match="Invalid pair ticker format"):
        await client.get_pair_by_ticker("INVALID")


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_pair_by_ticker_not_found(client: KaleidoClient):
    """Test get_pair_by_ticker when pair not found."""
    pair = await client.get_pair_by_ticker("NONEXIST/NOTFOUND")
    assert pair is None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_asset_by_ticker_not_found(client: KaleidoClient):
    """Test get_asset_by_ticker when asset not found."""
    # Populate cache
    await client.list_assets()

    asset = await client.get_asset_by_ticker("NONEXISTENT")
    assert asset is None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_asset_by_ticker_case_insensitive(client: KaleidoClient):
    """Test that get_asset_by_ticker is case-insensitive."""
    assets = await client.list_assets()
    if len(assets.assets) > 0:
        test_asset = assets.assets[0]
        ticker = test_asset.ticker

        # Test with different cases
        asset_upper = await client.get_asset_by_ticker(ticker.upper())
        asset_lower = await client.get_asset_by_ticker(ticker.lower())

        assert asset_upper is not None
        assert asset_lower is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_asset_by_ticker_force_refresh(client: KaleidoClient):
    """Test get_asset_by_ticker with force_refresh."""
    assets = await client.list_assets()
    if len(assets.assets) > 0:
        ticker = assets.assets[0].ticker

        # First call populates cache
        asset1 = await client.get_asset_by_ticker(ticker, force_refresh=False)

        # Second call with force_refresh should fetch from API again
        asset2 = await client.get_asset_by_ticker(ticker, force_refresh=True)

        assert asset1 is not None
        assert asset2 is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_validate_amount_asset_not_found(client: KaleidoClient):
    """Test validate_amount with non-existent asset."""
    result = await client.validate_amount(100.0, "NONEXISTENT")

    assert result["valid"] is False
    assert "Asset not found" in result["errors"][0]


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_validate_amount_negative(client: KaleidoClient):
    """Test validate_amount with negative amount."""
    assets = await client.list_assets()
    if len(assets.assets) > 0:
        ticker = assets.assets[0].ticker

        result = await client.validate_amount(-1.0, ticker)

        assert result["valid"] is False
        assert any("positive" in error.lower() for error in result["errors"])


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_validate_amount_zero(client: KaleidoClient):
    """Test validate_amount with zero amount."""
    assets = await client.list_assets()
    if len(assets.assets) > 0:
        ticker = assets.assets[0].ticker

        result = await client.validate_amount(0.0, ticker)

        assert result["valid"] is False
        assert any("positive" in error.lower() for error in result["errors"])


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_validate_amount_valid(client: KaleidoClient):
    """Test validate_amount with valid amount."""
    assets = await client.list_assets()
    if len(assets.assets) > 0:
        ticker = assets.assets[0].ticker

        result = await client.validate_amount(100.0, ticker)

        assert "valid" in result
        assert "normalized_amount" in result
        assert "display_amount" in result
        assert isinstance(result["normalized_amount"], int)
        assert isinstance(result["display_amount"], float)


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_validate_amount_by_asset_id(client: KaleidoClient):
    """Test validate_amount using asset ID instead of ticker."""
    assets = await client.list_assets()
    if len(assets.assets) > 0:
        asset_id = assets.assets[0].asset_id

        result = await client.validate_amount(100.0, asset_id)

        assert "valid" in result
        assert "normalized_amount" in result


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_pair_by_assets_both_directions(client: KaleidoClient):
    """Test that get_pair_by_assets works in both directions."""
    pairs = await client.list_pairs()
    if len(pairs.pairs) > 0:
        pair = pairs.pairs[0]

        # Try forward direction (base -> quote)
        pair_forward = await client.get_pair_by_assets(
            pair.base_asset, pair.quote_asset
        )
        assert pair_forward is not None

        # Try reverse direction (quote -> base)
        await client.get_pair_by_assets(pair.quote_asset, pair.base_asset)
        # May or may not find reverse pair depending on API
        # Just verify it doesn't crash


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_get_pair_by_assets_with_ids(client: KaleidoClient):
    """Test get_pair_by_assets using asset IDs."""
    pairs = await client.list_pairs()
    if len(pairs.pairs) > 0:
        pair = pairs.pairs[0]

        # Try with asset IDs
        pair_by_id = await client.get_pair_by_assets(
            pair.base_asset_id, pair.quote_asset_id
        )
        assert pair_by_id is not None


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_client_close_multiple_times(client: KaleidoClient):
    """Test that closing client multiple times doesn't cause errors."""
    await client.close()
    # Close again - should not raise
    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_decimal_precision_handling():
    """Test that Decimal is used for precise calculations."""
    client = KaleidoClient()

    asset = {"precision": 8}

    # Test with a number that has precision issues in float
    amount = 0.1 + 0.2  # This is 0.30000000000000004 in float

    raw = client._to_raw(amount, asset)
    display = client._to_display(raw, asset)

    # Should handle precision correctly
    assert abs(display - 0.3) < 1e-10

    await client.close()


@pytest.mark.asyncio
@pytest.mark.api_only
async def test_asset_conversion_with_dict_and_object():
    """Test that conversion works with both dict and object assets."""
    client = KaleidoClient()

    # Test with dict
    asset_dict = {"precision": 8}
    raw_from_dict = client._to_raw(1.5, asset_dict)
    assert raw_from_dict == 150000000

    # Test with object
    class AssetObj:
        precision = 8

    asset_obj = AssetObj()
    raw_from_obj = client._to_raw(1.5, asset_obj)
    assert raw_from_obj == 150000000

    await client.close()
