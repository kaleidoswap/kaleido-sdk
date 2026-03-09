/**
 * Unit Tests - WebSocket Client
 *
 * Tests WebSocket connectivity, reconnection, and message handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WSClient } from '../../src/ws-client.js';
import type { QuoteResponse } from '../../src/types/ws.js';

// Skip: WebSocket global is not available in Node.js test environment
describe.skip('WSClient', () => {
    let wsClient: WSClient;
    const mockWsUrl = 'ws://localhost:8000/ws/0b33b045-4cb8-4e2e-9e2d-bd8c1c8b4abe';

    beforeEach(() => {
        wsClient = new WSClient({
            url: mockWsUrl,
            maxReconnectAttempts: 3,
            reconnectDelay: 100,
            pingInterval: 1000,
        });
    });

    afterEach(() => {
        if (wsClient) {
            wsClient.disconnect();
        }
    });

    describe('Connection Management', () => {
        it('should create WSClient instance', () => {
            expect(wsClient).toBeDefined();
            expect(wsClient.isConnected()).toBe(false);
        });

        it('should have event emitter methods', () => {
            expect(typeof wsClient.on).toBe('function');
            expect(typeof wsClient.emit).toBe('function');
            expect(typeof wsClient.off).toBe('function');
        });

        it('should have requestQuote method', () => {
            expect(typeof wsClient.requestQuote).toBe('function');
        });

        it('should have ping method', () => {
            expect(typeof wsClient.ping).toBe('function');
        });
    });

    describe('Message Handling', () => {
        it('should handle quote response events', () => {
            return new Promise<void>((resolve) => {
                const mockQuote: QuoteResponse = {
                    action: 'quote_response',
                    from_asset: {
                        asset_id: 'BTC',
                        name: 'Bitcoin',
                        ticker: 'BTC',
                        layer: 'BTC_LN',
                        amount: 10000000n,
                        precision: 8,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        name: 'Tether USD',
                        ticker: 'USDT',
                        layer: 'RGB_LN',
                        amount: 45000000000n,
                        precision: 6,
                    },
                    price: 45000n,
                    rfq_id: 'rfq_123',
                    timestamp: Date.now(),
                    expires_at: Date.now() + 30000,
                    fee: {
                        fee_asset: 'usdt',
                        fee_precision: 6,
                        base_fee: 1000000n,
                        variable_fee: 500000n,
                        fee_rate: 0.001,
                        final_fee: 1500000n,
                    },
                };

                wsClient.on('quoteResponse', (response: QuoteResponse) => {
                    expect(response).toBeDefined();
                    expect(response.rfq_id).toBe(mockQuote.rfq_id);
                    expect(response.price).toBe(mockQuote.price);
                    resolve();
                });

                // Simulate receiving quote response
                wsClient.emit('quoteResponse', mockQuote);
            });
        });

        it('should handle connection established event', () => {
            return new Promise<void>((resolve) => {
                const mockData = {
                    client_id: 'client_123',
                    server_time: Date.now() / 1000,
                    timestamp: Date.now(),
                    message: 'Connected',
                };

                wsClient.on('connectionEstablished', (data: any) => {
                    expect(data).toBeDefined();
                    expect(data.client_id).toBe(mockData.client_id);
                    resolve();
                });

                wsClient.emit('connectionEstablished', mockData);
            });
        });

        it('should handle pong events', () => {
            return new Promise<void>((resolve) => {
                wsClient.on('pong', (response: any) => {
                    expect(response).toBeDefined();
                    resolve();
                });

                wsClient.emit('pong', { action: 'pong', timestamp: Date.now() });
            });
        });
    });

    describe('Error Handling', () => {
        it('should emit error events', () => {
            return new Promise<void>((resolve) => {
                const errorMessage = 'Connection failed';

                wsClient.on('error', (error: Error) => {
                    expect(error).toBeDefined();
                    expect(error.message).toBeDefined();
                    resolve();
                });

                wsClient.emit('error', new Error(errorMessage));
            });
        });

        it('should handle disconnection', () => {
            return new Promise<void>((resolve) => {
                wsClient.on('disconnected', () => {
                    resolve();
                });

                wsClient.emit('disconnected');
            });
        });

        it('should emit reconnecting event', () => {
            return new Promise<void>((resolve) => {
                wsClient.on('reconnecting', (attempt: number) => {
                    expect(attempt).toBeGreaterThan(0);
                    resolve();
                });

                wsClient.emit('reconnecting', 1);
            });
        });
    });

    describe('Disconnection', () => {
        it('should disconnect cleanly', () => {
            wsClient.disconnect();
            expect(wsClient.isConnected()).toBe(false);
        });
    });
});
