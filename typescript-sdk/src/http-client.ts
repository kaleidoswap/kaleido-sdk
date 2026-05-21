/**
 * HTTP Client for Kaleidoswap API
 *
 * Type-safe wrapper using openapi-fetch for automatic type inference
 */

import createClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import type { paths } from './generated/api-types.js';
import type { paths as nodePaths } from './generated/node-types.js';
import { ConfigError, TimeoutError } from './errors.js';
import { createLogger, LogState } from './logging.js';

export interface HttpClientConfig {
    baseUrl?: string;
    nodeUrl?: string;
    apiKey?: string;
    allowInsecure?: boolean;
    installId?: string;
    sessionId?: string;
    sdkVersion?: string;
    timeout?: number;
    /**
     * Maximum number of retry attempts for transient failures (network errors,
     * timeouts, HTTP 5xx, HTTP 429). The initial request is not counted, so a
     * value of `3` means up to 4 total attempts. Defaults to `0` (no retries)
     * for backwards compatibility; KaleidoClient passes `3` by default.
     */
    maxRetries?: number;
    /**
     * Base delay in milliseconds for exponential backoff between retries.
     * Actual delay is `baseDelayMs * 2 ** attempt`. Defaults to `1000`.
     */
    retryBaseDelayMs?: number;
}

const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHttpUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return (
            parsed.protocol === 'http:' &&
            (LOCAL_HTTP_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith('.localhost'))
        );
    } catch {
        return false;
    }
}

function isSecureMakerUrl(url: string | undefined, allowInsecure = false): boolean {
    if (!url) return true;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || allowInsecure || isLocalHttpUrl(url);
    } catch {
        return false;
    }
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

/**
 * HTTP status codes that should trigger a retry. Mirrors the Python SDK's
 * `KaleidoError.is_retryable()` semantics: server errors (5xx) and
 * rate-limit responses (429).
 */
function _isRetryableStatus(status: number): boolean {
    return status >= 500 || status === 429;
}

/**
 * Sleep helper used between retry attempts. Honors `AbortSignal` so an
 * upstream cancellation aborts the wait promptly.
 */
function _sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason ?? new Error('aborted'));
            return;
        }
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            reject(signal?.reason ?? new Error('aborted'));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}

/**
 * Build a fetch implementation with per-request timeout AND retry-with-backoff.
 *
 * Retries on:
 *   - Network errors (fetch throws)
 *   - Per-attempt timeouts (AbortError, surfaced as `TimeoutError`)
 *   - HTTP responses with status >= 500 or status === 429
 *
 * Does NOT retry on:
 *   - Successful responses (2xx/3xx)
 *   - 4xx (except 429) — these are caller errors and won't change
 *   - Upstream-aborted requests (caller's signal fired)
 *
 * Backoff is exponential: `baseDelayMs * 2 ** attempt`.
 * Mirrors the Python SDK's retry loop in `_http_client.py:_request`.
 */
function _createFetchWithRetry(
    timeoutMs?: number,
    maxRetries: number = 0,
    baseDelayMs: number = 1000,
): typeof fetch | undefined {
    const hasTimeout = typeof timeoutMs === 'number' && timeoutMs > 0;
    if (!hasTimeout && maxRetries <= 0) {
        return undefined;
    }

    return async (input, init) => {
        // RequestInit.signal is typed as AbortSignal | null | undefined; coerce
        // null to undefined so it matches helpers that only accept the latter.
        const upstreamSignal: AbortSignal | undefined = init?.signal ?? undefined;
        let lastError: unknown;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            // Bail immediately if the caller has already aborted.
            if (upstreamSignal?.aborted) {
                throw upstreamSignal.reason ?? new Error('aborted');
            }

            const perAttemptController = new AbortController();
            const timeoutId = hasTimeout
                ? setTimeout(() => perAttemptController.abort(), timeoutMs)
                : undefined;
            const signal = upstreamSignal
                ? AbortSignal.any([upstreamSignal, perAttemptController.signal])
                : perAttemptController.signal;

            try {
                const response = await fetch(input, { ...init, signal });

                if (_isRetryableStatus(response.status) && attempt < maxRetries) {
                    // Drain the body so the connection can be reused.
                    try {
                        await response.body?.cancel();
                    } catch {
                        /* ignore */
                    }
                    const delay = baseDelayMs * 2 ** attempt;
                    await _sleep(delay, upstreamSignal);
                    continue;
                }

                return response;
            } catch (error) {
                const timedOut = perAttemptController.signal.aborted && !upstreamSignal?.aborted;
                lastError = timedOut
                    ? new TimeoutError(`Request timeout after ${timeoutMs}ms`)
                    : error;

                // Upstream cancellation — surface immediately.
                if (upstreamSignal?.aborted) {
                    throw upstreamSignal.reason ?? error;
                }

                if (attempt < maxRetries) {
                    const delay = baseDelayMs * 2 ** attempt;
                    await _sleep(delay, upstreamSignal);
                    continue;
                }

                throw lastError;
            } finally {
                if (timeoutId !== undefined) clearTimeout(timeoutId);
            }
        }

        // Loop exited without returning — only reachable if `lastError` was set
        // on the final attempt; defensively throw.
        throw lastError ?? new Error('Request failed after retries');
    };
}

export class HttpClient {
    private makerClient?: ReturnType<typeof createClient<paths>>;
    private nodeClient?: ReturnType<typeof createClient<nodePaths>>;
    private config: HttpClientConfig;
    private _logState: LogState;

    constructor(config: HttpClientConfig, logState: LogState = new LogState()) {
        this.config = config;
        const fetchWithTimeout = _createFetchWithRetry(
            config.timeout,
            config.maxRetries ?? 0,
            config.retryBaseDelayMs,
        );
        const makerHeaders = this._createMakerHeaders();

        if (config.baseUrl) {
            this.makerClient = createClient<paths>({
                baseUrl: config.baseUrl,
                headers: Object.keys(makerHeaders).length > 0 ? makerHeaders : undefined,
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

    private _createMakerHeaders(): Record<string, string> {
        const headers: Record<string, string> = {};
        const secureForAttribution = isSecureMakerUrl(
            this.config.baseUrl,
            this.config.allowInsecure,
        );

        if (this.config.apiKey) {
            if (!secureForAttribution) {
                throw new ConfigError(
                    'Refusing to send Kaleido API key over a non-HTTPS Maker URL. ' +
                        'Use HTTPS, localhost HTTP for development, or set allowInsecure: true.',
                );
            }
            headers.Authorization = `Bearer ${this.config.apiKey}`;
        }

        if (secureForAttribution && this.config.installId) {
            headers['X-Kaleido-Install-Id'] = this.config.installId;
        }

        if (secureForAttribution && this.config.sessionId) {
            headers['X-Kaleido-Session-Id'] = this.config.sessionId;
        }

        if (this.config.sdkVersion) {
            headers['X-Kaleido-SDK'] = `typescript/${this.config.sdkVersion}`;
        }

        return headers;
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
            fetch: _createFetchWithRetry(
                this.config.timeout,
                this.config.maxRetries ?? 0,
                this.config.retryBaseDelayMs,
            ),
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
