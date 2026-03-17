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

function _createLoggingMiddleware(state: LogState): Middleware {
    const log = createLogger('http', state);
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
            return undefined;
        },
    };
}

function _createFetchWithTimeout(timeoutMs?: number): typeof fetch | undefined {
    if (!timeoutMs || timeoutMs <= 0) {
        return undefined;
    }

    return async (input, init) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const signal = init?.signal
            ? AbortSignal.any([init.signal, controller.signal])
            : controller.signal;

        try {
            return await fetch(input, { ...init, signal });
        } catch (error) {
            if (controller.signal.aborted && !init?.signal?.aborted) {
                throw new Error(`Request timeout after ${timeoutMs}ms`);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    };
}

export class HttpClient {
    private makerClient?: ReturnType<typeof createClient<paths>>;
    private nodeClient?: ReturnType<typeof createClient<nodePaths>>;
    private config: HttpClientConfig;
    private _logState: LogState;

    constructor(config: HttpClientConfig, logState: LogState = new LogState()) {
        this.config = config;
        const fetchWithTimeout = _createFetchWithTimeout(config.timeout);

        if (config.baseUrl) {
            this.makerClient = createClient<paths>({
                baseUrl: config.baseUrl,
                headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined,
                fetch: fetchWithTimeout,
            });
            this.makerClient.use(_createLoggingMiddleware(logState));
        }

        if (config.nodeUrl) {
            this.nodeClient = createClient<nodePaths>({
                baseUrl: config.nodeUrl,
                fetch: fetchWithTimeout,
            });
            this.nodeClient.use(_createLoggingMiddleware(logState));
        }

        this._logState = logState;
    }

    get maker() {
        if (!this.makerClient) {
            throw new ConfigError(
                'Maker API not configured. Provide "baseUrl" when creating the client.',
            );
        }
        return this.makerClient;
    }

    get node() {
        if (!this.nodeClient) {
            throw new ConfigError(
                'Node API not configured. Provide "nodeUrl" when creating the client.',
            );
        }
        return this.nodeClient;
    }

    enableNodeClient(nodeUrl: string): void {
        this.nodeClient = createClient<nodePaths>({
            baseUrl: nodeUrl,
            fetch: _createFetchWithTimeout(this.config.timeout),
        });
        this.nodeClient.use(_createLoggingMiddleware(this._logState));
    }

    hasMakerClient(): boolean {
        return this.makerClient !== undefined;
    }

    hasNodeClient(): boolean {
        return this.nodeClient !== undefined;
    }

    async close(): Promise<void> {
        // openapi-fetch uses the global fetch implementation, so there are no
        // per-client sockets or handles to dispose here.
    }
}
