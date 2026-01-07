"""SDK exception classes matching Maker error codes."""


class KaleidoError(Exception):
    """Base SDK exception."""

    def __init__(
        self,
        message: str,
        error_code: str = None,
        status_code: int = None,
        details: dict = None,
    ):
        super().__init__(message)
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}


# HTTP-level errors
class NetworkError(KaleidoError):
    """Network/connection error."""

    pass


class ValidationError(KaleidoError):
    """Request validation failed."""

    pass


class NotFoundError(KaleidoError):
    """Resource not found."""

    pass


class UnauthorizedError(KaleidoError):
    """Authentication/authorization failed."""

    pass


class RateLimitError(KaleidoError):
    """Rate limit exceeded."""

    pass


class APIError(KaleidoError):
    """API returned error."""

    pass


class TimeoutError(KaleidoError):
    """Request timed out."""

    pass


# Domain-specific errors
class AssetNotFoundError(NotFoundError):
    """Asset not found."""

    pass


class PairNotFoundError(NotFoundError):
    """Trading pair not found."""

    pass


class InsufficientLiquidityError(KaleidoError):
    """Insufficient liquidity."""

    pass


class SwapError(KaleidoError):
    """Swap operation failed."""

    pass


class NodeNotConfiguredError(KaleidoError):
    """Node operation requires node_url."""

    pass


class ServiceUnavailableError(KaleidoError):
    """External service unavailable."""

    pass


# Error code mapping table (matches Maker's error codes)
ERROR_CODE_MAP = {
    # Network/HTTP
    "NETWORK_ERROR": NetworkError,
    "TIMEOUT_ERROR": TimeoutError,
    "SERVICE_UNAVAILABLE": ServiceUnavailableError,
    "NODE_CONNECTION_ERROR": NetworkError,
    # Validation
    "VALIDATION_ERROR": ValidationError,
    "TYPE_VALIDATION": ValidationError,
    "INVALID_AMOUNT": ValidationError,
    # Not Found
    "NOT_FOUND": NotFoundError,
    "ASSET_NOT_FOUND": AssetNotFoundError,
    "PAIR_NOT_FOUND": PairNotFoundError,
    # Authorization
    "UNAUTHORIZED": UnauthorizedError,
    # Rate limiting
    "RATE_LIMIT_EXCEEDED": RateLimitError,
    # Domain errors
    "INSUFFICIENT_LIQUIDITY": InsufficientLiquidityError,
    "INSUFFICIENT_FUNDS": InsufficientLiquidityError,
    "SWAP_ERROR": SwapError,
    "SWAP_SERVICE_ERROR": SwapError,
    "SWAP_TIMEOUT": SwapError,
    "NODE_NOT_CONFIGURED": NodeNotConfiguredError,
    # API errors
    "API_ERROR": APIError,
    "INTERNAL_ERROR": KaleidoError,
}


def create_error_from_response(error_data: dict) -> KaleidoError:
    """Create appropriate exception from error response.

    Args:
        error_data: Dict with keys: error_code, message, status_code (optional), details (optional)

    Returns:
        Appropriate exception instance based on error_code
    """
    error_code = error_data.get("error_code", "INTERNAL_ERROR")
    message = error_data.get("message", "Unknown error")
    status_code = error_data.get("status_code")
    details = error_data.get("details")

    error_class = ERROR_CODE_MAP.get(error_code, KaleidoError)
    return error_class(message, error_code, status_code, details)


# Backward compatibility aliases (old names used in client.py)
ResourceNotFoundError = NotFoundError
TradingPairNotFoundError = PairNotFoundError
AuthenticationError = UnauthorizedError
NodeLockedError = NodeNotConfiguredError  # Close enough
LspError = ServiceUnavailableError
ChannelNotFoundError = NotFoundError
OrderNotFoundError = NotFoundError
QuoteExpiredError = ValidationError  # Quote expiry is a validation issue
InsufficientBalanceError = InsufficientLiquidityError
