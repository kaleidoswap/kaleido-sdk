"""
Test utilities for Kaleidoswap SDK tests.

"""

from __future__ import annotations

from kaleidoswap_sdk import (
    KaleidoClient,
    Layer,
    PairQuoteRequest,
    PairQuoteResponse,
    SwapLegInput,
    SwapRequest,
    SwapResponse,
)


async def get_fresh_quote(
    client: KaleidoClient,
    *,
    from_asset: str = "BTC",
    to_asset: str = "USDT",
    from_layer: Layer = Layer.btc_ln,
    to_layer: Layer = Layer.rgb_ln,
    from_amount: int = 4_100_000,  # 4.1M sats
) -> PairQuoteResponse:
    """
    Get a fresh quote from the maker API (BTC -> RGB asset by default).

    Args:
        client: KaleidoClient with maker configured
        from_asset: Source asset ticker (default: "BTC")
        to_asset: Destination RGB asset ticker (default: "USDT")
        from_amount: Amount in smallest unit, sats (default: 4_100_000)

    Returns:
        PairQuoteResponse from client.maker.get_quote()
    """
    request = PairQuoteRequest(
        from_asset=SwapLegInput(
            asset_id=from_asset,
            layer=from_layer,
            amount=from_amount,
        ),
        to_asset=SwapLegInput(
            asset_id=to_asset,
            layer=to_layer,
        ),
    )
    return await client.maker.get_quote(request)


async def initiate_swap(
    client: KaleidoClient,
    quote: PairQuoteResponse,
) -> SwapResponse:
    """
    Initialize a swap from a quote.

    Modeled after swaps_utils.py:541 (initiate_swap)

    Args:
        client: KaleidoClient instance
        quote: Quote response from get_fresh_quote

    Returns:
        SwapResponse with swapstring and payment_hash
    """
    swap_request = SwapRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset.asset_id,
        from_amount=quote.from_asset.amount or 0,
        to_asset=quote.to_asset.asset_id,
        to_amount=quote.to_asset.amount or 0,
    )
    return await client.maker.init_swap(swap_request)
