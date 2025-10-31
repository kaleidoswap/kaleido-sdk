#!/usr/bin/env python3
"""
Example script demonstrating how to use the Kaleidoswap SDK for market data.
This script shows how to:
1. List available assets and trading pairs
2. Get price quotes
3. Subscribe to real-time price updates
"""

import asyncio
import logging
from kaleidoswap_sdk.client import KaleidoClient

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = "http://localhost:8000/api/v1"  # Replace with actual API URL
NODE_URL = "http://localhost:8000/api/v1"  # Replace with actual Node URL


async def main():
    """Main function demonstrating SDK usage."""
    # Initialize SDK client
    async with KaleidoClient(api_url=API_URL, node_url=NODE_URL) as sdk:
        # List available assets
        logger.info("Fetching available assets...")
        assets = await sdk.list_assets()
        logger.info(f"Available assets: {assets['assets']}")

        # List available trading pairs
        logger.info("\nFetching available trading pairs...")
        pairs = await sdk.list_pairs()
        logger.info(f"Available pairs: {pairs['pairs']}")

        # Get node info
        logger.info("\nGetting node info...")
        node_info = await sdk.get_node_info()
        logger.info(f"Node info: {node_info}")

        # Get a price quote
        logger.info("\nGetting price quote for BTC/USDT...")
        from_asset = assets["assets"][0]["asset_id"]
        to_asset = assets["assets"][1]["asset_id"]
        quote = await sdk.get_quote(
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=100000000,  # 1 BTC in satoshis
        )
        logger.info(f"Quote: {quote}")

        # TODO: Implement websocket Getting quote
        # Get a quote using websocket
        # logger.info("\nGetting price quote for BTC/USDT using websocket...")
        # quote = await sdk.get_quote_websocket(
        #     from_asset="BTC",
        #     to_asset="USDT",
        #     from_amount=100000000,  # 1 BTC in satoshis
        # )
        # logger.info(f"Quote: {quote}")


if __name__ == "__main__":
    asyncio.run(main())
