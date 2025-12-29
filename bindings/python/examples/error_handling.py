#!/usr/bin/env python3
"""
Error Handling Best Practices

This example demonstrates:
1. Proper exception handling
2. Timeout handling
3. Validation errors
4. Retry strategies
"""

import logging
import os
import time

from kaleidoswap import KaleidoClient, KaleidoConfig, KaleidoError

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")


def example_basic_error_handling():
    """Demonstrate basic error handling."""
    logger.info("\n🔐 Example 1: Basic Error Handling")

    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    try:
        assets = client.list_assets()
        logger.info(f"  ✅ Found {len(assets)} assets")
    except KaleidoError as e:
        logger.warning(f"  ⚠️  Kaleido API error: {e}")
    except Exception as e:
        logger.error(f"  ❌ Unexpected error: {type(e).__name__}: {e}")


def example_invalid_parameters():
    """Demonstrate handling invalid parameters."""
    logger.info("\n✅ Example 2: Invalid Parameter Handling")

    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    try:
        # Try to get a swap status with invalid hash
        client.get_swap_status("invalid_payment_hash_12345")
        logger.info("  Got swap status (unexpected)")
    except KaleidoError as e:
        logger.warning(f"  ⚠️  API error (expected): {e}")
    except Exception as e:
        logger.info(f"  Got error: {type(e).__name__}: {e}")


def example_validation():
    """Demonstrate input validation."""
    logger.info("\n⚠️  Example 3: Input Validation")

    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    # Validate negative amount
    logger.info("  Testing negative amount...")
    result = client.validate_amount(-100, "BTC")
    if not result["valid"]:
        logger.info(f"    ❌ Invalid: {result['errors']}")
    else:
        logger.info("    ✅ Valid (unexpected)")

    # Validate zero amount
    logger.info("  Testing zero amount...")
    result = client.validate_amount(0, "BTC")
    if not result["valid"]:
        logger.info(f"    ❌ Invalid: {result['errors']}")
    else:
        logger.info("    ✅ Valid (unexpected)")

    # Validate valid amount
    logger.info("  Testing valid amount (0.01 BTC)...")
    try:
        result = client.validate_amount(0.01, "BTC")
        if result["valid"]:
            logger.info(f"    ✅ Valid: {result['raw_amount']} atomic units")
        else:
            logger.info(f"    ❌ Invalid: {result['errors']}")
    except Exception as e:
        logger.info(f"    Could not validate: {e}")


def example_retry_strategy():
    """Demonstrate retry strategy for transient errors."""
    logger.info("\n🔄 Example 4: Retry Strategy")

    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    max_retries = 3
    retry_delay = 1.0

    for attempt in range(max_retries):
        try:
            logger.info(f"  Attempt {attempt + 1}/{max_retries}...")
            assets = client.list_assets()
            logger.info(f"  ✅ Success! Found {len(assets)} assets")
            break
        except KaleidoError as e:
            if attempt < max_retries - 1:
                logger.warning(f"  ⚠️  API error, retrying in {retry_delay}s: {e}")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error(f"  ❌ Failed after {max_retries} attempts: {e}")
        except Exception as e:
            logger.error(f"  ❌ Unexpected error: {e}")
            break


def example_invalid_pair_ticker():
    """Demonstrate handling invalid pair ticker."""
    logger.info("\n📊 Example 5: Invalid Pair Ticker")

    config = KaleidoConfig(
        base_url=API_URL,
        node_url="http://localhost:3001",
    )
    client = KaleidoClient(config)

    try:
        # Invalid pair ticker format (missing slash)
        client.execute_swap_by_pair(
            pair_ticker="BTCUSDT",  # Should be BTC/USDT
            amount=0.01,
            side="sell",
            taker_pubkey="fakepubkey",
        )
    except ValueError as e:
        logger.info(f"  ⚠️  ValueError (expected): {e}")
    except Exception as e:
        logger.info(f"  Got error: {type(e).__name__}: {e}")

    try:
        # Invalid side
        client.execute_swap_by_pair(
            pair_ticker="BTC/USDT",
            amount=0.01,
            side="hodl",  # Invalid side
            taker_pubkey="fakepubkey",
        )
    except ValueError as e:
        logger.info(f"  ⚠️  ValueError for invalid side (expected): {e}")
    except Exception as e:
        logger.info(f"  Got error: {type(e).__name__}: {e}")


def example_graceful_degradation():
    """Demonstrate graceful degradation when services are unavailable."""
    logger.info("\n🛡️  Example 6: Graceful Degradation")

    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    # Check if node is available
    if client.has_node():
        logger.info("  ✅ Node is configured")
        try:
            info = client.get_rgb_node_info()
            logger.info(f"    Node info: {info[:100]}...")
        except Exception as e:
            logger.warning(f"    Could not get node info: {e}")
    else:
        logger.info("  ℹ️  No node configured - operating in API-only mode")
        logger.info("    Some features like whitelist_trade won't be available")

    # Node operations will fail gracefully
    if not client.has_node():
        logger.info("  Skipping node-dependent operations")
    

def main():
    """Run all error handling examples."""
    logger.info("=" * 60)
    logger.info("Error Handling Best Practices Examples")
    logger.info("=" * 60)

    try:
        example_basic_error_handling()
        example_invalid_parameters()
        example_validation()
        example_retry_strategy()
        example_invalid_pair_ticker()
        example_graceful_degradation()

        logger.info("\n" + "=" * 60)
        logger.info("✅ All error handling examples completed!")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ Unexpected error in main: {e}", exc_info=True)


if __name__ == "__main__":
    main()
