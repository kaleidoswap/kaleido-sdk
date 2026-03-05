/**
 * HTTP Client for Kaleidoswap API
 *
 * Type-safe wrapper using openapi-fetch for automatic type inference
 */

import createClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import type { paths } from './generated/api-types.js';
import type { paths as nodePaths } from './generated/node-types.js';
import { ConfigError } from './errors.js';
import { createLogger, LogState } from './logging.js';

export interface HttpClientConfig {
    baseUrl?: string;
    nodeUrl?: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
}

// LogState is passed separately so HttpClientConfig stays a plain data bag.

// ============================================================================
// Logging middleware factory
// ============================================================================

/**
 * Build an openapi-fetch middleware that logs every request and response
 * through the SDK's named 'http' logger bound to a specific `LogState`.
 *
 * The same `Request` object flows from `onRequest` through to `onResponse`,
 * so we use a WeakMap to associate a start timestamp with each in-flight
 * request and compute latency on the response side.
 *
 * Records emitted:
 *   DEBUG  →  outgoing request:  "GET /api/v1/market/assets"
 *   INFO   →  successful reply:  "GET /api/v1/market/assets → 200 (45ms)"
 *   WARN   →  error reply:       "POST /api/v1/swaps/orders → 422 (12ms)"
 */
function _createLoggingMiddleware(state: LogState): Middleware {
    const log = createLogger('http', state);
    // WeakMap is GC-safe: entries are automatically removed when the Request
    // object is collected, so there is no risk of unbounded memory growth.
    const _startTimes = new WeakMap<Request, number>();

    return {
        onRequest({ request }) {
            _startTimes.set(request, Date.now());
            try {
                const url = new URL(request.url);
                log.debug('%s %s', request.method, url.pathname + url.search);
            } catch {
                log.debug('%s %s', request.method, request.url);
            }
            // Return undefined to leave the request unmodified.
            return undefined;
        },

        onResponse({ request, response }) {
            const start = _startTimes.get(request);
            _startTimes.delete(request);
            const latency = start !== undefined ? `${Date.now() - start}ms` : '?ms';

            let pathname: string;
            try {
                pathname = new URL(request.url).pathname;
            } catch {
                pathname = request.url;
            }

            const summary = `${request.method} ${pathname} → ${response.status} (${latency})`;

            if (response.ok) {
                log.info(summary);
            } else {
                log.warn('%s %s', summary, response.statusText);
            }
            // Return undefined to leave the response unmodified.
            return undefined;
        },
    };
}

/**
 * Type-safe HTTP client using openapi-fetch
 */
export class HttpClient {
    private makerClient?: ReturnType<typeof createClient<paths>>;
    private nodeClient?: ReturnType<typeof createClient<nodePaths>>;
    private config: HttpClientConfig;
    private _logState: LogState;

    constructor(config: HttpClientConfig, logState: LogState = new LogState()) {
        this.config = config;

        // Create type-safe Maker API client only if baseUrl is provided
        if (config.baseUrl) {
            this.makerClient = createClient<paths>({
                baseUrl: config.baseUrl,
                headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined,
            });
            this.makerClient.use(_createLoggingMiddleware(logState));
        }

        // Create Node API client only if nodeUrl is provided
        if (config.nodeUrl) {
            this.nodeClient = createClient<nodePaths>({
                baseUrl: config.nodeUrl,
            });
            this.nodeClient.use(_createLoggingMiddleware(logState));
        }

        this._logState = logState;
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
        this.nodeClient.use(_createLoggingMiddleware(this._logState));
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
