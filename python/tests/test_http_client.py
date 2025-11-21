"""Tests for HTTP client functionality."""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from aiohttp import ClientResponseError, ClientError
from kaleidoswap_sdk.http import HttpClient
from kaleidoswap_sdk.exceptions import (
    NetworkError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
)
from kaleidoswap_sdk.retry import RetryConfig


@pytest_asyncio.fixture
async def http_client():
    """Create an HTTP client instance."""
    client = HttpClient(
        base_url="https://api.test.com",
        api_key="test_key",
    )
    try:
        yield client
    finally:
        await client.close()


@pytest_asyncio.fixture
async def http_client_no_auth():
    """Create an HTTP client without API key."""
    client = HttpClient(base_url="https://api.test.com")
    try:
        yield client
    finally:
        await client.close()


@pytest.mark.asyncio
async def test_http_client_initialization():
    """Test HTTP client initialization."""
    client = HttpClient(
        base_url="https://api.test.com",
        api_key="test_key",
    )
    assert client.base_url == "https://api.test.com"
    assert client.api_key == "test_key"
    assert client._session is None
    await client.close()


@pytest.mark.asyncio
async def test_http_client_initialization_strips_trailing_slash():
    """Test that base_url trailing slash is stripped."""
    client = HttpClient(base_url="https://api.test.com/")
    assert client.base_url == "https://api.test.com"
    await client.close()


@pytest.mark.asyncio
async def test_http_client_get_headers_with_auth(http_client: HttpClient):
    """Test getting headers with authentication."""
    headers = http_client._get_headers()
    assert headers["Content-Type"] == "application/json"
    assert headers["Accept"] == "application/json"
    assert headers["Authorization"] == "Bearer test_key"


@pytest.mark.asyncio
async def test_http_client_get_headers_without_auth(http_client_no_auth: HttpClient):
    """Test getting headers without authentication."""
    headers = http_client_no_auth._get_headers()
    assert headers["Content-Type"] == "application/json"
    assert headers["Accept"] == "application/json"
    assert "Authorization" not in headers


@pytest.mark.asyncio
async def test_http_client_ensure_session(http_client: HttpClient):
    """Test session creation."""
    assert http_client._session is None
    session = await http_client._ensure_session()
    assert session is not None
    assert http_client._session is not None
    await http_client.close()


@pytest.mark.asyncio
async def test_http_client_ensure_session_reuses_existing(http_client: HttpClient):
    """Test that ensure_session reuses an existing session."""
    session1 = await http_client._ensure_session()
    session2 = await http_client._ensure_session()
    assert session1 is session2
    await http_client.close()


@pytest.mark.asyncio
async def test_http_client_close(http_client: HttpClient):
    """Test closing the HTTP client."""
    # Create a session
    await http_client._ensure_session()
    assert http_client._session is not None

    # Close the client
    await http_client.close()
    assert http_client._session is None


@pytest.mark.asyncio
async def test_http_client_close_when_no_session(http_client: HttpClient):
    """Test closing when no session exists."""
    # Should not raise an error
    await http_client.close()
    assert http_client._session is None


@pytest.mark.asyncio
async def test_http_client_get_request_with_params(http_client: HttpClient):
    """Test GET request with query parameters."""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value={"result": "success"})
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        result = await http_client.get("/test", params={"key": "value"})

        assert result == {"result": "success"}
        # Verify the URL includes query parameters
        call_args = mock_request.call_args
        assert "key=value" in call_args[1]["url"]


@pytest.mark.asyncio
async def test_http_client_post_request(http_client: HttpClient):
    """Test POST request."""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value={"result": "created"})
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        result = await http_client.post("/test", data={"key": "value"})

        assert result == {"result": "created"}
        # Verify the request was POST with JSON data
        call_args = mock_request.call_args
        assert call_args[1]["method"] == "POST"
        assert call_args[1]["json"] == {"key": "value"}


