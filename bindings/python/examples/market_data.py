#!/usr/bin/env python3
"""
Market Data Example

This example demonstrates how to:
1. Connect to the Kaleidoswap API
2. List available assets
3. List trading pairs
4. Get a quote for a swap
"""

import json

from kaleidoswap import KaleidoClient, KaleidoConfig

BASE_URL = "http://localhost:8000"


def main():
    """Fetch and display market data."""

    # Initialize client
    config = KaleidoConfig(
        base_url=BASE_URL,
        timeout=30.0,
        max_retries=3,
        cache_ttl=300,
    )
    client = KaleidoClient(config)

    print("=" * 60)
    print("Kaleidoswap SDK - Market Data Example")
    print("=" * 60)

    # List available assets
    print("\n📋 Available Assets:")
    print("-" * 40)
    assets_json = client.list_assets()
    assets = json.loads(assets_json)

    for asset in assets[:5]:  # Show first 5
        print(asset)
        name = asset.get("name", "Unknown")
        ticker = asset.get("ticker", "???")
        precision = asset.get("precision", 0)
        print(f"  • {name} ({ticker}) - Precision: {precision}")

    if len(assets) > 5:
        print(f"  ... and {len(assets) - 5} more assets")

    # List trading pairs
    print("\n💱 Trading Pairs:")
    print("-" * 40)
    pairs_json = client.list_pairs()
    pairs = json.loads(pairs_json)

    for pair in pairs[:5]:  # Show first 5
        base = pair.get("base", {}).get("ticker", "?")
        quote = pair.get("quote", {}).get("ticker", "?")
        ticker = f"{base}/{quote}"
        price = pair.get("price", 0)
        print(f"  • {ticker} - Price: {price}")

    if len(pairs) > 5:
        print(f"  ... and {len(pairs) - 5} more pairs")

    # Get a quote (if pairs available)
    if pairs:
        first_pair = pairs[0]
        ticker = first_pair.get("ticker", "BTC/USDT")

        print(f"\n📊 Quote for {ticker}:")
        print("-" * 40)

        try:
            # 1M sats (> min 500k)
            quote_json = client.get_best_quote(ticker, 1_000_000, None)
            quote = json.loads(quote_json)

            from_amount = quote.get("from_asset", {}).get("amount", 0)
            to_amount = quote.get("to_asset", {}).get("amount", 0)

            print(f"  From Amount: {from_amount}")
            print(f"  To Amount: {to_amount}")
            print(f"  Price: {quote.get('price', 'N/A')}")
        except Exception as e:
            print(f"  Could not get quote: {e}")

    print("\n" + "=" * 60)
    print("Done!")


if __name__ == "__main__":
    main()
