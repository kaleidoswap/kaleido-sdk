#!/usr/bin/env python3
"""
Market Data Example

This example demonstrates how to:
1. Connect to the Kaleidoswap API
2. List available assets
3. List trading pairs
4. Get a quote for a swap
"""

from kaleidoswap import KaleidoClient, KaleidoConfig, KaleidoError

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

    # List available assets (returns typed list directly)
    print("\n📋 Available Assets:")

    print("-" * 40)
    assets = client.list_assets()

    for asset in assets[:5]:  # Show first 5
        name = getattr(asset, "name", "Unknown")
        ticker = getattr(asset, "ticker", "???")
        precision = getattr(asset, "precision", 0)
        print(f"  • {name} ({ticker}) - Precision: {precision}")

    if len(assets) > 5:
        print(f"  ... and {len(assets) - 5} more assets")

    # List trading pairs (returns typed list directly)
    print("\n💱 Trading Pairs:")
    print("-" * 40)
    pairs = client.list_pairs()

    for pair in pairs[:5]:  # Show first 5
        base = getattr(pair.base, "ticker", "?") if pair.base else "?"
        quote = getattr(pair.quote, "ticker", "?") if pair.quote else "?"
        ticker = f"{base}/{quote}"
        price = getattr(pair, "price", 0)
        print(f"  • {ticker} - Price: {price}")

    if len(pairs) > 5:
        print(f"  ... and {len(pairs) - 5} more pairs")

    # Get a quote (if pairs available)
    if pairs:
        first_pair = pairs[0]
        ticker = getattr(first_pair, "ticker", "BTC/USDT")

        print(f"\n📊 Quote for {ticker}:")
        print("-" * 40)

        try:
            # Determine valid amount from asset limits
            ticker_parts = ticker.split("/")
            base_ticker = ticker_parts[0]
            base_asset = None

            # Find base asset to check limits
            for asset in assets:
                if getattr(asset, "ticker", "") == base_ticker:
                    base_asset = asset
                    break

            from_amount = 10_000_000  # Default 10M
            if base_asset and hasattr(base_asset, "endpoints") and base_asset.endpoints:
                for endpoint in base_asset.endpoints:
                    if hasattr(endpoint, "min_amount") and endpoint.min_amount:
                        from_amount = max(
                            from_amount, endpoint.min_amount + endpoint.min_amount // 10
                        )
                        break

            print(f"  Requesting quote for {from_amount} {base_ticker}...")
            quote = client.get_quote_by_pair(
                ticker, from_amount, None, "BTC_LN", "RGB_LN"
            )

            from_amount = quote.from_asset.amount if quote.from_asset else 0
            to_amount = quote.to_asset.amount if quote.to_asset else 0

            print(f"  From Amount: {from_amount}")
            print(f"  To Amount: {to_amount}")
            print(f"  Price: {getattr(quote, 'price', 'N/A')}")
        except KaleidoError as e:
            print(f"  Error getting quote: {e} ({type(e).__name__})")
        except Exception as e:
            print(f"  Unexpected error: {e}")

    # Demonstrate error handling
    print("\n⚠️  Testing Error Handling:")
    print("-" * 40)
    try:
        print("  Requesting quote for invalid pair INV/ALID...")
        client.get_quote_by_pair("INV/ALID", 1000, None, "BTC_LN", "RGB_LN")
    except KaleidoError as e:
        print(f"  Caught expected error: {e}")
        print(f"  Error Type: {type(e).__name__}")
    except Exception as e:
        print(f"  Caught unexpected error: {e} ({type(e).__name__})")

    print("\n" + "=" * 60)
    print("Done!")


if __name__ == "__main__":
    main()
