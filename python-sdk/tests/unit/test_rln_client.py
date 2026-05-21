"""
Unit tests for ``kaleido_sdk._rln_client.RlnClient`` and its request models.

Counterpart of ``typescript-sdk/tests/unit/rln-client.test.ts``. Covers
generated-model regression cases (create_utxos, decode_rgb_invoice,
maker_execute, sync_rgb_wallet, list_assets enum serialization, IFA
parsing) and unlock-wallet timeout handling.
"""

from unittest.mock import AsyncMock, patch

import pytest

from kaleido_sdk import KaleidoClient, TimeoutError
from kaleido_sdk.rln import (
    AssetBalanceResponse,
    AssetSchema,
    CreateUtxosRequest,
    DecodeRGBInvoiceRequest,
    DecodeRGBInvoiceResponse,
    EmptyResponse,
    ListAssetsRequest,
    MakerExecuteRequest,
    SyncKeychain1,
    SyncOptions,
    SyncRequest,
    SyncStrategy,
)


class TestCreateUtxosFeeRate:
    """create_utxos must serialize the current generated request shape."""

    async def test_fee_rate_sent_as_int(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = {}
            await rln.create_utxos(
                CreateUtxosRequest(up_to=True, num=5, fee_rate=1, skip_sync=False)
            )

            sent = mock.call_args[0][1]
            assert isinstance(sent, dict)
            assert isinstance(sent["fee_rate"], int)
            assert sent["fee_rate"] == 1

    async def test_fee_rate_none_omitted(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = {}
            await rln.create_utxos(
                CreateUtxosRequest(up_to=True, num=5, fee_rate=1, skip_sync=False)
            )

            sent = mock.call_args[0][1]
            assert "size" not in sent
            assert sent["fee_rate"] == 1
            assert sent["skip_sync"] is False

    async def test_fee_rate_whole_number(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = {}
            await rln.create_utxos(CreateUtxosRequest(up_to=False, fee_rate=4, skip_sync=False))

            sent = mock.call_args[0][1]
            assert sent["fee_rate"] == 4
            assert isinstance(sent["fee_rate"], int)


class TestDecodeRgbInvoiceType:
    """decode_rgb_invoice must return DecodeRGBInvoiceResponse."""

    async def test_returns_correct_type(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        fake = {
            "recipient_id": "utxob:abc",
            "recipient_type": "Witness",
            "asset_id": "rgb:2dk...",
            "assignment": {"type": "Any"},
            "network": "Regtest",
            "expiration_timestamp": 1700000000,
            "transport_endpoints": ["rpc://proxy.example.com/json-rpc"],
        }
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = fake
            result = await rln.decode_rgb_invoice(DecodeRGBInvoiceRequest(invoice="rgb:..."))

        assert isinstance(result, DecodeRGBInvoiceResponse)
        assert result.recipient_id == "utxob:abc"
        assert result.transport_endpoints == ["rpc://proxy.example.com/json-rpc"]

    def test_decode_response_has_no_invoice_field(self) -> None:
        assert "invoice" not in DecodeRGBInvoiceResponse.model_fields


class TestMakerExecuteType:
    """maker_execute must return EmptyResponse."""

    async def test_returns_empty_response(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        fake = {}
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = fake
            result = await rln.maker_execute(
                MakerExecuteRequest(swapstring="s", payment_secret="p", taker_pubkey="t")
            )

        assert isinstance(result, EmptyResponse)

    def test_type_exported_from_package(self) -> None:
        from kaleido_sdk.rln import EmptyResponse as Exported

        assert Exported is EmptyResponse


class TestSyncRgbWalletRequest:
    """sync_rgb_wallet must send the regenerated /sync request body."""

    async def test_sends_default_sync_request(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = {}
            await rln.sync_rgb_wallet()

            path, sent = mock.call_args[0]
            assert path == "/sync"
            assert isinstance(sent, SyncRequest)
            assert sent.model_dump(mode="json") == {
                "options": {"keychain": "Colored", "strategy": "FastSync"}
            }

    async def test_accepts_explicit_sync_request(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        request = SyncRequest(
            options=SyncOptions(
                keychain=SyncKeychain1(Vanilla={"lookback": 20}),
                strategy=SyncStrategy.FULL_SCAN,
            )
        )

        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = {}
            await rln.sync_rgb_wallet(request)

            assert mock.call_args[0] == ("/sync", request)


class TestListAssetsEnumSerialization:
    """filter_asset_schemas enums must serialize to string values."""

    def test_json_mode_serializes_enums(self) -> None:
        req = ListAssetsRequest(filter_asset_schemas=[AssetSchema.NIA, AssetSchema.UDA])
        dumped = req.model_dump(mode="json", exclude_none=True)
        for v in dumped["filter_asset_schemas"]:
            assert isinstance(v, str), f"Expected str, got {type(v)}"

    def test_python_mode_keeps_enum_objects(self) -> None:
        """Confirm mode='python' (old default) keeps Enum objects -- the original bug."""
        req = ListAssetsRequest(filter_asset_schemas=[AssetSchema.NIA])
        dumped = req.model_dump(exclude_none=True)
        assert isinstance(dumped["filter_asset_schemas"][0], AssetSchema)

    async def test_node_post_serializes_enums(self, client_with_node: KaleidoClient) -> None:
        """HttpClient.node_post must produce JSON-safe dicts for enum fields."""
        http = client_with_node.rln._http
        body = ListAssetsRequest(filter_asset_schemas=[AssetSchema.NIA])

        with patch.object(http, "_request", new_callable=AsyncMock) as mock:
            mock.return_value = {"nia": [], "uda": [], "cfa": []}
            await http.node_post("/listassets", body)

            json_payload = mock.call_args[1]["json"]
            assert json_payload["filter_asset_schemas"] == ["Nia"]


class TestListAssetsIfaParsing:
    """IFA assets must survive list_assets response normalization."""

    async def test_list_assets_preserves_ifa_entries(self, client_with_node: KaleidoClient) -> None:
        rln = client_with_node.rln
        fake = {
            "nia": [],
            "uda": [],
            "cfa": [],
            "ifa": [
                {
                    "asset_id": "rgb1ifaassetid",
                    "ticker": "IFA",
                    "name": "IFA Asset",
                    "details": None,
                    "precision": 0,
                    "initial_supply": 1,
                    "max_supply": 1,
                    "known_circulating_supply": 1,
                    "timestamp": 1700000000,
                    "added_at": 1700000001,
                    "balance": {
                        "settled": 1,
                        "future": 0,
                        "spendable": 1,
                        "offchain_outbound": 0,
                        "offchain_inbound": 0,
                    },
                    "media": None,
                    "reject_list_url": None,
                }
            ],
        }

        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.return_value = fake
            result = await rln.list_assets()

        assert len(result.ifa) == 1
        assert isinstance(result.ifa[0].balance, AssetBalanceResponse)
        assert result.ifa[0].__class__.__name__ == "AssetIFA"
        assert result.ifa[0].ticker == "IFA"


class TestUnlockWalletTimeoutHandling:
    """unlock_wallet should surface a clear hint on timeout."""

    async def test_unlock_timeout_contains_resync_hint(
        self, client_with_node: KaleidoClient
    ) -> None:
        rln = client_with_node.rln
        with patch.object(rln._http, "node_post", new_callable=AsyncMock) as mock:
            mock.side_effect = TimeoutError("Request timed out")

            with pytest.raises(TimeoutError, match="it may still be syncing"):
                await rln.unlock_wallet({"password": "secret"})
