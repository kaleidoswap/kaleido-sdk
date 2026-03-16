"""
Kaleidoswap SDK - Python

Pure Python SDK for interacting with the Kaleidoswap protocol.
Trade RGB assets on Lightning Network with ease.

Example:
    ```python
    from kaleido_sdk import KaleidoClient

    async def main():
        client = KaleidoClient.create(
            base_url="https://api.kaleidoswap.com"
        )

        assets = await client.maker.list_assets()
        quote = await client.maker.get_quote(...)
    ```

Logging:
    The SDK uses Python's standard logging module and follows the library
    logging best practice: a NullHandler is installed at the root logger so
    no output is produced unless the application configures handlers.

    Available loggers:
        kaleido_sdk        — root (controls all SDK logging at once)
        kaleido_sdk.http   — HTTP requests, responses, latency, retries
        kaleido_sdk.ws     — WebSocket lifecycle and messages
        kaleido_sdk.maker  — Quote, swap order, and atomic swap events
        kaleido_sdk.rln    — RGB Lightning Node operations

    Quick start (configure handler in application code only):
        ```python
        import logging
        import kaleido_sdk as ks

        logging.basicConfig(
            level=logging.DEBUG,
            format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        )
        client = ks.KaleidoClient.create(
            base_url="https://api.kaleidoswap.com",
            log_level=logging.DEBUG,
        )
        ```

    To route logs to a file (application responsibility):
        ```python
        handler = logging.FileHandler("kaleido.log")
        logging.getLogger("kaleido_sdk").addHandler(handler)
        ```
"""

from ._maker_client import MakerClient, SwapCompletionOptions
from ._rln_client import RlnClient
from ._utils import (
    MappedAsset,
    PrecisionHandler,
    create_precision_handler,
    to_display_amount,
    to_raw_amount,
)
from ._ws_client import (
    WebSocketMessage,
    WSAction,
    WSClient,
)
from .client import (
    KaleidoClient,
    get_sdk_name,
    get_version,
    to_display_units,
    to_smallest_units,
)
from .errors import (
    APIError,
    ConfigError,
    InsufficientBalanceError,
    KaleidoError,
    NetworkError,
    NodeNotConfiguredError,
    NotFoundError,
    QuoteExpiredError,
    RateLimitError,
    SwapError,
    TimeoutError,
    ValidationError,
    WebSocketError,
)
from .types import (
    # API Types - Assets & Pairs
    Asset,
    AssetsResponse,
    BitcoinNetwork,
    ChannelDetails,
    ChannelFees,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateOrderRequest,
    # API Types - Swap Orders
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    # API Types - Quotes & Routes
    Fee,
    # API Types - LSP
    # Config
    KaleidoConfig,
    # Enums (API)
    Layer,
    LspInfoResponse,
    MultiHopRoute,
    NetworkInfoResponse,
    OrderHistoryResponse,
    OrderHistorySummary,
    OrderRequest,
    OrderState,
    OrderStatsResponse,
    PaginationMeta,
    PairQuoteRequest,
    PairQuoteResponse,
    PaymentBolt11,
    PaymentDetails,
    PaymentOnchain,
    PaymentState,
    PaymentStatus,
    RateDecisionRequest,
    RateDecisionResponse,
    ReachabilityCell,
    ReachabilityMatrixResponse,
    ReceiverAddress,
    ReceiverAddressFormat,
    RoutesRequest,
    RoutesResponse,
    RouteStep,
    Swap,
    SwapLeg,
    SwapLegInput,
    SwapNodeInfoResponse,
    SwapOrder,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,
    SwapOrderStatus,
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    # API Types - Atomic Swaps
    SwapRequest,
    SwapResponse,
    SwapRoute,
    SwapStatus,
    SwapStatusRequest,
    SwapStatusResponse,
    TradableAsset,
    TradingLimits,
    TradingPair,
    TradingPairsResponse,
)

__version__ = "0.1.0"
__all__ = [
    # Main client
    "KaleidoClient",
    "MakerClient",
    "RlnClient",
    "SwapCompletionOptions",
    # Utility functions
    "to_smallest_units",
    "to_display_units",
    "to_raw_amount",
    "to_display_amount",
    "get_version",
    "get_sdk_name",
    "PrecisionHandler",
    "MappedAsset",
    "create_precision_handler",
    # WebSocket
    "WSAction",
    "WSClient",
    "WebSocketMessage",
    # Config
    "KaleidoConfig",
    # Errors
    "KaleidoError",
    "APIError",
    "NetworkError",
    "ValidationError",
    "TimeoutError",
    "WebSocketError",
    "NotFoundError",
    "ConfigError",
    "SwapError",
    "NodeNotConfiguredError",
    "QuoteExpiredError",
    "InsufficientBalanceError",
    "RateLimitError",
    # Enums (API)
    "Layer",
    "ReceiverAddressFormat",
    "BitcoinNetwork",
    "SwapOrderStatus",
    "OrderState",
    "PaymentState",
    "PaymentStatus",
    "SwapStatus",
    # API Types - Assets & Pairs
    "Asset",
    "AssetsResponse",
    "TradingPair",
    "TradingPairsResponse",
    "TradableAsset",
    "TradingLimits",
    # API Types - Quotes & Routes
    "Fee",
    "SwapLeg",
    "SwapLegInput",
    "SwapRoute",
    "ReceiverAddress",
    "MultiHopRoute",
    "RouteStep",
    "PairQuoteRequest",
    "PairQuoteResponse",
    "RoutesRequest",
    "RoutesResponse",
    "ReachabilityCell",
    "ReachabilityMatrixResponse",
    # API Types - Swap Orders
    "CreateSwapOrderRequest",
    "CreateSwapOrderResponse",
    "SwapOrder",
    "SwapOrderStatusRequest",
    "SwapOrderStatusResponse",
    "SwapOrderRateDecisionRequest",
    "SwapOrderRateDecisionResponse",
    "OrderHistoryResponse",
    "OrderHistorySummary",
    "OrderStatsResponse",
    "PaginationMeta",
    # API Types - Atomic Swaps
    "SwapRequest",
    "SwapResponse",
    "ConfirmSwapRequest",
    "ConfirmSwapResponse",
    "SwapStatusRequest",
    "SwapStatusResponse",
    "Swap",
    "SwapNodeInfoResponse",
    # API Types - LSP
    "LspInfoResponse",
    "NetworkInfoResponse",
    "ChannelFees",
    "ChannelDetails",
    "PaymentDetails",
    "PaymentBolt11",
    "PaymentOnchain",
    "CreateOrderRequest",
    "ChannelOrderResponse",
    "OrderRequest",
    "RateDecisionRequest",
    "RateDecisionResponse",
]
