/**
 * SDK Configuration Types
 *
 * Core configuration interface and runtime enum values for the Kaleidoswap SDK.
 * Import these when configuring a client or comparing layer/address values at runtime.
 *
 * @example
 * import type { KaleidoConfig } from 'kaleidoswap-sdk/types';
 * import { LayerEnum } from 'kaleidoswap-sdk/types';
 */

import type { Layer, ReceiverAddressFormat } from '../api-types-ext.js';

// ============================================================================
// Client Configuration
// ============================================================================

/**
 * Configuration for the Kaleidoswap SDK client.
 *
 * At least one of `baseUrl` or `nodeUrl` must be provided.
 * Omitting both will throw a `ConfigError` at client creation time.
 *
 * @example
 * // Market API only
 * const config: KaleidoConfig = { baseUrl: 'https://api.kaleidoswap.com' };
 *
 * // RGB Node only
 * const config: KaleidoConfig = { nodeUrl: 'http://localhost:3001' };
 *
 * // Both APIs
 * const config: KaleidoConfig = {
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   nodeUrl: 'http://localhost:3001',
 *   apiKey: 'my-api-key',
 * };
 */
export interface KaleidoConfig {
    /** Base URL for the Kaleidoswap Maker API (e.g. https://api.kaleidoswap.com) */
    baseUrl?: string;
    /** URL for the RGB Lightning Node (e.g. http://localhost:3001) */
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
// Runtime Enum Values
// ============================================================================

/**
 * Layer enum values for runtime usage.
 *
 * Use this when you need to compare or assign layer values at runtime
 * instead of hardcoding plain strings.
 *
 * @example
 * import { LayerEnum } from 'kaleidoswap-sdk/types';
 *
 * if (route.from_layer === LayerEnum.RGB_LN) {
 *   console.log('RGB Lightning route');
 * }
 *
 * const myLayer: Layer = LayerEnum.BTC_LN;
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

/**
 * ReceiverAddressFormat enum values for runtime usage.
 *
 * Use this when you need to compare or assign address format values at runtime.
 *
 * @example
 * import { ReceiverAddressFormatEnum } from 'kaleidoswap-sdk/types';
 *
 * if (invoice.format === ReceiverAddressFormatEnum.BOLT11) {
 *   console.log('Lightning invoice');
 * }
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
