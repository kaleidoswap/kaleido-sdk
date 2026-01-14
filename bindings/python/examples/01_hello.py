#!/usr/bin/env python3
"""
01 - Hello Kaleidoswap

The simplest example: connect to the API and list available assets.
"""

import os

from kaleidoswap import KaleidoClient, KaleidoConfig
from kaleidoswap.utils import display_asset

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")


def main():
    print("=" * 50)
    print("Kaleidoswap SDK - Hello Example")
    print("=" * 50)

    # Create client
    config = KaleidoConfig(base_url=API_URL)
    client = KaleidoClient(config)

    # List assets
    print(f"\n📦 Available Assets on {API_URL}:\n")
    assets = client.list_assets()

    for asset in assets:
        print(f"  • {display_asset(asset)}")

    print(f"\n✅ Found {len(assets)} assets")


if __name__ == "__main__":
    main()
