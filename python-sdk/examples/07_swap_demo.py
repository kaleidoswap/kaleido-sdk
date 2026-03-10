#!/usr/bin/env python3
"""
Example 07: Swap Demo

Full swap-order lifecycle demo: quote -> create order -> wait for terminal state.
"""

import asyncio
import logging

from kaleidoswap_sdk import (
    CreateSwapOrderRequest,
    KaleidoClient,
    Layer,
    PairQuoteRequest,
    ReceiverAddress,
    ReceiverAddressFormat,
    SwapCompletionOptions,
    SwapLegInput,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)-8s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)


async def main() -> None:
    client = KaleidoClient.create(base_url="https://api.staging.kaleidoswap.com")

    pairs = await client.maker.list_pairs()
    pair = next((p for p in pairs.pairs if p.routes), None)
    if pair is None:
        print("No suitable pair found")
        return

    route = pair.routes[0]

    quote = await client.maker.get_quote(
        PairQuoteRequest(
            from_asset=SwapLegInput(
                asset_id=pair.base.ticker,
                layer=Layer(route.from_layer),
                amount=100000,
            ),
            to_asset=SwapLegInput(
                asset_id=pair.quote.ticker,
                layer=Layer(route.to_layer),
            ),
        )
    )

    create_req = CreateSwapOrderRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset,
        to_asset=quote.to_asset,
        receiver_address=ReceiverAddress(
            address="bc1qexampledestinationaddress0000000000000000",
            format=ReceiverAddressFormat.BTC_ADDRESS,
        ),
    )

    try:
        created = await client.maker.create_swap_order(create_req)
        print(f"Order created: {created.id}")

        final_order = await client.maker.wait_for_swap_completion(
            created.id,
            SwapCompletionOptions(
                timeout=60,
                poll_interval=5.0,
                on_status_update=lambda status: print(f"status -> {status}"),
            ),
        )
        print(f"Final status: {final_order.status}")
    except Exception as exc:
        print("Swap demo could not complete in this environment:")
        print(f"  {exc}")


if __name__ == "__main__":
    asyncio.run(main())
