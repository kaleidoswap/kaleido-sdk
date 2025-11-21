"""Tests for exception classes."""

import pytest
from kaleidoswap_sdk.exceptions import (
    KaleidoError,
    NetworkError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
    SwapError,
    TimeoutError,
    WebSocketError,
    AssetError,
    PairError,
    QuoteError,
    NodeError,
)


def test_kaleido_error_basic():
    """Test basic KaleidoError initialization."""
    error = KaleidoError("Test error")
    assert str(error) == "Test error"
    assert error.message == "Test error"
    assert error.status_code is None
    assert error.response is None


def test_kaleido_error_with_status_code():
    """Test KaleidoError with status code."""
    error = KaleidoError("Test error", status_code=500)
    assert error.message == "Test error"
    assert error.status_code == 500


def test_kaleido_error_with_response():
    """Test KaleidoError with response data."""
    response_data = {"error": "details", "code": "TEST_ERROR"}
    error = KaleidoError("Test error", response=response_data)
    assert error.response == response_data
    assert error.response["error"] == "details"


def test_kaleido_error_with_all_params():
    """Test KaleidoError with all parameters."""
    response_data = {"error": "details"}
    error = KaleidoError("Test error", status_code=400, response=response_data)
    assert error.message == "Test error"
    assert error.status_code == 400
    assert error.response == response_data


def test_network_error():
    """Test NetworkError exception."""
    error = NetworkError("Connection failed", status_code=503)
    assert isinstance(error, KaleidoError)
    assert str(error) == "Connection failed"
    assert error.status_code == 503


def test_authentication_error():
    """Test AuthenticationError exception."""
    error = AuthenticationError("Invalid token", status_code=401)
    assert isinstance(error, KaleidoError)
    assert str(error) == "Invalid token"
    assert error.status_code == 401


def test_rate_limit_error():
    """Test RateLimitError exception."""
    response = {"retry_after": 60}
    error = RateLimitError("Too many requests", status_code=429, response=response)
    assert isinstance(error, KaleidoError)
    assert str(error) == "Too many requests"
    assert error.status_code == 429
    assert error.response["retry_after"] == 60


def test_validation_error():
    """Test ValidationError exception."""
    response = {"field": "amount", "error": "must be positive"}
    error = ValidationError("Invalid input", status_code=400, response=response)
    assert isinstance(error, KaleidoError)
    assert str(error) == "Invalid input"
    assert error.status_code == 400


def test_swap_error():
    """Test SwapError exception."""
    error = SwapError("Swap execution failed")
    assert isinstance(error, KaleidoError)
    assert str(error) == "Swap execution failed"


def test_timeout_error():
    """Test TimeoutError exception."""
    error = TimeoutError("Operation timed out")
    assert isinstance(error, KaleidoError)
    assert str(error) == "Operation timed out"


def test_websocket_error():
    """Test WebSocketError exception."""
    error = WebSocketError("WebSocket connection lost")
    assert isinstance(error, KaleidoError)
    assert str(error) == "WebSocket connection lost"


def test_asset_error():
    """Test AssetError exception."""
    error = AssetError("Asset not found")
    assert isinstance(error, KaleidoError)
    assert str(error) == "Asset not found"


def test_pair_error():
    """Test PairError exception."""
    error = PairError("Trading pair not available")
    assert isinstance(error, KaleidoError)
    assert str(error) == "Trading pair not available"


def test_quote_error():
    """Test QuoteError exception."""
    error = QuoteError("Quote expired")
    assert isinstance(error, KaleidoError)
    assert str(error) == "Quote expired"


def test_node_error():
    """Test NodeError exception."""
    error = NodeError("Node unreachable")
    assert isinstance(error, KaleidoError)
    assert str(error) == "Node unreachable"


def test_exception_inheritance():
    """Test that all exceptions inherit from KaleidoError."""
    exceptions = [
        NetworkError,
        AuthenticationError,
        RateLimitError,
        ValidationError,
        SwapError,
        TimeoutError,
        WebSocketError,
        AssetError,
        PairError,
        QuoteError,
        NodeError,
    ]

    for exc_class in exceptions:
        error = exc_class("Test")
        assert isinstance(error, KaleidoError)
        assert isinstance(error, Exception)


def test_exception_can_be_caught_as_kaleido_error():
    """Test that specific exceptions can be caught as KaleidoError."""
    try:
        raise NetworkError("Network failure")
    except KaleidoError as e:
        assert isinstance(e, NetworkError)
        assert str(e) == "Network failure"


def test_exception_can_be_caught_specifically():
    """Test that exceptions can be caught by their specific type."""
    try:
        raise RateLimitError("Rate limited")
    except RateLimitError as e:
        assert str(e) == "Rate limited"
    except KaleidoError:
        pytest.fail("Should have been caught as RateLimitError")


def test_exception_with_empty_message():
    """Test exception with empty message."""
    error = KaleidoError("")
    assert str(error) == ""
    assert error.message == ""


def test_exception_with_multiline_message():
    """Test exception with multiline message."""
    message = "Error occurred:\nLine 1\nLine 2"
    error = KaleidoError(message)
    assert error.message == message
    assert str(error) == message


def test_exception_attributes_accessible():
    """Test that all exception attributes are accessible."""
    response = {"error_code": "E001", "details": "Something went wrong"}
    error = NetworkError("Network error", status_code=502, response=response)

    # All attributes should be accessible
    assert hasattr(error, "message")
    assert hasattr(error, "status_code")
    assert hasattr(error, "response")

    # Values should be correct
    assert error.message == "Network error"
    assert error.status_code == 502
    assert error.response["error_code"] == "E001"


def test_exception_repr():
    """Test exception string representation."""
    error = NetworkError("Connection failed", status_code=503)
    error_str = str(error)
    assert "Connection failed" in error_str


def test_nested_exception_handling():
    """Test handling nested exceptions."""

    def level2():
        raise ValidationError("Invalid data")

    def level1():
        try:
            level2()
        except ValidationError:
            raise NetworkError("Network issue")

    try:
        level1()
    except NetworkError as e:
        assert str(e) == "Network issue"
    except ValidationError:
        pytest.fail("Should have been caught as NetworkError")


def test_exception_equality():
    """Test that exceptions with same message are not necessarily equal."""
    error1 = NetworkError("Test")
    error2 = NetworkError("Test")

    # Different instances should not be equal
    assert error1 is not error2


def test_exception_with_special_characters():
    """Test exception with special characters in message."""
    special_message = "Error: <test> & 'quotes' \"double\" $special @chars"
    error = KaleidoError(special_message)
    assert error.message == special_message


def test_exception_response_dict_access():
    """Test accessing response dictionary."""
    response = {
        "error": "test_error",
        "message": "Detailed message",
        "code": 12345,
        "nested": {"key": "value"},
    }
    error = ValidationError("Error", response=response)

    assert error.response["error"] == "test_error"
    assert error.response["code"] == 12345
    assert error.response["nested"]["key"] == "value"


def test_exception_none_response():
    """Test exception with None response."""
    error = KaleidoError("Test", response=None)
    assert error.response is None


def test_exception_with_zero_status_code():
    """Test exception with status code 0."""
    error = NetworkError("Test", status_code=0)
    assert error.status_code == 0
