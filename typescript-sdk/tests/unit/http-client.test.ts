/**
 * Unit Tests - HTTP Client
 *
 * Tests the core HTTP client functionality with openapi-fetch
 */

import { describe, it, expect } from 'vitest';
import { ConfigError, TimeoutError } from '../../src/errors.js';
import { HttpClient } from '../../src/http-client.js';

describe('HttpClient', () => {
    describe('Constructor', () => {
        it('should create client with maker API', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(client).toBeDefined();
            expect(client.maker).toBeDefined();
        });

        it('should create client with node API when nodeUrl provided', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
                nodeUrl: 'https://node.example.com',
            });

            expect(client).toBeDefined();
            expect(client.hasNodeClient()).toBe(true);
        });

        it('should send maker authentication and attribution headers', async () => {
            const originalFetch = globalThis.fetch;
            let capturedRequest: Request | undefined;

            globalThis.fetch = async (input, init) => {
                capturedRequest = input instanceof Request ? input : new Request(input, init);
                return new Response('{}', {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                    apiKey: 'kld_live_c_test',
                    installId: 'inst_test_install',
                    sessionId: 'test-session',
                    sdkVersion: '0.1.6',
                });

                await client.maker.GET('/api/v1/lsps1/get_info');

                expect(capturedRequest?.headers.get('authorization')).toBe(
                    'Bearer kld_live_c_test',
                );
                expect(capturedRequest?.headers.get('x-kaleido-install-id')).toBe(
                    'inst_test_install',
                );
                expect(capturedRequest?.headers.get('x-kaleido-session-id')).toBe('test-session');
                expect(capturedRequest?.headers.get('x-kaleido-sdk')).toBe('typescript/0.1.6');
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should reject API keys over remote HTTP maker URLs', () => {
            expect(
                () =>
                    new HttpClient({
                        baseUrl: 'http://api.example.com',
                        apiKey: 'kld_live_c_test',
                        installId: 'inst_test_install',
                        sessionId: 'test-session',
                    }),
            ).toThrow(ConfigError);
        });

        it('should allow API keys over localhost HTTP maker URLs', async () => {
            const originalFetch = globalThis.fetch;
            let capturedRequest: Request | undefined;

            globalThis.fetch = async (input, init) => {
                capturedRequest = input instanceof Request ? input : new Request(input, init);
                return new Response('{}', {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'http://localhost:8000',
                    apiKey: 'kld_live_c_test',
                    installId: 'inst_test_install',
                    sessionId: 'test-session',
                    sdkVersion: '0.1.6',
                });

                await client.maker.GET('/api/v1/lsps1/get_info');

                expect(capturedRequest?.headers.get('authorization')).toBe(
                    'Bearer kld_live_c_test',
                );
                expect(capturedRequest?.headers.get('x-kaleido-install-id')).toBe(
                    'inst_test_install',
                );
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should allow explicit insecure opt-out for remote HTTP maker URLs', () => {
            const client = new HttpClient({
                baseUrl: 'http://api.example.com',
                apiKey: 'kld_live_c_test',
                allowInsecure: true,
                installId: 'inst_test_install',
            });

            expect(client.maker).toBeDefined();
        });

        it('should not have node client without nodeUrl', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(client.hasNodeClient()).toBe(false);
        });
    });

    describe('Node Client', () => {
        it('should throw error when accessing node without configuration', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(() => client.node).toThrow(
                'Node API not configured. Provide "nodeUrl" when creating the client.',
            );
        });

        it('should allow enabling node client later', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(client.hasNodeClient()).toBe(false);

            client.enableNodeClient('https://node.example.com');

            expect(client.hasNodeClient()).toBe(true);
            expect(client.node).toBeDefined();
        });

        it('should raise TimeoutError when fetch exceeds the configured timeout', async () => {
            const originalFetch = globalThis.fetch;
            globalThis.fetch = async (_input, init) =>
                await new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () =>
                        reject(new DOMException('Aborted', 'AbortError')),
                    );
                });

            try {
                const client = new HttpClient({
                    nodeUrl: 'https://node.example.com',
                    timeout: 5,
                });

                await expect(
                    client.node.POST('/unlock', { body: { password: 'secret' } }),
                ).rejects.toBeInstanceOf(TimeoutError);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });
    });

    describe('Retry behaviour', () => {
        // Mirrors the Python SDK retry loop in _http_client.py.

        it('should retry transient 5xx responses and ultimately succeed', async () => {
            const originalFetch = globalThis.fetch;
            let calls = 0;
            globalThis.fetch = async () => {
                calls += 1;
                if (calls < 3) {
                    return new Response('{"error":"upstream"}', {
                        status: 503,
                        headers: { 'content-type': 'application/json' },
                    });
                }
                return new Response('{"ok":true}', {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                    maxRetries: 3,
                    retryBaseDelayMs: 1, // keep test fast
                });

                const result = await client.maker.GET('/api/v1/lsps1/get_info');
                expect(calls).toBe(3);
                expect(result.response.status).toBe(200);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should retry on HTTP 429 (rate limit)', async () => {
            const originalFetch = globalThis.fetch;
            let calls = 0;
            globalThis.fetch = async () => {
                calls += 1;
                if (calls === 1) {
                    return new Response('{"error":"slow down"}', {
                        status: 429,
                        headers: { 'content-type': 'application/json' },
                    });
                }
                return new Response('{}', {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                    maxRetries: 2,
                    retryBaseDelayMs: 1,
                });

                const result = await client.maker.GET('/api/v1/lsps1/get_info');
                expect(calls).toBe(2);
                expect(result.response.status).toBe(200);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should NOT retry on 4xx (except 429)', async () => {
            const originalFetch = globalThis.fetch;
            let calls = 0;
            globalThis.fetch = async () => {
                calls += 1;
                return new Response('{"error":"bad request"}', {
                    status: 400,
                    headers: { 'content-type': 'application/json' },
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                    maxRetries: 3,
                    retryBaseDelayMs: 1,
                });

                const result = await client.maker.GET('/api/v1/lsps1/get_info');
                expect(calls).toBe(1); // no retries
                expect(result.response.status).toBe(400);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should retry on network errors and eventually surface the failure', async () => {
            const originalFetch = globalThis.fetch;
            let calls = 0;
            globalThis.fetch = async () => {
                calls += 1;
                throw new TypeError('network refused');
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                    maxRetries: 2,
                    retryBaseDelayMs: 1,
                });

                await expect(
                    client.maker.GET('/api/v1/lsps1/get_info'),
                ).rejects.toThrow(/network refused/);
                // initial attempt + 2 retries = 3 calls
                expect(calls).toBe(3);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should retry per-attempt timeouts (TimeoutError) and surface after exhaustion', async () => {
            const originalFetch = globalThis.fetch;
            let calls = 0;
            globalThis.fetch = async (_input, init) => {
                calls += 1;
                return new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () =>
                        reject(new DOMException('Aborted', 'AbortError')),
                    );
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                    timeout: 5,
                    maxRetries: 1,
                    retryBaseDelayMs: 1,
                });

                await expect(
                    client.maker.GET('/api/v1/lsps1/get_info'),
                ).rejects.toBeInstanceOf(TimeoutError);
                // initial attempt + 1 retry
                expect(calls).toBe(2);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });

        it('should default to maxRetries=0 (no retries) when not configured', async () => {
            const originalFetch = globalThis.fetch;
            let calls = 0;
            globalThis.fetch = async () => {
                calls += 1;
                return new Response('{}', {
                    status: 503,
                    headers: { 'content-type': 'application/json' },
                });
            };

            try {
                const client = new HttpClient({
                    baseUrl: 'https://api.example.com',
                });

                await client.maker.GET('/api/v1/lsps1/get_info');
                expect(calls).toBe(1); // HttpClientConfig default is 0
            } finally {
                globalThis.fetch = originalFetch;
            }
        });
    });
});
