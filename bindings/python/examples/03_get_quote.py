#!/usr/bin/env python3
"""
03 - Get Quote

Request a price quote for swapping assets.
"""

import os

from kaleidoswap import KaleidoClient, KaleidoConfig
from kaleidoswap.utils import display_quote

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")


def main():
    print("=" * 50)
    print("Kaleidoswap SDK - Get Quote")
    print("=" * 50)

    # Create client
    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    # Get quote for BTC → USDT
    print("\n💰 Getting quote: BTC/LN → USDT/L1\n")

    try:
        quote = client.get_quote_by_assets(
            from_ticker="BTC",
            to_ticker="rgb:34zafU5G-Vu1ovT5-bBIKhIM-Guhpa6X-Oq_kDUH-M5ihztA",  # USDT RGB ID
            from_amount=10000000,  # 10M msat
            from_layer="BTC_LN",
            to_layer="RGB_L1",
        )

        print(display_quote(quote, verbose=True))
        print("\n✅ Quote received successfully")

    except Exception as e:
        print(f"❌ Failed to get quote: {e}")
        print("\nTip: Make sure you have the correct asset IDs")
        print("     Run 01_hello.py to see available assets")


if __name__ == "__main__":
    main()
