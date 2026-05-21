"""
Kaleidoswap SDK Type Definitions

Re-exports types from auto-generated OpenAPI models.
Run `make generate-python-sdk-models` to regenerate from OpenAPI specs.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING

from ._logging import SdkLogger

# Re-export all generated API types (from maker.json OpenAPI spec)
from ._generated.api_types import (
    AssetResponseModel,
    AssetsResponse,
    BitcoinNetwork,
    ChannelDetails,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    EstimateFeesRequest,
    EstimateFeesResponse,
    Fee,
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
    SwapRequest,
    SwapResponse,
    SwapRoute,
    SwapStatus,
    SwapStatusRequest,
    SwapStatusResponse,
    TradableAssetResponseModel,
    TradingLimits,
    TradingPairResponseModel,
    TradingPairsResponse,
)

if TYPE_CHECKING:
    pass

# =============================================================================
# SDK Configuration
# =============================================================================


@dataclass
class KaleidoConfig:
    """
    SDK client configuration.

    Attributes:
        base_url: Base URL for the Kaleidoswap Maker API.
            Defaults to https://api.regtest.kaleidoswap.com.
        node_url: Optional URL for RGB Lightning Node
        api_key: Optional API key for authenticated requests
        allow_insecure: Allow attribution headers over non-HTTPS Maker URLs.
            HTTP localhost is allowed automatically for local development.
        install_id: Optional persistent install identifier. Generated automatically by
            KaleidoClient.create when omitted.
        session_id: Optional per-client session identifier. Generated automatically by
            KaleidoClient.create when omitted.
        timeout: Request timeout in seconds (default: 30)
        max_retries: Maximum retry attempts (default: 3)
        cache_ttl: Cache TTL in seconds (default: 60)
        log_level: Python logging level for all SDK loggers (default: logging.WARNING).
            Accepts integer constants (logging.DEBUG, logging.INFO, logging.WARNING, ...)
            or their string equivalents ('DEBUG', 'INFO', 'WARNING', 'ERROR').
            Set to logging.DEBUG to see full HTTP traces, WebSocket frames, and
            swap lifecycle events. The application is responsible for configuring
            log handlers and output destinations.
        logger: Optional custom logger that satisfies the ``SdkLogger`` Protocol
            (debug/info/warning/error methods). When set, SDK log records are
            forwarded to it via a stdlib ``logging.Handler`` bridge. Useful for
            plugging in loguru, structlog wrappers, or test recorders. Mirrors
            the TypeScript SDK's `logger` config field.
    """

    base_url: str = "https://api.regtest.kaleidoswap.com"
    node_url: str | None = None
    api_key: str | None = None
    allow_insecure: bool = False
    install_id: str | None = None
    session_id: str | None = None
    timeout: float = 30.0
    max_retries: int = 3
    cache_ttl: int = 60
    log_level: int | str = logging.WARNING
    logger: SdkLogger | None = None


# =============================================================================
# Cross-SDK type-name aliases (Batch F)
# Re-export the historical TypeScript names so call sites stay portable.
# Aliases are non-deprecated until 0.2.0; prefer the canonical name on the
# right-hand side going forward.
# =============================================================================

#: Alias of :class:`EstimateFeesRequest` — matches the TypeScript type name.
EstimateLspFeesRequest = EstimateFeesRequest
#: Alias of :class:`EstimateFeesResponse` — matches the TypeScript type name.
EstimateLspFeesResponse = EstimateFeesResponse
#: Alias of :class:`ChannelOrderResponse` for ``get_lsp_order`` — matches the TS name.
GetLspOrderResponse = ChannelOrderResponse


__all__ = [
    # Config
    "KaleidoConfig",
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
    "AssetResponseModel",
    "AssetsResponse",
    "TradingPairResponseModel",
    "TradingPairsResponse",
    "TradableAssetResponseModel",
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
    "EstimateFeesResponse",
    "ChannelDetails",
    "PaymentDetails",
    "PaymentBolt11",
    "PaymentOnchain",
    "CreateOrderRequest",
    "EstimateFeesRequest",
    "ChannelOrderResponse",
    "OrderRequest",
    "RateDecisionRequest",
    "RateDecisionResponse",
    # Cross-SDK type-name aliases (Batch F)
    "EstimateLspFeesRequest",
    "EstimateLspFeesResponse",
    "GetLspOrderResponse",
]
