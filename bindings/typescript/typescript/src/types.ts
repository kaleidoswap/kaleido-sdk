/**
 * Kaleidoswap SDK Type Definitions
 *
 * This file re-exports types from the auto-generated OpenAPI types
 * with additional SDK-specific type enhancements.
 *
 * Amount fields use JavaScript `number` from the API.
 * For high-precision operations, convert to BigInt as needed.
 */

// Import all generated types
import type { components } from './generated/api-types.js';

// ============================================================================
// Schema Type Aliases (from OpenAPI spec)
// ============================================================================

// Assets
// Assets
export type Asset = components['schemas']['ClientAsset'];
export type AssetBalance = components['schemas']['AssetBalanceResponse'];
export type AssetsResponse = components['schemas']['AssetsResponse'];

// Trading Pairs
export type TradingPair = components['schemas']['Pair'];
export type TradingPairAsset = components['schemas']['Pair']; // This seems redundant or wrong in original, keeping simple
export type PairsResponse = components['schemas']['PairResponse']; // Note: 'PairResponse' in spec has 'pairs' property

// Quotes
export type Quote = components['schemas']['PairQuoteResponse'];
export type Fee = components['schemas']['Fee'];

// Orders
export type CreateSwapOrderRequest = components['schemas']['CreateSwapOrderRequest'];
export type CreateSwapOrderResponse = components['schemas']['CreateSwapOrderResponse'];
export type SwapOrder = components['schemas']['SwapOrder'];
export type SwapOrderStatus = components['schemas']['SwapOrderStatus'];
export type SwapOrderStatusResponse = components['schemas']['SwapOrderStatusResponse'];

// Order History
export type OrderHistoryResponse = components['schemas']['OrderHistoryResponse'];
export type OrderStatsResponse = components['schemas']['OrderStatsResponse'];

// LSP
export type LspInfo = components['schemas']['GetInfoResponseModel'];
export type NetworkInfo = components['schemas']['NetworkInfoResponse'];
export type ChannelFees = components['schemas']['ChannelFees'];
export type ChannelDetails = components['schemas']['ChannelDetails'];

// Swaps
export type SwapRequest = components['schemas']['SwapRequest'];
export type SwapResponse = components['schemas']['SwapResponse'];
export type ConfirmSwapRequest = components['schemas']['ConfirmSwapRequest'];
export type ConfirmSwapResponse = components['schemas']['ConfirmSwapResponse'];

// Payments
export type PaymentDetails = components['schemas']['PaymentDetails'];
export type PaymentBolt11 = components['schemas']['PaymentBolt11'];
export type PaymentOnchain = components['schemas']['PaymentOnchain'];

// ============================================================================
// Enum Types (from OpenAPI spec)
// ============================================================================

export type SwapOrderSide = components['schemas']['SwapOrderSide'];
export type PaymentState = components['schemas']['PaymentState'];
export type PaymentStatus = components['schemas']['PaymentStatus'];
export type OrderState = components['schemas']['OrderState'];
export type AssetDeliveryStatus = components['schemas']['AssetDeliveryStatus'];
export type BitcoinNetwork = components['schemas']['BitcoinNetwork'];
export type AssetIface = components['schemas']['AssetIface'];

// ============================================================================
// Layer Types (SDK-specific)
// ============================================================================

/**
 * Supported network layers for asset transfers
 */
/**
 * Supported network layers for asset transfers
 */
export const Layer = {
    BTC_L1: 'BTC_L1',
    BTC_LN: 'BTC_LN',
    BTC_SPARK: 'BTC_SPARK',
    BTC_ARKADE: 'BTC_ARKADE',
    BTC_LIQUID: 'BTC_LIQUID',
    BTC_CASHU: 'BTC_CASHU',
    RGB_L1: 'RGB_L1',
    RGB_LN: 'RGB_LN',
    TAPASS_L1: 'TAPASS_L1',
    TAPASS_LN: 'TAPASS_LN',
    LIQUID_LIQUID: 'LIQUID_LIQUID',
    ARKADE_ARKADE: 'ARKADE_ARKADE',
    SPARK_SPARK: 'SPARK_SPARK',
} as const;

export type Layer = typeof Layer[keyof typeof Layer];

/**
 * Receiver address formats for different layers
 */
export const ReceiverAddressFormat = {
    BTC_ADDRESS: 'BTC_ADDRESS',
    BOLT11: 'BOLT11',
    BOLT12: 'BOLT12',
    LN_ADDRESS: 'LN_ADDRESS',
    RGB_INVOICE: 'RGB_INVOICE',
    LIQUID_ADDRESS: 'LIQUID_ADDRESS',
    LIQUID_INVOICE: 'LIQUID_INVOICE',
    SPARK_ADDRESS: 'SPARK_ADDRESS',
    SPARK_INVOICE: 'SPARK_INVOICE',
    ARKADE_ADDRESS: 'ARKADE_ADDRESS',
    ARKADE_INVOICE: 'ARKADE_INVOICE',
    CASHU_TOKEN: 'CASHU_TOKEN',
} as const;

export type ReceiverAddressFormat = typeof ReceiverAddressFormat[keyof typeof ReceiverAddressFormat];

// ============================================================================
// SDK Configuration (SDK-specific)
// ============================================================================

/**
 * SDK client configuration
 * Note: All config values use regular JavaScript numbers, not BigInt.
 */
export interface KaleidoConfig {
    /** Base URL for the Kaleidoswap API */
    baseUrl: string;
    /** Optional URL for RGB Lightning Node */
    nodeUrl?: string;
    /** Optional API key for authenticated requests */
    apiKey?: string;
    /** Request timeout in seconds (default: 30) */
    timeout?: number;
    /** Maximum retry attempts (default: 3) */
    maxRetries?: number;
    /** Cache TTL in seconds (default: 60) */
    cacheTtl?: number;
}

// ============================================================================
// Re-export generated types for advanced usage
// ============================================================================

/** All generated schema types from OpenAPI */
export type { components };

/** All generated path types from OpenAPI */
export type { paths, operations } from './generated/api-types.js';
