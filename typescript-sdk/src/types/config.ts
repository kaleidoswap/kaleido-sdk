import type { LogLevel, LogLevelName, SdkLogger } from '../logging.js';
import type { InstallIdStore } from '../identity.js';

export interface KaleidoConfig {
    /** Base URL for the Kaleidoswap Maker API. Defaults to https://api.regtest.kaleidoswap.com */
    baseUrl?: string;
    /** URL for the RGB Lightning Node (e.g. http://localhost:3001) */
    nodeUrl?: string;
    /** Optional API key for authenticated requests */
    apiKey?: string;
    /**
     * Allow attribution headers over non-HTTPS Maker URLs.
     * HTTP localhost is allowed automatically for local development.
     */
    allowInsecure?: boolean;
    /** Persistent install identifier. Generated and stored automatically when omitted. */
    installId?: string;
    /** Per-client session identifier. Generated automatically when omitted. */
    sessionId?: string;
    /** Optional platform-specific install ID store. Useful for tests and custom runtimes. */
    installIdStore?: InstallIdStore;
    /**
     * Persist browser install IDs in localStorage.
     * Defaults to false in browsers, so embedded SDK usage is memory-only unless opted in.
     */
    persistInstallId?: boolean;
    /** Request timeout in seconds (default: 30) */
    timeout?: number;
    /**
     * Maximum retry attempts for transient failures (network errors, timeouts,
     * HTTP 5xx, HTTP 429). The initial request is not counted, so `3` means up
     * to 4 total attempts. Defaults to `3`, matching the Python SDK.
     */
    maxRetries?: number;
    /**
     * Base delay in milliseconds for exponential retry backoff.
     * Actual delay is `retryBaseDelayMs * 2 ** attempt`. Defaults to `1000`.
     */
    retryBaseDelayMs?: number;
    /** Log level. Defaults to `LogLevel.SILENT`. */
    logLevel?: LogLevel | LogLevelName;
    /** Custom logger (console, Winston, Pino, etc.). */
    logger?: SdkLogger;
}
