from typing import Optional, Dict, Any


class KaleidoError(Exception):
    """Base exception for all Kaleido SDK errors."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        response: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(self.message)


class NetworkError(KaleidoError):
    """Raised when there are network-related issues."""

    pass


class AuthenticationError(KaleidoError):
    """Raised when there are authentication issues."""

    pass


class RateLimitError(KaleidoError):
    """Raised when rate limits are exceeded."""

    pass


class ValidationError(KaleidoError):
    """Raised when input validation fails."""

    pass


class SwapError(KaleidoError):
    """Raised when swap-related operations fail."""

    pass


class TimeoutError(KaleidoError):
    """Raised when operations timeout."""

    pass


class WebSocketError(KaleidoError):
    """Raised when WebSocket operations fail."""

    pass


class AssetError(KaleidoError):
    """Raised when asset-related operations fail."""

    pass


class PairError(KaleidoError):
    """Raised when trading pair operations fail."""

    pass


class QuoteError(KaleidoError):
    """Raised when quote operations fail."""

    pass


class NodeError(KaleidoError):
    """Raised when node operations fail."""

    pass
