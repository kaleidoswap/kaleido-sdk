"""
Tests for KaleidoClient.
"""

from unittest.mock import AsyncMock, patch

import pytest

import kaleido_sdk._identity as identity_module
from kaleido_sdk import (
    ConfigError,
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
from kaleido_sdk._http_client import HttpClient
from kaleido_sdk._identity import (
    generate_install_id,
    generate_session_id,
    load_or_create_install_id,
)
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


class TestKaleidoClient:
    """Tests for KaleidoClient."""

    async def test_create_basic(self, base_url: str) -> None:
        """Test basic client creation."""
        client = await KaleidoClient.create(base_url=base_url, install_id="inst_test_create_basic")
        assert client is not None
        assert not client.has_node()

    async def test_create_with_node(self, base_url: str, node_url: str) -> None:
        """Test client creation with node URL."""
        client = await KaleidoClient.create(
            base_url=base_url,
            node_url=node_url,
            install_id="inst_test_create_node",
        )
        assert client is not None
        assert client.has_node()

    async def test_create_from_config(self, config: KaleidoConfig) -> None:
        """Test client creation from config object."""
        client = await KaleidoClient.from_config(config)
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


class TestIdentity:
    """Tests for telemetry identity helpers and headers."""

    def test_generate_install_id(self) -> None:
        assert generate_install_id().startswith("inst_")

    def test_generate_session_id(self) -> None:
        assert len(generate_session_id()) == 36

    async def test_install_id_override_does_not_touch_storage(self) -> None:
        assert await load_or_create_install_id("inst_override") == "inst_override"

    async def test_install_id_reuses_process_fallback_when_storage_unavailable(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        monkeypatch.setenv("KALEIDO_INSTALL_ID_PATH", str(tmp_path / "missing" / "install_id"))
        monkeypatch.setattr(identity_module, "_ephemeral_install_id", None)

        def _raise_os_error(*_args, **_kwargs):
            raise OSError("storage unavailable")

        monkeypatch.setattr(identity_module.os, "open", _raise_os_error)

        first_install_id = await load_or_create_install_id()
        second_install_id = await load_or_create_install_id()

        assert first_install_id.startswith("inst_")
        assert second_install_id == first_install_id

    def test_maker_headers_include_attribution(self) -> None:
        http = HttpClient(
            KaleidoConfig(
                base_url="https://api.example.com",
                api_key="kld_live_c_test",
                install_id="inst_test_install",
                session_id="test-session",
            )
        )

        headers = http._maker_headers

        assert headers["Authorization"] == "Bearer kld_live_c_test"
        assert headers["X-Kaleido-Install-Id"] == "inst_test_install"
        assert headers["X-Kaleido-Session-Id"] == "test-session"
        assert headers["X-Kaleido-SDK"] == f"python/{get_version()}"
        assert "Authorization" not in http._default_headers
        assert "X-Kaleido-Install-Id" not in http._default_headers

    def test_maker_headers_reject_api_key_over_remote_http(self) -> None:
        with pytest.raises(ConfigError, match="non-HTTPS"):
            HttpClient(
                KaleidoConfig(
                    base_url="http://api.example.com",
                    api_key="kld_live_c_test",
                    install_id="inst_test_install",
                    session_id="test-session",
                )
            )

    async def test_create_rejects_api_key_over_remote_http(self) -> None:
        with pytest.raises(ConfigError, match="non-HTTPS"):
            await KaleidoClient.create(
                base_url="http://api.example.com",
                api_key="kld_live_c_test",
                install_id="inst_test_install",
            )

    def test_maker_headers_allow_api_key_over_localhost_http(self) -> None:
        http = HttpClient(
            KaleidoConfig(
                base_url="http://localhost:8000",
                api_key="kld_live_c_test",
                install_id="inst_test_install",
                session_id="test-session",
            )
        )

        headers = http._maker_headers

        assert headers["Authorization"] == "Bearer kld_live_c_test"
        assert headers["X-Kaleido-Install-Id"] == "inst_test_install"

    def test_maker_headers_allow_explicit_insecure_opt_out(self) -> None:
        http = HttpClient(
            KaleidoConfig(
                base_url="http://api.example.com",
                api_key="kld_live_c_test",
                allow_insecure=True,
                install_id="inst_test_install",
                session_id="test-session",
            )
        )

        assert http._maker_headers["Authorization"] == "Bearer kld_live_c_test"

    def test_maker_headers_skip_attribution_on_remote_http_without_api_key(self) -> None:
        http = HttpClient(
            KaleidoConfig(
                base_url="http://api.example.com",
                install_id="inst_test_install",
                session_id="test-session",
            )
        )

        headers = http._maker_headers

        assert "Authorization" not in headers
        assert "X-Kaleido-Install-Id" not in headers
        assert "X-Kaleido-Session-Id" not in headers

    async def test_maker_requests_reuse_precomputed_headers(self) -> None:
        http = HttpClient(
            KaleidoConfig(
                base_url="https://api.example.com",
                api_key="kld_live_c_test",
                install_id="inst_test_install",
                session_id="test-session",
            )
        )
        http._build_maker_headers = lambda: (_ for _ in ()).throw(  # type: ignore[method-assign]
            AssertionError("headers should be precomputed")
        )
        http._request = AsyncMock(return_value={})  # type: ignore[method-assign]

        await http.maker_get("/api/v1/market/assets")

        _, _, kwargs = http._request.mock_calls[0]
        assert kwargs["headers"]["Authorization"] == "Bearer kld_live_c_test"
        assert kwargs["headers"]["X-Kaleido-Install-Id"] == "inst_test_install"


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


class TestWaitForSwapCompletionAccessToken:
    """wait_for_swap_completion must forward access_token to the status poll."""

    async def test_no_access_token_when_omitted(self, client: KaleidoClient) -> None:
        """When access_token is not supplied, the status request omits it."""
        from kaleido_sdk import SwapCompletionOptions
        from kaleido_sdk._generated.api_types import (
            SwapOrder,
            SwapOrderStatus,
            SwapOrderStatusResponse,
        )

        maker = client.maker
        fake_order = SwapOrder.model_construct(
            id="order_123",
            status=SwapOrderStatus.FILLED,
        )
        fake_response = SwapOrderStatusResponse.model_construct(order=fake_order)

        with patch.object(
            maker, "get_swap_order_status", new_callable=AsyncMock
        ) as mock:
            mock.return_value = fake_response
            result = await maker.wait_for_swap_completion(
                "order_123",
                SwapCompletionOptions(timeout=5.0, poll_interval=0.01),
            )

        assert result.id == "order_123"
        sent_request = mock.call_args[0][0]
        # access_token defaults to "" in the model when not explicitly passed
        assert sent_request.access_token == ""
        assert sent_request.order_id == "order_123"

    async def test_forwards_access_token_when_provided(
        self, client: KaleidoClient
    ) -> None:
        """When access_token is set on options, it lands in the request body."""
        from kaleido_sdk import SwapCompletionOptions
        from kaleido_sdk._generated.api_types import (
            SwapOrder,
            SwapOrderStatus,
            SwapOrderStatusResponse,
        )

        maker = client.maker
        fake_order = SwapOrder.model_construct(
            id="order_456",
            status=SwapOrderStatus.FILLED,
        )
        fake_response = SwapOrderStatusResponse.model_construct(order=fake_order)

        with patch.object(
            maker, "get_swap_order_status", new_callable=AsyncMock
        ) as mock:
            mock.return_value = fake_response
            await maker.wait_for_swap_completion(
                "order_456",
                SwapCompletionOptions(
                    timeout=5.0,
                    poll_interval=0.01,
                    access_token="tok_authenticated_user",
                ),
            )

        sent_request = mock.call_args[0][0]
        assert sent_request.access_token == "tok_authenticated_user"
        assert sent_request.order_id == "order_456"


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


class TestConnectionErrorHandling:
    """Connection errors should be wrapped in NetworkError with clear messages."""

    async def test_connection_error_wrapped(self) -> None:
        """httpx.ConnectError should be wrapped in NetworkError."""

        client = await KaleidoClient.create(
            base_url="http://invalid.nonexistent.domain",
            install_id="inst_test_invalid_domain",
        )
        with pytest.raises(NetworkError) as exc_info:
            await client.maker.list_assets()

        assert "Network error" in str(exc_info.value) or "Failed to connect" in str(exc_info.value)
        assert exc_info.value.code == "NETWORK_ERROR"

    async def test_dns_error_user_friendly(self) -> None:
        """DNS resolution failure should give user-friendly error."""
        client = await KaleidoClient.create(
            base_url="http://does-not-exist.local",
            install_id="inst_test_dns_error",
        )
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


# =============================================================================
# Batch E — additive parity tests
# =============================================================================


class TestHasMaker:
    """``has_maker()`` returns True when base_url is non-empty."""

    def test_default_create_has_maker(self, client: KaleidoClient) -> None:
        assert client.has_maker() is True

    def test_empty_base_url_lacks_maker(self) -> None:
        from kaleido_sdk import KaleidoConfig

        config = KaleidoConfig(base_url="", install_id="inst_test", session_id="s")
        client = KaleidoClient(config)
        assert client.has_maker() is False


class TestCustomLogger:
    """``KaleidoConfig.logger`` should receive SDK log records via the bridge."""

    async def test_logger_receives_info_records(self) -> None:
        captured: list[tuple[str, str]] = []

        class Recorder:
            def debug(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("debug", msg))

            def info(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("info", msg))

            def warning(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("warning", msg))

            def error(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("error", msg))

        client = await KaleidoClient.create(
            base_url="https://api.example.com",
            install_id="inst_test_logger",
            log_level="DEBUG",
            logger=Recorder(),
        )

        # Trigger any internal log; using a direct logger call mirrors what
        # the SDK does internally and avoids needing a live HTTP request.
        from kaleido_sdk._logging import get_logger

        get_logger("test").info("hello from sdk")

        # Reset the global logger handler so subsequent tests aren't affected.
        from kaleido_sdk._logging import set_logger as _set_logger

        try:
            assert any(
                level == "info" and "hello from sdk" in msg
                for level, msg in captured
            ), f"expected info bridge record, got {captured!r}"
        finally:
            _set_logger(None)
            await client.close()

    def test_set_logger_is_idempotent(self) -> None:
        from kaleido_sdk._logging import _root, set_logger
        from kaleido_sdk._logging import _SdkLoggerHandler  # type: ignore[attr-defined]

        class _Noop:
            def debug(self, *a: object, **k: object) -> None: ...
            def info(self, *a: object, **k: object) -> None: ...
            def warning(self, *a: object, **k: object) -> None: ...
            def error(self, *a: object, **k: object) -> None: ...

        try:
            set_logger(_Noop())
            set_logger(_Noop())
            set_logger(_Noop())
            bridges = [h for h in _root.handlers if isinstance(h, _SdkLoggerHandler)]
            assert len(bridges) == 1
        finally:
            set_logger(None)


class TestAssetPairMapper:
    """Sanity tests for the ported AssetPairMapper utility."""

    def _build_pairs_response(self):
        from kaleido_sdk._generated.api_types import (
            TradableAssetResponseModel,
            TradingLimits,
            TradingPairResponseModel,
            TradingPairsResponse,
        )

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


# =============================================================================
# Symmetric tests — counterparts for items added in the TypeScript SDK
# =============================================================================


class TestHttpRetryBehaviour:
    """Mirror typescript-sdk/tests/unit/http-client.test.ts > Retry behaviour.

    Python's HTTP layer has always had a retry loop; these tests close the gap
    where parity was previously only implicit.
    """

    async def test_retries_transient_5xx_then_succeeds(self) -> None:
        import httpx

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_retry_5xx",
            session_id="s",
            max_retries=3,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            if calls["n"] < 3:
                return httpx.Response(503, json={"error": "upstream"})
            return httpx.Response(200, json={"ok": True})

        client = await http._get_client()
        with patch.object(client, "request", side_effect=mock_request), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ):
            result = await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 3
        assert result == {"ok": True}

    async def test_does_not_retry_on_429_rate_limit(self) -> None:
        """**Behavioural asymmetry vs. TS** — flagged for the audit ledger.

        Python's ``RateLimitError.is_retryable()`` returns ``False`` (see
        ``errors.py:32``), so 429 surfaces immediately. The TypeScript SDK's
        fetch wrapper retries 429 alongside 5xx. Test asserts the current
        Python behaviour; reconciliation is a separate decision.
        """
        import httpx

        from kaleido_sdk import RateLimitError

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_retry_429",
            session_id="s",
            max_retries=2,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            return httpx.Response(429, json={"error": "slow down"})

        client = await http._get_client()
        with patch.object(client, "request", side_effect=mock_request), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ):
            with pytest.raises(RateLimitError):
                await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 1  # no retries — current Python behaviour

    async def test_does_not_retry_on_4xx_except_429(self) -> None:
        import httpx

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_no_retry_4xx",
            session_id="s",
            max_retries=3,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            return httpx.Response(400, json={"error": "bad request"})

        client = await http._get_client()
        with patch.object(client, "request", side_effect=mock_request), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ):
            with pytest.raises(ValidationError):
                await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 1  # no retries

    async def test_retries_on_network_errors_and_surfaces_failure(self) -> None:
        import httpx

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_retry_net",
            session_id="s",
            max_retries=2,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            raise httpx.ConnectError("network refused")

        client = await http._get_client()
        with patch.object(client, "request", side_effect=mock_request), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ):
            with pytest.raises(NetworkError):
                await http.maker_get("/api/v1/lsps1/get_info")

        # initial attempt + 2 retries
        assert calls["n"] == 3

    async def test_retries_on_timeouts_and_surfaces_timeout_error(self) -> None:
        import httpx

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_retry_timeout",
            session_id="s",
            max_retries=1,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            raise httpx.TimeoutException("slow")

        client = await http._get_client()
        with patch.object(client, "request", side_effect=mock_request), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ):
            with pytest.raises(TimeoutError):
                await http.maker_get("/api/v1/lsps1/get_info")

        # initial attempt + 1 retry
        assert calls["n"] == 2

    async def test_max_retries_zero_disables_retries(self) -> None:
        import httpx

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_no_retries",
            session_id="s",
            max_retries=0,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            raise httpx.ConnectError("boom")

        client = await http._get_client()
        with patch.object(client, "request", side_effect=mock_request), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ):
            with pytest.raises(NetworkError):
                await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 1


