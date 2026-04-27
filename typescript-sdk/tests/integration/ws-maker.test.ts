/**
 * Integration Tests - WebSocket Streaming
 *
 * Tests WebSocket integration with MakerClient for real-time updates.
 * Requires a running maker server (set KALEIDO_API_URL / KALEIDO_WS_URL).
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { KaleidoClient } from '../../src/index.js';
import type { QuoteResponse } from '../../src/types/ws.js';
import type { WSClient } from '../../src/ws-client.js';
import { connectWebSocketOrSkip, skipIfBackendUnavailable } from './helpers.js';

const TEST_API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
const TEST_WS_URL =
    process.env.KALEIDO_WS_URL ||
    'ws://localhost:8000/api/v1/market/ws/0b33b045-4cb8-4e2e-9e2d-bd8c1c8b4abe';

describe('WebSocket Integration', () => {
    let client: KaleidoClient;
    let currentWs: WSClient | undefined;

    beforeAll(async () => {
        client = await KaleidoClient.create({
            baseUrl: TEST_API_URL,
            installId: 'inst_test_ws_maker',
        });
    });

    afterEach(() => {
        currentWs?.disconnect();
        currentWs = undefined;
    });

    describe('WebSocket Client Integration', () => {
        it('should enable WebSocket', () => {
            const ws = client.maker.enableWebSocket(TEST_WS_URL);
            currentWs = ws;
            expect(ws).toBeDefined();
            expect(ws.isConnected()).toBe(false);
        });

        it('should have streaming methods', () => {
            currentWs = client.maker.enableWebSocket(TEST_WS_URL);
            expect(typeof client.maker.streamQuotes).toBe('function');
        });

        it.skip(
            'should stream real-time quotes',
            async () => {
                client.maker.enableWebSocket(TEST_WS_URL);

                const quotes: QuoteResponse[] = [];
                const unsubscribe = await client.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000, // 0.1 BTC
                    'BTC_LN',
                    'RGB_LN',
                    (quote) => quotes.push(quote),
                );

                await new Promise((resolve) => setTimeout(resolve, 5000));

                expect(quotes.length).toBeGreaterThan(0);
                unsubscribe();
            },
            { timeout: 10000 },
        );
    });

    describe('Quote Streaming', () => {
        it('should return unsubscribe function', async () => {
            currentWs = client.maker.enableWebSocket(TEST_WS_URL);
            if (!(await connectWebSocketOrSkip(currentWs, 'WebSocket server not available'))) {
                return;
            }

            try {
                const unsubscribe = await client.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000,
                    'BTC_LN',
                    'RGB_LN',
                    () => {},
                );

                expect(typeof unsubscribe).toBe('function');
                unsubscribe();
            } catch (error) {
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            }
        });

        it('should throw error if WebSocket not enabled', async () => {
            const freshClient = await KaleidoClient.create({
                baseUrl: TEST_API_URL,
                installId: 'inst_test_ws_maker_fresh',
            });

            await expect(
                freshClient.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000,
                    'BTC_LN',
                    'RGB_LN',
                    () => {},
                ),
            ).rejects.toThrow('WebSocket not enabled');
        });
    });
});
