#!/usr/bin/env python3
"""
Basic Market Data Operations

This example demonstrates how to:
1. List available assets and trading pairs
2. Get node information
3. Get price quotes via HTTP
4. Display asset and pair information
"""

import asyncio
import logging
import os
from kaleidoswap_sdk.client import KaleidoClient

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")
API_KEY = os.getenv("KALEIDO_API_KEY")


async def main():
    """Main function demonstrating basic SDK usage."""

    # Initialize SDK client
    client = KaleidoClient(base_url=API_URL, node_url=NODE_URL, api_key=API_KEY)

    try:
        # Step 1: List available assets
        logger.info("📋 Step 1: Fetching available assets...")
        assets = await client.list_assets()

        logger.info(f"  Found {len(assets.assets)} assets:")
        for i, asset in enumerate(assets.assets[:5], 1):  # Show first 5
            logger.info(f"  {i}. {asset.ticker} ({asset.name})")
            logger.info(f"     ID: {asset.asset_id}")
            logger.info(f"     Precision: {asset.precision}")

        # Step 2: List available trading pairs
        logger.info("\n📊 Step 2: Fetching available trading pairs...")
        pairs = await client.list_pairs()

        logger.info(f"  Found {len(pairs.pairs)} trading pairs:")
        for i, pair in enumerate(pairs.pairs[:5], 1):  # Show first 5
            logger.info(f"  {i}. {pair.base_asset}/{pair.quote_asset}")
            logger.info(f"     Price: {pair.price}")

        # Step 3: Get node info
        logger.info("\n🔑 Step 3: Getting node info...")
        node_info = await client.get_swap_node_info()

        logger.info(f"  Node Pubkey: {node_info.pubkey}")
        logger.info(f"  Network: {node_info.network}")
        if hasattr(node_info, "block_height"):
            logger.info(f"  Block Height: {node_info.block_height}")

        # Step 4: Get a price quote (HTTP)
        logger.info("\n💱 Step 4: Getting price quote...")

        if len(assets.assets) >= 2:
            from_asset = assets.assets[0].asset_id
            to_asset = assets.assets[1].asset_id
            from_amount = 100000000  # 1 BTC in satoshis (assuming 8 decimals)

            logger.info("  Requesting quote:")
            logger.info(f"    From: {assets.assets[0].ticker} ({from_amount})")
            logger.info(f"    To: {assets.assets[1].ticker}")

            quote = await client.get_quote(
                from_asset=from_asset, to_asset=to_asset, from_amount=from_amount
            )

            logger.info("  ✅ Quote received:")
            logger.info(f"     RFQ ID: {quote.rfq_id}")
            logger.info(f"     To Amount: {quote.to_amount}")
            logger.info(f"     Price: {quote.price}")
            logger.info(f"     Fee: {quote.fee.final_fee}")
            logger.info(f"     Expires at: {quote.expires_at}")

        logger.info("\n✅ Market data operations completed successfully!")
        logger.info("💡 Tip: See websocket_quotes.py for real-time quote updates")

    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
