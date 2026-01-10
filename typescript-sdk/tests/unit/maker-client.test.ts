/**
 * Unit Tests - MakerClient Quote Methods
 * 
 * Tests for quote-related functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MakerClient } from '../../src/maker-client.js';
import { HttpClient } from '../../src/http-client.js';
import type { Quote } from '../../src/types.js';

describe('MakerClient - Quote Methods', () => {
    let makerClient: MakerClient;
    let mockHttpClient: any;

    beforeEach(() => {
        // Create mock HTTP client
        mockHttpClient = {
            maker: {
                POST: vi.fn(),
            },
        };
        makerClient = new MakerClient(mockHttpClient as unknown as HttpClient);
    });

    describe('getQuote', () => {
        it('should successfully get quote with from_amount specified', async () => {
            // Mock successful API response
            const mockQuoteResponse: Quote = {
                rfq_id: 'test-rfq-123',
                from_asset: {
                    asset_id: 'BTC',
                    ticker: 'BTC',
                    name: 'Bitcoin',
                    layer: 'BTC_LN',
                    amount: 21000000,
                    precision: 8,
                },
                to_asset: {
                    asset_id: 'USDT',
                    ticker: 'USDT',
                    name: 'Tether USD',
                    layer: 'RGB_LN',
                    amount: 22000000000,
                    precision: 6,
                },
                price: 104761904761,
                price_precision: 6,
                fee: {
                    fee_asset: 'BTC',
                    fee_precision: 8,
                    base_fee: 0,
                    variable_fee: 0,
                    fee_rate: 0.001,
                    final_fee: 21000,
                },
                timestamp: Math.floor(Date.now() / 1000),
                expires_at: Math.floor(Date.now() / 1000) + 60,
            };

            mockHttpClient.maker.POST.mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
            });

            // Call getQuote with proper PairQuoteRequest body
            const result = await makerClient.getQuote({
                from_asset: {
                    asset_id: 'BTC',
                    layer: 'BTC_LN',
                    amount: 21000000,
                },
                to_asset: {
                    asset_id: 'USDT',
                    layer: 'RGB_LN',
                    amount: null,
                },
            });

            // Verify POST was called with correct endpoint and body
            expect(mockHttpClient.maker.POST).toHaveBeenCalledWith(
                '/api/v1/market/quote',
                {
                    body: {
                        from_asset: {
                            asset_id: 'BTC',
                            layer: 'BTC_LN',
                            amount: 21000000,
                        },
                        to_asset: {
                            asset_id: 'USDT',
                            layer: 'RGB_LN',
                            amount: null,
                        },
                    },
                }
            );

            // Verify response
            expect(result).toEqual(mockQuoteResponse);
            expect(result.rfq_id).toBe('test-rfq-123');
            expect(result.from_asset.amount).toBe(21000000);
            expect(result.to_asset.amount).toBe(22000000000);
        });

        it('should successfully get quote with to_amount specified (reverse quote)', async () => {
            const mockQuoteResponse: Quote = {
                rfq_id: 'test-rfq-456',
                from_asset: {
                    asset_id: 'BTC',
                    ticker: 'BTC',
                    name: 'Bitcoin',
                    layer: 'BTC_LN',
                    amount: 19047619,
                    precision: 8,
                },
                to_asset: {
                    asset_id: 'USDT',
                    ticker: 'USDT',
                    name: 'Tether USD',
                    layer: 'RGB_LN',
                    amount: 20000000000,
                    precision: 6,
                },
                price: 104761904761,
                price_precision: 6,
                fee: {
                    fee_asset: 'BTC',
                    fee_precision: 8,
                    base_fee: 0,
                    variable_fee: 0,
                    fee_rate: 0.001,
                    final_fee: 19048,
                },
                timestamp: Math.floor(Date.now() / 1000),
                expires_at: Math.floor(Date.now() / 1000) + 60,
            };

            mockHttpClient.maker.POST.mockResolvedValue({
                data: mockQuoteResponse,
                error: null,
            });

            const result = await makerClient.getQuote({
                from_asset: {
                    asset_id: 'BTC',
                    layer: 'BTC_LN',
                    amount: null,
                },
                to_asset: {
                    asset_id: 'USDT',
                    layer: 'RGB_LN',
                    amount: 20000000000,
                },
            });

            expect(result.rfq_id).toBe('test-rfq-456');
            expect(result.to_asset.amount).toBe(20000000000);
            expect(result.from_asset.amount).toBe(19047619);
        });

        it('should handle API errors correctly', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    status: 400,
                    message: 'Invalid amount',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: 'BTC_LN',
                        amount: -1000,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null,
                    },
                })
            ).rejects.toThrow();
        });

        it('should handle different layer combinations', async () => {
            const combinations = [
                { from: 'BTC_LN' as const, to: 'RGB_LN' as const },
                { from: 'BTC_L1' as const, to: 'RGB_L1' as const },
                { from: 'RGB_LN' as const, to: 'BTC_LN' as const },
            ];

            for (const { from, to } of combinations) {
                mockHttpClient.maker.POST.mockResolvedValue({
                    data: {
                        rfq_id: `test-${from}-${to}`,
                        from_asset: { asset_id: 'BTC', layer: from, amount: 1000000 },
                        to_asset: { asset_id: 'USDT', layer: to, amount: null },
                        price: 100000,
                        timestamp: Date.now(),
                        expires_at: Date.now() + 60000,
                    },
                    error: null,
                });

                await makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: from,
                        amount: 1000000,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: to,
                        amount: null,
                    },
                });

                expect(mockHttpClient.maker.POST).toHaveBeenLastCalledWith(
                    '/api/v1/market/quote',
                    expect.objectContaining({
                        body: expect.objectContaining({
                            from_asset: expect.objectContaining({ layer: from }),
                            to_asset: expect.objectContaining({ layer: to }),
                        }),
                    })
                );
            }
        });
    });

    describe('Precision Methods', () => {
        it('should convert raw amounts to display amounts', () => {
            const btcPrecision = 8;
            const sats = 150000000;
            const btc = makerClient.toDisplay(sats, btcPrecision);

            expect(btc).toBe(1.5);
        });

        it('should convert display amounts to raw amounts', () => {
            const btcPrecision = 8;
            const btc = 1.5;
            const sats = makerClient.toRaw(btc, btcPrecision);

            expect(sats).toBe(150000000);
        });
    });
});
