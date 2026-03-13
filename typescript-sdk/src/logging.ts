/**
 * Logging support for kaleido-sdk.
 *
 * Library logging policy:
 * - The SDK emits NO output by default (SILENT level — zero output unless you
 *   opt in by setting `logLevel` in KaleidoConfig).
 * - The SDK NEVER configures output destinations or formats on its own; that
 *   is always the application's responsibility.
 * - Users opt in to SDK output by setting `logLevel` in KaleidoConfig.
 * - Users may supply their own logger via `logger` in KaleidoConfig; when
 *   present the SDK delegates every record to it instead of the built-in
 *   StreamLogger.
 *
 * Named sub-components (mirroring the Python SDK):
 *   kaleido-sdk:http    HTTP requests, responses, latency
 *   kaleido-sdk:ws      WebSocket lifecycle and messages
 *   kaleido-sdk:maker   Quote, swap order, and atomic swap events
 *   kaleido-sdk:rln     RGB Lightning Node operations
 *
 * Quick start (application code only — never inside the SDK itself):
 * ```typescript
 * import { KaleidoClient, LogLevel } from 'kaleido-sdk';
 *
 * // Built-in stderr output at DEBUG level:
 * const client = KaleidoClient.create({
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   logLevel: LogLevel.DEBUG,
 * });
 *
 * // Plug in your own logger (Winston, Pino, etc.):
 * const client = KaleidoClient.create({
 *   baseUrl: 'https://api.kaleidoswap.com',
 *   logLevel: LogLevel.INFO,
 *   logger: myWinstonLogger,   // must have debug/info/warn/error methods
 * });
 *
 * // Silence the http sub-component while keeping everything else:
 * import { setComponentLogLevel } from 'kaleido-sdk';
 * setComponentLogLevel('http', LogLevel.WARN);
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
 * | Constant       | Value | Python equivalent     |
 * |----------------|-------|-----------------------|
 * | LogLevel.DEBUG |  10   | logging.DEBUG         |
 * | LogLevel.INFO  |  20   | logging.INFO          |
 * | LogLevel.WARN  |  30   | logging.WARNING       |
 * | LogLevel.ERROR |  40   | logging.ERROR         |
 * | LogLevel.SILENT|  Inf  | (NullHandler / no-op) |
 *
 * @example
 * // Show everything:
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG });
 *
 * // Only warnings and errors:
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.WARN });
 *
 * // Silence all SDK output (default):
 * KaleidoClient.create({ baseUrl: '…' }); // logLevel omitted → SILENT
 */
export const LogLevel = {
    DEBUG: 10,
    INFO: 20,
    WARN: 30,
    ERROR: 40,
    SILENT: Infinity,
} as const satisfies Record<string, number>;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * String aliases accepted wherever a LogLevel is expected.
 *
 * Follows Node.js / TypeScript ecosystem conventions (`'warn'` not
 * `'warning'`), matching Winston, Pino, and the built-in `console`.
 */
export type LogLevelName = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// ============================================================================
// SdkLogger interface
// ============================================================================

/**
 * Minimal logger interface used by the SDK internally.
 *
 * Any object that satisfies this interface can be passed as `logger` in
 * KaleidoConfig. The interface is intentionally compatible with:
 *
 * - `console`           (no install required — pass it directly)
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
// sprintf — printf-style format string interpolation
// ============================================================================

/**
 * Minimal printf-style formatter supporting `%s`, `%d`, `%i`, `%o`, `%%`.
 *
 * This mirrors the format string style used throughout the Python SDK
 * (e.g. `_log.debug('%s %s -> %d', method, url, status)`) and keeps
 * the SDK independent from any external formatting library.
 *
 * Unrecognised specifiers are left unchanged.
 *
 * @internal
 */
export function _sprintf(fmt: string, args: unknown[]): string {
    let i = 0;
    return fmt.replace(/%([%sdio])/g, (_, spec: string) => {
        if (spec === '%') return '%';
        const val = args[i++];
        if (val === undefined || val === null) return String(val);
        switch (spec) {
            case 's':
                return String(val);
            case 'd':
            case 'i':
                return String(Math.trunc(Number(val)));
            case 'o':
                return JSON.stringify(val);
            default:
                return String(val);
        }
    });
}

// ============================================================================
// StreamLogger — built-in logger writing to a Node.js Writable stream
// ============================================================================

/** Label string used in formatted output lines. */
type LogLabel = 'DEBUG' | 'INFO ' | 'WARN ' | 'ERROR';

/**
 * Formatter function signature for {@link StreamLogger}.
 *
 * Receives the level label and the fully-interpolated message string
 * (with any `%s`/`%d` placeholders already resolved), and returns the
 * line to be written to the stream (without a trailing newline).
 */
export type StreamLogFormatter = (label: LogLabel, msg: string) => string;

