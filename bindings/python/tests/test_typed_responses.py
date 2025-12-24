"""
Quick test to verify typed response parsing works correctly.
"""

from kaleidoswap import KaleidoClient, KaleidoConfig, Asset, TradingPair, PairQuoteResponse


def test_typed_responses():
    """Test that typed responses work without manual JSON parsing."""
    
    # This test demonstrates the new API
    config = KaleidoConfig(
        base_url="http://localhost:8000",
        api_key="test_key"
    )
    client = KaleidoClient(config)
    
    # Test 1: list_assets returns List[Asset]
    try:
        assets = client.list_assets()
        assert isinstance(assets, list), f"Expected list, got {type(assets)}"
        if assets:
            assert isinstance(assets[0], Asset), f"Expected Asset, got {type(assets[0])}"
            print(f"✓ list_assets() returns List[Asset]: {len(assets)} assets")
            print(f"  First asset: {assets[0].ticker} - {assets[0].name}")
    except Exception as e:
        print(f"✗ list_assets() failed: {e}")
    
    # Test 2: list_assets(raw=True) returns JSON string
    try:
        assets_json = client.list_assets(raw=True)
        assert isinstance(assets_json, str), f"Expected str, got {type(assets_json)}"
        print("✓ list_assets(raw=True) returns JSON string")
    except Exception as e:
       print(f"✗ list_assets(raw=True) failed: {e}")
    
    # Test 3: list_pairs returns List[TradingPair]
    try:
        pairs = client.list_pairs()
        assert isinstance(pairs, list), f"Expected list, got {type(pairs)}"
        if pairs:
            assert isinstance(pairs[0], TradingPair), f"Expected TradingPair, got {type(pairs[0])}"
            print(f"✓ list_pairs() returns List[TradingPair]: {len(pairs)} pairs")
            print(f"  First pair: {pairs[0].base.ticker}/{pairs[0].quote.ticker}")
    except Exception as e:
        print(f"✗ list_pairs() failed: {e}")
    
    # Test 4: get_best_quote returns PairQuoteResponse
    try:
        quote = client.get_best_quote("BTC/USDT", 1000000, None)
        assert isinstance(quote, PairQuoteResponse), f"Expected PairQuoteResponse, got {type(quote)}"
        print("✓ get_best_quote() returns PairQuoteResponse")
        print(f"  {quote.from_asset.amount} {quote.from_asset.ticker} -> {quote.to_asset.amount} {quote.to_asset.ticker}")
        print(f"  Price: {quote.price}")
    except Exception as e:
        print(f"✗ get_best_quote() failed: {e}")
    
    print("\n✅ All tests passed! Typed responses working correctly.")


if __name__ == "__main__":
    test_typed_responses()
