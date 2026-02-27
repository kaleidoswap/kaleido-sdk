"""
Kaleidoswap SDK Type Definitions

Re-exports types from auto-generated OpenAPI models.
Run `make generate-python-sdk-models` to regenerate from OpenAPI specs.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

# Re-export all generated API types (from maker.json OpenAPI spec)
from ._generated.api_types import (
    Asset,
    AssetDeliveryStatus,
    AssetsResponse,
    BitcoinNetwork,
    ChannelDetails,
    ChannelFees,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    Fee,
    GetInfoResponseModel,
    GetOrderRequest,
    Layer,
    MultiHopRoute,
    NetworkInfoResponse,
    OrderHistoryResponse,
    OrderHistorySummary,
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
    RetryDeliveryRequest,
    RetryDeliveryResponse,
    RetryDeliveryStatus,
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
    TradableAsset,
    TradingLimits,
    TradingPair,
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
        base_url: Base URL for the Kaleidoswap API
        node_url: Optional URL for RGB Lightning Node
        api_key: Optional API key for authenticated requests
        timeout: Request timeout in seconds (default: 30)
        max_retries: Maximum retry attempts (default: 3)
        cache_ttl: Cache TTL in seconds (default: 60)
    """

    base_url: str
    node_url: str | None = None
    api_key: str | None = None
    timeout: float = 30.0
    max_retries: int = 3
    cache_ttl: int = 60


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
    "AssetDeliveryStatus",
    "SwapStatus",
    "RetryDeliveryStatus",
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
    "GetInfoResponseModel",
    "NetworkInfoResponse",
    "ChannelFees",
    "ChannelDetails",
    "PaymentDetails",
    "PaymentBolt11",
    "PaymentOnchain",
    "CreateOrderRequest",
    "ChannelOrderResponse",
    "GetOrderRequest",
    "RateDecisionRequest",
    "RateDecisionResponse",
    "RetryDeliveryRequest",
    "RetryDeliveryResponse",
]
