#!/usr/bin/env python3
"""
LSPS1 Channel Purchase Flow

This example demonstrates how to:
1. Get LSP information
2. Get network information
3. Get order history and analytics
4. Estimate channel fees
"""

import logging
import os

from kaleidoswap import KaleidoClient, KaleidoConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")


def main():
    """Demonstrate LSPS1 channel information retrieval."""

    # Initialize client
    config = KaleidoConfig(
        base_url=API_URL,
        node_url=NODE_URL,
    )
    client = KaleidoClient(config)

    # Step 1: Get LSP information
    logger.info("📋 Step 1: Getting LSP information...")
    try:
        lsp_info = client.get_lsp_info()
        logger.info(
            f"  LSP Info: {lsp_info[:200]}..."
            if len(lsp_info) > 200
            else f"  LSP Info: {lsp_info}"
        )
    except Exception as e:
        logger.warning(f"  Could not get LSP info: {e}")

    # Step 2: Get network information
    logger.info("\n🌐 Step 2: Getting network information...")
    try:
        network_info = client.get_lsp_network_info()
        logger.info(f"  Network: {network_info.network}")
        logger.info(f"  Block Height: {network_info.height}")
    except Exception as e:
        logger.warning(f"  Could not get network info: {e}")

    # Step 3: Check node availability
    logger.info("\n🔑 Step 3: Checking node availability...")
    if client.has_node():
        logger.info("  ✅ Node is configured")

        # Get node info
        try:
            node_info = client.get_rgb_node_info()
            logger.info(
                f"  Node info: {node_info[:100]}..."
                if len(node_info) > 100
                else f"  Node info: {node_info}"
            )
        except Exception as e:
            logger.warning(f"  Could not get node info: {e}")

        # Get channels
        try:
            channels = client.list_channels()
            logger.info(
                f"  Channels: {channels[:100]}..."
                if len(channels) > 100
                else f"  Channels: {channels}"
            )
        except Exception as e:
            logger.warning(f"  Could not list channels: {e}")

        # Get peers
        try:
            peers = client.list_peers()
            logger.info(
                f"  Peers: {peers[:100]}..."
                if len(peers) > 100
                else f"  Peers: {peers}"
            )
        except Exception as e:
            logger.warning(f"  Could not list peers: {e}")
    else:
        logger.info("  ℹ️  No node configured")
        logger.info("  💡 Add NODE_URL to configuration for node operations")

    # Step 4: Get onchain address (if node available)
    if client.has_node():
        logger.info("\n💰 Step 4: Getting onchain address...")
        try:
            address = client.get_onchain_address()
            logger.info(f"  Address: {address}")
        except Exception as e:
            logger.warning(f"  Could not get address: {e}")

    # Step 5: Estimate LSP fees
    logger.info("\n💵 Step 5: Estimating LSP fees...")
    try:
        fees = client.estimate_lsp_fees(channel_size=100000)  # 100k sats
        logger.info(f"  Estimated fees: {fees}")
    except Exception as e:
        logger.warning(f"  Could not estimate fees: {e}")

    # Step 6: Get order history
    logger.info("\n📜 Step 6: Getting order history...")
    try:
        history = client.get_order_history(limit=5, skip=0)
        logger.info(f"  Order history: {history}")
    except Exception as e:
        logger.warning(f"  Could not get history: {e}")

    # Step 7: Get order analytics
    logger.info("\n📊 Step 7: Getting order analytics...")
    try:
        analytics = client.get_order_analytics()
        logger.info(f"  Filled Orders: {analytics.filled_orders_count}")
        logger.info(f"  Total Volume: {analytics.filled_orders_volume}")
    except Exception as e:
        logger.warning(f"  Could not get analytics: {e}")

    logger.info("\n✅ LSPS1 information retrieval completed!")


if __name__ == "__main__":
    main()
