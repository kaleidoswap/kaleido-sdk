#!/usr/bin/env python3
"""
Swap Orders Management

This example demonstrates how to:
1. Create swap orders for automated trading
2. Check order status
3. View order history
4. Handle rate decisions
5. Monitor order analytics
"""

import asyncio
import logging
import os
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import CreateSwapOrderRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")
API_KEY = os.getenv("KALEIDO_API_KEY")


async def main():
    """Manage swap orders."""

    # Initialize client
    client = KaleidoClient(base_url=API_URL, node_url=NODE_URL, api_key=API_KEY)

    try:
        # Step 1: Get available assets
        logger.info("📋 Step 1: Fetching available assets...")
        assets = await client.list_assets()

        if len(assets.assets) < 2:
            logger.error("Need at least 2 assets for a swap order")
            return

        from_asset = assets.assets[0].asset_id
        to_asset = assets.assets[1].asset_id

        logger.info(f"  From Asset: {assets.assets[0].ticker} ({from_asset})")
        logger.info(f"  To Asset: {assets.assets[1].ticker} ({to_asset})")

        # Step 2: Get a quote to determine amounts
        logger.info("\n💱 Step 2: Getting quote for reference...")
        quote = await client.get_quote_websocket(
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=50000000,  # 0.5 BTC
        )

        logger.info(f"  From Amount: {quote.from_amount}")
        logger.info(f"  To Amount: {quote.to_amount}")
        logger.info(f"  Price: {quote.price}")

        # Step 3: Get node information
        logger.info("\n🔑 Step 3: Getting maker node information...")
        node_info = await client.get_swap_node_info()
        maker_pubkey = node_info.pubkey
        logger.info(f"  Maker Pubkey: {maker_pubkey}")

        # Step 4: Create a swap order
        logger.info("\n📝 Step 4: Creating swap order...")

        order_request = CreateSwapOrderRequest(
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=quote.from_amount,
            to_amount=quote.to_amount,
            maker_pubkey=maker_pubkey,
            payment_hash=None,  # Will be generated
            rfq_id=quote.rfq_id,
        )

        order_response = await client.create_swap_order(order_request)

        logger.info("  ✅ Swap order created:")
        logger.info(f"     Order ID: {order_response.order_id}")
        logger.info(f"     Status: {order_response.status}")
        logger.info(
            f"     From: {order_response.from_asset} ({order_response.from_amount})"
        )
        logger.info(f"     To: {order_response.to_asset} ({order_response.to_amount})")
        logger.info(f"     Payment Hash: {order_response.payment_hash}")
        logger.info(f"     Created: {order_response.created_at}")
        if order_response.expires_at:
            logger.info(f"     Expires: {order_response.expires_at}")

        # Step 5: Check order status
        logger.info("\n🔍 Step 5: Checking order status...")
        status = await client.get_swap_order_status(order_id=order_response.order_id)

        logger.info(f"  Order Status: {status.status}")
        logger.info(f"  From: {status.from_asset} ({status.from_amount})")
        logger.info(f"  To: {status.to_asset} ({status.to_amount})")
        if status.filled_at:
            logger.info(f"  Filled At: {status.filled_at}")
        if status.failure_reason:
            logger.info(f"  Failure Reason: {status.failure_reason}")

        # Step 6: Get order history
        logger.info("\n📜 Step 6: Getting order history...")
        history = await client.get_order_history(limit=10, offset=0)

        logger.info(f"  Total Orders: {history.total}")
        logger.info(f"  Showing: {len(history.orders)} orders")

        for i, order in enumerate(history.orders[:3], 1):
            logger.info(f"  Order {i}:")
            logger.info(f"    ID: {order.order_id}")
            logger.info(f"    Status: {order.status}")
            logger.info(f"    From: {order.from_asset} -> To: {order.to_asset}")
            logger.info(f"    Created: {order.created_at}")

        # Step 7: Get analytics
        logger.info("\n📊 Step 7: Getting order analytics...")
        analytics = await client.get_order_analytics(
            from_date=None,  # All time
            to_date=None,
        )

        logger.info(f"  Total Filled Orders: {analytics.filled_orders_count}")
        logger.info(f"  Total Volume: {analytics.filled_orders_volume}")

        if hasattr(analytics, "status_counts") and analytics.status_counts:
            logger.info("  Status Distribution:")
            for status_name, count in analytics.status_counts.items():
                logger.info(f"    {status_name}: {count}")

        logger.info("\n✅ Swap order management completed successfully!")

    except Exception as e:
        logger.error(f"❌ Error managing swap orders: {e}", exc_info=True)

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
