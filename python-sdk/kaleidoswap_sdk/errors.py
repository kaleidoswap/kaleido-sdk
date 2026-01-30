"""
Kaleidoswap SDK Error Classes

Structured exception hierarchy for proper error handling.
Errors from HTTP responses are automatically mapped to these classes.
"""

from __future__ import annotations

from typing import Any


class KaleidoError(Exception):
    """Base error class for all Kaleidoswap SDK errors."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int | None = None,
        details: str | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.details = details

    def is_retryable(self) -> bool:
        """Check if this error is retryable."""
        if self.code == "RATE_LIMIT_ERROR":
            return False
        return (
            self.code == "NETWORK_ERROR"
            or self.code == "TIMEOUT_ERROR"
            or (self.status_code is not None and self.status_code >= 500)
        )

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(code={self.code!r}, message={str(self)!r})"


class APIError(KaleidoError):
    """API request failed with an error response."""

    def __init__(
        self,
        message: str,
        status_code: int,
        details: str | None = None,
    ) -> None:
        super().__init__(
            code="API_ERROR",
            message=f"API Error ({status_code}): {message}",
            status_code=status_code,
            details=details,
        )


class NetworkError(KaleidoError):
    """Network connectivity error."""

    def __init__(self, message: str) -> None:
        super().__init__(code="NETWORK_ERROR", message=message)


class ValidationError(KaleidoError):
    """Request or input validation failed."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status_code,
        )


class TimeoutError(KaleidoError):
    """Request timed out."""

    def __init__(self, message: str) -> None:
        super().__init__(code="TIMEOUT_ERROR", message=message)


class WebSocketError(KaleidoError):
    """WebSocket connection or communication error."""

    def __init__(self, message: str) -> None:
        super().__init__(code="WEBSOCKET_ERROR", message=message)


class NotFoundError(KaleidoError):
    """Resource not found (404)."""

    def __init__(self, message: str) -> None:
        super().__init__(code="NOT_FOUND", message=message, status_code=404)


class ConfigError(KaleidoError):
    """Configuration error."""

    def __init__(self, message: str) -> None:
        super().__init__(code="CONFIG_ERROR", message=message)


class SwapError(KaleidoError):
    """Swap operation failed."""

    def __init__(self, message: str, swap_id: str | None = None) -> None:
        super().__init__(code="SWAP_ERROR", message=message, details=swap_id)
        self.swap_id = swap_id


class NodeNotConfiguredError(KaleidoError):
    """RGB Node not configured but required for operation."""

    def __init__(self) -> None:
        super().__init__(
            code="NODE_NOT_CONFIGURED",
            message="RGB Node not configured. This operation requires a connected RGB Lightning Node.",
        )


class QuoteExpiredError(KaleidoError):
    """Quote has expired."""

    def __init__(self) -> None:
        super().__init__(code="QUOTE_EXPIRED", message="Quote has expired")


class InsufficientBalanceError(KaleidoError):
    """Insufficient balance for operation."""

    def __init__(
        self,
        required_amount: int,
        available_amount: int,
        asset: str | None = None,
    ) -> None:
        if asset:
            msg = f"Insufficient {asset} balance: need {required_amount}, have {available_amount}"
        else:
            msg = (
                f"Insufficient balance: need {required_amount}, have {available_amount}"
            )
        super().__init__(code="INSUFFICIENT_BALANCE", message=msg)
        self.required_amount = required_amount
        self.available_amount = available_amount
        self.asset = asset


class RateLimitError(KaleidoError):
    """Rate limit exceeded (429)."""

    def __init__(
        self,
        message: str | None = None,
        retry_after: int | None = None,
    ) -> None:
        if message:
            msg = message
        elif retry_after is not None:
            msg = f"Rate limit exceeded. Retry after {retry_after} seconds"
        else:
            msg = "Rate limit exceeded"
        super().__init__(code="RATE_LIMIT_ERROR", message=msg, status_code=429)
        self.retry_after = retry_after


def map_http_error(
    status: int,
    status_text: str,
    data: dict[str, Any] | str | None = None,
) -> KaleidoError:
    """
    Map HTTP errors to typed SDK errors.

    Args:
        status: HTTP status code
        status_text: HTTP status text
        data: Response data (may contain error details)

    Returns:
        Appropriate KaleidoError subclass
    """
    message = status_text

    if data:
        if isinstance(data, str):
            message = data
        elif isinstance(data, dict):
            # Check formatted error fields in order of preference
            message = (
                data.get("detail")
                or data.get("message")
                or data.get("error")
                or status_text
            )

            # Handle FastAPI validation errors which return detail as array
            detail = data.get("detail")
            if isinstance(detail, list):
                error_parts = []
                for err in detail:
                    if isinstance(err, dict):
                        loc = err.get("loc", [])
                        msg = err.get("msg", "")
                        loc_str = ".".join(str(item) for item in loc)
                        error_parts.append(f"{loc_str}: {msg}")
                if error_parts:
                    message = "; ".join(error_parts)

    # Map HTTP status codes to specific error types
    if status in (400, 422):
        return ValidationError(message, status_code=status)
    elif status == 404:
        return NotFoundError(message)
    elif status in (408, 504):
        return TimeoutError(message)
    elif status == 429:
        return RateLimitError()
    elif status in (500, 502, 503):
        return APIError(message, status)
    elif 400 <= status < 500:
        return APIError(message, status)
    else:
        return NetworkError(message)