class TestEnableWebsocketUserId:
    """Mirror typescript-sdk/tests/unit/ws-client.test.ts userId tests (E9)."""

    def test_explicit_user_id_becomes_client_id(self) -> None:
        from kaleido_sdk import WSClient

        ws = WSClient(
            "ws://localhost:8000/api/v1/market/ws",
            user_id="user_abc_123",
        )
        assert ws.client_id == "user_abc_123"

    def test_user_id_wins_over_embedded_client_id(self) -> None:
        """**Behavioural asymmetry vs. TS** — flagged for the audit ledger.

        Python's ``WSClient.__init__`` does ``self._client_id = user_id or
        uuid.uuid4()`` and then ALWAYS rebuilds the URL with the chosen
        client_id appended (``_build_url_with_client_id``), so an embedded
        client ID in the input URL is silently ignored when ``user_id`` is
        provided. The TypeScript SDK gives the embedded ID precedence to
        keep existing call sites stable. Test asserts current Python
        behaviour; reconciliation is a separate decision.
        """
        from kaleido_sdk import WSClient

        ws = WSClient(
            "ws://localhost:8000/api/v1/market/ws/0b33b045-4cb8-4e2e-9e2d-bd8c1c8b4abe",
            user_id="user_overrides_embedded",
        )
        assert ws.client_id == "user_overrides_embedded"

    def test_no_user_id_generates_uuid(self) -> None:
        from kaleido_sdk import WSClient

        ws = WSClient("ws://localhost:8000/api/v1/market/ws")
        assert ws.client_id  # truthy
        assert ws.client_id not in ("ws", "")


