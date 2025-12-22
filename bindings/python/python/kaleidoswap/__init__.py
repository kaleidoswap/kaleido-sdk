"""
Kaleidoswap SDK for Python.

A Python SDK for interacting with Kaleidoswap - a decentralized exchange for
Bitcoin and RGB assets on the Lightning Network.

This package uses PyO Python bindings to the Rust core library.

Example:
    >>> from kaleidoswap import PyKaleidoClient, PyKaleidoConfig
    >>> config = PyKaleidoConfig(
    ...     base_url="https://api.regtest.kaleidoswap.com",
    ...     node_url=None,
    ...     api_key=None,
    ...     timeout=30.0,
    ...     max_retries=3,
    ...     cache_ttl=300
    ... )
    >>> client = PyKaleidoClient(config)
    >>> result = client.list_assets()
    >>> print(result)
"""

# Import the PyO3-generated bindings
from .kaleidoswap import PyJsonValue as JsonValue
from .kaleidoswap import PyKaleidoClient as KaleidoClient
from .kaleidoswap import PyKaleidoConfig as KaleidoConfig
from .kaleidoswap import PyQuoteStream
from .kaleidoswap import to_display_units_py as to_display_units
from .kaleidoswap import to_smallest_units_py as to_smallest_units


# For compatibility, create a KaleidoError class
class KaleidoError(Exception):
    """Base exception for Kaleidoswap SDK errors"""

    pass


__all__ = [
    "KaleidoClient",
    "KaleidoConfig",
    "KaleidoError",
    "JsonValue",
    "PyQuoteStream",
    "to_smallest_units",
    "to_display_units",
]

__version__ = "0.2.0"
