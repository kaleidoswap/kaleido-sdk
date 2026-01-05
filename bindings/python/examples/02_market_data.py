#!/usr/bin/env python3
"""
02 - Market Data

Get trading pairs and current market prices.
"""

import os

from kaleidoswap import KaleidoClient, KaleidoConfig
from kaleidoswap.utils import display_pair

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")


def main():
    print("=" * 50)
    print("Kaleidoswap SDK - Market Data")
    print("=" * 50)

    # Create client
    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    # Get trading pairs
    print("\n💱 Trading Pairs:\n")
    pairs = client.list_pairs()

    for pair in pairs:
        print(f"  • {display_pair(pair)}")

    # Find specific pair
    print("\n🔍 Finding BTC/USDT pair...")
    btc_usdt = next(
        (p for p in pairs if "BTC" in p.base.ticker and "USDT" in p.quote.ticker), None
    )

    if btc_usdt:
        print(f"\n  Pair: {display_pair(btc_usdt, verbose=True)}")
    else:
        print("  BTC/USDT pair not found")

    print(f"\n✅ Total pairs: {len(pairs)}")


if __name__ == "__main__":
    main()
