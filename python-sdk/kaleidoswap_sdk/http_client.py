"""
HTTP Client for Kaleidoswap API

Async HTTP wrapper using httpx for API communication.
"""

from __future__ import annotations

import asyncio
from typing import Any, TypeVar

import httpx
from pydantic import BaseModel

from .errors import (
    KaleidoError,
    NetworkError,
    TimeoutError,
    map_http_error,
)
from .types import KaleidoConfig

T = TypeVar("T", bound=BaseModel)


class HttpClient:
    """
    Async HTTP client for Kaleidoswap APIs.

    Provides a unified interface for making requests to both the
    Maker API (market operations) and Node API (RGB Lightning Node).
    """

    def __init__(self, config: KaleidoConfig) -> None:
        """
        Initialize the HTTP client.

        Args:
            config: SDK configuration with URLs and auth settings
        """
        self._config = config
        self._maker_client: httpx.AsyncClient | None = None
        self._node_client: httpx.AsyncClient | None = None

    async def _get_maker_client(self) -> httpx.AsyncClient:
        """Get or create the Maker API client."""
        if self._maker_client is None or self._maker_client.is_closed:
            headers: dict[str, str] = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            if self._config.api_key:
                headers["Authorization"] = f"Bearer {self._config.api_key}"

            self._maker_client = httpx.AsyncClient(
                base_url=self._config.base_url,
                headers=headers,
                timeout=httpx.Timeout(self._config.timeout),
            )
        return self._maker_client

    async def _get_node_client(self) -> httpx.AsyncClient:
        """Get or create the Node API client."""
        if self._config.node_url is None:
            raise KaleidoError(
                code="NODE_NOT_CONFIGURED",
                message="Node API client not configured. Provide node_url in configuration.",
            )

        if self._node_client is None or self._node_client.is_closed:
            self._node_client = httpx.AsyncClient(
                base_url=self._config.node_url,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                timeout=httpx.Timeout(self._config.timeout),
            )
        return self._node_client

    def has_node_client(self) -> bool:
        """Check if Node API client is configured."""
        return self._config.node_url is not None

    def enable_node_client(self, node_url: str) -> None:
        """
        Enable Node API client with a URL.

        Args:
            node_url: URL for the RGB Lightning Node API
        """
        self._config.node_url = node_url
        # Close existing client if any so it gets recreated with new URL
        if self._node_client is not None:
            asyncio.create_task(self._node_client.aclose())
            self._node_client = None

    async def _handle_response(
        self,
        response: httpx.Response,
    ) -> dict[str, Any]:
        """
        Handle HTTP response and raise appropriate errors.

        Args:
            response: The HTTP response

        Returns:
            Parsed JSON response data

        Raises:
            KaleidoError: On error responses
        """
        if response.is_success:
            if response.status_code == 204:
                return {}
            try:
                return response.json()
            except Exception:
                return {}

        # Handle error responses
        try:
            data = response.json()
        except Exception:
            data = response.text

        raise map_http_error(response.status_code, response.reason_phrase or "", data)

    async def _request_with_retry(
        self,
        client: httpx.AsyncClient,
        method: str,
        path: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """
        Make HTTP request with retry logic.

        Args:
            client: The httpx client to use
            method: HTTP method (GET, POST, etc.)
            path: URL path
            **kwargs: Additional arguments for httpx request

        Returns:
            Parsed response data

        Raises:
            KaleidoError: On request failure after retries
        """
        last_error: Exception | None = None
        retries = self._config.max_retries

        for attempt in range(retries + 1):
            try:
                response = await client.request(method, path, **kwargs)
                return await self._handle_response(response)
            except httpx.TimeoutException as e:
                last_error = TimeoutError(f"Request timed out: {e}")
                if attempt < retries:
                    await asyncio.sleep(2**attempt)  # Exponential backoff
            except httpx.RequestError as e:
                last_error = NetworkError(f"Network error: {e}")
                if attempt < retries:
                    await asyncio.sleep(2**attempt)
            except KaleidoError as e:
                # Only retry on retryable errors
                if e.is_retryable() and attempt < retries:
                    last_error = e
                    await asyncio.sleep(2**attempt)
                else:
                    raise

        if last_error:
            raise last_error
        raise NetworkError("Request failed after retries")

    # =========================================================================
    # Maker API Methods
    # =========================================================================

    async def maker_get(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make GET request to Maker API.

        Args:
            path: API endpoint path
            params: Query parameters

        Returns:
            Response data
        """
        client = await self._get_maker_client()
        return await self._request_with_retry(client, "GET", path, params=params)

    async def maker_post(
        self,
        path: str,
        data: dict[str, Any] | BaseModel | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make POST request to Maker API.

        Args:
            path: API endpoint path
            data: Request body (dict or Pydantic model)
            params: Query parameters

        Returns:
            Response data
        """
        client = await self._get_maker_client()
        json_data = None
        if data is not None:
            if isinstance(data, BaseModel):
                json_data = data.model_dump(mode="json", exclude_none=True)
            else:
                json_data = data
        return await self._request_with_retry(client, "POST", path, json=json_data, params=params)

    # =========================================================================
    # Node API Methods
    # =========================================================================

    async def node_get(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make GET request to Node API.

        Args:
            path: API endpoint path
            params: Query parameters

        Returns:
            Response data
        """
        client = await self._get_node_client()
        return await self._request_with_retry(client, "GET", path, params=params)

    async def node_post(
        self,
        path: str,
        data: dict[str, Any] | BaseModel | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make POST request to Node API.

        Args:
            path: API endpoint path
            data: Request body (dict or Pydantic model)
            params: Query parameters

        Returns:
            Response data
        """
        client = await self._get_node_client()
        json_data = None
        if data is not None:
            if isinstance(data, BaseModel):
                json_data = data.model_dump(mode="json", exclude_none=True)
            else:
                json_data = data
        return await self._request_with_retry(client, "POST", path, json=json_data, params=params)

    # =========================================================================
    # Lifecycle Methods
    # =========================================================================

    async def close(self) -> None:
        """Close all HTTP clients."""
        if self._maker_client is not None:
            await self._maker_client.aclose()
            self._maker_client = None
        if self._node_client is not None:
            await self._node_client.aclose()
            self._node_client = None

    async def __aenter__(self) -> HttpClient:
        """Async context manager entry."""
        return self

    async def __aexit__(self, *args: Any) -> None:
        """Async context manager exit."""
        await self.close()
