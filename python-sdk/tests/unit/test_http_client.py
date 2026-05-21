"""
Unit tests for ``kaleido_sdk._http_client.HttpClient``.

Covers connection-error mapping and the retry loop with exponential backoff.
Counterpart of ``typescript-sdk/tests/unit/http-client.test.ts``.
"""

from unittest.mock import AsyncMock, patch

import pytest

from kaleido_sdk import (
    KaleidoClient,
    KaleidoConfig,
    NetworkError,
    TimeoutError,
    ValidationError,
)
from kaleido_sdk._http_client import HttpClient


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
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
        ):
            result = await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 3
        assert result == {"ok": True}

    async def test_retries_on_429_rate_limit(self) -> None:
        """Batch G / R8 — 429 is retried alongside 5xx as of 0.2.0.

        Aligns Python with the TypeScript SDK and the HTTP ``Retry-After``
        convention. Callers that want the previous fail-fast behaviour
        should set ``max_retries=0`` on the client.
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
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
        ):
            with pytest.raises(RateLimitError):
                await http.maker_get("/api/v1/lsps1/get_info")

        # initial attempt + 2 retries
        assert calls["n"] == 3

    async def test_max_retries_zero_does_not_retry_429(self) -> None:
        """Companion to the previous test — opt-out via max_retries=0."""
        import httpx

        from kaleido_sdk import RateLimitError

        config = KaleidoConfig(
            base_url="https://api.example.com",
            install_id="inst_429_no_retry",
            session_id="s",
            max_retries=0,
        )
        http = HttpClient(config)

        calls = {"n": 0}

        async def mock_request(*_args, **_kwargs):
            calls["n"] += 1
            return httpx.Response(429, json={"error": "slow down"})

        client = await http._get_client()
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
        ):
            with pytest.raises(RateLimitError):
                await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 1

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
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
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
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
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
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
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
        with (
            patch.object(client, "request", side_effect=mock_request),
            patch("asyncio.sleep", new_callable=AsyncMock),
        ):
            with pytest.raises(NetworkError):
                await http.maker_get("/api/v1/lsps1/get_info")

        assert calls["n"] == 1
