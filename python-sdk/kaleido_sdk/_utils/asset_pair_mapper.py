"""
Utilities for working with trading pairs and assets.

Port of typescript-sdk/src/utils/asset-pair-mapper.ts. Keeps the same public
surface (class + ``create_asset_pair_mapper`` factory) so behaviour is
consistent across SDKs.
"""

from __future__ import annotations

import sys
from typing import TypedDict

from .._generated.api_types import TradingPairResponseModel, TradingPairsResponse

_MAX_SAFE_INTEGER = (1 << 53) - 1
"""Mirrors JavaScript's ``Number.MAX_SAFE_INTEGER`` so the unbounded
``max_order_size`` sentinel matches between SDKs."""

# Use sys.maxsize as a tighter Python-native ceiling when callers don't
# specifically care about JS interop, but default to the JS constant so the
# wire-level behaviour stays identical.
assert _MAX_SAFE_INTEGER <= sys.maxsize


class AssetPairMappedAsset(TypedDict):
    """Asset record built from one or more trading pairs.

    Named distinctly from :class:`kaleido_sdk._utils.precision.MappedAsset` so
    the two TypedDicts don't shadow each other; the precision module's
    ``MappedAsset`` is the minimal shape used for amount-conversion helpers.
    """

    asset_id: str
    ticker: str
    name: str
    precision: int
    is_active: bool
    min_order_size: int
    max_order_size: int
    trading_pairs: list[str]  # Asset IDs this asset can trade with
    protocol_ids: dict[str, str]


class AssetPairMapper:
    """Index a :class:`TradingPairsResponse` for ticker / asset-id lookups.

    The original TypeScript implementation collapses both sides of every
    active pair into one row per asset, accumulating the union of trading
    partners and the tightest min/max order size seen across pairs. This port
    preserves that behaviour line-for-line.
    """

    def __init__(self, pairs_response: TradingPairsResponse) -> None:
        self._pairs: list[TradingPairResponseModel] = list(pairs_response.pairs)
        self._asset_map: dict[str, AssetPairMappedAsset] = {}
        self._ticker_map: dict[str, str] = {}  # ticker (uppercase) -> asset_id
        self._build_asset_map()

    # ------------------------------------------------------------------ build

    def _build_asset_map(self) -> None:
        for pair in self._pairs:
            if not pair.is_active:
                continue

            base_endpoint = pair.base.endpoints[0] if pair.base.endpoints else None
            quote_endpoint = pair.quote.endpoints[0] if pair.quote.endpoints else None

            self._process_asset(
                asset_id=pair.base.asset_id,
                ticker=pair.base.ticker,
                name=pair.base.name,
                precision=pair.base.precision,
                is_active=pair.is_active,
                min_order_size=base_endpoint.min_amount if base_endpoint else 0,
                max_order_size=(
                    base_endpoint.max_amount if base_endpoint else _MAX_SAFE_INTEGER
                ),
                trading_partner=pair.quote.asset_id,
                protocol_ids=dict(pair.base.protocol_ids or {}),
            )

            self._process_asset(
                asset_id=pair.quote.asset_id,
                ticker=pair.quote.ticker,
                name=pair.quote.name,
                precision=pair.quote.precision,
                is_active=pair.is_active,
                min_order_size=quote_endpoint.min_amount if quote_endpoint else 0,
                max_order_size=(
                    quote_endpoint.max_amount if quote_endpoint else _MAX_SAFE_INTEGER
                ),
                trading_partner=pair.base.asset_id,
                protocol_ids=dict(pair.quote.protocol_ids or {}),
            )

    def _process_asset(
        self,
        *,
        asset_id: str,
        ticker: str,
        name: str,
        precision: int,
        is_active: bool,
        min_order_size: int,
        max_order_size: int,
        trading_partner: str,
        protocol_ids: dict[str, str],
    ) -> None:
        self._ticker_map[ticker.upper()] = asset_id
        existing = self._asset_map.get(asset_id)

        if existing is not None:
            if trading_partner not in existing["trading_pairs"]:
                existing["trading_pairs"].append(trading_partner)
            # Narrow towards the tightest constraints observed across pairs:
            # take the LARGEST min and the SMALLEST max (matches TS impl).
            if min_order_size > 0 and min_order_size > existing["min_order_size"]:
                existing["min_order_size"] = min_order_size
            if (
                max_order_size < _MAX_SAFE_INTEGER
                and max_order_size < existing["max_order_size"]
            ):
                existing["max_order_size"] = max_order_size
            return

        self._asset_map[asset_id] = AssetPairMappedAsset(
            asset_id=asset_id,
            ticker=ticker,
            name=name,
            precision=precision,
            is_active=is_active,
            min_order_size=min_order_size,
            max_order_size=max_order_size,
            trading_pairs=[trading_partner],
            protocol_ids=protocol_ids,
        )

    # ------------------------------------------------------------------- API

    def find_by_ticker(self, ticker: str) -> AssetPairMappedAsset | None:
        asset_id = self._ticker_map.get(ticker.upper())
        if asset_id is None:
            return None
        return self._asset_map.get(asset_id)

    def find_by_id(self, asset_id: str) -> AssetPairMappedAsset | None:
        return self._asset_map.get(asset_id)

    def get_all_assets(self) -> list[AssetPairMappedAsset]:
        return list(self._asset_map.values())

    def can_trade(self, from_asset_id: str, to_asset_id: str) -> bool:
        from_asset = self._asset_map.get(from_asset_id)
        return from_asset is not None and to_asset_id in from_asset["trading_pairs"]

    def can_trade_by_ticker(self, from_ticker: str, to_ticker: str) -> bool:
        from_asset = self.find_by_ticker(from_ticker)
        to_asset = self.find_by_ticker(to_ticker)
        if from_asset is None or to_asset is None:
            return False
        return self.can_trade(from_asset["asset_id"], to_asset["asset_id"])

    def get_trading_partners(self, asset_id: str) -> list[AssetPairMappedAsset]:
        asset = self._asset_map.get(asset_id)
        if asset is None:
            return []
        partners: list[AssetPairMappedAsset] = []
        for partner_id in asset["trading_pairs"]:
            partner = self._asset_map.get(partner_id)
            if partner is not None:
                partners.append(partner)
        return partners

    def get_active_pairs(self) -> list[TradingPairResponseModel]:
        return [pair for pair in self._pairs if pair.is_active]

    def find_pair_by_tickers(
        self, base_ticker: str, quote_ticker: str
    ) -> TradingPairResponseModel | None:
        upper_base = base_ticker.upper()
        upper_quote = quote_ticker.upper()
        for pair in self._pairs:
            if (
                pair.base.ticker.upper() == upper_base
                and pair.quote.ticker.upper() == upper_quote
            ):
                return pair
        return None


def create_asset_pair_mapper(pairs_response: TradingPairsResponse) -> AssetPairMapper:
    """Factory mirroring the TypeScript ``createAssetPairMapper`` helper."""
    return AssetPairMapper(pairs_response)
