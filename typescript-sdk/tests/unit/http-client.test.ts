/**
 * Unit Tests - HTTP Client
 *
 * Tests the core HTTP client functionality with openapi-fetch
 */

import { describe, it, expect } from 'vitest';
import { HttpClient } from '../../src/http-client.js';
import { TimeoutError } from '../../src/errors.js';

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
});
