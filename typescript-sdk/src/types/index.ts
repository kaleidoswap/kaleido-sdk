/**
 * Kaleidoswap SDK - Type Exports
 *
 * Single entry point for all SDK type definitions.
 * Developers should import types from here rather than from internal files.
 *
 * @example
 * // All types from one place
 * import type { GetQuoteResponse, Asset, NodeInfoResponse, KaleidoConfig } from 'kaleidoswap-sdk/types';
 *
 * // Or use domain-specific sub-paths for focused imports
 * import type { GetQuoteResponse, Asset } from 'kaleidoswap-sdk/types/market';
 * import type { NodeInfoResponse, Channel } from 'kaleidoswap-sdk/types/node';
 */

// ============================================================================
// SDK Configuration (values + types)
// ============================================================================

export type { KaleidoConfig } from './config.js';

/**
 * Runtime enum values for the Layer type.
 * Use when you need to compare or assign layer values at runtime.
 *
 * @example
 * import { LayerEnum } from 'kaleidoswap-sdk/types';
 * if (route.from_layer === LayerEnum.RGB_LN) { ... }
 */
export { LayerEnum, ReceiverAddressFormatEnum } from './config.js';

// ============================================================================
// Market API Types
// ============================================================================

export type {
    // Schema types
    Asset,
    TradingPair,
    Quote,
    SwapOrder,
    SwapOrderStatus,
    Layer,
    ReceiverAddressFormat,
    ApiComponents,

    // Market / Assets
    MarketListAssetsResponse,
    ListPairsResponse,

    // Routes
    GetPairRoutesRequest,
    GetPairRoutesResponse,
    DiscoverRoutesRequest,
    DiscoverRoutesResponse,
    GetRouteMatrixResponse,

    // Quotes
    GetQuoteRequest,
    GetQuoteResponse,

    // Swap Orders
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    GetSwapOrderStatusRequest,
    GetSwapOrderStatusResponse,
    GetOrderHistoryResponse,
    GetOrderStatsResponse,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,

    // Atomic Swaps
    InitiateSwapRequest,
    InitiateSwapResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    GetSwapStatusRequest,
    GetSwapStatusResponse,
    GetNodeInfoResponse,

    // LSPS1
    GetLspInfoResponse,
    GetLspNetworkInfoResponse,
    CreateLspOrderRequest,
    CreateLspOrderResponse,
    GetLspOrderRequest,
    GetLspOrderResponse,
    EstimateLspFeesRequest,
    EstimateLspFeesResponse,
    LspRateDecisionRequest,
    LspRateDecisionResponse,
    RetryDeliveryRequest,
    RetryDeliveryResponse,

    // Backward compat aliases
    SwapOrderStatusResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    LspInfo,
    NetworkInfo,
} from './market.js';

// ============================================================================
// Node API Types
// ============================================================================

export type {
    // Schema types
    Channel,
    NodeAsset,
    NiaAsset,
    Recipient,
    RecipientType,
    Utxo,
    BlockTime,
    EmbeddedMedia,
    Media,
    PostAssetMediaRequest,
    PostAssetMediaResponse,
    ProofOfReserves,
    RgbAllocation,
    Token,
    TokenLight,
    TransactionType,
    TransferTransportEndpoint,
    WitnessData,
    NodeComponents,

    // Authentication & Wallet
    InitWalletRequest,
    InitResponse,
    UnlockRequest,
    UnlockResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    RestoreRequest,
    RestoreResponse,
    BackupRequest,
    BackupResponse,
    ShutdownResponse,

    // Node Information
    NodeInfoResponse,
    NetworkInfoResponse,

    // Bitcoin Operations
    AddressResponse,
    BtcBalanceResponse,
    SendBtcRequest,
    SendBtcResponse,
    ListTransactionsRequest,
    ListTransactionsResponse,
    ListUnspentsRequest,
    ListUnspentsResponse,
    CreateUtxosRequest,
    CreateUtxosResponse,
    EstimateFeeRequest,
    EstimateFeeResponse,

    // RGB Asset Management
    ListAssetsRequest,
    ListAssetsResponse,
    AssetBalanceRequest,
    AssetBalanceResponse,
    AssetMetadataRequest,
    AssetMetadataResponse,
    GetAssetMediaRequest,
    GetAssetMediaResponse,
    SendRgbRequest,
    SendRgbResponse,

    // Asset Issuance
    IssueAssetNIARequest,
    IssueAssetNIAResponse,
    IssueAssetCFARequest,
    IssueAssetCFAResponse,
    IssueAssetUDARequest,
    IssueAssetUDAResponse,

    // Transfers
    ListTransfersRequest,
    ListTransfersResponse,
    RefreshTransfersRequest,
    FailTransfersRequest,

    // Channels
    ListChannelsResponse,
    OpenChannelRequest,
    OpenChannelResponse,
    CloseChannelRequest,
    GetChannelIdRequest,
    GetChannelIdResponse,

    // Peers
    ListPeersResponse,
    ConnectPeerRequest,
    ConnectPeerResponse,
    DisconnectPeerRequest,

    // Invoices
    CreateLNInvoiceRequest,
    CreateLNInvoiceResponse,
    CreateRgbInvoiceRequest,
    CreateRgbInvoiceResponse,
    DecodeLNInvoiceRequest,
    DecodeLNInvoiceResponse,
    DecodeRgbInvoiceRequest,
    DecodeRgbInvoiceResponse,
    GetInvoiceStatusRequest,
    GetInvoiceStatusResponse,

    // Payments
    SendPaymentRequest,
    SendPaymentResponse,
    KeysendRequest,
    KeysendResponse,
    ListPaymentsResponse,
    GetPaymentRequest,
    GetPaymentResponse,

    // Maker / Taker Swaps (on-node)
    WhitelistTradeRequest,
    MakerInitRequest,
    MakerInitResponse,
    MakerExecuteRequest,
    MakerExecuteResponse,
    ListSwapsResponse,
    GetSwapRequest,
    GetSwapResponse,

    // Utility
    SignMessageRequest,
    SignMessageResponse,
    SendOnionMessageRequest,
    CheckIndexerUrlRequest,
    CheckProxyEndpointRequest,
    RevokeTokenRequest,

    // Backward compat aliases
    InitRequest,
    UnlockWalletRequest,
    LNInvoiceResponse,
    AssetMediaRequest,
    AssetMediaResponse,
} from './node.js';

// ============================================================================
// WebSocket Types
// ============================================================================

export type {
    QuoteResponse,
    QuoteRequest,
    PongResponse,
    Fee,
    WebSocketResponse,
    WebSocketMessage,
    WSAction,
} from './ws.js';

// ============================================================================
// Client Types
// ============================================================================

export type { SwapCompletionOptions } from '../maker-client.js';
