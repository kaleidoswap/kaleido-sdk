/**
 * Logging support for kaleidoswap-sdk.
 *
 * Library logging policy:
 * - The SDK emits NO output by default (SILENT level — zero console calls).
 * - The SDK NEVER configures handlers, output destinations, or formats on its
 *   own; that is always the application's responsibility.
 * - Users opt in to SDK output by setting `logLevel` in KaleidoConfig.
 * - Users may supply their own logger via `logger` in KaleidoConfig; when
 *   present the SDK delegates every record to it instead of `console`.
 *
 * Named sub-components (mirroring the Python SDK):
 *   kaleidoswap-sdk:http    HTTP requests, responses, latency, retries
 *   kaleidoswap-sdk:ws      WebSocket lifecycle and messages
 *   kaleidoswap-sdk:maker   Quote, swap order, and atomic swap events
 *   kaleidoswap-sdk:rln     RGB Lightning Node operations
 *
 * Quick start (application code only — never inside the SDK itself):
 * ```typescript
 * import { KaleidoClient, LogLevel } from 'kaleidoswap-sdk';
 *
 * // Built-in console output at DEBUG level:
 * const client = KaleidoClient.create({
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   logLevel: LogLevel.DEBUG,
 * });
 *
 * // Plug in your own logger (Winston, Pino, etc.):
 * const client = KaleidoClient.create({
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   logLevel: LogLevel.INFO,
 *   logger: myWinstonLogger,          // must have debug/info/warn/error methods
 * });
 *
 * // Silence the http sub-component while keeping everything else:
 * import { setComponentLogLevel } from 'kaleidoswap-sdk';
 * setComponentLogLevel('http', LogLevel.WARNING);
 * ```
 */

// ============================================================================
// Log levels — numeric values mirror Python's logging module
// ============================================================================

/**
 * Numeric log levels used to control SDK verbosity.
 *
 * Values are intentionally aligned with Python's `logging` module so that
 * configurations are easy to translate between the two SDKs:
 *
 * | Constant        | Value | Python equivalent      |
 * |-----------------|-------|------------------------|
 * | LogLevel.DEBUG  |  10   | logging.DEBUG          |
 * | LogLevel.INFO   |  20   | logging.INFO           |
 * | LogLevel.WARNING|  30   | logging.WARNING        |
 * | LogLevel.ERROR  |  40   | logging.ERROR          |
 * | LogLevel.SILENT |  Inf  | (NullHandler / no-op)  |
 *
 * @example
 * // Show everything:
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG });
 *
 * // Only warnings and errors:
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.WARNING });
 *
 * // Silence all SDK output (default):
 * KaleidoClient.create({ baseUrl: '…' }); // logLevel omitted → SILENT
 */
export const LogLevel = {
    DEBUG: 10,
    INFO: 20,
    WARNING: 30,
    ERROR: 40,
    SILENT: Infinity,
} as const satisfies Record<string, number>;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * String aliases accepted wherever a LogLevel is expected.
 *
 * Both `'warning'` and `'warn'` are accepted so that code written against
 * Node.js conventions (`'warn'`) works without changes.
 */
export type LogLevelName = 'debug' | 'info' | 'warning' | 'warn' | 'error' | 'silent';

// ============================================================================
// SdkLogger interface
// ============================================================================

/**
 * Minimal logger interface used by the SDK internally.
 *
 * Any object that satisfies this interface can be passed as `logger` in
 * KaleidoConfig. The interface is intentionally compatible with:
 *
 * - `console`          (no install required — pass it directly)
 * - `winston.Logger`
 * - `pino()`
 * - `bunyan.createLogger()`
 * - `loglevel`
 * - Any custom object with these four methods
 *
 * @example
 * // console works out of the box:
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger: console });
 *
 * // Winston:
 * import winston from 'winston';
 * const logger = winston.createLogger({ … });
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger });
 *
 * // Pino:
 * import pino from 'pino';
 * const logger = pino();
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger });
 */
export interface SdkLogger {
    debug(msg: string, ...args: unknown[]): void;
    info(msg: string, ...args: unknown[]): void;
    warn(msg: string, ...args: unknown[]): void;
    error(msg: string, ...args: unknown[]): void;
}

