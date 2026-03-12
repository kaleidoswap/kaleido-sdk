#!/usr/bin/env python3
"""
Example 09: Error Handling

Demonstrates handling the SDK's typed exceptions.
"""

import asyncio

from kaleido_sdk import (
    APIError,
    KaleidoClient,
    KaleidoError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    ValidationError,
)


async def main() -> None:
    # Intentionally invalid endpoint for demo purposes.
    client = KaleidoClient.create(base_url="http://invalid.nonexistent.kaleidoswap.local")

    try:
        await client.maker.list_assets()
    except ValidationError as exc:
        print(f"Validation error: {exc}")
    except NotFoundError as exc:
        print(f"Not found: {exc}")
    except RateLimitError as exc:
        print(f"Rate limited: {exc}")
    except NetworkError as exc:
        print(f"Network issue: {exc}")
    except APIError as exc:
        print(f"API error {exc.status_code}: {exc}")
    except KaleidoError as exc:
        print(f"SDK error ({exc.code}): {exc}")


if __name__ == "__main__":
    asyncio.run(main())
