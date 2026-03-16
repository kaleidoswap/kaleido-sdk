#!/usr/bin/env python3
"""
Example 09: Error Handling

Demonstrates typed exception handling for:
1. API errors from a non-existent order
2. Validation errors from an invalid quote request
3. Network errors from an invalid host
"""

import asyncio
import logging
import os

from kaleido_sdk import (
    APIError,
    KaleidoClient,
    KaleidoError,
    Layer,
    NetworkError,
    NotFoundError,
    PairQuoteRequest,
    RateLimitError,
    SwapLegInput,
    SwapOrderStatusRequest,
    TimeoutError,
    ValidationError,
)

API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")

# ---------------------------------------------------------------------------
# Logging setup (application's responsibility — the SDK never does this)
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)


def describe_error(error: Exception) -> str:
    """Return a compact description for any SDK exception."""
    if isinstance(error, ValidationError):
        return f"VALIDATION: {error}"
    if isinstance(error, NotFoundError):
        return f"NOT_FOUND: {error}"
    if isinstance(error, RateLimitError):
        return f"RATE_LIMIT: {error}"
    if isinstance(error, NetworkError):
        return f"NETWORK: {error}"
    if isinstance(error, TimeoutError):
        return f"TIMEOUT: {error}"
    if isinstance(error, APIError):
        return f"API({error.status_code}): {error}"
    if isinstance(error, KaleidoError):
        return f"SDK({error.code}): {error}"
    return f"UNKNOWN: {error}"


async def main() -> None:
    """Main entry point."""
    client = KaleidoClient.create(
        base_url=API_URL,
        log_level=logging.DEBUG,
    )

    print(f"Maker API: {API_URL}")
    print("-" * 40)

    print("\n1. Requesting status for a non-existent order...")
    try:
        await client.maker.get_swap_order_status(
            SwapOrderStatusRequest(order_id="non-existent-order-id")
        )
    except Exception as error:
        print(f"  {describe_error(error)}")

    print("\n2. Sending an invalid quote request...")
    try:
        await client.maker.get_quote(
            PairQuoteRequest(
                from_asset=SwapLegInput(
                    asset_id="BTC",
                    layer=Layer.BTC_LN,
                    amount=-100,
                ),
                to_asset=SwapLegInput(
                    asset_id="USDT",
                    layer=Layer.RGB_LN,
                ),
            )
        )
    except Exception as error:
        print(f"  {describe_error(error)}")

    print("\n3. Simulating a network failure...")
    bad_client = KaleidoClient.create(
        base_url="http://invalid-host-that-does-not-exist.local:9999",
        timeout=2.0,
        log_level=logging.DEBUG,
    )
    try:
        await bad_client.maker.list_assets()
    except Exception as error:
        print(f"  {describe_error(error)}")


if __name__ == "__main__":
    asyncio.run(main())
