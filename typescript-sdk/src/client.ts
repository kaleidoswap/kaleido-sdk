/**
 * Kaleidoswap SDK Client
 *
 * Main client class that coordinates Maker and RLN operations.
 */

import { HttpClient } from './http-client.js';
import { MakerClient } from './maker-client.js';
import { RlnClient } from './rln-client.js';
import { LogState, applyLogLevel, setComponentLogLevel, setLogger } from './logging.js';
import type { LogLevel, LogLevelName, SdkLogger } from './logging.js';
import type { KaleidoConfig } from './types/config.js';

/**
 * Kaleidoswap SDK Client
 *
 * Provides a typed interface for interacting with the Kaleidoswap protocol.
 * Both `baseUrl` and `nodeUrl` are optional. When `baseUrl` is omitted it
 * defaults to the regtest environment (https://api.regtest.kaleidoswap.com).
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleidoswap-sdk';
 *
 * // Market API only
 * const client = KaleidoClient.create({
 *     baseUrl: 'https://api.regtest.kaleidoswap.com',
 * });
 *
 * // RGB Node only
 * const client = KaleidoClient.create({
 *     nodeUrl: 'http://localhost:3001',
 * });
 *
 * // Both APIs
 * const client = KaleidoClient.create({
 *     baseUrl: 'https://api.regtest.kaleidoswap.com',
 *     nodeUrl: 'http://localhost:3001',
 * });
 *
 * const assets = await client.maker.listAssets();
 * ```
 */
export class KaleidoClient {
    private http: HttpClient;
    private config: KaleidoConfig;
    private _maker: MakerClient;
    private _rln: RlnClient;

    /**
     * Per-instance log state.
     *
     * Use this to adjust log levels or swap loggers at runtime without
     * affecting other `KaleidoClient` instances in the same process:
     *
     * ```typescript
     * import { applyLogLevel, setComponentLogLevel, setLogger, LogLevel } from 'kaleidoswap-sdk';
     *
     * // Raise root level to INFO after creation:
     * applyLogLevel(client.logState, LogLevel.INFO);
     *
     * // Silence HTTP noise while keeping maker events:
     * setComponentLogLevel(client.logState, 'http', LogLevel.WARN);
     *
     * // Swap in a Winston logger at runtime:
     * setLogger(client.logState, myWinstonLogger);
     * ```
     */
    readonly logState: LogState;

    private constructor(config: KaleidoConfig) {
        this.config = config;
        // Build the per-instance LogState before constructing any sub-clients
        // so that the very first log calls (e.g. HTTP middleware) already
        // respect the configuration.
        this.logState = new LogState(config.logLevel, config.logger);
        this.http = new HttpClient(
            {
                baseUrl: config.baseUrl,
                nodeUrl: config.nodeUrl,
                apiKey: config.apiKey,
                timeout: (config.timeout ?? 30) * 1000, // Convert to milliseconds
                maxRetries: config.maxRetries ?? 3,
            },
            this.logState,
        );
        this._maker = new MakerClient(this.http, this.logState);
        this._rln = new RlnClient(this.http, this.logState);
    }

    /**
     * Create a new KaleidoClient instance.
     *
     * Both `baseUrl` and `nodeUrl` are optional.
     * When `baseUrl` is not provided it defaults to the regtest environment.
     *
     * @param config - Client configuration (all fields optional)
     * @returns Initialized client
     *
     * @example
     * // Zero-config — connects to regtest
     * const client = KaleidoClient.create();
     *
     * // Production Maker API
     * const client = KaleidoClient.create({ baseUrl: 'https://api.kaleidoswap.com' });
     *
     * // RGB Node only (still defaults baseUrl to regtest)
     * const client = KaleidoClient.create({ nodeUrl: 'http://localhost:3001' });
     *
     * // Both APIs
     * const client = KaleidoClient.create({
     *     baseUrl: 'https://api.kaleidoswap.com',
     *     nodeUrl: 'http://localhost:3001',
     * });
     */
    static create(config: KaleidoConfig = {}): KaleidoClient {
        return new KaleidoClient({
            baseUrl: 'https://api.regtest.kaleidoswap.com',
            ...config,
        });
    }

    /**
     * Check if the Maker API is configured (baseUrl was provided)
     */
    hasMaker(): boolean {
        return !!this.config.baseUrl;
    }

    /**
     * Check if the RGB Lightning Node is configured (nodeUrl was provided)
     */
    hasNode(): boolean {
        return !!this.config.nodeUrl;
    }

    /**
     * Access Market (Maker) Operations.
     * Requires `baseUrl` to have been set in the config.
     */
    get maker(): MakerClient {
        return this._maker;
    }

    /**
     * Access RGB/Lightning Node Operations.
     * Requires `nodeUrl` to have been set in the config.
     */
    get rln(): RlnClient {
        return this._rln;
    }

    /**
     * Close client resources and active connections
     */
    async close(): Promise<void> {
        await this._rln.close();
    }
}

// Re-export LogState helpers bound to the per-instance pattern for
// convenience — users import these alongside KaleidoClient.
export { applyLogLevel, setComponentLogLevel, setLogger };
export type { LogLevel, LogLevelName, SdkLogger };

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert display units to smallest units (e.g., BTC to satoshis)
 *
 * @param amount - Amount in display units
 * @param precision - Decimal precision (e.g., 8 for BTC)
 * @returns Amount in smallest units as number
 */
export function toSmallestUnits(amount: number, precision: number): number {
    return Math.round(amount * Math.pow(10, precision));
}

/**
 * Convert smallest units to display units (e.g., satoshis to BTC)
 *
 * @param amount - Amount in smallest units
 * @param precision - Decimal precision (e.g., 8 for BTC)
 * @returns Amount in display units
 */
export function toDisplayUnits(amount: number, precision: number): number {
    return amount / Math.pow(10, precision);
}

/**
 * Get SDK version
 */
export function getVersion(): string {
    return '0.5.5';
}

/**
 * Get SDK name
 */
export function getSdkName(): string {
    return 'kaleidoswap-sdk';
}
