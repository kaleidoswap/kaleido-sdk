"""
Unit tests for ``kaleido_sdk._identity`` and attribution header wiring.

Covers install-ID / session-ID generation, the ephemeral fallback when
storage is unavailable, HTTPS-only API-key enforcement, attribution
header composition, and the O_EXCL race-safety guarantee. Counterpart of
``typescript-sdk/tests/unit/identity.test.ts``.
"""

from unittest.mock import AsyncMock

import pytest

import kaleido_sdk._identity as identity_module
from kaleido_sdk import (
    ConfigError,
    KaleidoClient,
    KaleidoConfig,
    get_version,
)
from kaleido_sdk._http_client import HttpClient
from kaleido_sdk._identity import (
    generate_install_id,
    generate_session_id,
    load_or_create_install_id,
)


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

    async def test_from_config_preserves_explicit_session_id(self) -> None:
        client = await KaleidoClient.from_config(
            KaleidoConfig(
                base_url="https://api.example.com",
                install_id="inst_session_override",
                session_id="session_override",
            )
        )

        assert client._http._maker_headers["X-Kaleido-Session-Id"] == "session_override"

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


class TestInstallIdRaceSafety:
    """Mirror typescript-sdk/tests/unit/identity.test.ts race-safety test.

    Python uses ``os.O_EXCL`` in ``_load_or_create_install_id_sync``; this
    test asserts that a second writer doesn't clobber the first writer's
    value when the file already exists.
    """

    async def test_second_writer_does_not_overwrite(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
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

    def test_sync_helper_respects_existing_file_under_o_excl_race(
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
