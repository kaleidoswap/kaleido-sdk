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
import type { LogLevel, LogLevelName, SdkLogger } from '../logging.js';

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
 *
 * // With debug logging to the built-in console logger:
 * const config: KaleidoConfig = {
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   logLevel: LogLevel.DEBUG,
 * };
 *
 * // With a custom logger (Winston, Pino, etc.):
 * const config: KaleidoConfig = {
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   logLevel: LogLevel.INFO,
 *   logger: myLogger,
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
    /**
     * Log level for all SDK loggers.
     *
     * Controls which log records the SDK emits. Accepts a `LogLevel` constant
     * (e.g. `LogLevel.DEBUG`) or a string name (`'debug'`, `'info'`,
     * `'warning'`, `'warn'`, `'error'`, `'silent'`).
     *
     * When omitted the SDK defaults to `LogLevel.SILENT` — no console output
     * is produced, mirroring the Python SDK's NullHandler behaviour.
     *
     * Set to `LogLevel.DEBUG` to see full HTTP traces, WebSocket lifecycle
     * events, and swap operation details. Set to `LogLevel.WARNING` to see
     * only problems.
     *
     * After client creation, call `applyLogLevel()` or `setComponentLogLevel()`
     * for runtime adjustments.
     *
     * @example
     * // See everything:
     * { logLevel: LogLevel.DEBUG }
     *
     * // Only warnings and errors:
     * { logLevel: 'warning' }
     *
     * // Silence all SDK output (default behaviour):
     * {}  // logLevel omitted
     */
    logLevel?: LogLevel | LogLevelName;
    /**
     * Custom logger for SDK output.
     *
     * When provided, the SDK routes every log record through this object
     * instead of the built-in `console`. Must implement `debug`, `info`,
     * `warn`, and `error` methods.
     *
     * This is intentionally compatible with `console`, Winston, Pino,
     * Bunyan, loglevel, and most other popular loggers.
     *
     * Note: `logLevel` still controls *which* records are emitted — the
     * custom logger only decides *where* they go.
     *
     * @example
     * import winston from 'winston';
     * const logger = winston.createLogger({ … });
     * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.INFO, logger });
     *
     * // Pass console directly (useful for testing):
     * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger: console });
     */
    logger?: SdkLogger;
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
