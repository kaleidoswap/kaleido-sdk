/**
 * Unit Tests - MakerClient Quote Methods
 *
 * Tests for quote-related functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MakerClient } from '../../src/maker-client.js';
import { HttpClient } from '../../src/http-client.js';
import type { Quote } from '../../src/api-types-ext.js';

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
                    amount: 21000000n,
                    precision: 8,
                },
                to_asset: {
                    asset_id: 'USDT',
                    ticker: 'USDT',
                    name: 'Tether USD',
                    layer: 'RGB_LN',
                    amount: 22000000000n,
                    precision: 6,
                },
                price: 104761904761n,
                fee: {
                    fee_asset: 'BTC',
                    fee_asset_precision: 8,
                    base_fee: 0n,
                    variable_fee: 0n,
                    fee_rate: 0.001,
                    final_fee: 21000n,
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
                    amount: 21000000n,
                },
                to_asset: {
                    asset_id: 'USDT',
                    layer: 'RGB_LN',
                    amount: null,
                },
            });

            // Verify POST was called with correct endpoint and body
            expect(mockHttpClient.maker.POST).toHaveBeenCalledWith('/api/v1/market/quote', {
                body: {
                    from_asset: {
                        asset_id: 'BTC',
                        layer: 'BTC_LN',
                        amount: 21000000n,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null,
                    },
                },
            });

            // Verify response
            expect(result).toEqual(mockQuoteResponse);
            expect(result.rfq_id).toBe('test-rfq-123');
            expect(result.from_asset.amount).toBe(21000000n);
            expect(result.to_asset.amount).toBe(22000000000n);
        });

        it('should successfully get quote with to_amount specified (reverse quote)', async () => {
            const mockQuoteResponse: Quote = {
                rfq_id: 'test-rfq-456',
                from_asset: {
                    asset_id: 'BTC',
                    ticker: 'BTC',
                    name: 'Bitcoin',
                    layer: 'BTC_LN',
                    amount: 19047619n,
                    precision: 8,
                },
                to_asset: {
                    asset_id: 'USDT',
                    ticker: 'USDT',
                    name: 'Tether USD',
                    layer: 'RGB_LN',
                    amount: 20000000000n,
                    precision: 6,
                },
                price: 104761904761n,
                fee: {
                    fee_asset: 'BTC',
                    fee_asset_precision: 8,
                    base_fee: 0n,
                    variable_fee: 0n,
                    fee_rate: 0.001,
                    final_fee: 19048n,
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
                    amount: 20000000000n,
                },
            });

            expect(result.rfq_id).toBe('test-rfq-456');
            expect(result.to_asset.amount).toBe(20000000000n);
            expect(result.from_asset.amount).toBe(19047619n);
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
                        amount: -1000n,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null,
                    },
                }),
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
                        from_asset: { asset_id: 'BTC', layer: from, amount: 1000000n },
                        to_asset: { asset_id: 'USDT', layer: to, amount: null },
                        price: 100000n,
                        timestamp: Date.now(),
                        expires_at: Date.now() + 60000,
                    },
                    error: null,
                });

                await makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: from,
                        amount: 1000000n,
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
                    }),
                );
            }
        });
    });

    describe('Error Handling - Quote Validation', () => {
        it('should throw ValidationError when amount is below minimum', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'BTC amount must be between 1000 and 100000',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: 'BTC_LN',
                        amount: 500n, // Below minimum
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null,
                    },
                }),
            ).rejects.toThrow('must be between');
        });

        it('should throw ValidationError when amount is above maximum', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'BTC amount must be between 1000 and 100000',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: 'BTC_LN',
                        amount: 200000n, // Above maximum
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null,
                    },
                }),
            ).rejects.toThrow('must be between');
        });

        it('should throw ValidationError when both amounts are provided', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'Exactly one of from_amount or to_amount must be provided',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: 'BTC_LN',
                        amount: 10000n,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: 500000000n, // Both provided - should error
                    },
                }),
            ).rejects.toThrow(/exactly one of.*amount.*must be provided/i);
        });

        it('should throw ValidationError when neither amount is provided', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'Either from_amount or to_amount must be provided',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: {
                        asset_id: 'BTC',
                        layer: 'BTC_LN',
                        amount: null,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null, // Neither provided - should error
                    },
                }),
            ).rejects.toThrow(/either.*amount.*must be provided/i);
        });

        it('should throw ValidationError for invalid asset/layer combination', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'NONEXISTENT cannot use layer BTC_LN',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: {
                        asset_id: 'NONEXISTENT',
                        layer: 'BTC_LN',
                        amount: 10000n,
                    },
                    to_asset: {
                        asset_id: 'USDT',
                        layer: 'RGB_LN',
                        amount: null,
                    },
                }),
            ).rejects.toThrow(/cannot use layer/i);
        });
    });

    describe('Error Handling - Error Type Mapping', () => {
        it('should map 400 status to ValidationError with correct properties', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'Invalid amount',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            try {
                await makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                });
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.name).toBe('ValidationError');
                expect(error.code).toBe('VALIDATION_ERROR');
            }
        });

        it('should map 404 status to NotFoundError', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'Asset not found: NONEXISTENT',
                },
                response: {
                    status: 404,
                    statusText: 'Not Found',
                },
            });

            try {
                await makerClient.getQuote({
                    from_asset: { asset_id: 'NONEXISTENT', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                });
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.name).toBe('NotFoundError');
                expect(error.code).toBe('NOT_FOUND');
                expect(error.statusCode).toBe(404);
            }
        });

        it('should map 422 status to ValidationError for missing fields', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: [
                        {
                            loc: ['body', 'receiver_address'],
                            msg: 'Field required',
                            type: 'missing',
                        },
                    ],
                },
                response: {
                    status: 422,
                    statusText: 'Unprocessable Entity',
                },
            });

            try {
                await makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                });
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.name).toBe('ValidationError');
                expect(error.message).toContain('receiver_address');
                expect(error.message).toContain('Field required');
            }
        });

        it('should map 503 status to APIError for service unavailable', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'Service temporarily unavailable',
                },
                response: {
                    status: 503,
                    statusText: 'Service Unavailable',
                },
            });

            try {
                await makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                });
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.name).toBe('APIError');
                expect(error.statusCode).toBe(503);
                expect(error.message).toContain('Service temporarily unavailable');
            }
        });
    });

    describe('Error Handling - Message Extraction', () => {
        it('should extract detail field from error response', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: 'Detailed error message',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                }),
            ).rejects.toThrow('Detailed error message');
        });

        it('should extract message field from error response', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    message: 'Error message field',
                },
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                }),
            ).rejects.toThrow('Error message field');
        });

        it('should handle FastAPI validation array format', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {
                    detail: [
                        {
                            loc: ['body', 'from_asset', 'amount'],
                            msg: 'value must be positive',
                            type: 'value_error',
                        },
                        {
                            loc: ['body', 'to_asset', 'layer'],
                            msg: 'invalid layer value',
                            type: 'value_error',
                        },
                    ],
                },
                response: {
                    status: 422,
                    statusText: 'Unprocessable Entity',
                },
            });

            try {
                await makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: -1000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                });
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                // Should combine multiple validation errors
                expect(error.message).toContain('from_asset.amount');
                expect(error.message).toContain('value must be positive');
                expect(error.message).toContain('to_asset.layer');
                expect(error.message).toContain('invalid layer value');
            }
        });

        it('should fall back to statusText when no error details available', async () => {
            mockHttpClient.maker.POST.mockResolvedValue({
                data: null,
                error: {},
                response: {
                    status: 500,
                    statusText: 'Internal Server Error',
                },
            });

            await expect(
                makerClient.getQuote({
                    from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10000n },
                    to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                }),
            ).rejects.toThrow('Internal Server Error');
        });
    });

    describe('Precision Methods', () => {
        it('should convert raw amounts to display amounts', () => {
            const btcPrecision = 8;
            const sats = 150000000n;
            const btc = makerClient.toDisplay(sats, btcPrecision);

            expect(btc).toBe(1.5);
        });

        it('should convert display amounts to raw amounts', () => {
            const btcPrecision = 8;
            const btc = 1.5;
            const sats = makerClient.toRaw(btc, btcPrecision);

            expect(sats).toBe(150000000n);
        });
    });
});
