import type { LogLevel, LogLevelName, SdkLogger } from '../logging.js';
import type { InstallIdStore } from '../identity.js';

export interface KaleidoConfig {
    /** Base URL for the Kaleidoswap Maker API. Defaults to https://api.regtest.kaleidoswap.com */
    baseUrl?: string;
    /** URL for the RGB Lightning Node (e.g. http://localhost:3001) */
    nodeUrl?: string;
    /** Optional API key for authenticated requests */
    apiKey?: string;
    /** Persistent install identifier. Generated and stored automatically when omitted. */
    installId?: string;
    /** Optional platform-specific install ID store. Useful for tests and custom runtimes. */
    installIdStore?: InstallIdStore;
    /** Request timeout in seconds (default: 30) */
    timeout?: number;
    /** Log level. Defaults to `LogLevel.SILENT`. */
    logLevel?: LogLevel | LogLevelName;
    /** Custom logger (console, Winston, Pino, etc.). */
    logger?: SdkLogger;
}
