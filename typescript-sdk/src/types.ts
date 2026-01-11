/**
 * Kaleidoswap SDK Type Definitions
 *
 * This file re-exports types from the auto-generated OpenAPI types
 * with additional SDK-specific type enhancements.
 *
 * Amount fields use JavaScript `number` from the API for compatibility.
 * Note: JavaScript numbers are safe up to 2^53. For high-precision operations
 * with very large amounts, consider converting to BigInt as needed.
 */

// Import all generated types
import type { components } from './generated/api-types.js';

// ============================================================================
// Schema Type Aliases (from OpenAPI spec)
// ============================================================================

// Assets
export type Asset = components['schemas']['Asset'];
export type AssetsResponse = components['schemas']['AssetsResponse'];

// Trading Pairs
export type TradingPair = components['schemas']['TradingPair'];
export type TradingPairsResponse = components['schemas']['TradingPairsResponse'];

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

export type PaymentState = components['schemas']['PaymentState'];
export type PaymentStatus = components['schemas']['PaymentStatus'];
export type OrderState = components['schemas']['OrderState'];
export type AssetDeliveryStatus = components['schemas']['AssetDeliveryStatus'];
export type BitcoinNetwork = components['schemas']['BitcoinNetwork'];

// ============================================================================
// Layer Types (from OpenAPI spec)
// ============================================================================

/**
 * Supported network layers for asset transfers
 * Generated from OpenAPI spec
 */
export type Layer = components['schemas']['Layer'];

/**
 * Receiver address formats for different layers
 * Generated from OpenAPI spec
 */
export type ReceiverAddressFormat = components['schemas']['ReceiverAddressFormat'];

/**
 * Layer enum values for runtime usage
 * @deprecated Use type-safe Layer type instead
 */
export const LayerEnum = {
    BTC_L1: 'BTC_L1' as Layer,
    BTC_LN: 'BTC_LN' as Layer,
    BTC_SPARK: 'BTC_SPARK' as Layer,
    BTC_ARKADE: 'BTC_ARKADE' as Layer,
    BTC_LIQUID: 'BTC_LIQUID' as Layer,
    BTC_CASHU: 'BTC_CASHU' as Layer,
    RGB_L1: 'RGB_L1' as Layer,
    RGB_LN: 'RGB_LN' as Layer,
    TAPASS_L1: 'TAPASS_L1' as Layer,
    TAPASS_LN: 'TAPASS_LN' as Layer,
    LIQUID_LIQUID: 'LIQUID_LIQUID' as Layer,
    ARKADE_ARKADE: 'ARKADE_ARKADE' as Layer,
    SPARK_SPARK: 'SPARK_SPARK' as Layer,
} as const;

/** @deprecated Use Layer type or LayerEnum const instead */
export { LayerEnum as Layer };

/**
 * ReceiverAddressFormat enum values for runtime usage
 * @deprecated Use type-safe ReceiverAddressFormat type instead
 */
export const ReceiverAddressFormatEnum = {
    BTC_ADDRESS: 'BTC_ADDRESS' as ReceiverAddressFormat,
    BOLT11: 'BOLT11' as ReceiverAddressFormat,
    BOLT12: 'BOLT12' as ReceiverAddressFormat,
    LN_ADDRESS: 'LN_ADDRESS' as ReceiverAddressFormat,
    RGB_INVOICE: 'RGB_INVOICE' as ReceiverAddressFormat,
    LIQUID_ADDRESS: 'LIQUID_ADDRESS' as ReceiverAddressFormat,
    LIQUID_INVOICE: 'LIQUID_INVOICE' as ReceiverAddressFormat,
    SPARK_ADDRESS: 'SPARK_ADDRESS' as ReceiverAddressFormat,
    SPARK_INVOICE: 'SPARK_INVOICE' as ReceiverAddressFormat,
    ARKADE_ADDRESS: 'ARKADE_ADDRESS' as ReceiverAddressFormat,
    ARKADE_INVOICE: 'ARKADE_INVOICE' as ReceiverAddressFormat,
    CASHU_TOKEN: 'CASHU_TOKEN' as ReceiverAddressFormat,
} as const;

/** @deprecated Use ReceiverAddressFormat type or ReceiverAddressFormatEnum const instead */
export { ReceiverAddressFormatEnum as ReceiverAddressFormat };

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

// ============================================================================
// RGB Lightning Node API Types (from node-types.ts)
// ============================================================================

// Import node types
import type { components as nodeComponents } from './generated/node-types.js';

/** Node API generated schema types */
export type { nodeComponents };

/** Node API paths and operations */
export type { paths as nodePaths, operations as nodeOperations } from './generated/node-types.js';

// --- Request/Response Types ---

