#!/usr/bin/env python3
"""
Complete Atomic Swap Flow

This example demonstrates how to:
1. Get a quote for a swap
2. Initialize a maker swap
3. Whitelist the trade on the taker node
4. Execute the swap
5. Monitor swap status until completion
"""

import asyncio
import logging
import os
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import SwapRequest, TakerRequest, ConfirmSwapRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")
API_KEY = os.getenv("KALEIDO_API_KEY")


async def main():
    """Execute a complete atomic swap flow."""

    # Initialize client
    client = KaleidoClient(base_url=API_URL, node_url=NODE_URL, api_key=API_KEY)

    try:
        # Step 1: Get available assets
        logger.info("📋 Step 1: Fetching available assets...")
        assets = await client.list_assets()

        if len(assets.assets) < 2:
            logger.error("Need at least 2 assets for a swap")
            return

        from_asset = assets.assets[0].asset_id
        to_asset = assets.assets[1].asset_id
        from_amount = 21000000  # 0.21 BTC in satoshis

        logger.info(f"  From: {from_asset}")
        logger.info(f"  To: {to_asset}")
        logger.info(f"  Amount: {from_amount}")

        # Step 2: Get a quote via WebSocket (faster)
        logger.info("\n💱 Step 2: Getting quote via WebSocket...")
        quote = await client.get_quote_websocket(
            from_asset=from_asset, to_asset=to_asset, from_amount=from_amount
        )

        logger.info("  ✅ Quote received:")
        logger.info(f"     RFQ ID: {quote.rfq_id}")
        logger.info(f"     Price: {quote.price}")
        logger.info(f"     To Amount: {quote.to_amount}")
        logger.info(f"     Fee: {quote.fee.final_fee}")
        logger.info(f"     Expires: {quote.expires_at}")

        # Step 3: Initialize the swap
        logger.info("\n🔄 Step 3: Initializing swap...")
        swap_request = SwapRequest(
            rfq_id=quote.rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=from_amount,
            to_amount=quote.to_amount,
        )

        init_response = await client.init_maker_swap(swap_request)
        logger.info("  ✅ Swap initialized:")
        logger.info(f"     Swapstring: {init_response.swapstring}")
        logger.info(f"     Payment Hash: {init_response.payment_hash}")

        # Step 4: Whitelist trade on taker node
        logger.info("\n🔐 Step 4: Whitelisting trade on taker node...")
        taker_request = TakerRequest(swapstring=init_response.swapstring)
        await client.whitelist_trade(taker_request)
        logger.info("  ✅ Trade whitelisted")

        # Step 5: Get taker pubkey
        logger.info("\n🔑 Step 5: Getting taker node info...")
        node_info = await client.get_node_info()
        taker_pubkey = node_info.pubkey
        logger.info(f"  Taker pubkey: {taker_pubkey}")

        # Step 6: Execute the swap
        logger.info("\n⚡ Step 6: Executing swap...")
        confirm_request = ConfirmSwapRequest(
            swapstring=init_response.swapstring,
            payment_hash=init_response.payment_hash,
            taker_pubkey=taker_pubkey,
        )

        execute_response = await client.execute_maker_swap(confirm_request)
        logger.info("  ✅ Swap executed:")
        logger.info(f"     Status: {execute_response.status}")
        logger.info(f"     Message: {execute_response.message}")

        # Step 7: Wait for swap completion
        logger.info("\n⏳ Step 7: Waiting for swap completion...")
        final_status = await client.wait_for_swap_completion(
            payment_hash=init_response.payment_hash, timeout=180.0, poll_interval=2.0
        )

        logger.info("  ✅ Swap completed!")
        logger.info(f"     Status: {final_status.status}")
        logger.info(f"     Completed at: {final_status.completed_at}")
        logger.info(f"     From amount: {final_status.qty_from}")
        logger.info(f"     To amount: {final_status.qty_to}")

        logger.info("\n🎉 Atomic swap completed successfully!")

    except TimeoutError as e:
        logger.error(f"❌ Swap timed out: {e}")
    except Exception as e:
        logger.error(f"❌ Error during swap: {e}", exc_info=True)

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
