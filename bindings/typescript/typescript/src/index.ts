/**
 * Kaleidoswap SDK
 *
 * TypeScript SDK for the Kaleidoswap protocol - trade RGB assets on Lightning Network.
 *
 * @packageDocumentation
 */

// Main client
export { KaleidoClient } from './client.js';

// Utility functions
export {
    toSmallestUnits,
    toDisplayUnits,
    getVersion,
    getSdkName,
} from './client.js';

// Types - re-export from types.ts (which sources from generated OpenAPI types)
export type {
    // Configuration
    KaleidoConfig,

    // Layers (SDK-specific)
    Layer,
    ReceiverAddressFormat,

    // Assets
    Asset,
    AssetBalance,

    // Trading pairs
    TradingPair,
    TradingPairAsset,

    // Quotes
    Quote,
    Fee,

    // Orders
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    SwapOrder,
    SwapOrderStatus,
    SwapOrderStatusResponse,
    OrderHistoryResponse,
    OrderStatsResponse,

    // LSP
    LspInfo,
    NetworkInfo,
    ChannelFees,
    ChannelDetails,

    // Swaps
    SwapRequest,
    SwapResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,

    // Payments
    PaymentDetails,
    PaymentBolt11,
    PaymentOnchain,

    // Enums
    SwapOrderSide,
    PaymentState,
    PaymentStatus,
    OrderState,
    AssetDeliveryStatus,
    BitcoinNetwork,
    AssetIface,

    // Advanced: raw generated types
    components,
    paths,
    operations,
} from './types.js';

// Errors
export {
    // Base error
    KaleidoError,
    // Specific errors
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
    // Error mapping utility
    mapWasmError,
} from './errors.js';

export type { WasmErrorData } from './errors.js';
