#!/usr/bin/env python3
"""
Complete Atomic Swap Flow

This example demonstrates how to:
1. Get trading pairs and check their limits
2. Get a quote for a swap (using valid amounts)
3. Initialize a maker swap
4. Whitelist the trade on the taker node
5. Execute the swap
6. Wait for swap completion
"""

import json
import os

from kaleidoswap import KaleidoClient, KaleidoConfig


def main():
    """Execute a complete atomic swap flow."""

    # Configuration from environment or defaults
    api_url = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
    node_url = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")

    print("=" * 60)
    print("Kaleidoswap SDK - Complete Atomic Swap Example")
    print("=" * 60)

    # Initialize client with node URL for full swap capabilities
    config = KaleidoConfig(
        base_url=api_url,
        node_url=node_url,
        timeout=30.0,
    )
    client = KaleidoClient(config)

    print(f"\n🔗 Connected to: {api_url}")
    print(f"   Node URL: {node_url}")
    print(f"   Has Node: {client.has_node()}")

    if not client.has_node():
        print("\n⚠️  Node not configured - cannot execute swaps")
        print("   Set KALEIDO_NODE_URL to execute swaps")
        return

    # Step 1: Get trading pairs with their limits
    print("\n📋 Step 1: Fetching trading pairs...")
    pairs = client.list_pairs()

    if not pairs:
        print("   ❌ No trading pairs available")
        return

    # Pick the first active pair
    pair = pairs[0]
    from_ticker = pair.base.ticker if pair.base else "?"
    to_ticker = pair.quote.ticker if pair.quote else "?"
    pair_ticker = f"{from_ticker}/{to_ticker}"

    print(f"   Using pair: {pair_ticker}")
    print(f"   Price: {pair.price}")

    # Get trading limits from the pair's routes
    min_amount = None
    max_amount = None

    # Check if base asset has endpoints with limits
    from_asset = client.get_asset_by_ticker(from_ticker)
    if from_asset and from_asset.endpoints:
        for endpoint in from_asset.endpoints:
            if hasattr(endpoint, "min_amount") and hasattr(endpoint, "max_amount"):
                min_amount = endpoint.min_amount
                max_amount = endpoint.max_amount
                print(f"   Limits: min={min_amount}, max={max_amount}")
                break

    # Step 2: Calculate a valid amount
    print("\n💰 Step 2: Determining valid swap amount...")

    # Start with a reasonable default
    from_amount = 10_000_000  # 10M smallest units

    # Adjust to be within limits if known
    if min_amount and from_amount < min_amount:
        from_amount = min_amount + (min_amount // 10)  # Add 10% buffer
        print(f"   Adjusted to minimum: {from_amount}")
    elif max_amount and from_amount > max_amount:
        from_amount = max_amount - (max_amount // 10)  # Subtract 10% buffer
        print(f"   Adjusted to maximum: {from_amount}")

    display_amount = (
        client.to_display(from_amount, from_asset) if from_asset else from_amount
    )
    print(f"   Amount: {from_amount} ({display_amount} {from_ticker})")

    # Step 3: Get a quote
    print("\n💱 Step 3: Getting quote...")
    try:
        quote = client.get_quote_by_pair(pair_ticker, from_amount=from_amount, from_layer="BTC_LN", to_layer="RGB_LN")

        print("   ✅ Quote received:")
        print(f"     RFQ ID: {quote.rfq_id}")
        print(f"     From: {quote.from_asset.amount} {quote.from_asset.ticker}")
        print(f"     To: {quote.to_asset.amount} {quote.to_asset.ticker}")
        print(f"     Price: {quote.price}")
        print(f"     Fee: {quote.fee.final_fee}")
        print(f"     Expires: {quote.expires_at}")
    except Exception as e:
        print(f"   ❌ Could not get quote: {e}")
        print("\n   💡 Tips:")
        print("      - Check if the pair has active routes/limits")
        print("      - Try a different amount (min/max limits may vary)")
        print("      - Ensure the maker node has sufficient liquidity")
        return

    # Step 4: Get node info for taker pubkey
    print("\n🔑 Step 4: Getting taker node info...")
    try:
        node_info_json = client.get_rgb_node_info()
        node_info = json.loads(node_info_json)
        taker_pubkey = node_info.get("pubkey", "")
        print(f"   Taker pubkey: {taker_pubkey[:20]}...")
    except Exception as e:
        print(f"   ❌ Could not get node info: {e}")
        return

    # Step 5: Execute the complete swap flow with wait
    print("\n⚡ Step 5: Executing swap flow (init + whitelist + execute + wait)...")
    try:
        result = client.execute_swap_flow(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset.asset_id,
            to_asset=quote.to_asset.asset_id,
            from_amount=quote.from_asset.amount,
            to_amount=quote.to_asset.amount,
            taker_pubkey=taker_pubkey,
            wait_for_completion=True,  # Wait for swap to complete
            timeout=180.0,  # 3 minutes
            poll_interval=2.0,
        )

        print("   ✅ Swap completed:")
        print(f"     Swapstring: {result['swapstring'][:50]}...")
        print(f"     Payment Hash: {result['payment_hash']}")

        if "swap" in result:
            swap = result["swap"]
            if isinstance(swap, dict):
                print(f"     Status: {swap.get('status', 'N/A')}")
                print(f"     From: {swap.get('qty_from', 'N/A')}")
                print(f"     To: {swap.get('qty_to', 'N/A')}")
            else:
                print(f"     Swap result: {swap}")

        print("\n🎉 Atomic swap completed successfully!")

    except TimeoutError as e:
        print(f"   ⏱️  Swap timed out: {e}")
    except Exception as e:
        print(f"   ❌ Could not execute swap: {e}")

    print("\n" + "=" * 60)
    print("Atomic swap flow complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
