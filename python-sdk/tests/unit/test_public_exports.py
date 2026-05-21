"""
Surface-area tests for the ``kaleido_sdk`` public API.

Covers the ``AssetPairMapper`` utility and the cross-SDK type-name
aliases (Batch F) re-exported from the package root. Counterpart of
``typescript-sdk/tests/unit/public-exports.test.ts``.
"""

from kaleido_sdk._generated.api_types import (
    TradableAssetResponseModel,
    TradingLimits,
    TradingPairResponseModel,
    TradingPairsResponse,
)


class TestAssetPairMapper:
    """Sanity tests for the ported AssetPairMapper utility."""

    def _build_pairs_response(self) -> TradingPairsResponse:
        btc = TradableAssetResponseModel(
            ticker="BTC",
            asset_id="asset_btc",
            name="Bitcoin",
            precision=8,
            protocol_ids={"native": "btc"},
            endpoints=[
                TradingLimits(layer="BTC_LN", min_amount=1000, max_amount=1_000_000_000)
            ],
        )
        usdt = TradableAssetResponseModel(
            ticker="USDT",
            asset_id="asset_usdt",
            name="Tether",
            precision=6,
            protocol_ids={"rgb": "usdt-rgb"},
            endpoints=[TradingLimits(layer="RGB_LN", min_amount=1, max_amount=10_000_000)],
        )

        pair = TradingPairResponseModel(
            id="pair_btc_usdt",
            base=btc,
            quote=usdt,
            ticker="BTC/USDT",
            base_asset="BTC",
            base_asset_id="asset_btc",
            quote_asset="USDT",
            quote_asset_id="asset_usdt",
            is_active=True,
        )

        return TradingPairsResponse(
            pairs=[pair], total=1, limit=100, offset=0, timestamp=0
        )

    def test_find_by_ticker_and_id(self) -> None:
        from kaleido_sdk import create_asset_pair_mapper

        mapper = create_asset_pair_mapper(self._build_pairs_response())

        btc = mapper.find_by_ticker("btc")  # case-insensitive
        assert btc is not None
        assert btc["asset_id"] == "asset_btc"
        assert btc["min_order_size"] == 1000
        assert btc["max_order_size"] == 1_000_000_000

        assert mapper.find_by_id("asset_usdt") is not None
        assert mapper.find_by_id("asset_missing") is None

    def test_can_trade_and_partners(self) -> None:
        from kaleido_sdk import create_asset_pair_mapper

        mapper = create_asset_pair_mapper(self._build_pairs_response())

        assert mapper.can_trade("asset_btc", "asset_usdt") is True
        assert mapper.can_trade("asset_btc", "asset_other") is False
        assert mapper.can_trade_by_ticker("BTC", "USDT") is True

        partners = mapper.get_trading_partners("asset_btc")
        assert len(partners) == 1
        assert partners[0]["asset_id"] == "asset_usdt"

    def test_find_pair_by_tickers_and_active(self) -> None:
        from kaleido_sdk import create_asset_pair_mapper

        mapper = create_asset_pair_mapper(self._build_pairs_response())

        assert mapper.find_pair_by_tickers("BTC", "USDT") is not None
        assert mapper.find_pair_by_tickers("USDT", "BTC") is None  # direction matters
        assert len(mapper.get_active_pairs()) == 1


class TestCrossSdkTypeNameAliases:
    """Batch F — type-name aliases keep call sites portable across SDKs.

    Each alias must resolve to the SAME underlying class as its canonical
    name; this guards against future regenerations dropping the re-export
    or rebinding it to a stale class.
    """

    def test_estimate_lsp_fees_aliases_resolve_to_python_canonical(self) -> None:
        from kaleido_sdk import (
            EstimateFeesRequest,
            EstimateFeesResponse,
            EstimateLspFeesRequest,
            EstimateLspFeesResponse,
        )

        assert EstimateLspFeesRequest is EstimateFeesRequest
        assert EstimateLspFeesResponse is EstimateFeesResponse

    def test_get_lsp_order_response_alias(self) -> None:
        from kaleido_sdk import ChannelOrderResponse, GetLspOrderResponse

        assert GetLspOrderResponse is ChannelOrderResponse

    def test_create_ln_invoice_response_alias(self) -> None:
        from kaleido_sdk.rln import CreateLNInvoiceResponse, LNInvoiceResponse

        assert CreateLNInvoiceResponse is LNInvoiceResponse

    def test_maker_execute_response_alias(self) -> None:
        from kaleido_sdk.rln import EmptyResponse, MakerExecuteResponse

        assert MakerExecuteResponse is EmptyResponse

    def test_node_network_info_response_alias(self) -> None:
        from kaleido_sdk.rln import NetworkInfoResponse, NodeNetworkInfoResponse

        assert NodeNetworkInfoResponse is NetworkInfoResponse
