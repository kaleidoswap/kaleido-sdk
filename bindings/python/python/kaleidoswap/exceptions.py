"""
Kaleidoswap SDK Exceptions.

Structured exception hierarchy for better error handling.
"""


class KaleidoError(Exception):
    """Base exception for Kaleidoswap SDK errors."""
    pass


class APIError(KaleidoError):
    """API request failed."""
    
    def __init__(self, status_code: int, message: str, response: dict = None):
        self.status_code = status_code
        self.message = message
        self.response = response
        super().__init__(f"API Error {status_code}: {message}")


class NetworkError(KaleidoError):
    """Network connectivity issues."""
    pass


class ValidationError(KaleidoError):
    """Invalid input parameters."""
    pass


class QuoteExpiredError(KaleidoError):
    """Quote has expired."""
    pass


class InsufficientBalanceError(KaleidoError):
    """Insufficient balance for operation."""
    
    def __init__(self, required_amount: int, available_amount: int, asset: str = None):
        self.required_amount = required_amount
        self.available_amount = available_amount
        self.asset = asset
        msg = f"Insufficient balance: need {required_amount}, have {available_amount}"
        if asset:
            msg += f" for {asset}"
        super().__init__(msg)


class NodeNotConfiguredError(KaleidoError):
    """RGB Node not configured."""
    pass


class AuthenticationError(KaleidoError):
    """Authentication failed."""
    pass


class RateLimitError(APIError):
    """Rate limit exceeded."""
    
    def __init__(self, retry_after: int = None):
        self.retry_after = retry_after
        msg = "Rate limit exceeded"
        if retry_after:
            msg += f". Retry after {retry_after} seconds"
        super().__init__(429, msg)


class ChannelNotFoundError(KaleidoError):
    """Channel not found."""
    pass


class OrderNotFoundError(KaleidoError):
    """Order not found."""
    pass