@pytest.mark.asyncio
async def test_http_client_authentication_error(http_client: HttpClient):
    """Test handling 401 authentication error."""
    mock_response = AsyncMock()
    mock_response.status = 401
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        with pytest.raises(AuthenticationError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 401
        assert "Authentication failed" in str(exc_info.value)


@pytest.mark.asyncio
async def test_http_client_rate_limit_error(http_client: HttpClient):
    """Test handling 429 rate limit error."""
    mock_response = AsyncMock()
    mock_response.status = 429
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        with pytest.raises(RateLimitError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 429
        assert "Rate limit exceeded" in str(exc_info.value)


@pytest.mark.asyncio
async def test_http_client_validation_error(http_client: HttpClient):
    """Test handling 400 validation error."""
    mock_response = AsyncMock()
    mock_response.status = 400
    mock_response.text = AsyncMock(return_value="Invalid input")
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        with pytest.raises(ValidationError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 400
        assert "Invalid request" in str(exc_info.value)


@pytest.mark.asyncio
async def test_http_client_server_error(http_client: HttpClient):
    """Test handling 500 server error."""
    mock_response = AsyncMock()
    mock_response.status = 500
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        with pytest.raises(NetworkError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 500
        assert "Server error" in str(exc_info.value)


@pytest.mark.asyncio
async def test_http_client_client_response_error(http_client: HttpClient):
    """Test handling ClientResponseError."""
    error = ClientResponseError(
        request_info=MagicMock(),
        history=(),
        status=503,
        message="Service unavailable",
    )

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.side_effect = error

        with pytest.raises(NetworkError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_http_client_generic_client_error(http_client: HttpClient):
    """Test handling generic ClientError."""
    error = ClientError("Connection failed")

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.side_effect = error

        with pytest.raises(NetworkError) as exc_info:
            await http_client.get("/test")

        assert "Network error" in str(exc_info.value)


@pytest.mark.asyncio
async def test_http_client_custom_retry_config(http_client: HttpClient):
    """Test HTTP client with custom retry configuration."""
    custom_config = RetryConfig(
        max_retries=5,
        initial_delay=2.0,
        max_delay=20.0,
        exponential_base=3.0,
    )
    client = HttpClient(
        base_url="https://api.test.com",
        retry_config=custom_config,
    )
    assert client.retry_config.max_retries == 5
    assert client.retry_config.initial_delay == 2.0
    assert client.retry_config.max_delay == 20.0
    assert client.retry_config.exponential_base == 3.0
    await client.close()


@pytest.mark.asyncio
async def test_http_client_endpoint_with_leading_slash(http_client: HttpClient):
    """Test that endpoint with leading slash is handled correctly."""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value={"result": "success"})
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        await http_client.get("/test")

        call_args = mock_request.call_args
        url = call_args[1]["url"]
        # Should not have double slashes
        assert "https://api.test.com/test" == url
        assert "//" not in url.replace("https://", "")


@pytest.mark.asyncio
async def test_http_client_endpoint_without_leading_slash(http_client: HttpClient):
    """Test that endpoint without leading slash is handled correctly."""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value={"result": "success"})
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        await http_client.get("test")

        call_args = mock_request.call_args
        url = call_args[1]["url"]
        assert "https://api.test.com/test" == url


@pytest.mark.asyncio
async def test_http_client_multiple_query_params(http_client: HttpClient):
    """Test request with multiple query parameters."""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value={"result": "success"})
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        params = {"key1": "value1", "key2": "value2", "key3": "value3"}
        await http_client.get("/test", params=params)

        call_args = mock_request.call_args
        url = call_args[1]["url"]
        # All parameters should be in URL
        assert "key1=value1" in url
        assert "key2=value2" in url
        assert "key3=value3" in url


@pytest.mark.asyncio
async def test_http_client_response_error_with_text(http_client: HttpClient):
    """Test validation error with response text logging."""
    mock_response = AsyncMock()
    mock_response.status = 400
    mock_response.text = AsyncMock(return_value="Detailed error message")
    mock_response.raise_for_status = MagicMock()

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.return_value = mock_response

        with pytest.raises(ValidationError):
            await http_client.get("/test")

        # Verify that text() was called to get error details
        mock_response.text.assert_called_once()


@pytest.mark.asyncio
async def test_http_client_401_from_response_error(http_client: HttpClient):
    """Test 401 error from ClientResponseError exception path."""
    error = ClientResponseError(
        request_info=MagicMock(),
        history=(),
        status=401,
        message="Unauthorized",
    )

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.side_effect = error

        with pytest.raises(AuthenticationError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_http_client_429_from_response_error(http_client: HttpClient):
    """Test 429 error from ClientResponseError exception path."""
    error = ClientResponseError(
        request_info=MagicMock(),
        history=(),
        status=429,
        message="Too many requests",
    )

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.side_effect = error

        with pytest.raises(RateLimitError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 429


@pytest.mark.asyncio
async def test_http_client_400_from_response_error(http_client: HttpClient):
    """Test 400 error from ClientResponseError exception path."""
    error = ClientResponseError(
        request_info=MagicMock(),
        history=(),
        status=400,
        message="Bad request",
    )

    with patch("aiohttp.ClientSession.request") as mock_request:
        mock_request.return_value.__aenter__.side_effect = error

        with pytest.raises(ValidationError) as exc_info:
            await http_client.get("/test")

        assert exc_info.value.status_code == 400
