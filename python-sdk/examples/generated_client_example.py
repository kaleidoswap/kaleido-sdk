#!/usr/bin/env python3
"""
Example usage of auto-generated Kaleidoswap API clients.

This demonstrates how to use the openapi-python-client generated code.
"""

import asyncio
from kaleidoswap_sdk.generated.maker_client_generated.client import Client
from kaleidoswap_sdk.generated.maker_client_generated.api.market import (
    list_assets,
    get_quote,
)
from kaleidoswap_sdk.generated.maker_client_generated.models import PairQuoteRequest


async def example_list_assets():
    """List all available assets."""
    print("📋 Listing all assets...")
    
    # Create client
    client = Client(base_url="http://localhost:8000")
    
    # Make request using the generated function
    response = await list_assets.asyncio(client=client)
    
    if response:
        print(f"\n✅ Found {len(response.assets)} assets:")
        for asset in response.assets[:5]:  # Show first 5
            print(f"  • {asset.ticker:6s} - {asset.name}")
            if hasattr(asset, 'layers'):
                print(f"    Layers: {', '.join(asset.layers)}")
    else:
        print("❌ No response received")


async def example_get_quote():
    """Get a swap quote."""
    print("\n💱 Getting swap quote...")
    
    client = Client(base_url="http://localhost:8000")
    
    # Create request with Pydantic model
    request = PairQuoteRequest(
        from_asset="BTC",
        to_asset="USDT",
        from_amount=100000,  # 100k sats
        from_layer="BTC_LN",
        to_layer="RGB_LN"
    )
    
    # Make request
    response = await get_quote.asyncio(client=client, body=request)
    
    if response:
        print(f"\n✅ Quote received:")
        print(f"  From: {request.from_amount} sats")
        print(f"  To: {response.to_amount} USDT")
        print(f"  Rate: {response.rate}")
    else:
        print("❌ No quote available")


async def example_error_handling():
    """Demonstrate error handling."""
    print("\n⚠️  Error handling example...")
    
    client = Client(
        base_url="http://localhost:8000",
        raise_on_unexpected_status=True  # Raise on errors
    )
    
    try:
        # Use _detailed variant to get full response info
        response = await list_assets.asyncio_detailed(client=client)
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Headers: {dict(response.headers)}")
        
        if response.parsed:
            print(f"✅ Assets: {len(response.parsed.assets)}")
            
    except Exception as e:
        print(f"❌ Error occurred: {e}")


async def main():
    """Run all examples."""
    print("=" * 60)
    print("Kaleidoswap SDK - Auto-Generated Client Examples")
    print("=" * 60)
    
    try:
        await example_list_assets()
        # await example_get_quote()  # Uncomment if API is available
        await example_error_handling()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("✨ Examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
