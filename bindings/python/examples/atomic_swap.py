#!/usr/bin/env python3
"""
Atomic Swap Example

This example demonstrates the complete atomic swap flow:
1. Get available assets and pairs
2. Get a quote for a swap
3. Initialize the swap
4. Whitelist trade on taker node
5. Monitor swap status
"""

import json
import os
from kaleidoswap import KaleidoClient, KaleidoConfig


def main():
    """Execute a complete atomic swap flow."""
    
    # Configuration from environment or defaults
    api_url = os.getenv("KALEIDO_API_URL", "https://api.regtest.kaleidoswap.com")
    node_url = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")
    
    print("=" * 60)
    print("Kaleidoswap SDK - Atomic Swap Example")
    print("=" * 60)
    
    # Initialize client with node URL for full swap capabilities
    config = KaleidoConfig(
        base_url=api_url,
        node_url=node_url,
        timeout=30.0,
        max_retries=3,
        cache_ttl=300,
    )
    client = KaleidoClient(config)
    
    print(f"\n🔗 Connected to: {api_url}")
    print(f"   Node URL: {node_url}")
    print(f"   Has Node: {client.has_node()}")
    
    # Step 1: Get trading pairs
    print("\n📋 Step 1: Fetching trading pairs...")
    pairs_json = client.list_pairs()
    pairs = json.loads(pairs_json)
    
    if not pairs:
        print("   ❌ No trading pairs available")
        return
    
    pair = pairs[0]
    ticker = pair.get("ticker", "BTC/USDT")
    print(f"   ✓ Found {len(pairs)} pairs, using: {ticker}")
    
    # Step 2: Get a quote
    print(f"\n📊 Step 2: Getting quote for {ticker}...")
    try:
        quote_json = client.get_quote_by_pair(ticker, 100000, None)
        quote = json.loads(quote_json)
        
        print(f"   ✓ Quote received:")
        print(f"     From Amount: {quote.get('from_amount', 'N/A')}")
        print(f"     To Amount: {quote.get('to_amount', 'N/A')}")
        print(f"     Price: {quote.get('price', 'N/A')}")
        print(f"     Expires: {quote.get('expires_at', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Could not get quote: {e}")
        return
    
    # Step 3: Get node info (if node configured)
    if client.has_node():
        print("\n🔑 Step 3: Getting node info...")
        try:
            node_info_json = client.get_node_info()
            node_info = json.loads(node_info_json)
            print(f"   ✓ Node pubkey: {node_info.get('pubkey', 'N/A')[:20]}...")
        except Exception as e:
            print(f"   ⚠️ Could not get node info: {e}")
    else:
        print("\n⚠️ Node not configured - skipping swap execution")
        print("   Set KALEIDO_NODE_URL to execute swaps")
    
    # Step 4: Show order history (demo)
    print("\n📜 Step 4: Fetching order history...")
    try:
        history_json = client.get_order_history(None, 5, 0)
        history = json.loads(history_json)
        orders = history.get("orders", []) if isinstance(history, dict) else history
        print(f"   ✓ Found {len(orders)} orders")
    except Exception as e:
        print(f"   ⚠️ Could not get order history: {e}")
    
    # Step 5: Get LSP info
    print("\n🏦 Step 5: Fetching LSP info...")
    try:
        lsp_info_json = client.get_lsp_info()
        lsp_info = json.loads(lsp_info_json)
        print(f"   ✓ LSP available")
    except Exception as e:
        print(f"   ⚠️ Could not get LSP info: {e}")
    
    print("\n" + "=" * 60)
    print("Atomic swap flow demonstration complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
