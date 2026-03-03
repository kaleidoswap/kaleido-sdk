/**
 * Kaleidoswap SDK - TypeScript/JavaScript
 *
 * Pure TypeScript SDK for interacting with the Kaleidoswap protocol.
 * Trade RGB assets on Lightning Network with ease.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleidoswap-sdk';
 * import type { GetQuoteResponse, Asset } from 'kaleidoswap-sdk/types';
 *
 * const client = KaleidoClient.create({
 *   baseUrl: 'https://api.regtest.kaleidoswap.com',
 * });
 *
 * const assets = await client.maker.listAssets();
 * const quote = await client.maker.getQuote({ ... });
 * ```
 */

// Export client classes
export { KaleidoClient } from './client.js';
export { MakerClient } from './maker-client.js';
export { RlnClient } from './rln-client.js';

// Export HTTP client (for advanced usage)
export { HttpClient } from './http-client.js';

// Export utility functions
export { WSClient } from './ws-client.js';
export { toSmallestUnits, toDisplayUnits, getVersion, getSdkName } from './client.js';

// ============================================================================
// Logging
//
// The SDK is silent by default (LogLevel.SILENT).
// Applications opt in to output by passing logLevel / logger in KaleidoConfig,
// or by calling the functions below directly after client creation.
//
// Available sub-components:
//   'http'   HTTP requests, responses, latency
//   'ws'     WebSocket lifecycle and messages
//   'maker'  Quote, swap order, atomic swap events
//   'rln'    RGB Lightning Node operations
//
// @example
// import { KaleidoClient, LogLevel, setComponentLogLevel } from 'kaleidoswap-sdk';
//
// // Full debug output via built-in console logger:
// const client = KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG });
//
// // Plug in Winston / Pino / any SdkLogger-compatible object:
// const client = KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.INFO, logger: myLogger });
//
// // Silence the noisy HTTP sub-component after creation:
// setComponentLogLevel('http', LogLevel.WARNING);
// ============================================================================

export {
    /** Numeric log level constants (DEBUG=10, INFO=20, WARNING=30, ERROR=40, SILENT=∞). */
    LogLevel,
    /**
     * Set the root log level for all SDK loggers at runtime.
     * Component overrides (setComponentLogLevel) take precedence.
     */
    applyLogLevel,
    /**
     * Override the log level for a single sub-component ('http', 'ws', 'maker', 'rln').
     * Pass null to clear the override and inherit the root level again.
     */
    setComponentLogLevel,
    /**
     * Inject a custom logger (Winston, Pino, console, …).
     * Pass null to revert to the built-in console output.
     */
    setLogger,
    /** Read the current root log level. */
    currentLogLevel,
    /** Read the effective level for a specific sub-component. */
    effectiveComponentLogLevel,
    /** Convert a numeric level to its human-readable name. */
    logLevelName,
} from './logging.js';

export type {
    /** Numeric type for LogLevel constants. */
    LogLevel as LogLevelValue,
    /** String aliases accepted wherever LogLevel is expected. */
    LogLevelName,
    /**
     * Minimal logger interface the SDK uses internally.
     * Implement this to plug in any logging library.
     */
    SdkLogger,
} from './logging.js';
export {
    toRawAmount,
    toDisplayAmount,
    PrecisionHandler,
    createPrecisionHandler,
    AssetPairMapper,
    createAssetPairMapper,
} from './utils/index.js';

// ============================================================================
// Error classes
// ============================================================================

export {
    KaleidoError,
    APIError,
    NetworkError,
    ValidationError,
    TimeoutError,
    WebSocketError,
    NotFoundError,
    ConfigError,
    SwapError,
    NodeNotConfiguredError,
    QuoteExpiredError,
    InsufficientBalanceError,
    RateLimitError,
    mapHttpError,
    assertResponse,
} from './errors.js';