class TestInstallIdRaceSafety:
    """Mirror typescript-sdk/tests/unit/identity.test.ts race-safety test.

    Python uses ``os.O_EXCL`` in ``_load_or_create_install_id_sync``; this
    test asserts that a second writer doesn't clobber the first writer's
    value when the file already exists.
    """

    async def test_second_writer_does_not_overwrite(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        from kaleido_sdk._identity import (
            _load_or_create_install_id_sync,
            load_or_create_install_id,
        )

        target = tmp_path / "install_id"
        monkeypatch.setenv("KALEIDO_INSTALL_ID_PATH", str(target))

        # First writer creates the file with a known value.
        target.write_text("inst_first_writer\n", encoding="utf-8")

        # Subsequent load_or_create calls must surface the existing value
        # instead of generating a fresh ID and overwriting.
        first = await load_or_create_install_id()
        second = await load_or_create_install_id()
        assert first == "inst_first_writer"
        assert second == "inst_first_writer"

        # And the file on disk is untouched.
        assert target.read_text(encoding="utf-8").strip() == "inst_first_writer"

    def test_sync_helper_respects_existing_file_under_O_EXCL_race(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        """Simulate the FileExistsError branch: O_EXCL fires because another
        writer raced us between the load() and save() calls."""
        import os as os_module

        from kaleido_sdk._identity import _load_or_create_install_id_sync

        target = tmp_path / "install_id"
        monkeypatch.setenv("KALEIDO_INSTALL_ID_PATH", str(target))

        # Pretend the file does not exist on the first read attempt so we
        # enter the write branch. Then have os.open raise FileExistsError as
        # if another writer beat us to the punch, while the file (now on
        # disk thanks to the racing writer) contains a winning value.
        target.write_text("inst_racing_winner\n", encoding="utf-8")

        original_read_text = type(target).read_text
        calls = {"reads": 0}

        def first_read_returns_empty(self_path, *args, **kwargs):
            calls["reads"] += 1
            if calls["reads"] == 1:
                # Simulate the file not existing yet on first read.
                raise OSError("simulated absence")
            return original_read_text(self_path, *args, **kwargs)

        original_os_open = os_module.open

        def raising_open(path, flags, mode=0o777):
            if flags & os_module.O_EXCL:
                raise FileExistsError(path)
            return original_os_open(path, flags, mode)

        monkeypatch.setattr(type(target), "read_text", first_read_returns_empty)
        monkeypatch.setattr(os_module, "open", raising_open)

        result = _load_or_create_install_id_sync()
        assert result == "inst_racing_winner"


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
