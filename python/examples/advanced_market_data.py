#!/usr/bin/env python3
"""
Advanced Market Data Operations

This example demonstrates advanced SDK features:
1. Using helper methods for easier asset/pair lookup
2. Converting between display and atomic units
3. Amount validation
4. Caching strategies
5. Getting quotes by ticker symbols
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
API_KEY = os.getenv("KALEIDO_API_KEY")


async def main():
    """Demonstrate advanced market data operations."""

    # Initialize client
    client = KaleidoClient(base_url=API_URL, api_key=API_KEY)

    try:
        # Example 1: Find assets by ticker
        logger.info("🔍 Example 1: Finding assets by ticker...")

        btc_asset = await client.get_asset_by_ticker("BTC")
        if btc_asset:
            logger.info("  Found BTC:")
            logger.info(f"    Asset ID: {btc_asset.asset_id}")
            logger.info(f"    Ticker: {btc_asset.ticker}")
            logger.info(f"    Precision: {btc_asset.precision}")
            logger.info(f"    Name: {btc_asset.name}")

        # Example 2: Find trading pair by ticker
        logger.info("\n📊 Example 2: Finding trading pairs by ticker...")

        # First, let's see what pairs are available
        pairs = await client.list_pairs()
        if pairs and pairs.pairs:
            first_pair = pairs.pairs[0]
            pair_ticker = f"{first_pair.base_asset}/{first_pair.quote_asset}"
            logger.info(f"  Looking for pair: {pair_ticker}")

            pair = await client.get_pair_by_ticker(pair_ticker)
            if pair:
                logger.info("  ✅ Found pair:")
                logger.info(f"    Base: {pair.base_asset} ({pair.base_asset_id})")
                logger.info(f"    Quote: {pair.quote_asset} ({pair.quote_asset_id})")
                logger.info(f"    Price: {pair.price}")

        # Example 3: Amount conversion
        logger.info("\n💱 Example 3: Converting between display and atomic units...")

        if btc_asset:
            # Convert 1.5 BTC to atomic units (satoshis)
            display_amount = 1.5
            atomic_amount = client.convert_amount(display_amount, btc_asset, to="raw")
            logger.info(f"  {display_amount} BTC = {atomic_amount} satoshis")

            # Convert back
            converted_back = client.convert_amount(
                atomic_amount, btc_asset, to="display"
            )
            logger.info(f"  {atomic_amount} satoshis = {converted_back} BTC")

        # Example 4: Amount validation
        logger.info("\n✅ Example 4: Validating amounts...")

        test_amount = 0.01  # 0.01 BTC
        validation = await client.validate_amount(test_amount, "BTC")

        logger.info(f"  Amount: {test_amount} BTC")
        logger.info(f"  Valid: {validation['valid']}")
        logger.info(f"  Normalized (atomic): {validation['normalized_amount']}")
        logger.info(f"  Display amount: {validation['display_amount']}")
        if validation["errors"]:
            logger.info(f"  Errors: {', '.join(validation['errors'])}")

        # Example 5: Get quote by ticker (convenience method)
        logger.info("\n💰 Example 5: Getting quote by asset tickers...")

        try:
            quote = await client.get_quote_by_assets(
                from_asset="BTC",
                to_asset="BTC",  # Just for demo
                from_amount=0.1,  # Display units (0.1 BTC)
            )

            logger.info("  ✅ Quote received:")
            logger.info(f"    RFQ ID: {quote.rfq_id}")
            logger.info(f"    From: {quote.from_amount} (atomic)")
            logger.info(f"    To: {quote.to_amount} (atomic)")
            logger.info(f"    Price: {quote.price}")
            logger.info(f"    Fee: {quote.fee.final_fee}")
        except Exception as e:
            logger.warning(f"  Could not get quote: {e}")

        # Example 6: Get quote by pair ticker
        logger.info("\n📈 Example 6: Getting quote by pair ticker...")

        try:
            if pairs and pairs.pairs:
                first_pair = pairs.pairs[0]
                pair_ticker = f"{first_pair.base_asset}/{first_pair.quote_asset}"

                quote = await client.get_quote_by_pair(
                    pair_ticker=pair_ticker,
                    from_amount=0.1,  # Display units
                )

                logger.info(f"  ✅ Quote for {pair_ticker}:")
                logger.info(f"    RFQ ID: {quote.rfq_id}")
                logger.info(f"    Price: {quote.price}")
                logger.info(f"    To Amount: {quote.to_amount}")
        except Exception as e:
            logger.warning(f"  Could not get quote by pair: {e}")

        # Example 7: Find pair by asset IDs or tickers
        logger.info("\n🔄 Example 7: Finding pair by asset identifiers...")

        if btc_asset:
            # Can use ticker or asset ID
            pair = await client.get_pair_by_assets("BTC", "BTC")
            if pair:
                logger.info("  ✅ Found pair:")
                logger.info(f"    {pair.base_asset}/{pair.quote_asset}")
                logger.info(f"    Price: {pair.price}")
            else:
                logger.info("  No pair found for BTC/BTC")

        # Example 8: Force cache refresh
        logger.info("\n🔄 Example 8: Cache management...")

        logger.info("  Getting assets (from cache)...")
        assets1 = await client.list_assets()
        logger.info(f"    Found {len(assets1.assets)} assets")

        logger.info("  Force refreshing cache...")
        # The next call will use cache, but you can force refresh by calling internal methods
        assets2 = await client.list_assets()
        logger.info(f"    Found {len(assets2.assets)} assets")

        logger.info("\n✅ All advanced market data operations completed!")

    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