// ============================================================================
// All type definitions
//
// Prefer importing from 'kaleidoswap-sdk/types' for a focused type-only import,
// or use the domain sub-paths:
//   import type { ... } from 'kaleidoswap-sdk/types/market';
//   import type { ... } from 'kaleidoswap-sdk/types/node';
//
// Everything below is re-exported here for convenience so that plain
// `import { ... } from 'kaleidoswap-sdk'` still works for types.
// ============================================================================

export type {
    // ---- Configuration ----
    KaleidoConfig,

    // ---- Market schema types ----
    Asset,
    TradingPair,
    Quote,
    SwapOrder,
    SwapOrderStatus,
    Layer,
    ReceiverAddressFormat,
    ApiComponents,

    // ---- Market / Assets ----
    MarketListAssetsResponse,
    ListPairsResponse,

    // ---- Routes ----
    GetPairRoutesRequest,
    GetPairRoutesResponse,
    DiscoverRoutesRequest,
    DiscoverRoutesResponse,
    GetRouteMatrixResponse,

    // ---- Quotes ----
    GetQuoteRequest,
    GetQuoteResponse,

    // ---- Swap Orders ----
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    GetSwapOrderStatusRequest,
    GetSwapOrderStatusResponse,
    GetOrderHistoryResponse,
    GetOrderStatsResponse,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,

    // ---- Atomic Swaps ----
    InitiateSwapRequest,
    InitiateSwapResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    GetSwapStatusRequest,
    GetSwapStatusResponse,
    GetNodeInfoResponse,

    // ---- LSPS1 ----
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

    // ---- Market backward compat aliases ----
    SwapOrderStatusResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    LspInfo,
    NetworkInfo,

    // ---- Node schema types ----
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

    // ---- Authentication & Wallet ----
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

    // ---- Node Information ----
    NodeInfoResponse,
    NetworkInfoResponse,

    // ---- Bitcoin Operations ----
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

    // ---- RGB Asset Management ----
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

    // ---- Asset Issuance ----
    IssueAssetNIARequest,
    IssueAssetNIAResponse,
    IssueAssetCFARequest,
    IssueAssetCFAResponse,
    IssueAssetUDARequest,
    IssueAssetUDAResponse,

    // ---- Transfers ----
    ListTransfersRequest,
    ListTransfersResponse,
    RefreshTransfersRequest,
    FailTransfersRequest,

    // ---- Channels ----
    ListChannelsResponse,
    OpenChannelRequest,
    OpenChannelResponse,
    CloseChannelRequest,
    GetChannelIdRequest,
    GetChannelIdResponse,

    // ---- Peers ----
    ListPeersResponse,
    ConnectPeerRequest,
    ConnectPeerResponse,
    DisconnectPeerRequest,

    // ---- Invoices ----
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

    // ---- Payments ----
    SendPaymentRequest,
    SendPaymentResponse,
    KeysendRequest,
    KeysendResponse,
    ListPaymentsResponse,
    GetPaymentRequest,
    GetPaymentResponse,

    // ---- Maker / Taker Swaps (on-node) ----
    WhitelistTradeRequest,
    MakerInitRequest,
    MakerInitResponse,
    MakerExecuteRequest,
    MakerExecuteResponse,
    ListSwapsResponse,
    GetSwapRequest,
    GetSwapResponse,

    // ---- Utility ----
    SignMessageRequest,
    SignMessageResponse,
    SendOnionMessageRequest,
    CheckIndexerUrlRequest,
    CheckProxyEndpointRequest,
    RevokeTokenRequest,

    // ---- Node backward compat aliases ----
    InitRequest,
    UnlockWalletRequest,
    LNInvoiceResponse,
    AssetMediaRequest,
    AssetMediaResponse,

    // ---- WebSocket types ----
    QuoteResponse,
    QuoteRequest,
    PongResponse,
    Fee,
    WebSocketResponse,
    WebSocketMessage,
    WSAction,

    // ---- Client types ----
    SwapCompletionOptions,
} from './types/index.js';

// ---- Runtime enum values (values, not types — must use plain export) ----
export { LayerEnum, ReceiverAddressFormatEnum } from './types/index.js';
