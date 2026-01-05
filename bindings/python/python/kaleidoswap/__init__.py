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
# Import models from auto-generated file
from .generated_models import (Asset, ConfirmSwapResponse, Fee, Layer,
                               NetworkInfoResponse, OrderHistoryResponse,
                               OrderStatsResponse, PairQuoteResponse,
                               ReceiverAddressFormat, SwapLeg,
                               SwapNodeInfoResponse, SwapOrderStatusResponse,
                               SwapResponse, SwapRoute, TradingPair)
# Import the PyO3-generated bindings
from .kaleidoswap import PyJsonValue as JsonValue
from .kaleidoswap import PyKaleidoClient
from .kaleidoswap import PyKaleidoConfig as KaleidoConfig
from .kaleidoswap import PyQuoteStream
from .kaleidoswap import to_display_units_py as to_display_units
from .kaleidoswap import to_smallest_units_py as to_smallest_units
# Import RGB Node models
from .rgb_node_models import (AddressResponse, AssetBalanceResponse,
                              BtcBalanceResponse)
from .rgb_node_models import Channel as RgbChannel
from .rgb_node_models import (DecodeLNInvoiceResponse, EmptyResponse,
                              InitResponse)
from .rgb_node_models import NodeInfoResponse as RgbNodeInfoResponse
from .rgb_node_models import Payment as RgbPayment
from .rgb_node_models import Peer as RgbPeer
from .sub_clients import (LspClient, MarketClient, NodeClient, OrdersClient,
                          SwapsClient)

# Import models that are not yet in generated_models from manual models
try:
    from .models import (AssetBalance, BtcBalance, Channel,
                         ChannelOrderResponse, ClientAsset,
                         CreateSwapOrderResponse, Invoice, LspInfo, NodeInfo,
                         OnchainAddress, Payment, Peer, Swap,
                         SwapStatusResponse)
except ImportError:
    # If models.py doesn't exist or doesn't have these, use placeholders
    pass


# WebSocket Event types
from enum import Enum

# Import exceptions
from .exceptions import (APIError, AssetNotFoundError, AuthenticationError,
                         ChannelNotFoundError, InsufficientBalanceError,
                         KaleidoError, LspError, NetworkError, NodeLockedError,
                         NodeNotConfiguredError, OrderNotFoundError,
                         QuoteExpiredError, RateLimitError,
                         ResourceNotFoundError, TradingPairNotFoundError,
                         ValidationError)


class WsEvent(str, Enum):
    """WebSocket event types."""

    PriceUpdate = "price_update"
    QuoteResponse = "quote_response"
    SwapUpdate = "swap_update"
    OrderUpdate = "order_update"
    Connected = "connected"
    Disconnected = "disconnected"
    Error = "error"


__all__ = [
    "KaleidoClient",
    "KaleidoConfig",
    # WebSocket
    "WsEvent",
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
    "ResourceNotFoundError",
    "AssetNotFoundError",
    "TradingPairNotFoundError",
    "NodeLockedError",
    "LspError",
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