// ============================================================================
// Internal state — shared by all ComponentLogger instances
// ============================================================================

/**
 * Per-component level override.
 * Keys are component names (e.g. 'http', 'ws').
 * When absent for a component, `_rootState.level` is used.
 */
interface _LogState {
    /** Root effective level; applies to every component unless overridden. */
    level: number;
    /**
     * Per-component level overrides.
     * `null` entry means the component inherits the root level.
     */
    componentLevels: Map<string, number>;
    /**
     * User-supplied logger.
     * `null` → fall back to the built-in `console` output.
     */
    userLogger: SdkLogger | null;
}

const _state: _LogState = {
    level: LogLevel.SILENT, // Default: zero console noise, matching Python's NullHandler
    componentLevels: new Map(),
    userLogger: null,
};

// ============================================================================
// Level normalisation helpers
// ============================================================================

/**
 * Convert a LogLevel constant or its string name to a numeric level.
 * @throws {Error} on unknown string names.
 */
function _levelNumber(level: LogLevel | LogLevelName): number {
    if (typeof level === 'number') return level;
    switch (level.toLowerCase()) {
        case 'debug':
            return LogLevel.DEBUG;
        case 'info':
            return LogLevel.INFO;
        case 'warning':
        case 'warn':
            return LogLevel.WARNING;
        case 'error':
            return LogLevel.ERROR;
        case 'silent':
            return LogLevel.SILENT;
        default:
            throw new Error(`[kaleidoswap-sdk] Unknown log level name: "${level}"`);
    }
}

/**
 * Return a human-readable string for a numeric level (for diagnostics).
 */
export function logLevelName(level: number): string {
    if (level <= LogLevel.DEBUG) return 'DEBUG';
    if (level <= LogLevel.INFO) return 'INFO';
    if (level <= LogLevel.WARNING) return 'WARNING';
    if (level <= LogLevel.ERROR) return 'ERROR';
    return 'SILENT';
}

// ============================================================================
// ComponentLogger — the object held by each SDK module
// ============================================================================

/**
 * Internal logger bound to a named SDK sub-component.
 *
 * Reads the shared `_state` on every call, so changes made via
 * `applyLogLevel()` or `setComponentLogLevel()` after construction are
 * automatically reflected without needing to re-create any loggers.
 */
class _ComponentLogger implements SdkLogger {
    private readonly _component: string;
    private readonly _prefix: string;

    constructor(component: string) {
        this._component = component;
        this._prefix = `[kaleidoswap-sdk:${component}]`;
    }

    // ------------------------------------------------------------------
    // Public SdkLogger methods
    // ------------------------------------------------------------------

    debug(msg: string, ...args: unknown[]): void {
        if (this._effectiveLevel() <= LogLevel.DEBUG) {
            this._emit('debug', msg, args);
        }
    }

    info(msg: string, ...args: unknown[]): void {
        if (this._effectiveLevel() <= LogLevel.INFO) {
            this._emit('info', msg, args);
        }
    }

    warn(msg: string, ...args: unknown[]): void {
        if (this._effectiveLevel() <= LogLevel.WARNING) {
            this._emit('warn', msg, args);
        }
    }