/** Default formatter: `2024-01-15T10:23:45.123Z [DEBUG] <msg>` */
function _defaultFormat(label: LogLabel, msg: string): string {
    return `${new Date().toISOString()} [${label}] ${msg}`;
}

/**
 * SDK's built-in logger. Writes formatted lines to a Node.js `Writable`
 * stream — `process.stderr` by default.
 *
 * Writing to `stderr` keeps SDK log output on a separate stream from your
 * application's data (`stdout`), so the two can be piped or redirected
 * independently:
 *
 * ```sh
 * node app.js 2>sdk.log   # silence SDK logs, keep app stdout
 * node app.js 2>/dev/null # suppress SDK logs entirely at the shell level
 * node app.js 2>&1        # merge both streams
 * ```
 *
 * @example
 * // Default: stderr with ISO timestamp prefix
 * KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG });
 *
 * // Custom stream (e.g. stdout):
 * import { StreamLogger } from 'kaleido-sdk';
 * KaleidoClient.create({
 *   baseUrl: '…',
 *   logLevel: LogLevel.DEBUG,
 *   logger: new StreamLogger({ stream: process.stdout }),
 * });
 *
 * // Custom format:
 * KaleidoClient.create({
 *   baseUrl: '…',
 *   logLevel: LogLevel.DEBUG,
 *   logger: new StreamLogger({
 *     format: (label, msg) => `[${label.trim()}] ${msg}`,
 *   }),
 * });
 */
export class StreamLogger implements SdkLogger {
    private readonly _stream: NodeJS.WritableStream;
    private readonly _format: StreamLogFormatter;

    constructor(options?: {
        /** Target writable stream. Defaults to `process.stderr`. */
        stream?: NodeJS.WritableStream;
        /**
         * Custom line formatter.
         * Defaults to `"<ISO timestamp> [LEVEL] <msg>"`.
         */
        format?: StreamLogFormatter;
    }) {
        this._stream = options?.stream ?? process.stderr;
        this._format = options?.format ?? _defaultFormat;
    }

    debug(msg: string, ...args: unknown[]): void {
        this._write('DEBUG', msg, args);
    }

    info(msg: string, ...args: unknown[]): void {
        this._write('INFO ', msg, args);
    }

    warn(msg: string, ...args: unknown[]): void {
        this._write('WARN ', msg, args);
    }

    error(msg: string, ...args: unknown[]): void {
        this._write('ERROR', msg, args);
    }

    private _write(label: LogLabel, msg: string, args: unknown[]): void {
        const resolved = args.length > 0 ? _sprintf(msg, args) : msg;
        this._stream.write(this._format(label, resolved) + '\n');
    }
}

// ============================================================================
// Per-instance log state
// ============================================================================

/**
 * Isolated log configuration held by a single `KaleidoClient` instance.
 *
 * Each client has its own `LogState` so two clients in the same process can
 * run at different verbosity levels without interfering with each other.
 *
 * ```
 * const staging = KaleidoClient.create({ baseUrl: stagingUrl, logLevel: LogLevel.DEBUG });
 * const prod    = KaleidoClient.create({ baseUrl: prodUrl,    logLevel: LogLevel.WARN  });
 * // DEBUG records from prod are never emitted.
 * ```
 */
export class LogState {
    /** Root level; applies to every component unless overridden. */
    level: number;

    /**
     * Per-component level overrides.
     * Absent key → component inherits `level`.
     */
    readonly componentLevels: Map<string, number> = new Map();

    /**
     * User-supplied logger.
     * `null` → fall back to the built-in {@link StreamLogger} (stderr).
     */
    userLogger: SdkLogger | null;

    constructor(level: LogLevel | LogLevelName = LogLevel.SILENT, logger?: SdkLogger) {
        this.level = typeof level === 'number' ? level : _levelNumber(level);
        this.userLogger = logger ?? null;
    }

    /** Resolve effective level for a component (override → root). */
    effectiveLevelFor(component: string): number {
        return this.componentLevels.get(component) ?? this.level;
    }
}

// ============================================================================
// Level normalisation helpers
// ============================================================================

/**
 * Convert a `LogLevel` constant or its string name to the underlying number.
 * @throws {Error} on unrecognised string names.
 */
export function _levelNumber(level: LogLevel | LogLevelName): number {
    if (typeof level === 'number') return level;
    switch (level.toLowerCase()) {
        case 'debug':
            return LogLevel.DEBUG;
        case 'info':
            return LogLevel.INFO;
        case 'warn':
            return LogLevel.WARN;
        case 'error':
            return LogLevel.ERROR;
        case 'silent':
            return LogLevel.SILENT;
        default:
            throw new Error(`[kaleido-sdk] Unknown log level name: "${level}"`);
    }
}

/**
 * Return a human-readable string for a numeric level (for diagnostics).
 *
 * @example
 * logLevelName(LogLevel.DEBUG)   // → 'DEBUG'
 * logLevelName(LogLevel.SILENT)  // → 'SILENT'
 */
