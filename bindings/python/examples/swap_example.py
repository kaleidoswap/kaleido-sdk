#!/usr/bin/env python3
"""
Swap Example - Execute BTC/LN to RGB/L1 atomic swap

Demonstrates:
1. Connecting to Kaleidoswap API
2. Listing assets and finding pairs
3. Getting a quote
4. Executing the swap
"""

import ast
import json
import os
import re

from kaleidoswap import KaleidoClient, KaleidoConfig


def get_asset_id(asset):
    """Extract the best identifier for an asset (protocol ID or ticker)."""
    if hasattr(asset, "protocol_ids") and asset.protocol_ids:
        for k, v in asset.protocol_ids.items():
            if "BTC" in k and "BTC" in asset.ticker:
                return v
            if "rgb" in k.lower():
                return v
        return list(asset.protocol_ids.values())[0]
    return asset.ticker


def recover_pubkey_from_error(error):
    """
    Workaround for u64 overflow in node info response.

    The RLN node returns channel_asset_max_amount as u64::MAX which
    overflows when deserializing to i64. Extract pubkey from error.
    """
    match = re.search(r"Payload \((.*?)\):", str(error))
    if not match:
        return None

    raw_captured = match.group(1)
    unescaped = raw_captured.replace('\\"', '"').replace("\\\\", "\\")

    try:
        payload_bytes = ast.literal_eval(unescaped)
        payload_str = payload_bytes.decode("utf-8")
        data = json.loads(payload_str)
        return data.get("pubkey")
    except Exception:
        return None


def format_amount(amount, ticker, layer):
    """Format amount with correct units based on layer."""
    if layer in ("BTC_LN", "RGB_LN"):
        # Lightning uses millisatoshi (msat)
        return f"{amount:,} msat"
    else:
        # On-chain uses satoshi (sat) for BTC and smallest units for RGB
        unit = "sat" if "BTC" in ticker else ticker
        return f"{amount:,} {unit}"


def find_btc_usdt_pair(pairs):
    """Find BTC/USDT pair, or return first available pair."""
    for pair in pairs:
        from_ticker = pair.base.ticker if pair.base else ""
        to_ticker = pair.quote.ticker if pair.quote else ""

        if ("BTC" in from_ticker and "USDT" in to_ticker) or (
            "USDT" in from_ticker and "BTC" in to_ticker
        ):
            return pair

    return pairs[0] if pairs else None


def main():
    """Execute a complete atomic swap flow."""
    api_url = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
    node_url = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")

    print("=" * 60)
    print("Kaleidoswap SDK - Swap Example")
    print(f"API: {api_url} | Node: {node_url}")
    print("=" * 60)

    config = KaleidoConfig(base_url=api_url, node_url=node_url, timeout=30.0)
    client = KaleidoClient(config)

    if not client.has_node():
        print("\n⚠️  Node not configured - cannot execute swaps")
        return

    # Step 1: List Assets
    print("\n📦 Listing Assets...")
    try:
        assets = client.list_assets()
        print(f"   Found {len(assets)} assets")
        for asset in assets[:3]:
            asset_info = f"{asset.ticker}: {asset.name}"
            if hasattr(asset, "protocol_ids") and asset.protocol_ids:
                proto_ids = list(asset.protocol_ids.values())
                if proto_ids:
                    asset_info += f" ({proto_ids[0][:10]}...)"
            print(f"   - {asset_info}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return

    # Step 2: Find Trading Pair
    print("\n💱 Finding BTC/USDT pair...")
    try:
        pairs = client.list_pairs()
        target_pair = find_btc_usdt_pair(pairs)

        if not target_pair:
            print("   ❌ No pairs found")
            return

        from_ticker = target_pair.base.ticker
        to_ticker = target_pair.quote.ticker
        print(f"   Using pair: {from_ticker}/{to_ticker}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return

    # Step 3: Get Quote
    print("\n💰 Getting quote for BTC/LN → RGB/L1...")

    asset_a = target_pair.base
    asset_b = target_pair.quote

    if "BTC" in asset_a.ticker:
        source_asset, target_asset = asset_a, asset_b
    else:
        source_asset, target_asset = asset_b, asset_a

    from_id = get_asset_id(source_asset)
    to_id = get_asset_id(target_asset)
    from_amount = 10000000  # Minimum required amount

    print(f"   Using: {from_id} → {to_id}")

    try:
        quote = client.get_quote_by_assets(
            from_ticker=from_id,
            to_ticker=to_id,
            from_amount=from_amount,
            from_layer="BTC_LN",
            to_layer="RGB_L1",
        )

        print("   ✅ Quote received:")
        from_formatted = format_amount(
            quote.from_asset.amount, quote.from_asset.ticker, quote.from_asset.layer
        )
        to_formatted = format_amount(
            quote.to_asset.amount, quote.to_asset.ticker, quote.to_asset.layer
        )
        fee_formatted = format_amount(
            quote.fee.final_fee, quote.from_asset.ticker, quote.from_asset.layer
        )

        print(f"      {from_formatted} → {to_formatted}")
        print(f"      Fee: {fee_formatted} | RFQ: {quote.rfq_id}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return

    # Step 4: Get Taker Pubkey
    print("\n🔑 Getting taker pubkey...")
    try:
        # get_rgb_node_info() now returns a NodeInfoResponse object, not JSON
        node_info = client.get_rgb_node_info()
        taker_pubkey = node_info.pubkey if node_info.pubkey else ""
        print(f"   ✅ Pubkey: {taker_pubkey[:20]}...")
    except Exception as e:
        print("   ⚠️  Node info failed (expected u64 overflow)")
        taker_pubkey = recover_pubkey_from_error(e)
        if taker_pubkey:
            print(f"   ✅ Recovered: {taker_pubkey[:20]}...")
        else:
            print(f"   ❌ Recovery failed: {e}")
            return

    # Step 5: Execute Swap
    print("\n⚡ Executing swap...")
    try:
        result = client.execute_swap_flow(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset.asset_id,
            to_asset=quote.to_asset.asset_id,
            from_amount=quote.from_asset.amount,
            to_amount=quote.to_asset.amount,
            taker_pubkey=taker_pubkey,
            wait_for_completion=True,
            timeout=180.0,
            poll_interval=2.0,
        )

        print("   ✅ Swap completed!")
        print(f"      Swapstring: {result.get('swapstring', 'N/A')[:40]}...")
        print(f"      Payment Hash: {result.get('payment_hash', 'N/A')}")

        if "swap" in result and isinstance(result["swap"], dict):
            print(f"      Status: {result['swap'].get('status', 'N/A')}")

        print("\n🎉 Example finished successfully!")
    except Exception as e:
        print(f"   ❌ Swap failed: {e}")


if __name__ == "__main__":
    main()
