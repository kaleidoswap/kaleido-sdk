/**
 * Kaleidoswap SDK Client
 *
 * Main client class that coordinates Maker and RLN operations.
 */

import { HttpClient } from './http-client.js';
import { MakerClient } from './maker-client.js';
import { RlnClient } from './rln-client.js';
import type { KaleidoConfig } from './types.js';

/**
 * Kaleidoswap SDK Client
 *
 * Provides a typed interface for interacting with the Kaleidoswap protocol.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleidoswap-sdk';
 *
 * const client = KaleidoClient.create({
 *     baseUrl: 'https://api.kaleidoswap.com'
 * });
 *
 * const assets = await client.maker.listAssets();
 * console.log(assets[0].ticker); // "BTC"
 * ```
 */
export class KaleidoClient {
    private http: HttpClient;
    private config: KaleidoConfig;
    private _maker: MakerClient;
    private _rln: RlnClient;

    private constructor(config: KaleidoConfig) {
        this.config = config;
        this.http = new HttpClient({
            baseUrl: config.baseUrl,
            nodeUrl: config.nodeUrl,
            apiKey: config.apiKey,
            timeout: (config.timeout ?? 30) * 1000, // Convert to milliseconds
            maxRetries: config.maxRetries ?? 3,
        });
        this._maker = new MakerClient(this.http);
        this._rln = new RlnClient(this.http);
    }

    /**
     * Create a new KaleidoClient instance
     *
     * @param config - Client configuration
     * @returns Initialized client (synchronous)
     */
    static create(config: KaleidoConfig): KaleidoClient {
        return new KaleidoClient(config);
    }

    /**
     * Check if RGB Lightning Node is configured
     */
    hasNode(): boolean {
        return !!this.config.nodeUrl;
    }

    /**
     * Access Market (Maker) Operations
     */
    get maker(): MakerClient {
        return this._maker;
    }

    /**
     * Access RGB/Lightning Node Operations
     */
    get rln(): RlnClient {
        return this._rln;
    }
}

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
    return '0.4.0';
}

/**
 * Get SDK name
 */
export function getSdkName(): string {
    return 'kaleidoswap-sdk';
}
