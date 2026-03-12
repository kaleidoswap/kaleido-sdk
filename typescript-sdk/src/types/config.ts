/**
 * SDK Configuration Types
 *
 * Core configuration interface and runtime enum values for the Kaleidoswap SDK.
 * Import these when configuring a client or comparing layer/address values at runtime.
 *
 * @example
 * import type { KaleidoConfig } from 'kaleido-sdk';
 * import { Layer } from 'kaleido-sdk';
 */

import type { LogLevel, LogLevelName, SdkLogger } from '../logging.js';

// ============================================================================
// Client Configuration
// ============================================================================

/**
 * Configuration for the Kaleidoswap SDK client.
 *
 * All fields are optional. When `baseUrl` is omitted the client defaults to
 * the regtest environment (https://api.regtest.kaleidoswap.com).
 *
 * @example
 * // Zero-config — connects to regtest
 * const config: KaleidoConfig = {};
 *
 * // Production Maker API
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
    /** Base URL for the Kaleidoswap Maker API. Defaults to https://api.regtest.kaleidoswap.com */
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

