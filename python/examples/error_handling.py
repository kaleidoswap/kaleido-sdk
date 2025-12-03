#!/usr/bin/env python3
"""
Error Handling Best Practices

This example demonstrates:
1. Proper exception handling
2. Retry strategies
3. Timeout handling
4. Validation errors
5. Network error recovery
"""

import asyncio
import logging
import os
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.exceptions import (
    NetworkError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")
API_KEY = os.getenv("KALEIDO_API_KEY", "invalid_key_for_demo")


async def example_authentication_error():
    """Demonstrate handling authentication errors."""
    logger.info("\n🔐 Example 1: Authentication Error Handling")

    # Use an invalid API key
    client = KaleidoClient(base_url=API_URL, api_key="invalid_key_123")

    try:
        await client.list_assets()
    except AuthenticationError as e:
        logger.warning(f"  ⚠️  Authentication failed (expected): {e}")
        logger.info("  💡 Solution: Check your API key and ensure it's valid")
    except Exception as e:
        logger.info(
            f"  Note: Got {type(e).__name__} instead (API might not require auth)"
        )
    finally:
        await client.close()


async def example_validation_error():
    """Demonstrate handling validation errors."""
    logger.info("\n✅ Example 2: Validation Error Handling")

    client = KaleidoClient(base_url=API_URL)

    try:
        # Try to get a quote with invalid parameters
        await client.get_quote(
            from_asset="INVALID_ASSET",
            to_asset="ALSO_INVALID",
            from_amount=-1000,  # Invalid negative amount
        )
    except ValidationError as e:
        logger.warning(f"  ⚠️  Validation error (expected): {e}")
        logger.info("  💡 Solution: Validate input parameters before making API calls")
    except Exception as e:
        logger.info(f"  Got error: {type(e).__name__}: {e}")
    finally:
        await client.close()


async def example_timeout_handling():
    """Demonstrate handling timeout errors."""
    logger.info("\n⏱️  Example 3: Timeout Error Handling")

    client = KaleidoClient(
        base_url=API_URL,
        timeout=0.001,  # Very short timeout to trigger error
    )

    try:
        await client.list_assets()
    except NetworkError as e:
        logger.warning(f"  ⚠️  Network/timeout error (expected): {e}")
        logger.info("  💡 Solution: Increase timeout or check network connectivity")
    except Exception as e:
        logger.info(f"  Got error: {type(e).__name__}: {e}")
    finally:
        await client.close()


async def example_retry_strategy():
    """Demonstrate retry strategy for transient errors."""
    logger.info("\n🔄 Example 4: Retry Strategy")

    client = KaleidoClient(base_url=API_URL)

    max_retries = 3
    retry_delay = 1.0

    for attempt in range(max_retries):
        try:
            logger.info(f"  Attempt {attempt + 1}/{max_retries}...")
            assets = await client.list_assets()
            logger.info(f"  ✅ Success! Found {len(assets.assets)} assets")
            break
        except NetworkError as e:
            if attempt < max_retries - 1:
                logger.warning(f"  ⚠️  Network error, retrying in {retry_delay}s: {e}")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error(f"  ❌ Failed after {max_retries} attempts: {e}")
        except Exception as e:
            logger.error(f"  ❌ Unexpected error: {e}")
            break

    await client.close()


async def example_rate_limit_handling():
    """Demonstrate handling rate limit errors."""
    logger.info("\n🚦 Example 5: Rate Limit Handling")

    client = KaleidoClient(base_url=API_URL)

    try:
        # Make many requests quickly
        for i in range(5):
            logger.info(f"  Request {i + 1}...")
            await client.list_assets()
            await asyncio.sleep(0.1)

        logger.info("  ✅ All requests succeeded")

    except RateLimitError as e:
        logger.warning(f"  ⚠️  Rate limit exceeded: {e}")
        logger.info(
            "  💡 Solution: Implement request throttling or wait before retrying"
        )
    except Exception as e:
        logger.info(f"  Note: {type(e).__name__}: {e}")
    finally:
        await client.close()


async def example_swap_timeout_handling():
    """Demonstrate handling swap timeout errors."""
    logger.info("\n⏳ Example 6: Swap Timeout Handling")

    client = KaleidoClient(
        base_url="http://localhost:8000", node_url="http://localhost:3001"
    )

    try:
        # Try to wait for a non-existent swap with short timeout
        await client.wait_for_swap_completion(
            payment_hash="nonexistent_hash_12345",
            timeout=5.0,  # 5 second timeout
            poll_interval=1.0,
        )
    except TimeoutError as e:
        logger.warning(f"  ⚠️  Swap timeout (expected): {e}")
        logger.info("  💡 Solution: Increase timeout or check swap status manually")
    except Exception as e:
        logger.info(f"  Got error: {type(e).__name__}: {e}")
    finally:
        await client.close()


async def example_proper_cleanup():
    """Demonstrate proper resource cleanup."""
    logger.info("\n🧹 Example 7: Proper Resource Cleanup")

    client = None
    try:
        client = KaleidoClient(base_url=API_URL)
        assets = await client.list_assets()
        logger.info(f"  ✅ Got {len(assets.assets)} assets")
    except Exception as e:
        logger.error(f"  ❌ Error: {e}")
    finally:
        if client:
            await client.close()
            logger.info("  ✅ Client properly closed")


async def example_context_manager():
    """Demonstrate using context manager for automatic cleanup."""
    logger.info("\n🎯 Example 8: Using Context Manager (Best Practice)")

    # Using async context manager ensures proper cleanup
    async with KaleidoClient(base_url=API_URL) as client:
        try:
            assets = await client.list_assets()
            logger.info(f"  ✅ Got {len(assets.assets)} assets")
        except Exception as e:
            logger.error(f"  ❌ Error: {e}")

    logger.info("  ✅ Client automatically closed by context manager")


async def main():
    """Run all error handling examples."""
    logger.info("=" * 60)
    logger.info("Error Handling Best Practices Examples")
    logger.info("=" * 60)

    try:
        await example_authentication_error()
        await example_validation_error()
        await example_timeout_handling()
        await example_retry_strategy()
        await example_rate_limit_handling()
        await example_swap_timeout_handling()
        await example_proper_cleanup()
        await example_context_manager()

        logger.info("\n" + "=" * 60)
        logger.info("✅ All error handling examples completed!")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ Unexpected error in main: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main())
