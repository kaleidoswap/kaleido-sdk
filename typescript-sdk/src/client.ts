/**
 * Kaleidoswap SDK Client
 *
 * Main client class that coordinates Maker and RLN operations.
 */

import { HttpClient } from './http-client.js';
import { MakerClient } from './maker-client.js';
import { RlnClient } from './rln-client.js';
import { LogState, applyLogLevel, setComponentLogLevel, setLogger } from './logging.js';
import { generateSessionId, loadOrCreateInstallId } from './identity.js';
import type { LogLevel, LogLevelName, SdkLogger } from './logging.js';
import type { KaleidoConfig } from './types/config.js';

const SDK_VERSION = '0.1.6';

type ResolvedKaleidoConfig = KaleidoConfig & {
    baseUrl: string;
    installId: string;
    sessionId: string;
};

/**
 * Kaleidoswap SDK Client
 *
 * Provides a typed interface for interacting with the Kaleidoswap protocol.
 * Both `baseUrl` and `nodeUrl` are optional. When `baseUrl` is omitted it
 * defaults to the regtest environment (https://api.regtest.kaleidoswap.com).
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleido-sdk';
 *
 * // Market API only
 * const client = await KaleidoClient.create({
 *     baseUrl: 'https://api.regtest.kaleidoswap.com',
 * });
 *
 * // RGB Node only
 * const client = await KaleidoClient.create({
 *     nodeUrl: 'http://localhost:3001',
 * });
 *
 * // Both APIs
 * const client = await KaleidoClient.create({
 *     baseUrl: 'https://api.regtest.kaleidoswap.com',
 *     nodeUrl: 'http://localhost:3001',
 * });
 *
 * const assets = await client.maker.listAssets();
 * ```
 */
export class KaleidoClient {
    private http: HttpClient;
    private config: ResolvedKaleidoConfig;
    private _maker: MakerClient;
    private _rln: RlnClient;

    readonly logState: LogState;

    private constructor(config: ResolvedKaleidoConfig) {
        this.config = config;
        this.logState = new LogState(config.logLevel, config.logger);
        this.http = new HttpClient(
            {
                baseUrl: config.baseUrl,
                nodeUrl: config.nodeUrl,
                apiKey: config.apiKey,
                installId: config.installId,
                sessionId: config.sessionId,
                sdkVersion: SDK_VERSION,
                timeout: (config.timeout ?? 30) * 1000,
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
     * const client = await KaleidoClient.create();
     *
     * // Production Maker API
     * const client = await KaleidoClient.create({ baseUrl: 'https://api.kaleidoswap.com' });
     *
     * // RGB Node only (still defaults baseUrl to regtest)
     * const client = await KaleidoClient.create({ nodeUrl: 'http://localhost:3001' });
     *
     * // Both APIs
     * const client = await KaleidoClient.create({
     *     baseUrl: 'https://api.kaleidoswap.com',
     *     nodeUrl: 'http://localhost:3001',
     * });
     */
    static async create(config: KaleidoConfig = {}): Promise<KaleidoClient> {
        const installId = await loadOrCreateInstallId({
            override: config.installId,
            store: config.installIdStore,
        });
        const sessionId = generateSessionId();

        return new KaleidoClient({
            baseUrl: 'https://api.regtest.kaleidoswap.com',
            ...config,
            installId,
            sessionId,
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
        await Promise.all([this._maker.close(), this.http.close()]);
    }
}

export { applyLogLevel, setComponentLogLevel, setLogger };
export type { LogLevel, LogLevelName, SdkLogger };

// ============================================================================
// Utility Functions
// ============================================================================

export function getVersion(): string {
    return SDK_VERSION;
}

export function getSdkName(): string {
    return 'kaleido-sdk';
}
