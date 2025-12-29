import aiohttp
import logging
from typing import Dict, Any, Optional
from .exceptions import (
    NetworkError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
)
from .retry import with_retry, RetryConfig

logger = logging.getLogger(__name__)


class HttpClient:
    """HTTP client for making requests to the Kaleido API."""

    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        retry_config: Optional[RetryConfig] = None,
    ):
        """Initialize the HTTP client.

        Args:
            base_url: Base URL for the API
            api_key: Optional API key for authentication
            retry_config: Optional retry configuration
        """
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.retry_config = retry_config or RetryConfig()
        self._session: Optional[aiohttp.ClientSession] = None

    async def _ensure_session(self) -> aiohttp.ClientSession:
        """Ensure a session exists."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session

    async def close(self):
        """Close the HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()
            self._session = None

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests."""
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    @with_retry(config=None)  # Will use default config from instance
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make an HTTP request to the API.

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            data: Optional request payload
            params: Optional query parameters

        Returns:
            API response as dictionary

        Raises:
            NetworkError: If there are network issues
            AuthenticationError: If authentication fails
            RateLimitError: If rate limits are exceeded
            ValidationError: If request validation fails
        """
        session = await self._ensure_session()
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        # Build URL with query parameters if provided
        if params:
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            url = f"{url}?{query_string}"

        headers = self._get_headers()

        try:
            async with session.request(
                method=method, url=url, json=data, headers=headers
            ) as response:
                if response.status == 401:
                    raise AuthenticationError(
                        "Authentication failed", status_code=response.status
                    )
                elif response.status == 429:
                    raise RateLimitError(
                        "Rate limit exceeded", status_code=response.status
                    )
                elif response.status == 400:
                    try:
                        error_detail = await response.text()
                        logger.error(f"400 Error details: {error_detail}")
                    except Exception:
                        pass
                    raise ValidationError(
                        "Invalid request", status_code=response.status
                    )
                elif response.status >= 500:
                    raise NetworkError("Server error", status_code=response.status)

                response.raise_for_status()
                return await response.json()

        except aiohttp.ClientResponseError as e:
            if e.status == 401:
                raise AuthenticationError("Authentication failed", status_code=e.status)
            elif e.status == 429:
                raise RateLimitError("Rate limit exceeded", status_code=e.status)
            elif e.status == 400:
                raise ValidationError("Invalid request", status_code=e.status)
            else:
                raise NetworkError(f"Request failed: {str(e)}", status_code=e.status)
        except aiohttp.ClientError as e:
            raise NetworkError(f"Network error: {str(e)}")

    async def get(
        self, endpoint: str, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make a GET request to the API.

        Args:
            endpoint: API endpoint
            params: Optional query parameters

        Returns:
            API response as dictionary
        """
        return await self._request("GET", endpoint, params=params)

    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a POST request to the API.

        Args:
            endpoint: API endpoint
            data: Request payload

        Returns:
            API response as dictionary
        """
        return await self._request("POST", endpoint, data)
