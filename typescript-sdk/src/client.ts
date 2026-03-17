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

    readonly logState: LogState;

    private constructor(config: KaleidoConfig) {
        this.config = config;
        this.logState = new LogState(config.logLevel, config.logger);
        this.http = new HttpClient(
            {
                baseUrl: config.baseUrl,
                nodeUrl: config.nodeUrl,
                apiKey: config.apiKey,
                timeout: (config.timeout ?? 30) * 1000,
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

    hasMaker(): boolean {
        return !!this.config.baseUrl;
    }

    hasNode(): boolean {
        return !!this.config.nodeUrl;
    }

    get maker(): MakerClient {
        return this._maker;
    }

    get rln(): RlnClient {
        return this._rln;
    }

    async close(): Promise<void> {
        await this._rln.close();
    }
}

export { applyLogLevel, setComponentLogLevel, setLogger };
export type { LogLevel, LogLevelName, SdkLogger };

// ============================================================================
// Utility Functions
// ============================================================================

export function toSmallestUnits(amount: number, precision: number): number {
    return Math.round(amount * Math.pow(10, precision));
}

export function toDisplayUnits(amount: number, precision: number): number {
    return amount / Math.pow(10, precision);
}

export function getVersion(): string {
    return '0.5.5';
}

export function getSdkName(): string {
    return 'kaleidoswap-sdk';
}
