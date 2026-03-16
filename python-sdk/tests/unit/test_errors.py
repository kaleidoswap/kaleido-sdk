"""
Error Handling Tests

Tests error mapping and custom error classes, matching TypeScript SDK coverage.
"""

from kaleido_sdk.errors import (
    APIError,
    ConfigError,
    KaleidoError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    SwapError,
    TimeoutError,
    ValidationError,
    map_http_error,
)


class TestErrorClasses:
    """Test error class hierarchy and properties."""

    def test_kaleido_error_is_base_class(self) -> None:
        """KaleidoError should extend Exception."""
        error = KaleidoError("TEST_ERROR", "Test message")
        assert isinstance(error, Exception)
        assert isinstance(error, KaleidoError)
        assert error.code == "TEST_ERROR"
        assert str(error) == "Test message"
        assert str(error) == "Test message"

    def test_api_error_extends_kaleido_error(self) -> None:
        """APIError should extend KaleidoError."""
        error = APIError("API Error", 400)
        assert isinstance(error, KaleidoError)
        assert isinstance(error, APIError)
        assert error.status_code == 400
        assert error.code == "API_ERROR"

    def test_network_error_extends_kaleido_error(self) -> None:
        """NetworkError should extend KaleidoError."""
        error = NetworkError("Connection failed")
        assert isinstance(error, KaleidoError)
        assert isinstance(error, NetworkError)
        assert error.code == "NETWORK_ERROR"

    def test_validation_error_has_correct_code(self) -> None:
        """ValidationError should have VALIDATION_ERROR code."""
        error = ValidationError("Invalid amount")
        assert error.code == "VALIDATION_ERROR"

    def test_not_found_error_has_404_status(self) -> None:
        """NotFoundError should have 404 status."""
        error = NotFoundError("Asset not found")
        assert error.status_code == 404
        assert error.code == "NOT_FOUND"

    def test_timeout_error_has_correct_code(self) -> None:
        """TimeoutError should have correct code."""
        error = TimeoutError("Request timed out")
        assert error.code == "TIMEOUT_ERROR"

    def test_rate_limit_error_has_429_status(self) -> None:
        """RateLimitError should have 429 status."""
        error = RateLimitError("Too many requests")
        assert error.status_code == 429
        assert error.code == "RATE_LIMIT_ERROR"

    def test_config_error_has_correct_code(self) -> None:
        """ConfigError should have correct code."""
        error = ConfigError("Missing base URL")
        assert error.code == "CONFIG_ERROR"

    def test_swap_error_includes_swap_id(self) -> None:
        """SwapError should include swap ID."""
        error = SwapError("Swap failed", swap_id="swap-123")
        assert error.swap_id == "swap-123"
        assert error.code == "SWAP_ERROR"


class TestRetryableErrors:
    """Test retryable error identification."""

    def test_network_error_is_retryable(self) -> None:
        """NetworkError should be retryable."""
        error = NetworkError("Connection failed")
        assert error.is_retryable() is True

    def test_timeout_error_is_retryable(self) -> None:
        """TimeoutError should be retryable."""
        error = TimeoutError("Request timed out")
        assert error.is_retryable() is True

    def test_api_error_with_500_is_retryable(self) -> None:
        """500 APIError should be retryable."""
        error = APIError("Server error", 500)
        assert error.is_retryable() is True

    def test_api_error_with_503_is_retryable(self) -> None:
        """503 APIError should be retryable."""
        error = APIError("Service unavailable", 503)
        assert error.is_retryable() is True

    def test_validation_error_not_retryable(self) -> None:
        """ValidationError should not be retryable."""
        error = ValidationError("Invalid input")
        assert error.is_retryable() is False

    def test_not_found_error_not_retryable(self) -> None:
        """NotFoundError should not be retryable."""
        error = NotFoundError("Resource not found")
        assert error.is_retryable() is False

    def test_rate_limit_error_not_retryable(self) -> None:
        """RateLimitError should not be retryable."""
        error = RateLimitError("Too many requests")
        assert error.is_retryable() is False


class TestHttpErrorMapping:
    """Test HTTP status code to error type mapping."""

    def test_map_400_to_validation_error(self) -> None:
        """400 status should map to ValidationError."""
        error = map_http_error(400, "Bad Request", {"message": "Invalid parameters"})
        assert isinstance(error, ValidationError)
        assert str(error) == "Invalid parameters"

    def test_map_404_to_not_found_error(self) -> None:
        """404 status should map to NotFoundError."""
        error = map_http_error(404, "Not Found", {"message": "Resource not found"})
        assert isinstance(error, NotFoundError)
        assert error.status_code == 404

    def test_map_429_to_rate_limit_error(self) -> None:
        """429 status should map to RateLimitError."""
        error = map_http_error(429, "Too Many Requests", {})
        assert isinstance(error, RateLimitError)
        assert error.status_code == 429

    def test_map_408_to_timeout_error(self) -> None:
        """408 status should map to TimeoutError."""
        error = map_http_error(408, "Request Timeout", {})
        assert isinstance(error, TimeoutError)

    def test_map_504_to_timeout_error(self) -> None:
        """504 status should map to TimeoutError."""
        error = map_http_error(504, "Gateway Timeout", {})
        assert isinstance(error, TimeoutError)

    def test_map_500_to_api_error(self) -> None:
        """500 status should map to APIError."""
        error = map_http_error(500, "Internal Server Error", {})
        assert isinstance(error, APIError)
        assert error.status_code == 500
        assert error.is_retryable() is True

    def test_map_503_to_api_error(self) -> None:
        """503 status should map to APIError."""
        error = map_http_error(503, "Service Unavailable", {})
        assert isinstance(error, APIError)
        assert error.is_retryable() is True

    def test_extract_error_message_from_data(self) -> None:
        """Should extract error message from response data."""
        error = map_http_error(400, "Bad Request", {"message": "Custom error message"})
        assert str(error) == "Custom error message"

    def test_extract_detail_field_from_data(self) -> None:
        """Should extract detail field from response data."""
        error = map_http_error(400, "Bad Request", {"detail": "Detailed error"})
        assert str(error) == "Detailed error"

    def test_fallback_to_status_text(self) -> None:
        """Should fallback to statusText when no data."""
        error = map_http_error(503, "Service Unavailable", {})
        assert "Service Unavailable" in str(error)

    def test_handle_fastapi_validation_array(self) -> None:
        """Should handle FastAPI validation error format."""
        error = map_http_error(
            422,
            "Unprocessable Entity",
            {
                "detail": [
                    {
                        "loc": ["body", "from_asset", "amount"],
                        "msg": "value must be positive",
                        "type": "value_error",
                    },
                    {
                        "loc": ["body", "to_asset", "layer"],
                        "msg": "invalid layer value",
                        "type": "value_error",
                    },
                ]
            },
        )
        assert isinstance(error, ValidationError)
        assert "from_asset.amount" in str(error)
        assert "value must be positive" in str(error)
        assert "to_asset.layer" in str(error)
        assert "invalid layer value" in str(error)
