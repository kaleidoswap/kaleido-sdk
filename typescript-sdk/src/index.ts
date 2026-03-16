/**
 * Kaleidoswap SDK - TypeScript/JavaScript
 *
 * Pure TypeScript SDK for interacting with the Kaleidoswap protocol.
 * Trade RGB assets on Lightning Network with ease.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleidoswap-sdk';
 * import type { PairQuoteResponse, Asset } from 'kaleidoswap-sdk';
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
// setComponentLogLevel(client.logState, 'http', LogLevel.WARN);
// ============================================================================

export {
    /** Numeric log level constants (DEBUG=10, INFO=20, WARN=30, ERROR=40, SILENT=∞). */
    LogLevel,
    /**
     * Set the root log level on a client's LogState at runtime.
     * Component overrides (setComponentLogLevel) take precedence.
     *
     * @example
     * applyLogLevel(client.logState, LogLevel.DEBUG);
     */
    applyLogLevel,
    /**
     * Override the log level for a single sub-component on a LogState.
     * Pass null to clear the override and inherit the root level again.
     *
     * @example
     * setComponentLogLevel(client.logState, 'http', LogLevel.WARN);
     * setComponentLogLevel(client.logState, 'http', null); // clear override
     */
    setComponentLogLevel,
    /**
     * Inject a custom logger into a LogState.
     * Pass null to revert to the built-in StreamLogger (stderr) output.
     *
     * @example
     * setLogger(client.logState, myWinstonLogger);
     */
    setLogger,
    /** Convert a numeric level to its human-readable name ('DEBUG', 'INFO', 'WARN', …). */
    logLevelName,
    /**
     * Built-in logger that writes formatted lines to a Node.js Writable stream.
     * Defaults to process.stderr. Configurable stream and format.
     *
     * @example
     * import { StreamLogger } from 'kaleidoswap-sdk';
     * KaleidoClient.create({
     *   baseUrl: '…',
     *   logLevel: LogLevel.DEBUG,
     *   logger: new StreamLogger({ stream: process.stdout }),
     * });
     */
    StreamLogger,
} from './logging.js';

export type {
    /** Numeric type for LogLevel constants. */
    LogLevel as LogLevelValue,
    /** String aliases accepted wherever LogLevel is expected ('debug', 'info', 'warn', …). */
    LogLevelName,
    /**
     * Minimal logger interface the SDK uses internally.
     * Implement this to plug in any logging library (Winston, Pino, console, …).
     */
    SdkLogger,
    /** Formatter function signature for StreamLogger. */
    StreamLogFormatter,
    /**
     * Per-instance log configuration. Exposed as client.logState.
     * Pass to applyLogLevel / setComponentLogLevel / setLogger for runtime control.
     */
    LogState,
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
// Type definitions
//
// Market/maker types are exported here so `import type { ... } from 'kaleidoswap-sdk'` works.
// RLN types are intentionally excluded — import from 'kaleidoswap-sdk/rln'.
// ============================================================================

// ---- Configuration ----
export type { KaleidoConfig } from './types/config.js';

// ---- Market types (includes enums as runtime values) ----
export * from './api-types-ext.js';

// ---- WebSocket types ----
export type * from './types/ws.js';

// ---- Client types ----
export type { SwapCompletionOptions } from './maker-client.js';