// Address & Balance
export type AddressResponse = nodeComponents['schemas']['AddressResponse'];
export type AssetBalanceRequest = nodeComponents['schemas']['AssetBalanceRequest'];
export type AssetBalanceResponse = nodeComponents['schemas']['AssetBalanceResponse'];
export type BtcBalanceRequest = nodeComponents['schemas']['BtcBalanceRequest'];
export type BtcBalanceResponse = nodeComponents['schemas']['BtcBalanceResponse'];

// Backup & Restore
export type BackupRequest = nodeComponents['schemas']['BackupRequest'];
export type RestoreRequest = nodeComponents['schemas']['RestoreRequest'];

// Channels
export type CloseChannelRequest = nodeComponents['schemas']['CloseChannelRequest'];
export type OpenChannelRequest = nodeComponents['schemas']['OpenChannelRequest'];
export type OpenChannelResponse = nodeComponents['schemas']['OpenChannelResponse'];
export type ListChannelsResponse = nodeComponents['schemas']['ListChannelsResponse'];
export type Channel = nodeComponents['schemas']['Channel'];

// Peers
export type ConnectPeerRequest = nodeComponents['schemas']['ConnectPeerRequest'];
export type DisconnectPeerRequest = nodeComponents['schemas']['DisconnectPeerRequest'];
export type ListPeersResponse = nodeComponents['schemas']['ListPeersResponse'];

// UTXOs & Transactions
export type CreateUtxosRequest = nodeComponents['schemas']['CreateUtxosRequest'];
export type ListUnspentsResponse = nodeComponents['schemas']['ListUnspentsResponse'];
export type ListTransactionsResponse = nodeComponents['schemas']['ListTransactionsResponse'];
export type EstimateFeeRequest = nodeComponents['schemas']['EstimateFeeRequest'];
export type EstimateFeeResponse = nodeComponents['schemas']['EstimateFeeResponse'];

// Invoices
export type DecodeLNInvoiceRequest = nodeComponents['schemas']['DecodeLNInvoiceRequest'];
export type DecodeLNInvoiceResponse = nodeComponents['schemas']['DecodeLNInvoiceResponse'];
export type DecodeRGBInvoiceRequest = nodeComponents['schemas']['DecodeRGBInvoiceRequest'];
export type DecodeRGBInvoiceResponse = nodeComponents['schemas']['DecodeRGBInvoiceResponse'];
export type LNInvoiceRequest = nodeComponents['schemas']['LNInvoiceRequest'];
export type LNInvoiceResponse = nodeComponents['schemas']['LNInvoiceResponse'];
export type RgbInvoiceRequest = nodeComponents['schemas']['RgbInvoiceRequest'];
export type RgbInvoiceResponse = nodeComponents['schemas']['RgbInvoiceResponse'];
export type InvoiceStatusRequest = nodeComponents['schemas']['InvoiceStatusRequest'];
export type InvoiceStatusResponse = nodeComponents['schemas']['InvoiceStatusResponse'];

// Assets
export type IssueAssetNIARequest = nodeComponents['schemas']['IssueAssetNIARequest'];
export type IssueAssetNIAResponse = nodeComponents['schemas']['IssueAssetNIAResponse'];
export type ListAssetsResponse = nodeComponents['schemas']['ListAssetsResponse'];
export type AssetNIA = nodeComponents['schemas']['AssetNIA'];

// Transfers
export type ListTransfersResponse = nodeComponents['schemas']['ListTransfersResponse'];
export type RefreshRequest = nodeComponents['schemas']['RefreshRequest'];

// Send Operations
export type SendAssetRequest = nodeComponents['schemas']['SendAssetRequest'];
export type SendAssetResponse = nodeComponents['schemas']['SendAssetResponse'];
export type SendBtcRequest = nodeComponents['schemas']['SendBtcRequest'];
export type SendBtcResponse = nodeComponents['schemas']['SendBtcResponse'];

// Payments
export type SendPaymentRequest = nodeComponents['schemas']['SendPaymentRequest'];
export type SendPaymentResponse = nodeComponents['schemas']['SendPaymentResponse'];
export type KeysendRequest = nodeComponents['schemas']['KeysendRequest'];
export type KeysendResponse = nodeComponents['schemas']['KeysendResponse'];
export type ListPaymentsResponse = nodeComponents['schemas']['ListPaymentsResponse'];

// Node Info & Auth
export type NodeInfoResponse = nodeComponents['schemas']['NodeInfoResponse'];
export type InitRequest = nodeComponents['schemas']['InitRequest'];
export type InitResponse = nodeComponents['schemas']['InitResponse'];
export type UnlockRequest = nodeComponents['schemas']['UnlockRequest'];
export type SignMessageRequest = nodeComponents['schemas']['SignMessageRequest'];
export type SignMessageResponse = nodeComponents['schemas']['SignMessageResponse'];

// Misc types
export type Assignment = nodeComponents['schemas']['Assignment'];
export type AssignmentFungible = nodeComponents['schemas']['AssignmentFungible'];
