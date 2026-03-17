/**
 * Logging support for kaleidoswap-sdk.
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
 *   kaleidoswap-sdk:http    HTTP requests, responses, latency
 *   kaleidoswap-sdk:ws      WebSocket lifecycle and messages
 *   kaleidoswap-sdk:maker   Quote, swap order, and atomic swap events
 *   kaleidoswap-sdk:rln     RGB Lightning Node operations
 *
 * Quick start (application code only — never inside the SDK itself):
 * ```typescript
 * import { KaleidoClient, LogLevel } from 'kaleidoswap-sdk';
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
 * import { setComponentLogLevel } from 'kaleidoswap-sdk';
 * setComponentLogLevel('http', LogLevel.WARN);
 * ```
 */

/** Numeric log levels. Values mirror Python's logging module (DEBUG=10, INFO=20, WARN=30, ERROR=40, SILENT=∞). */
export const LogLevel = {
    DEBUG: 10,
    INFO: 20,
    WARN: 30,
    ERROR: 40,
    SILENT: Infinity,
} as const satisfies Record<string, number>;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export type LogLevelName = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Minimal logger interface. Compatible with `console`, Winston, Pino, etc.
 */
export interface SdkLogger {
    debug(msg: string, ...args: unknown[]): void;
    info(msg: string, ...args: unknown[]): void;
    warn(msg: string, ...args: unknown[]): void;
    error(msg: string, ...args: unknown[]): void;
}

/** @internal */
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

type LogLabel = 'DEBUG' | 'INFO ' | 'WARN ' | 'ERROR';

export type StreamLogFormatter = (label: LogLabel, msg: string) => string;

/** Default formatter: `2024-01-15T10:23:45.123Z [DEBUG] <msg>` */
function _defaultFormat(label: LogLabel, msg: string): string {
    return `${new Date().toISOString()} [${label}] ${msg}`;
}

/** Built-in logger writing formatted lines to a Node.js Writable stream (stderr by default). */
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

/** Per-instance log configuration. Each KaleidoClient instance owns one LogState. */
export class LogState {
    level: number;
    readonly componentLevels: Map<string, number> = new Map();
    userLogger: SdkLogger | null;

    constructor(level: LogLevel | LogLevelName = LogLevel.SILENT, logger?: SdkLogger) {
        this.level = typeof level === 'number' ? level : _levelNumber(level);
        this.userLogger = logger ?? null;
    }

    effectiveLevelFor(component: string): number {
        return this.componentLevels.get(component) ?? this.level;
    }
}

/** @internal */
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
            throw new Error(`[kaleidoswap-sdk] Unknown log level name: "${level}"`);
    }
}

export function logLevelName(level: number): string {
    if (level <= LogLevel.DEBUG) return 'DEBUG';
    if (level <= LogLevel.INFO) return 'INFO';
    if (level <= LogLevel.WARN) return 'WARN';
    if (level <= LogLevel.ERROR) return 'ERROR';
    return 'SILENT';
}

const _builtinLogger: SdkLogger = new StreamLogger();

/** @internal */
export class ComponentLogger implements SdkLogger {
    private readonly _component: string;
    private readonly _prefix: string;
    private readonly _state: LogState;

    constructor(component: string, state: LogState) {
        this._component = component;
        this._prefix = `[kaleidoswap-sdk:${component}]`;
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

/** @internal */
export function createLogger(component: string, state: LogState): ComponentLogger {
    return new ComponentLogger(component, state);
}

export function applyLogLevel(state: LogState, level: LogLevel | LogLevelName): void {
    state.level = _levelNumber(level);
}

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

export function setLogger(state: LogState, logger: SdkLogger | null): void {
    state.userLogger = logger;
}
