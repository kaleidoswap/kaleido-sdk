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

import logging
import os

from kaleidoswap import (
    KaleidoClient, 
    KaleidoConfig, 
    Asset, 
    KaleidoError, 
    AssetNotFoundError,
    TradingPairNotFoundError,
    ValidationError
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")


def main():
    """Demonstrate advanced market data operations."""

    # Initialize client
    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    # Example 1: Find assets by ticker
    logger.info("🔍 Example 1: Finding assets by ticker...")
    
    try:
        btc_asset = client.get_asset_by_ticker("BTC")
        if btc_asset:
            logger.info("  Found BTC:")
            logger.info(f"    Ticker: {btc_asset.ticker}")
            logger.info(f"    Precision: {btc_asset.precision}")
            logger.info(f"    Name: {btc_asset.name}")
    except AssetNotFoundError:
        logger.warning("  Asset 'BTC' not found.")
        btc_asset = None
    except KaleidoError as e:
        logger.warning(f"  Error finding BTC: {e}")
        btc_asset = None
    except Exception as e:
        logger.warning(f"  Unexpected error: {e}")
        btc_asset = None

    # Example 2: Find trading pair by ticker
    logger.info("\n📊 Example 2: Finding trading pairs by ticker...")
    
    try:
        pairs = client.list_pairs()
        if pairs:
            first_pair = pairs[0]
            pair_ticker = f"{first_pair.base.ticker}/{first_pair.quote.ticker}"
            logger.info(f"  Looking for pair: {pair_ticker}")

            pair = client.get_pair_by_ticker(pair_ticker)
            if pair:
                logger.info("  ✅ Found pair:")
                logger.info(f"    Base: {pair.base.ticker}")
                logger.info(f"    Quote: {pair.quote.ticker}")
    except TradingPairNotFoundError:
        logger.warning(f"  Trading pair {pair_ticker} not found.")
    except KaleidoError as e:
        logger.warning(f"  Could not get pairs: {e}")
    except Exception as e:
        logger.warning(f"  Unexpected error: {e}")
    # Example 3: Amount conversion
    logger.info("\n💱 Example 3: Converting between display and atomic units...")

    if btc_asset:
        # Convert 1.5 BTC to atomic units (satoshis)
        display_amount = 1.5
        atomic_amount = client.to_raw(display_amount, btc_asset)
        logger.info(f"  {display_amount} BTC = {atomic_amount} satoshis")

        # Convert back
        converted_back = client.to_display(atomic_amount, btc_asset)
        logger.info(f"  {atomic_amount} satoshis = {converted_back} BTC")
        
        # Using convert_amount helper
        result = client.convert_amount(2.5, btc_asset, to="raw")
        logger.info(f"  2.5 BTC = {result} satoshis (via convert_amount)")
    else:
        # Demo with mock asset
        logger.info("  Using mock BTC asset for demo...")
        mock_btc = Asset(ticker="BTC", name="Bitcoin", precision=8)
        
        atomic = client.to_raw(1.0, mock_btc)
        logger.info(f"  1.0 BTC = {atomic} satoshis")
        
        display = client.to_display(100_000_000, mock_btc)
        logger.info(f"  100,000,000 satoshis = {display} BTC")

    # Example 4: Amount validation
    logger.info("\n✅ Example 4: Validating amounts...")

    try:
        test_amount = 0.01  # 0.01 BTC
        validation = client.validate_amount(test_amount, "BTC")

        logger.info(f"  Amount: {test_amount} BTC")
        logger.info(f"  Valid: {validation['valid']}")
        logger.info(f"  Raw Amount: {validation['raw_amount']}")
        logger.info(f"  Display Amount: {validation['display_amount']}")
        if validation["errors"]:
            logger.info(f"  Errors: {', '.join(validation['errors'])}")
    except ValidationError as e:
        logger.warning(f"  Validation error: {e}")
    except Exception as e:
        logger.warning(f"  Could not validate amount: {e}")
    # Example 5: Check if pair is tradeable
    logger.info("\n🔄 Example 5: Checking trade availability...")

    can_trade_btc_usdt = client.can_trade("BTC", "USDT")
    logger.info(f"  Can trade BTC/USDT: {can_trade_btc_usdt}")

    can_trade_fake = client.can_trade("FAKE", "COIN")
    logger.info(f"  Can trade FAKE/COIN: {can_trade_fake}")

    # Example 6: Get quote by pair ticker
    logger.info("\n💰 Example 6: Getting quote by pair ticker...")

    try:
        if pairs:
            first_pair = pairs[0]
            pair_ticker = f"{first_pair.base.ticker}/{first_pair.quote.ticker}"
            
            # Get base asset to check limits
            base_asset = client.get_asset_by_ticker(first_pair.base.ticker)
            
            # Find a valid amount from asset limits
            from_amount = 10_000_000  # Default 10M smallest units
            if base_asset and base_asset.endpoints:
                for endpoint in base_asset.endpoints:
                    if hasattr(endpoint, 'min_amount') and endpoint.min_amount:
                        from_amount = max(from_amount, endpoint.min_amount + endpoint.min_amount // 10)
                        break
            
            logger.info(f"  Using amount: {from_amount} for {pair_ticker}")
            
            quote = client.get_quote_by_pair(
                ticker=pair_ticker,
                from_amount=from_amount,
            )

            logger.info(f"  ✅ Quote for {pair_ticker}:")
            logger.info(f"    RFQ ID: {quote.rfq_id}")
            logger.info(f"    From: {quote.from_asset.amount} {quote.from_asset.ticker}")
            logger.info(f"    To: {quote.to_asset.amount} {quote.to_asset.ticker}")
    except ResourceNotFoundError as e:
        logger.warning(f"  Resource not found: {e}")
    except KaleidoError as e:
        logger.warning(f"  Error getting quote: {e}")
    except Exception as e:
        logger.warning(f"  Unexpected error: {e}")


    # Example 7: Cache management
    logger.info("\n🔄 Example 7: Cache management...")

    logger.info("  Getting assets...")
    assets1 = client.list_assets()
    logger.info(f"    Found {len(assets1)} assets")

    logger.info("  Refreshing cache...")
    client.refresh_cache()
    logger.info("    Cache cleared")

    assets2 = client.list_assets()
    logger.info(f"    Found {len(assets2)} assets after refresh")

    logger.info("\n✅ All advanced market data operations completed!")


if __name__ == "__main__":
    main()
