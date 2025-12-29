#!/usr/bin/env python3
"""
WebSocket Quotes Example

This example demonstrates how to use WebSocket for real-time quote requests.
"""

import asyncio

from kaleidoswap import KaleidoClient, KaleidoConfig

BASE_URL = "https://api.regtest.kaleidoswap.com"


async def main():
    """Get quotes via WebSocket."""
    print("=" * 60)
    print("Kaleidoswap SDK - WebSocket Quotes Example")
    print("=" * 60)

    # Initialize client
    config = KaleidoConfig(
        base_url=BASE_URL,
        timeout=30.0,
    )
    client = KaleidoClient(config)

    try:
        print("\n📡 Connecting to WebSocket...")
        await client.connect_websocket()
        print("✅ WebSocket connected!")

        # Request quotes
        pairs = [
            ("BTC/USDT", 100000000),  # 1 BTC
            ("BTC/USDT", 50000000),  # 0.5 BTC
            ("BTC/USDT", 200000000),  # 2 BTC
        ]

        print("\n📊 Requesting quotes via WebSocket...")
        print("-" * 40)

        for pair, amount in pairs:
            print(f"\nRequesting quote for {pair} ({amount} sats)...")

            try:
                quote = await client.get_quote_websocket(
                    ticker=pair, from_amount=amount, layer="BTC_LN"
                )

                from_btc = quote.from_asset.amount / 100_000_000
                print("  ✅ Quote received:")
                print(f"     From: {from_btc:.8f} BTC")
                print(f"     To: {quote.to_asset.amount} USDT")
                if hasattr(quote, "price") and quote.price:
                    print(f"     Price: ${quote.price:.2f}/BTC")

            except Exception as e:
                print(f"  ❌ Error: {e}")

    except Exception as e:
        print(f"\n❌ Connection error: {e}")
        print("\nNote: WebSocket connection requires authentication.")
        print("This example demonstrates the API usage pattern.")

    finally:
        # Disconnect only if connected
        if await client.is_websocket_connected():
            print("\n🔌 Disconnecting WebSocket...")
            try:
                await client.disconnect_websocket()
                print("✅ Disconnected")
            except Exception as e:
                print(f"⚠️  Disconnect warning: {e}")

    print("\n" + "=" * 60)
    print("✅ Done!")


if __name__ == "__main__":
    asyncio.run(main())
