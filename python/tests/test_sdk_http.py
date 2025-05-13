import pytest
import pytest_asyncio
from kaleidoswap_sdk.client import KaleidoSDK

# Configuration for the mock server
MOCK_SERVER_URL = "http://localhost:8000"

@pytest_asyncio.fixture
async def sdk_client():
    """Provides an instance of the KaleidoSDK client for testing."""
    async with KaleidoSDK(http_base_url=MOCK_SERVER_URL) as client:
        yield client

@pytest.mark.asyncio
async def test_list_assets(sdk_client: KaleidoSDK):
    """Tests the list_assets method."""
    response = await sdk_client.list_assets()
    assert "assets" in response
    assert isinstance(response["assets"], list)
    assert len(response["assets"]) > 0 # Assuming mock server returns at least one asset
    assert "network" in response
    assert "response_timestamp" in response
    # Check some fields of the first asset
    first_asset = response["assets"][0]
    assert "asset_id" in first_asset
    assert "ticker" in first_asset
    assert "name" in first_asset
    assert "precision" in first_asset

@pytest.mark.asyncio
async def test_list_pairs(sdk_client: KaleidoSDK):
    """Tests the list_pairs method."""
    response = await sdk_client.list_pairs()
    assert "pairs" in response
    assert isinstance(response["pairs"], list)
    assert len(response["pairs"]) > 0 # Assuming mock server returns at least one pair
    # Check some fields of the first pair
    first_pair = response["pairs"][0]
    assert "id" in first_pair
    assert "base_asset_ticker" in first_pair
    assert "quote_asset_ticker" in first_pair

@pytest.mark.asyncio
async def test_get_quote_btc_to_usdt(sdk_client: KaleidoSDK):
    """Tests the get_quote method for a valid pair (BTC to USDT)."""
    pair_id = "BTC_USDT_mock" # From mock_server.py
    from_asset_id = "BTC"
    from_amount = 100000000 # 1 BTC in satoshis
    to_asset_id = "rgb:unique_rgb_id_usdt"

    response = await sdk_client.get_quote(pair_id, from_asset_id, from_amount, to_asset_id)

    assert "rfq_id" in response
    assert response["pair_id"] == pair_id
    assert response["from_asset_id"] == from_asset_id
    assert response["to_asset_id"] == to_asset_id
    assert response["from_amount"] == from_amount
    assert "to_amount" in response
    assert response["to_amount"] > 0
    assert "price" in response
    assert response["price"] > 0
    assert "fee" in response
    assert "fee_rate" in response
    assert "timestamp" in response
    assert "expires_at" in response
    assert response["expires_at"] > response["timestamp"]

@pytest.mark.asyncio
async def test_get_quote_invalid_pair(sdk_client: KaleidoSDK):
    """Tests get_quote with a pair_id not in the mock server."""
    pair_id = "INVALID_PAIR_mock"
    from_asset_id = "BTC"
    from_amount = 100000000
    to_asset_id = "rgb:unique_rgb_id_usdt"

    # Expecting an HTTP error (e.g., 404 Not Found or 400 Bad Request)
    # HttpClient re-raises httpx.HTTPStatusError, which pytest can catch
    with pytest.raises(Exception): # More specific: httpx.HTTPStatusError, but needs import
        await sdk_client.get_quote(pair_id, from_asset_id, from_amount, to_asset_id)

# To run these tests:
# 1. Ensure the mock_server.py is running: `python kaleido-sdk/python/tests/mock_server.py`
#    (or `uvicorn kaleido-sdk.python.tests.mock_server:app --host 0.0.0.0 --port 8000` from workspace root)
# 2. Navigate to the `kaleido-sdk/python/` directory in your terminal.
# 3. Run `pytest`.
#    You might need to install pytest and pytest-asyncio: `pip install pytest pytest-asyncio` 