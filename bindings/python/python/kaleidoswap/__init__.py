"""
Kaleidoswap SDK for Python.

A Python SDK for interacting with Kaleidoswap - a decentralized exchange for
Bitcoin and RGB assets on the Lightning Network.

This package uses PyO Python bindings to the Rust core library.

Example:
    >>> from kaleidoswap import KaleidoClient, KaleidoConfig
    >>> config = KaleidoConfig(
    ...     base_url="https://api.regtest.kaleidoswap.com",
    ...     node_url=None,
    ...     api_key=None
    ... )
    >>> client = KaleidoClient(config)
    >>> result = client.list_assets()
    >>> print(result)
"""

from .client import KaleidoClient
from .sub_clients import (
    MarketClient,
    OrdersClient,
    SwapsClient,
    LspClient,
    NodeClient,
)
# Import the PyO3-generated bindings
from .kaleidoswap import PyJsonValue as JsonValue
from .kaleidoswap import PyKaleidoClient
from .kaleidoswap import PyKaleidoConfig as KaleidoConfig
from .kaleidoswap import PyQuoteStream
from .kaleidoswap import to_display_units_py as to_display_units
from .kaleidoswap import to_smallest_units_py as to_smallest_units

# Import models from auto-generated file
from .generated_models import (
    Asset,
    TradingPair,
    PairQuoteResponse,
    SwapLeg,
    SwapRoute,
    Fee,
    Layer,
    ReceiverAddressFormat,
    SwapNodeInfoResponse,
    SwapResponse,
    ConfirmSwapResponse,
    SwapOrderStatusResponse,
    OrderStatsResponse,
    OrderHistoryResponse,
    NetworkInfoResponse,
)

# Import RGB Node models
from .rgb_node_models import (
    NodeInfoResponse as RgbNodeInfoResponse,
    Channel as RgbChannel,
    Peer as RgbPeer,
    Payment as RgbPayment,
    BtcBalanceResponse,
    AddressResponse,
    DecodeLNInvoiceResponse,
    AssetBalanceResponse,
    InitResponse,
    EmptyResponse,
)

# Import models that are not yet in generated_models from manual models
try:
    from .models import (
        Swap,
        SwapStatusResponse,
        CreateSwapOrderResponse,
        LspInfo,
        ChannelOrderResponse,
        ClientAsset,
        AssetBalance,
        NodeInfo,
        Channel,
        Peer,
        OnchainAddress,
        BtcBalance,
        Invoice,
        Payment,
    )
except ImportError:
    # If models.py doesn't exist or doesn't have these, use placeholders
    pass


# Import exceptions
from .exceptions import (
    KaleidoError,
    APIError,
    NetworkError,
    ValidationError,
    QuoteExpiredError,
    InsufficientBalanceError,
    NodeNotConfiguredError,
    AuthenticationError,
    RateLimitError,
    ChannelNotFoundError,
    OrderNotFoundError,
)


__all__ = [
    "KaleidoClient",
    "KaleidoConfig",
    # Exceptions
    "KaleidoError",
    "APIError",
    "NetworkError",
    "ValidationError",
    "QuoteExpiredError",
    "InsufficientBalanceError",
    "NodeNotConfiguredError",
    "AuthenticationError",
    "RateLimitError",
    "ChannelNotFoundError",
    "OrderNotFoundError",
    # Utilities
    "JsonValue",
    "PyKaleidoClient",
    "PyQuoteStream",
    "to_smallest_units",
    "to_display_units",
    # Models
    "Asset",
    "TradingPair",
    "PairQuoteResponse",
    "SwapLeg",
    "SwapRoute",
    "Fee",
    "Layer",
    "ReceiverAddressFormat",
    "SwapNodeInfoResponse",
    "SwapResponse",
    "ConfirmSwapResponse",
    "Swap",
    "SwapStatusResponse",
    "CreateSwapOrderResponse",
    "SwapOrderStatusResponse",
    "OrderHistoryResponse",
    "OrderStatsResponse",
    "LspInfo",
    "NetworkInfoResponse",
    "ChannelOrderResponse",
    "ClientAsset",
    "AssetBalance",
    "NodeInfo",
    "Channel",
    "Peer",
    "OnchainAddress",
    "BtcBalance",
    "Invoice",
    "Payment",
    # RGB Node models
    "RgbNodeInfoResponse",
    "RgbChannel",
    "RgbPeer",
    "RgbPayment",
    "BtcBalanceResponse",
    "AddressResponse",
    "DecodeLNInvoiceResponse",
    "AssetBalanceResponse",
    "InitResponse",
    "EmptyResponse",
    # Sub-clients
    "MarketClient",
    "OrdersClient",
    "SwapsClient",
    "LspClient",
    "NodeClient",
]

__version__ = "0.2.0"
