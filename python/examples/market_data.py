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
from kaleidoswap_sdk.client import KaleidoSDK
from kaleidoswap_sdk.generated.kaleidoswap_pb2 import PriceUpdate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
HTTP_BASE_URL = "http://localhost:8000"  # Replace with actual API URL
WS_BASE_URL = "ws://localhost:8001"      # Replace with actual WebSocket URL

async def handle_price_update(update: PriceUpdate):
    """Handle incoming price updates."""
    logger.info(f"Price update for {update.pair_id}:")
    logger.info(f"  Price: {update.data['price']}")
    logger.info(f"  Timestamp: {update.data['timestamp']}")
    logger.info(f"  Expires at: {update.data['expires_at']}")

async def main():
    """Main function demonstrating SDK usage."""
    # Initialize SDK client
    async with KaleidoSDK(
        http_base_url=HTTP_BASE_URL,
        ws_base_url=WS_BASE_URL
    ) as sdk:
        # List available assets
        logger.info("Fetching available assets...")
        assets = await sdk.list_assets()
        logger.info(f"Available assets: {assets['assets']}")
        
        # List available trading pairs
        logger.info("\nFetching available trading pairs...")
        pairs = await sdk.list_pairs()
        logger.info(f"Available pairs: {pairs['pairs']}")
        
        # Get a price quote
        logger.info("\nGetting price quote for BTC/USDT...")
        quote = await sdk.get_quote(
            pair_id="BTC_USDT",
            from_asset_id="BTC",
            from_amount=100000000,  # 1 BTC in satoshis
            to_asset_id="rgb:unique_rgb_id_usdt"
        )
        logger.info(f"Quote: {quote}")
        
        # Subscribe to real-time price updates
        logger.info("\nSubscribing to BTC/USDT price updates...")
        
        # Register callbacks
        sdk.on_price_update(handle_price_update)
        
        # Subscribe to pair
        await sdk.subscribe("BTC/USDT")
        
        # Keep the script running to receive updates
        logger.info("Waiting for price updates (press Ctrl+C to exit)...")
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Exiting...")
            await sdk.unsubscribe("BTC/USDT")

if __name__ == "__main__":
    asyncio.run(main()) 