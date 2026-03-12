"""
HTTP Client for Kaleidoswap API

Single async HTTP client (httpx) shared by both Maker and Node APIs.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, TypeVar

import httpx
from pydantic import BaseModel

from ._logging import get_logger
from .errors import (
    KaleidoError,
    NetworkError,
    TimeoutError,
    map_http_error,
)
from .types import KaleidoConfig

T = TypeVar("T", bound=BaseModel)

_log = get_logger("http")


class HttpClient:
    """
    Async HTTP client for Kaleidoswap APIs.

    Uses a single httpx.AsyncClient for both Maker and Node requests,
    building full URLs from the configured base_url / node_url.
    """

    def __init__(self, config: KaleidoConfig) -> None:
        self._config = config
        self._client: httpx.AsyncClient | None = None

    def _build_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self._config.api_key:
            headers["Authorization"] = f"Bearer {self._config.api_key}"
        return headers

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                headers=self._build_headers(),
                timeout=httpx.Timeout(self._config.timeout),
            )
        return self._client

    # =========================================================================
    # URL helpers
    # =========================================================================

    def _maker_url(self, path: str) -> str:
        return f"{self._config.base_url.rstrip('/')}{path}"

    def _node_url(self, path: str) -> str:
        if self._config.node_url is None:
            raise KaleidoError(
                code="NODE_NOT_CONFIGURED",
                message="Node API client not configured. Provide node_url in configuration.",
            )
        return f"{self._config.node_url.rstrip('/')}{path}"

    # =========================================================================
    # Capabilities
    # =========================================================================

    def has_node_client(self) -> bool:
        """Check if Node API client is configured."""
        return self._config.node_url is not None

    def enable_node_client(self, node_url: str) -> None:
        """Enable Node API client with a URL."""
        self._config.node_url = node_url

    # =========================================================================
    # Response / retry
    # =========================================================================

    async def _handle_response(self, response: httpx.Response) -> dict[str, Any]:
        if response.is_success:
            if response.status_code == 204:
                return {}
            try:
                return response.json()
            except Exception:
                return {}

        try:
            data = response.json()
        except Exception:
            data = response.text

        _log.debug(
            "HTTP error response [%d %s]: %r",
            response.status_code,
            response.reason_phrase,
            data,
        )
        raise map_http_error(response.status_code, response.reason_phrase or "", data)

    async def _request(
        self,
        method: str,
        url: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Make an HTTP request with retry logic."""
        client = await self._get_client()
        last_error: Exception | None = None
        retries = self._config.max_retries

        for attempt in range(retries + 1):
            t_start = time.monotonic()
            try:
                _log.debug("%s %s (attempt %d/%d)", method, url, attempt + 1, retries + 1)
                response = await client.request(method, url, **kwargs)
                latency_ms = (time.monotonic() - t_start) * 1000
                _log.info("%s %s -> %d (%.0fms)", method, url, response.status_code, latency_ms)
                return await self._handle_response(response)
            except httpx.TimeoutException as e:
                latency_ms = (time.monotonic() - t_start) * 1000
                last_error = TimeoutError(f"Request timed out: {e}")
                if attempt < retries:
                    delay = 2**attempt
                    _log.warning(
                        "%s %s timed out after %.0fms (attempt %d/%d), retrying in %ds",
                        method,
                        url,
                        latency_ms,
                        attempt + 1,
                        retries + 1,
                        delay,
                    )
                    await asyncio.sleep(delay)
                else:
                    _log.error(
                        "%s %s timed out after %.0fms, exhausted %d retries",
                        method,
                        url,
                        latency_ms,
                        retries,
                    )
            except httpx.RequestError as e:
                latency_ms = (time.monotonic() - t_start) * 1000
                last_error = NetworkError(f"Network error: {e}")
                if attempt < retries:
                    delay = 2**attempt
                    _log.warning(
                        "%s %s network error (attempt %d/%d): %s, retrying in %ds",
                        method,
                        url,
                        attempt + 1,
                        retries + 1,
                        type(e).__name__,
                        delay,
                    )
                    await asyncio.sleep(delay)
                else:
                    _log.error(
                        "%s %s network error after %d retries: %s",
                        method,
                        url,
                        retries,
                        type(e).__name__,
                    )
            except KaleidoError as e:
                if e.is_retryable() and attempt < retries:
                    last_error = e
                    delay = 2**attempt
                    _log.warning(
                        "%s %s retryable error %s (attempt %d/%d), retrying in %ds",
                        method,
                        url,
                        e.code,
                        attempt + 1,
                        retries + 1,
                        delay,
                    )
                    await asyncio.sleep(delay)
                else:
                    _log.error("%s %s raised %s: %s", method, url, type(e).__name__, e.code)
                    raise

        if last_error:
            raise last_error
        raise NetworkError("Request failed after retries")

    @staticmethod
    def _serialize_body(data: dict[str, Any] | BaseModel | None) -> dict[str, Any] | None:
        if data is None:
            return None
        if isinstance(data, BaseModel):
            return data.model_dump(mode="json", exclude_none=True)
        return data

    # =========================================================================
    # Maker API
    # =========================================================================

    async def maker_get(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make GET request to Maker API."""
        return await self._request("GET", self._maker_url(path), params=params)

    async def maker_post(
        self,
        path: str,
        data: dict[str, Any] | BaseModel | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make POST request to Maker API."""
        return await self._request(
            "POST", self._maker_url(path), json=self._serialize_body(data), params=params
        )

    # =========================================================================
    # Node API
    # =========================================================================

    async def node_get(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make GET request to Node API."""
        return await self._request("GET", self._node_url(path), params=params)

    async def node_post(
        self,
        path: str,
        data: dict[str, Any] | BaseModel | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make POST request to Node API."""
        return await self._request(
            "POST", self._node_url(path), json=self._serialize_body(data), params=params
        )

    # =========================================================================
    # Lifecycle
    # =========================================================================

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> HttpClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()