export function logLevelName(level: number): string {
    if (level <= LogLevel.DEBUG) return 'DEBUG';
    if (level <= LogLevel.INFO) return 'INFO';
    if (level <= LogLevel.WARN) return 'WARN';
    if (level <= LogLevel.ERROR) return 'ERROR';
    return 'SILENT';
}

// ============================================================================
// ComponentLogger — the object held by each SDK module
// ============================================================================

// Singleton fallback logger (used when the user hasn't supplied one).
const _builtinLogger: SdkLogger = new StreamLogger();

/**
 * Internal logger bound to a named SDK sub-component and a `LogState`.
 *
 * Reads `state` on every call so any runtime changes to the state
 * (level adjustments, logger swaps) are automatically reflected without
 * re-creating any loggers.
 *
 * @internal
 */
export class ComponentLogger implements SdkLogger {
    private readonly _component: string;
    private readonly _prefix: string;
    private readonly _state: LogState;

    constructor(component: string, state: LogState) {
        this._component = component;
        this._prefix = `[kaleido-sdk:${component}]`;
        this._state = state;
    }

    debug(msg: string, ...args: unknown[]): void {
        if (this._state.effectiveLevelFor(this._component) <= LogLevel.DEBUG) {
            this._emit('debug', msg, args);
        }
    }

    info(msg: string, ...args: unknown[]): void {
        if (this._state.effectiveLevelFor(this._component) <= LogLevel.INFO) {
            this._emit('info', msg, args);
        }
    }

    warn(msg: string, ...args: unknown[]): void {
        if (this._state.effectiveLevelFor(this._component) <= LogLevel.WARN) {
            this._emit('warn', msg, args);
        }
    }

    error(msg: string, ...args: unknown[]): void {
        if (this._state.effectiveLevelFor(this._component) <= LogLevel.ERROR) {
            this._emit('error', msg, args);
        }
    }

    private _emit(method: keyof SdkLogger, msg: string, args: unknown[]): void {
        const out = this._state.userLogger ?? _builtinLogger;
        out[method](`${this._prefix} ${msg}`, ...args);
    }
}

// ============================================================================
// Factory — used by client sub-modules
// ============================================================================

/**
 * Return a `ComponentLogger` for the given sub-component name, bound to the
 * supplied `LogState`.
 *
 * Called once per module during client construction:
 * ```typescript
 * // Inside an SDK module:
 * const log = createLogger('http', state);
 * log.debug('%s %s', method, url);
 * ```
 *
 * @internal
 */
export function createLogger(component: string, state: LogState): ComponentLogger {
    return new ComponentLogger(component, state);
}

// ============================================================================
// LogState helpers — convenience wrappers for the KaleidoClient public API
// ============================================================================

/**
 * Set the root log level on a `LogState` instance.
 *
 * @param state - The `LogState` belonging to the client you want to adjust.
 * @param level - A `LogLevel` constant or its string name.
 *
 * @example
 * import { applyLogLevel, LogLevel } from 'kaleido-sdk';
 *
 * applyLogLevel(client.logState, LogLevel.DEBUG);
 * applyLogLevel(client.logState, 'warn');
 */
export function applyLogLevel(state: LogState, level: LogLevel | LogLevelName): void {
    state.level = _levelNumber(level);
}

/**
 * Override the log level for a single sub-component on a `LogState`.
 *
 * Pass `null` to clear the override and fall back to the root level.
 *
 * @param state     - Target `LogState`.
 * @param component - Sub-component name: `'http'`, `'ws'`, `'maker'`, `'rln'`.
 * @param level     - Level to apply, or `null` to inherit the root level.
 *
 * @example
 * import { setComponentLogLevel, LogLevel } from 'kaleido-sdk';
 *
 * // Debug everything but silence the HTTP sub-component:
 * setComponentLogLevel(client.logState, 'http', LogLevel.WARN);
 *
 * // Clear override — 'http' inherits the root level again:
 * setComponentLogLevel(client.logState, 'http', null);
 */
export function setComponentLogLevel(
    state: LogState,
    component: string,
    level: LogLevel | LogLevelName | null,
): void {
    if (level === null) {
        state.componentLevels.delete(component);
    } else {
        state.componentLevels.set(component, _levelNumber(level));
    }
}

/**
 * Inject a custom logger into a `LogState`.
 *
 * Pass `null` to revert to the built-in {@link StreamLogger} (stderr) output.
 *
 * @example
 * import winston from 'winston';
 * import { setLogger } from 'kaleido-sdk';
 *
 * const myLogger = winston.createLogger({ … });
 * setLogger(client.logState, myLogger);
 */
export function setLogger(state: LogState, logger: SdkLogger | null): void {
    state.userLogger = logger;
}
