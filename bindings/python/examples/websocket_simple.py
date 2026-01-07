#!/usr/bin/env python3
"""
Simple WebSocket Example

This example demonstrates basic WebSocket usage without async/await.
The WebSocket methods in the Python SDK are synchronous (blocking).
"""

from kaleidoswap import KaleidoClient, KaleidoConfig

# Note: Change this to your actual API URL
BASE_URL = "http://localhost:8000"


def main():
    """Simple WebSocket example."""
    print("=" * 60)
    print("Kaleidoswap SDK - Simple WebSocket Example")
    print("=" * 60)

    # Initialize client
    config = KaleidoConfig(
        base_url=BASE_URL,
        timeout=30.0,
    )
    client = KaleidoClient(config)

    try:
        # Connect to WebSocket
        print("\n📡 Connecting to WebSocket...")
        client.connect_websocket()

        # Check connection status
        is_connected = client.is_websocket_connected()
        if is_connected:
            print("✅ WebSocket connected!")
        else:
            print("⚠️  WebSocket connection status: False")
            return

        # Request a quote via WebSocket
        print("\n📊 Requesting quote via WebSocket...")
        try:
            quote = client.get_quote_websocket(
                ticker="BTC/USDT",
                from_amount=10000000,  # 0.1 BTC in sats
                layer="BTC_LN"
            )

            print("✅ Quote received:")
            print(f"   From: {quote.from_asset.amount / 100_000_000:.8f} BTC")
            print(f"   To: {quote.to_asset.amount} {quote.to_asset.ticker}")
            print(f"   RFQ ID: {quote.rfq_id}")

        except Exception as e:
            print(f"❌ Quote request failed: {e}")

        # Subscribe to pair updates
        print("\n📥 Subscribing to BTC/USDT updates...")
        try:
            client.subscribe_to_pair("BTC/USDT")
            print("✅ Subscribed to BTC/USDT")

            # Note: Event handling requires a separate event loop implementation
            print("\nℹ️  Event handling is not fully implemented in this example.")
            print("   For real-time updates, implement your own event loop.")

            # Unsubscribe
            print("\n📤 Unsubscribing from BTC/USDT...")
            client.unsubscribe_from_pair("BTC/USDT")
            print("✅ Unsubscribed")

        except Exception as e:
            print(f"❌ Subscription failed: {e}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nNote: Make sure the Kaleidoswap API server is running")
        print(f"at {BASE_URL}")

    finally:
        # Disconnect only if connected
        try:
            if client.is_websocket_connected():
                print("\n🔌 Disconnecting WebSocket...")
                client.disconnect_websocket()
                print("✅ Disconnected")
        except Exception as e:
            print(f"⚠️  Disconnect warning: {e}")

    print("\n" + "=" * 60)
    print("✅ Done!")


if __name__ == "__main__":
    main()
