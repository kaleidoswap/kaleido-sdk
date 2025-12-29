#!/usr/bin/env python3
"""
LSPS1 Channel Purchase Flow

This example demonstrates how to:
1. Get LSP information
2. Estimate channel fees
3. Create a channel purchase order
4. Get order status
5. Handle rate decisions
"""

import asyncio
import logging
import os
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import CreateOrderRequest

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
    """Execute LSPS1 channel purchase flow."""

    # Initialize client
    client = KaleidoClient(base_url=API_URL, node_url=NODE_URL, api_key=API_KEY)

    try:
        # Step 1: Get LSP information
        logger.info("📋 Step 1: Getting LSP information...")
        lsp_info = await client.get_lsp_info()
        logger.info(f"  LSP Pubkey: {lsp_info.pubkey}")
        logger.info(f"  LSP Address: {lsp_info.host}:{lsp_info.port}")
        logger.info(f"  Network: {lsp_info.network}")

        # Step 2: Get network information
        logger.info("\n🌐 Step 2: Getting network information...")
        network_info = await client.get_lsp_network_info()
        logger.info(f"  Block Height: {network_info.block_height}")
        logger.info(f"  Block Hash: {network_info.block_hash}")

        # Step 3: Get node pubkey for the order
        logger.info("\n🔑 Step 3: Getting client node information...")
        node_info = await client.get_node_info()
        client_pubkey = node_info.pubkey
        logger.info(f"  Client Pubkey: {client_pubkey}")

        # Step 4: Get onchain address for refunds
        logger.info("\n💰 Step 4: Getting onchain address...")
        address_response = await client.get_onchain_address()
        refund_address = address_response.address
        logger.info(f"  Refund Address: {refund_address}")

        # Step 5: Estimate fees first
        logger.info("\n💵 Step 5: Estimating channel fees...")
        order_request = CreateOrderRequest(
            lsp_balance_sat=80000,
            client_balance_sat=20000,
            required_channel_confirmations=1,
            funding_confirms_within_blocks=6,
            channel_expiry_blocks=1000,
            token="BTC",
            refund_onchain_address=refund_address,
            announce_channel=True,
        )

        fees = await client.estimate_fees(order_request)
        logger.info("  ✅ Estimated fees:")
        logger.info(f"     Base Fee: {fees.base_fee_sat} sat")
        logger.info(f"     Variable Fee: {fees.variable_fee_ppm} ppm")
        logger.info(f"     Total: {fees.total_fee_sat} sat")

        # Step 6: Create the order
        logger.info("\n📝 Step 6: Creating channel purchase order...")
        order = await client.create_order(order_request)

        logger.info("  ✅ Order created:")
        logger.info(f"     Order ID: {order.order_id}")
        logger.info(f"     State: {order.order_state}")
        logger.info(f"     LSP Balance: {order.lsp_balance_sat} sat")
        logger.info(f"     Client Balance: {order.client_balance_sat} sat")

        # Display payment options
        logger.info("\n💳 Payment Options:")
        if order.payment.bolt11:
            logger.info("  Lightning Invoice:")
            logger.info(f"    Invoice: {order.payment.bolt11.invoice}")
            logger.info(f"    Amount: {order.payment.bolt11.order_total_sat} sat")
            logger.info(f"    Expires: {order.payment.bolt11.expires_at}")

        if order.payment.onchain:
            logger.info("  Onchain Payment:")
            logger.info(f"    Address: {order.payment.onchain.address}")
            logger.info(f"    Amount: {order.payment.onchain.order_total_sat} sat")
            logger.info(
                f"    Min Confirmations: {order.payment.onchain.min_onchain_payment_confirmations}"
            )

        # Step 7: Check order status
        logger.info("\n🔍 Step 7: Checking order status...")
        order_status = await client.get_order(order_id=order.order_id)
        logger.info(f"  Order State: {order_status.order_state}")
        logger.info(f"  Created At: {order_status.created_at}")

        # Step 8: Get order history
        logger.info("\n📜 Step 8: Getting order history...")
        history = await client.get_order_history(limit=5)
        logger.info(f"  Total Orders: {history.total}")
        logger.info(f"  Recent Orders: {len(history.orders)}")

        # Step 9: Get order analytics
        logger.info("\n📊 Step 9: Getting order analytics...")
        stats = await client.get_order_analytics()
        logger.info(f"  Total Filled Orders: {stats.filled_orders_count}")
        logger.info(f"  Total Volume: {stats.filled_orders_volume} sat")
        if hasattr(stats, "status_counts") and stats.status_counts:
            logger.info(f"  Status Counts: {dict(stats.status_counts)}")

        logger.info("\n✅ LSPS1 channel purchase flow completed!")
        logger.info(
            "⚠️  Remember to pay the invoice or send to the onchain address to complete the order"
        )

    except Exception as e:
        logger.error(f"❌ Error during channel purchase: {e}", exc_info=True)

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
