"""
Kaleidoswap SDK Type Definitions

This file provides SDK configuration and re-exports types from generated OpenAPI models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

# Re-export all generated API types
from .generated.api_types import (
    Asset,
    AssetDeliveryStatus,
    AssetsResponse,
    BitcoinNetwork,
    ChannelDetails,
    ChannelFees,
    ChannelOrderResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    CreateLspOrderRequest,
    CreateLspOrderResponse,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    DiscoverRoutesRequest,
    DiscoverRoutesResponse,
    EstimateLspFeesRequest,
    EstimateLspFeesResponse,
    Fee,
    GetLspInfoResponse,
    GetLspNetworkInfoResponse,
    GetLspOrderRequest,
    GetLspOrderResponse,
    GetNodeInfoResponse,
    GetOrderHistoryResponse,
    GetOrderStatsResponse,
    GetPairRoutesRequest,
    GetPairRoutesResponse,
    GetQuoteRequest,
    GetQuoteResponse,
    GetRouteMatrixResponse,
    GetSwapStatusRequest,
    GetSwapStatusResponse,
    InitiateSwapRequest,
    InitiateSwapResponse,
    Layer,
    ListPairsResponse,
    LspRateDecisionRequest,
    LspRateDecisionResponse,
    MarketListAssetsResponse,
    MultiHopRoute,
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
    ReachabilityCell,
    ReachabilityMatrixResponse,
    ReceiverAddress,
    ReceiverAddressFormat,
    RetryDeliveryRequest,
    RetryDeliveryResponse,
    RetryDeliveryStatus,
    RouteStep,
    RoutesRequest,
    RoutesResponse,
    Swap,
    SwapLeg,
    SwapLegInput,
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

# Re-export node types
from .generated.node_types import (
    AddressResponse,
    AssetBalanceRequest,
    AssetBalanceResponse,
    AssetCFA,
    AssetMetadataRequest,
    AssetMetadataResponse,
    AssetNIA,
    AssetSchema,
    AssetUDA,
    BackupRequest,
    BtcBalance,
    BtcBalanceRequest,
    BtcBalanceResponse,
    Channel,
    ChannelStatus,
    ChangePasswordRequest,
    CheckIndexerUrlRequest,
    CheckIndexerUrlResponse,
    CheckProxyEndpointRequest,
    CloseChannelRequest,
    ConnectPeerRequest,
    ConnectPeerResponse,
    CreateUtxosRequest,
    DecodeLNInvoiceRequest,
    DecodeLNInvoiceResponse,
    DecodeRgbInvoiceRequest,
    DecodeRgbInvoiceResponse,
    DisconnectPeerRequest,
    EstimateFeeRequest,
    EstimateFeeResponse,
    FailTransfersRequest,
    FailTransfersResponse,
    GetAssetMediaRequest,
    GetAssetMediaResponse,
    GetChannelIdRequest,
    GetChannelIdResponse,
    GetPaymentRequest,
    GetPaymentResponse,
    GetSwapRequest,
    GetSwapResponse,
    HTLCStatus,
    IndexerProtocol,
    InitWalletRequest,
    InitWalletResponse,
    InvoiceStatus,
    InvoiceStatusRequest,
    InvoiceStatusResponse,
    IssueAssetCFARequest,
    IssueAssetCFAResponse,
    IssueAssetNIARequest,
    IssueAssetNIAResponse,
    IssueAssetUDARequest,
    IssueAssetUDAResponse,
    KeysendRequest,
    KeysendResponse,
    ListAssetsRequest,
    ListAssetsResponse,
    ListChannelsResponse,
    ListPaymentsResponse,
    ListPeersResponse,
    ListSwapsResponse,
    ListTransactionsRequest,
    ListTransactionsResponse,
    ListTransfersRequest,
    ListTransfersResponse,
    ListUnspentsRequest,
    ListUnspentsResponse,
    LNInvoiceRequest,
    LNInvoiceResponse,
    MakerExecuteRequest,
    MakerExecuteResponse,
    MakerInitRequest,
    MakerInitResponse,
    NetworkInfoResponse,
    NodeInfoResponse,
    OpenChannelRequest,
    OpenChannelResponse,
    Payment,
    Peer,
    RefreshTransfersRequest,
    RestoreRequest,
    RevokeTokenRequest,
    RgbInvoiceRequest,
    RgbInvoiceResponse,
    SendAssetRequest,
    SendAssetResponse,
    SendBtcRequest,
    SendBtcResponse,
    SendOnionMessageRequest,
    SendPaymentRequest,
    SendPaymentResponse,
    SignMessageRequest,
    SignMessageResponse,
    Transaction,
    Transfer,
    TransferKind,
    TransferStatus,
    UnlockWalletRequest,
    Unspent,
    WhitelistTradeRequest,
)

if TYPE_CHECKING:
    from httpx import AsyncClient


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


# =============================================================================
# Layer Enum Constants (for runtime usage)
# =============================================================================

# Layer enum values for runtime usage
LAYER_BTC_L1 = Layer.BTC_L1
LAYER_BTC_LN = Layer.BTC_LN
LAYER_BTC_SPARK = Layer.BTC_SPARK
LAYER_BTC_ARKADE = Layer.BTC_ARKADE
LAYER_BTC_LIQUID = Layer.BTC_LIQUID
LAYER_BTC_CASHU = Layer.BTC_CASHU
LAYER_RGB_L1 = Layer.RGB_L1
LAYER_RGB_LN = Layer.RGB_LN
LAYER_TAPASS_L1 = Layer.TAPASS_L1
LAYER_TAPASS_LN = Layer.TAPASS_LN
LAYER_LIQUID_LIQUID = Layer.LIQUID_LIQUID
LAYER_ARKADE_ARKADE = Layer.ARKADE_ARKADE
LAYER_SPARK_SPARK = Layer.SPARK_SPARK

# ReceiverAddressFormat enum values for runtime usage
FORMAT_BTC_ADDRESS = ReceiverAddressFormat.BTC_ADDRESS
FORMAT_BOLT11 = ReceiverAddressFormat.BOLT11
FORMAT_BOLT12 = ReceiverAddressFormat.BOLT12
FORMAT_LN_ADDRESS = ReceiverAddressFormat.LN_ADDRESS
FORMAT_RGB_INVOICE = ReceiverAddressFormat.RGB_INVOICE
FORMAT_LIQUID_ADDRESS = ReceiverAddressFormat.LIQUID_ADDRESS
FORMAT_LIQUID_INVOICE = ReceiverAddressFormat.LIQUID_INVOICE
FORMAT_SPARK_ADDRESS = ReceiverAddressFormat.SPARK_ADDRESS
FORMAT_SPARK_INVOICE = ReceiverAddressFormat.SPARK_INVOICE
FORMAT_ARKADE_ADDRESS = ReceiverAddressFormat.ARKADE_ADDRESS
FORMAT_ARKADE_INVOICE = ReceiverAddressFormat.ARKADE_INVOICE
FORMAT_CASHU_TOKEN = ReceiverAddressFormat.CASHU_TOKEN


# =============================================================================
# Type Aliases
# =============================================================================

# Quote alias
Quote = PairQuoteResponse

# LSP aliases
LspInfo = GetLspInfoResponse
NetworkInfo = NetworkInfoResponse

__all__ = [
    # Config
    "KaleidoConfig",
    # Layer constants
    "LAYER_BTC_L1",
    "LAYER_BTC_LN",
    "LAYER_BTC_SPARK",
    "LAYER_BTC_ARKADE",
    "LAYER_BTC_LIQUID",
    "LAYER_BTC_CASHU",
    "LAYER_RGB_L1",
    "LAYER_RGB_LN",
    "LAYER_TAPASS_L1",
    "LAYER_TAPASS_LN",
    "LAYER_LIQUID_LIQUID",
    "LAYER_ARKADE_ARKADE",
    "LAYER_SPARK_SPARK",
    # Format constants
    "FORMAT_BTC_ADDRESS",
    "FORMAT_BOLT11",
    "FORMAT_BOLT12",
    "FORMAT_LN_ADDRESS",
    "FORMAT_RGB_INVOICE",
    "FORMAT_LIQUID_ADDRESS",
    "FORMAT_LIQUID_INVOICE",
    "FORMAT_SPARK_ADDRESS",
    "FORMAT_SPARK_INVOICE",
    "FORMAT_ARKADE_ADDRESS",
    "FORMAT_ARKADE_INVOICE",
    "FORMAT_CASHU_TOKEN",
    # Enums
    "Layer",
    "ReceiverAddressFormat",
    "BitcoinNetwork",
    "SwapOrderStatus",
    "OrderState",
    "PaymentState",
    "PaymentStatus",
    "AssetDeliveryStatus",
    "SwapStatus",
    "AssetSchema",
    "ChannelStatus",
    "HTLCStatus",
    "InvoiceStatus",
    "TransferStatus",
    "TransferKind",
    "IndexerProtocol",
    # API Types
    "Asset",
    "AssetsResponse",
    "TradingPair",
    "TradingPairsResponse",
    "TradableAsset",
    "TradingLimits",
    "Fee",
    "Quote",
    "SwapLeg",
    "SwapLegInput",
    "SwapRoute",
    "ReceiverAddress",
    "MultiHopRoute",
    "RouteStep",
    # Request/Response types
    "PairQuoteRequest",
    "PairQuoteResponse",
    "GetQuoteRequest",
    "GetQuoteResponse",
    "RoutesRequest",
    "RoutesResponse",
    "GetPairRoutesRequest",
    "GetPairRoutesResponse",
    "DiscoverRoutesRequest",
    "DiscoverRoutesResponse",
    "CreateSwapOrderRequest",
    "CreateSwapOrderResponse",
    "SwapOrder",
    "SwapOrderStatusRequest",
    "SwapOrderStatusResponse",
    "OrderHistoryResponse",
    "OrderHistorySummary",
    "OrderStatsResponse",
    "GetOrderHistoryResponse",
    "GetOrderStatsResponse",
    "PaginationMeta",
    "SwapOrderRateDecisionRequest",
    "SwapOrderRateDecisionResponse",
    # Atomic swap types
    "SwapRequest",
    "SwapResponse",
    "ConfirmSwapRequest",
    "ConfirmSwapResponse",
    "SwapStatusRequest",
    "SwapStatusResponse",
    "InitiateSwapRequest",
    "InitiateSwapResponse",
    "GetSwapStatusRequest",
    "GetSwapStatusResponse",
    "Swap",
    "GetNodeInfoResponse",
    # LSP types
    "LspInfo",
    "NetworkInfo",
    "GetLspInfoResponse",
    "GetLspNetworkInfoResponse",
    "ChannelFees",
    "ChannelDetails",
    "PaymentDetails",
    "PaymentBolt11",
    "PaymentOnchain",
    "CreateLspOrderRequest",
    "CreateLspOrderResponse",
    "ChannelOrderResponse",
    "GetLspOrderRequest",
    "GetLspOrderResponse",
    "EstimateLspFeesRequest",
    "EstimateLspFeesResponse",
    "LspRateDecisionRequest",
    "LspRateDecisionResponse",
    "RetryDeliveryRequest",
    "RetryDeliveryResponse",
    "RetryDeliveryStatus",
    # Route matrix
    "ReachabilityCell",
    "ReachabilityMatrixResponse",
    "GetRouteMatrixResponse",
    "MarketListAssetsResponse",
    "ListPairsResponse",
    # Node types
    "AddressResponse",
    "AssetBalanceRequest",
    "AssetBalanceResponse",
    "AssetCFA",
    "AssetMetadataRequest",
    "AssetMetadataResponse",
    "AssetNIA",
    "AssetUDA",
    "BackupRequest",
    "BtcBalance",
    "BtcBalanceRequest",
    "BtcBalanceResponse",
    "Channel",
    "ChangePasswordRequest",
    "CheckIndexerUrlRequest",
    "CheckIndexerUrlResponse",
    "CheckProxyEndpointRequest",
    "CloseChannelRequest",
    "ConnectPeerRequest",
    "ConnectPeerResponse",
    "CreateUtxosRequest",
    "DecodeLNInvoiceRequest",
    "DecodeLNInvoiceResponse",
    "DecodeRgbInvoiceRequest",
    "DecodeRgbInvoiceResponse",
    "DisconnectPeerRequest",
    "EstimateFeeRequest",
    "EstimateFeeResponse",
    "FailTransfersRequest",
    "FailTransfersResponse",
    "GetAssetMediaRequest",
    "GetAssetMediaResponse",
    "GetChannelIdRequest",
    "GetChannelIdResponse",
    "GetPaymentRequest",
    "GetPaymentResponse",
    "GetSwapRequest",
    "GetSwapResponse",
    "InitWalletRequest",
    "InitWalletResponse",
    "InvoiceStatusRequest",
    "InvoiceStatusResponse",
    "IssueAssetCFARequest",
    "IssueAssetCFAResponse",
    "IssueAssetNIARequest",
    "IssueAssetNIAResponse",
    "IssueAssetUDARequest",
    "IssueAssetUDAResponse",
    "KeysendRequest",
    "KeysendResponse",
    "ListAssetsRequest",
    "ListAssetsResponse",
    "ListChannelsResponse",
    "ListPaymentsResponse",
    "ListPeersResponse",
    "ListSwapsResponse",
    "ListTransactionsRequest",
    "ListTransactionsResponse",
    "ListTransfersRequest",
    "ListTransfersResponse",
    "ListUnspentsRequest",
    "ListUnspentsResponse",
    "LNInvoiceRequest",
    "LNInvoiceResponse",
    "MakerExecuteRequest",
    "MakerExecuteResponse",
    "MakerInitRequest",
    "MakerInitResponse",
    "NetworkInfoResponse",
    "NodeInfoResponse",
    "OpenChannelRequest",
    "OpenChannelResponse",
    "Payment",
    "Peer",
    "RefreshTransfersRequest",
    "RestoreRequest",
    "RevokeTokenRequest",
    "RgbInvoiceRequest",
    "RgbInvoiceResponse",
    "SendAssetRequest",
    "SendAssetResponse",
    "SendBtcRequest",
    "SendBtcResponse",
    "SendOnionMessageRequest",
    "SendPaymentRequest",
    "SendPaymentResponse",
    "SignMessageRequest",
    "SignMessageResponse",
    "Transaction",
    "Transfer",
    "UnlockWalletRequest",
    "Unspent",
    "WhitelistTradeRequest",
]
