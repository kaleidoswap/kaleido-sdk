#!/usr/bin/env python3
"""
Swap Orders Management

This example demonstrates how to:
1. Create swap orders for automated trading
2. Check order status
3. View order history
4. Handle order analytics
"""

import json
import logging
import os

from kaleidoswap import KaleidoClient, KaleidoConfig
from kaleidoswap.generated_models import (
    CreateSwapOrderRequest,
    ReceiverAddress,
    ReceiverAddressFormat,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")


def main():
    """Manage swap orders."""

    # Initialize client
    config = KaleidoConfig(
        base_url=API_URL,
        node_url=NODE_URL,
    )
    client = KaleidoClient(config)

    # Step 1: Get available pairs
    logger.info("📋 Step 1: Fetching available pairs...")
    pairs = client.list_pairs()

    if not pairs:
        logger.error("No trading pairs available")
        return

    # Pick the first active pair
    pair = pairs[0]
    from_ticker = pair.base.ticker if pair.base else "?"
    to_ticker = pair.quote.ticker if pair.quote else "?"
    pair_ticker = f"{from_ticker}/{to_ticker}"
    
    logger.info(f"  Using Pair: {pair_ticker}")

    # Determine valid amount from asset limits
    from_amount = 10_000_000  # Default 10M
    
    base_asset = None
    assets = client.list_assets()
    for asset in assets:
        if getattr(asset, "ticker", "") == from_ticker:
            base_asset = asset
            break

    if base_asset and hasattr(base_asset, 'endpoints') and base_asset.endpoints:
        for endpoint in base_asset.endpoints:
            if hasattr(endpoint, 'min_amount') and endpoint.min_amount:
                from_amount = max(from_amount, endpoint.min_amount + endpoint.min_amount // 10)
                break

    # Step 2: Get a quote to determine amounts
    logger.info("\n💱 Step 2: Getting quote for reference...")
    try:
        quote = client.get_quote_by_pair(pair_ticker, from_amount=from_amount)

        logger.info(f"  From Amount: {quote.from_asset.amount}")
        logger.info(f"  To Amount: {quote.to_asset.amount}")
        logger.info(f"  Price: {quote.price}")
        logger.info(f"  RFQ ID: {quote.rfq_id}")
    except Exception as e:
        logger.warning(f"  Could not get quote: {e}")
        quote = None
        return

    # Step 3: Get node information (if node configured)
    if client.has_node():
        logger.info("\n🔑 Step 3: Getting node information...")
        try:
            node_info_json = client.get_rgb_node_info()
            node_info = json.loads(node_info_json)
            pubkey = node_info.get("pubkey", "N/A")
            logger.info(f"  Node Pubkey: {pubkey[:20]}...")
        except Exception as e:
            logger.warning(f"  Could not get node info: {e}")
    else:
        logger.info("\n⚠️ Step 3: Node not configured - skipping node operations")
        logger.info("  Set KALEIDO_NODE_URL to enable full swap order creation")

    # Step 4: Create a swap order (if quote and node available)
    if quote and client.has_node():
        logger.info("\n📝 Step 4: Creating swap order...")
        try:
            # Create typed request object
            order_request = CreateSwapOrderRequest(
                rfq_id=quote.rfq_id,
                from_asset=quote.from_asset,
                to_asset=quote.to_asset,
                receiver_address=ReceiverAddress(
                    address="lnbcrt1p...",  # Mock invoice for demo
                    format=ReceiverAddressFormat.bolt11
                )
            )

            # Pass the typed object - client will serialize it correctly
            order_response_json = client.create_swap_order(order_request)
            order_response = json.loads(order_response_json)

            logger.info("  ✅ Swap order created:")
            logger.info(f"     Order ID: {order_response.get('order_id')}")
            logger.info(f"     Status: {order_response.get('status')}")
            logger.info(f"     Payment Hash: {order_response.get('payment_hash')}")

            # Check order status
            order_id = order_response.get("order_id")
            if order_id:
                logger.info(f"\n🔍 Checking order status for {order_id}...")
                status_json = client.get_swap_order_status(order_id)
                status = json.loads(status_json)
                logger.info(f"  Status: {status.get('status')}")

        except Exception as e:
            logger.warning(f"  Could not create swap order: {e}")
            logger.info("  Note: This is expected if 'lnbcrt1p...' is not a valid invoice or node rejects it")
    else:
        logger.info("\n⏭️  Step 4: Skipping swap order creation (missing quote or node)")

    # Step 5: Get order history
    logger.info("\n📜 Step 5: Getting order history...")
    try:
        history_json = client.get_order_history(limit=5, skip=0)
        history = json.loads(history_json)
        orders = history.get("orders", []) if isinstance(history, dict) else history

        logger.info(f"  Total Orders: {len(orders)}")

        for i, order in enumerate(orders[:3], 1):
            logger.info(f"  Order {i}:")
            logger.info(f"    ID: {order.get('order_id', 'N/A')}")
            logger.info(f"    Status: {order.get('status', 'N/A')}")
            logger.info(f"    Created: {order.get('created_at', 'N/A')}")
    except Exception as e:
        logger.warning(f"  Could not get order history: {e}")

    # Step 6: Get analytics
    logger.info("\n📊 Step 6: Getting order analytics...")
    try:
        analytics = client.get_order_analytics()

        logger.info(f"  Filled Orders: {analytics.filled_orders_count}")
        logger.info(f"  Total Volume: {analytics.filled_orders_volume}")

        if analytics.status_counts:
            logger.info("  Status Distribution:")
            for status_name, count in analytics.status_counts.items():
                logger.info(f"    {status_name}: {count}")
    except Exception as e:
        logger.warning(f"  Could not get analytics: {e}")

    logger.info("\n✅ Swap order management completed!")


if __name__ == "__main__":
    main()
