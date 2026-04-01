"""
Tests for KaleidoClient.
"""

from unittest.mock import AsyncMock, patch

import pytest

from kaleido_sdk import (
    KaleidoClient,
    KaleidoConfig,
    NetworkError,
    NodeNotConfiguredError,
    TimeoutError,
    ValidationError,
    get_sdk_name,
    get_version,
    parse_raw_amount,
    to_display_amount,
)
from kaleido_sdk.rln import (
    AssetSchema,
    CreateUtxosRequest,
    DecodeRGBInvoiceRequest,
    DecodeRGBInvoiceResponse,
    EmptyResponse,
    ListAssetsRequest,
    MakerExecuteRequest,
)


class TestKaleidoClient:
    """Tests for KaleidoClient."""

    def test_create_basic(self, base_url: str) -> None:
        """Test basic client creation."""
        client = KaleidoClient.create(base_url=base_url)
        assert client is not None
        assert not client.has_node()

    def test_create_with_node(self, base_url: str, node_url: str) -> None:
        """Test client creation with node URL."""
        client = KaleidoClient.create(base_url=base_url, node_url=node_url)
        assert client is not None
        assert client.has_node()

    def test_create_from_config(self, config: KaleidoConfig) -> None:
        """Test client creation from config object."""
        client = KaleidoClient.from_config(config)
        assert client is not None

    def test_maker_property(self, client: KaleidoClient) -> None:
        """Test maker property returns MakerClient."""
        from kaleido_sdk import MakerClient

        assert isinstance(client.maker, MakerClient)

    def test_rln_property_without_node(self, client: KaleidoClient) -> None:
        """Test rln property raises error without node configured."""
        with pytest.raises(NodeNotConfiguredError):
            _ = client.rln

    def test_rln_property_with_node(self, client_with_node: KaleidoClient) -> None:
        """Test rln property returns RlnClient with node configured."""
        from kaleido_sdk import RlnClient

        assert isinstance(client_with_node.rln, RlnClient)


class TestUtilityFunctions:
    """Tests for utility functions."""

    def test_parse_raw_amount(self) -> None:
        """Test converting to smallest units."""
        # BTC to satoshis
        assert parse_raw_amount(1.0, 8) == 100_000_000
        assert parse_raw_amount(0.5, 8) == 50_000_000
        assert parse_raw_amount(1.5, 8) == 150_000_000
        assert parse_raw_amount(0.00000001, 8) == 1

        # USDT with precision 6
        assert parse_raw_amount(1.0, 6) == 1_000_000
        assert parse_raw_amount(100.50, 6) == 100_500_000

    def test_to_display_amount(self) -> None:
        """Test converting to display units."""
        # Satoshis to BTC
        assert to_display_amount(100_000_000, 8) == 1.0
        assert to_display_amount(50_000_000, 8) == 0.5
        assert to_display_amount(150_000_000, 8) == 1.5
        assert to_display_amount(1, 8) == 0.00000001

        # USDT smallest units to display
        assert to_display_amount(1_000_000, 6) == 1.0
        assert to_display_amount(100_500_000, 6) == 100.5

    def test_parse_raw_amount_rejects_extra_precision(self) -> None:
        """Public helper must reject values that would otherwise be rounded."""
        with pytest.raises(ValidationError, match="more than 8 decimal places"):
            parse_raw_amount(1.234567891, 8)

    def test_conversion_roundtrip(self) -> None:
        """Test that conversion roundtrips correctly."""
        original = 1.23456789
        precision = 8
        smallest = parse_raw_amount(original, precision)
        display = to_display_amount(smallest, precision)
        # Note: floating point precision limits
        assert abs(display - 1.23456789) < 1e-8

    def test_get_version(self) -> None:
        """Test get_version returns a string."""
        version = get_version()
        assert isinstance(version, str)
        assert len(version) > 0
        # Check version format (semver-like)
        parts = version.split(".")
        assert len(parts) >= 2

    def test_get_sdk_name(self) -> None:
        """Test get_sdk_name returns expected name."""
        name = get_sdk_name()
        assert name == "kaleido-sdk"


# =============================================================================
# Bug-fix regression tests
# =============================================================================


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


class TestConnectionErrorHandling:
    """Connection errors should be wrapped in NetworkError with clear messages."""

    async def test_connection_error_wrapped(self) -> None:
        """httpx.ConnectError should be wrapped in NetworkError."""

        client = KaleidoClient.create(base_url="http://invalid.nonexistent.domain")
        with pytest.raises(NetworkError) as exc_info:
            await client.maker.list_assets()

        assert "Network error" in str(exc_info.value) or "Failed to connect" in str(exc_info.value)
        assert exc_info.value.code == "NETWORK_ERROR"

    async def test_dns_error_user_friendly(self) -> None:
        """DNS resolution failure should give user-friendly error."""
        client = KaleidoClient.create(base_url="http://does-not-exist.local")
        with pytest.raises(NetworkError) as exc_info:
            await client.maker.list_assets()

        error_msg = str(exc_info.value)
        assert "Failed to connect" in error_msg or "Network error" in error_msg


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
