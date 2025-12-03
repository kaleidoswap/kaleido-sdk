#!/usr/bin/env python3
"""
Real-time Quote Updates via WebSocket

This example demonstrates how to:
1. Connect to the WebSocket API
2. Get real-time price quotes
3. Handle quote updates efficiently
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
API_KEY = os.getenv("KALEIDO_API_KEY", "your_api_key_here")


async def main():
    """Main function demonstrating WebSocket quote fetching."""

    # Initialize client with API key for authentication
    client = KaleidoClient(base_url=API_URL, api_key=API_KEY)

    try:
        logger.info("Fetching available assets...")
        assets_response = await client.list_assets()

        if not assets_response or not assets_response.assets:
            logger.error("No assets available")
            return

        # Get first two assets for quote
        from_asset = assets_response.assets[0].asset_id
        to_asset = (
            assets_response.assets[1].asset_id
            if len(assets_response.assets) > 1
            else assets_response.assets[0].asset_id
        )

        logger.info(f"Getting WebSocket quote for {from_asset} -> {to_asset}")

        # Get quote via WebSocket (automatically connects if needed)
        quote = await client.get_quote_websocket(
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=100000000,  # Amount in atomic units
        )

        logger.info("✅ WebSocket Quote received:")
        logger.info(f"  RFQ ID: {quote.rfq_id}")
        logger.info(f"  From: {quote.from_asset} ({quote.from_amount})")
        logger.info(f"  To: {quote.to_asset} ({quote.to_amount})")
        logger.info(f"  Price: {quote.price}")
        logger.info(f"  Fee: {quote.fee.final_fee} {quote.fee.fee_asset}")
        logger.info(f"  Expires at: {quote.expires_at}")

        # Get multiple quotes for comparison
        logger.info("\n📊 Getting multiple quotes via WebSocket...")
        for i in range(3):
            quote = await client.get_quote_websocket(
                from_asset=from_asset,
                to_asset=to_asset,
                from_amount=100000000 * (i + 1),  # Varying amounts
            )
            logger.info(
                f"Quote {i + 1}: {quote.from_amount} -> {quote.to_amount} (fee: {quote.fee.final_fee})"
            )
            await asyncio.sleep(1)  # Small delay between requests

    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)

    finally:
        # Clean up connections
        await client.close()
        logger.info("✅ Client closed")


if __name__ == "__main__":
    asyncio.run(main())