    error(msg: string, ...args: unknown[]): void {
        if (this._effectiveLevel() <= LogLevel.ERROR) {
            this._emit('error', msg, args);
        }
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    /** Resolve effective level: component override > root level. */
    private _effectiveLevel(): number {
        return _state.componentLevels.get(this._component) ?? _state.level;
    }

    /** Dispatch the record to the user logger or built-in console. */
    private _emit(method: 'debug' | 'info' | 'warn' | 'error', msg: string, args: unknown[]): void {
        const out: SdkLogger = _state.userLogger ?? (console as unknown as SdkLogger);
        out[method](`${this._prefix} ${msg}`, ...args);
    }
}

// ============================================================================
// Public API — consumed by SDK internals and advanced users
// ============================================================================

/**
 * Return a logger scoped to the named SDK sub-component.
 *
 * Called by internal modules (`http-client`, `ws-client`, etc.).
 * The returned logger is lightweight and re-reads the shared state on every
 * call, so it does not need to be replaced if the log level changes later.
 *
 * ```typescript
 * // Inside an SDK module:
 * import { getLogger } from './logging.js';
 * const log = getLogger('http');
 * log.debug('GET %s', url);
 * ```
 *
 * @internal
 */
export function getLogger(component: string): SdkLogger {
    return new _ComponentLogger(component);
}

/**
 * Set the effective log level for **all** SDK loggers.
 *
 * Called once by `KaleidoClient` at construction time via `applyLogConfig()`.
 * Applications may also call this directly to adjust the level at runtime.
 *
 * Component-level overrides set via `setComponentLogLevel()` take precedence
 * over the root level.
 *
 * @param level - A `LogLevel` constant (e.g. `LogLevel.DEBUG`) or its string
 *                equivalent (`'debug'`, `'info'`, `'warning'`, `'warn'`,
 *                `'error'`, `'silent'`).
 *
 * @example
 * import { applyLogLevel, LogLevel } from 'kaleidoswap-sdk';
 *
 * applyLogLevel(LogLevel.DEBUG);    // see everything
 * applyLogLevel('warning');         // only warnings and errors
 * applyLogLevel(LogLevel.SILENT);   // silence all SDK output
 */
export function applyLogLevel(level: LogLevel | LogLevelName): void {
    _state.level = _levelNumber(level);
}

/**
 * Override the log level for a single SDK sub-component.
 *
 * Useful for silencing noisy low-level components (e.g. `'http'`) while
 * keeping higher-level events from `'maker'` or `'ws'` visible.
 *
 * Pass `null` to clear the override and fall back to the root level.
 *
 * @param component - Sub-component name: `'http'`, `'ws'`, `'maker'`, `'rln'`.
 * @param level     - Level to apply, or `null` to inherit the root level.
 *
 * @example
 * import { applyLogLevel, setComponentLogLevel, LogLevel } from 'kaleidoswap-sdk';
 *
 * applyLogLevel(LogLevel.DEBUG);
 * // Too much HTTP noise? Silence just that component:
 * setComponentLogLevel('http', LogLevel.WARNING);
 */
export function setComponentLogLevel(
    component: string,
    level: LogLevel | LogLevelName | null,
): void {
    if (level === null) {
        _state.componentLevels.delete(component);
    } else {
        _state.componentLevels.set(component, _levelNumber(level));
    }
}

/**
 * Inject a custom logger for all SDK output.
 *
 * When set, the SDK delegates every log record to this object instead of
 * the built-in `console`. The object must implement `debug`, `info`, `warn`,
 * and `error` methods with a `(msg: string, ...args: unknown[]) => void`
 * signature.
 *
 * Pass `null` to revert to the default `console` output.
 *
 * @example
 * import winston from 'winston';
 * import { setLogger } from 'kaleidoswap-sdk';
 *
 * const myLogger = winston.createLogger({ … });
 * setLogger(myLogger);
 */
export function setLogger(logger: SdkLogger | null | undefined): void {
    _state.userLogger = logger ?? null;
}

/**
 * Apply both a log level and an optional custom logger in one call.
 *
 * This is the single entry point used by `KaleidoClient`'s constructor.
 * Applications should not need to call it directly.
 *
 * @param level  - LogLevel constant or name, or `undefined` to leave unchanged.
 * @param logger - Custom logger instance, or `undefined` to leave unchanged.
 *
 * @internal
 */
export function applyLogConfig(
    level: LogLevel | LogLevelName | undefined,
    logger: SdkLogger | undefined,
): void {
    if (level !== undefined) applyLogLevel(level);
    if (logger !== undefined) setLogger(logger);
}

/**
 * Read the current root log level.
 *
 * Useful for diagnostics or when building wrapper utilities that need to
 * know whether a given level is currently active.
 *
 * @example
 * import { currentLogLevel, LogLevel } from 'kaleidoswap-sdk';
 *
 * if (currentLogLevel() <= LogLevel.DEBUG) {
 *   // Perform expensive debug introspection only when it will be logged.
 * }
 */
export function currentLogLevel(): number {
    return _state.level;
}

/**
 * Read the effective log level for a specific sub-component,
 * respecting any override set via `setComponentLogLevel()`.
 */
export function effectiveComponentLogLevel(component: string): number {
    return _state.componentLevels.get(component) ?? _state.level;
}
