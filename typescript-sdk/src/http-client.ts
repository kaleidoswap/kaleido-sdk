/**
 * HTTP Client for Kaleidoswap API
 *
 * Type-safe wrapper using openapi-fetch for automatic type inference
 */

import createClient from 'openapi-fetch';
import type { paths } from './generated/api-types.js';
import type { paths as nodePaths } from './generated/node-types.js';
import { ConfigError } from './errors.js';

export interface HttpClientConfig {
    baseUrl?: string;
    nodeUrl?: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
}

/**
 * Type-safe HTTP client using openapi-fetch
 */
export class HttpClient {
    private makerClient?: ReturnType<typeof createClient<paths>>;
    private nodeClient?: ReturnType<typeof createClient<nodePaths>>;
    private config: HttpClientConfig;

    constructor(config: HttpClientConfig) {
        this.config = config;

        // Create type-safe Maker API client only if baseUrl is provided
        if (config.baseUrl) {
            this.makerClient = createClient<paths>({
                baseUrl: config.baseUrl,
                headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined,
            });
        }

        // Create Node API client only if nodeUrl is provided
        if (config.nodeUrl) {
            this.nodeClient = createClient<nodePaths>({
                baseUrl: config.nodeUrl,
            });
        }
    }

    /**
     * Get the type-safe Maker API client.
     * Throws a ConfigError if no baseUrl was provided at construction time.
     */
    get maker() {
        if (!this.makerClient) {
            throw new ConfigError(
                'Maker API not configured. Provide "baseUrl" when creating the client.',
            );
        }
        return this.makerClient;
    }

    /**
     * Get the type-safe Node API client.
     * Throws a ConfigError if no nodeUrl was provided at construction time.
     */
    get node() {
        if (!this.nodeClient) {
            throw new ConfigError(
                'Node API not configured. Provide "nodeUrl" when creating the client.',
            );
        }
        return this.nodeClient;
    }

    /**
     * Enable Node API client with a URL
     */
    enableNodeClient(nodeUrl: string): void {
        this.nodeClient = createClient<nodePaths>({
            baseUrl: nodeUrl,
        });
    }

    /**
     * Check if the Maker API client is configured
     */
    hasMakerClient(): boolean {
        return this.makerClient !== undefined;
    }

    /**
     * Check if the Node API client is configured
     */
    hasNodeClient(): boolean {
        return this.nodeClient !== undefined;
    }
}
