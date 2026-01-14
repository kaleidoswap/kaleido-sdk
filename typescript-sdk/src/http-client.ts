/**
 * HTTP Client for Kaleidoswap API
 *
 * Type-safe wrapper using openapi-fetch for automatic type inference
 */

import createClient from 'openapi-fetch';
import type { paths } from './generated/api-types.js';
import type { paths as nodePaths } from './generated/node-types.js';

export interface HttpClientConfig {
    baseUrl: string;
    nodeUrl?: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
}

/**
 * Type-safe HTTP client using openapi-fetch
 */
export class HttpClient {
    private makerClient: ReturnType<typeof createClient<paths>>;
    private nodeClient?: ReturnType<typeof createClient<nodePaths>>;
    private config: HttpClientConfig;

    constructor(config: HttpClientConfig) {
        this.config = config;

        // Create type-safe Maker API client
        this.makerClient = createClient<paths>({
            baseUrl: config.baseUrl,
            headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined,
        });

        // Create Node API client if URL provided
        if (config.nodeUrl) {
            this.nodeClient = createClient<nodePaths>({
                baseUrl: config.nodeUrl,
            });
        }
    }

    /**
     * Get the type-safe Maker API client
     */
    get maker() {
        return this.makerClient;
    }

    /**
     * Get the type-safe Node API client
     */
    get node() {
        if (!this.nodeClient) {
            throw new Error('Node API client not configured. Provide nodeUrl in configuration.');
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
     * Check if Node API client is configured
     */
    hasNodeClient(): boolean {
        return this.nodeClient !== undefined;
    }
}
