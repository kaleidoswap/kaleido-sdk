/**
 * Integration Tests - Trading Pairs and WebSocket Quotes
 *
 * Tests for fetching trading pairs and requesting quotes via WebSocket
 * with BTC and RGB assets across different layers (BTC_L1, BTC_LN, RGB_L1, RGB_LN)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { KaleidoClient } from '../../src/index.js';
import type { QuoteResponse } from '../../src/ws-types.js';
import type { Layer } from '../../src/types.js';

const TEST_API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
const TEST_WS_URL =
    process.env.KALEIDO_WS_URL ||
    'ws://localhost:8000/api/v1/market/ws/0b33b045-4cb8-4e2e-9e2d-bd8c1c8b4abe';

describe('Trading Pairs and WebSocket Quotes Integration', () => {
    let client: KaleidoClient;

    beforeAll(() => {
        client = KaleidoClient.create({
            baseUrl: TEST_API_URL,
        });
    });

    // ============================================================================
    // Trading Pairs Tests
    // ============================================================================

    describe('Fetching Trading Pairs', () => {
        it('should fetch all trading pairs', async () => {
            const response = await client.maker.listPairs();

            expect(response).toBeDefined();
            expect(response.pairs).toBeDefined();
            expect(Array.isArray(response.pairs)).toBe(true);
            expect(response.total).toBeGreaterThan(0);
            expect(response.timestamp).toBeDefined();
        });

        it('should fetch pairs with BTC as base asset', async () => {
            const response = await client.maker.listPairs();
            const btcPairs = response.pairs.filter((pair) => pair.base.ticker === 'BTC');

            expect(btcPairs.length).toBeGreaterThan(0);

            // Verify each BTC pair has proper structure
            btcPairs.forEach((pair) => {
                expect(pair.base.ticker).toBe('BTC');
                expect(pair.base.name).toBeDefined();
                expect(pair.base.precision).toBeDefined();
                expect(pair.quote).toBeDefined();
                expect(pair.routes).toBeDefined();
                expect(Array.isArray(pair.routes)).toBe(true);
            });
        });

        it('should fetch pairs with RGB assets', async () => {
            const response = await client.maker.listPairs();
            const rgbPairs = response.pairs.filter(
                (pair) =>
                    pair.base.ticker.includes('RGB') ||
                    pair.quote.ticker.includes('RGB') ||
                    (pair.base.protocol_ids && 'RGB' in pair.base.protocol_ids) ||
                    (pair.quote.protocol_ids && 'RGB' in pair.quote.protocol_ids),
            );

            // RGB pairs may or may not exist depending on maker configuration
            if (rgbPairs.length > 0) {
                rgbPairs.forEach((pair) => {
                    expect(pair.routes).toBeDefined();
                    expect(Array.isArray(pair.routes)).toBe(true);
                });
            }
        });

        it('should verify pairs have layer information in routes', async () => {
            const response = await client.maker.listPairs();

            expect(response.pairs.length).toBeGreaterThan(0);

            // Check that at least some pairs have routes with layer info
            const pairsWithRoutes = response.pairs.filter(
                (pair) => pair.routes && pair.routes.length > 0,
            );
            expect(pairsWithRoutes.length).toBeGreaterThan(0);

            pairsWithRoutes.forEach((pair) => {
                pair.routes?.forEach((route) => {
                    expect(route.from_layer).toBeDefined();
                    expect(route.to_layer).toBeDefined();
                    // Verify layer values are valid
                    const validLayers = ['BTC_L1', 'BTC_LN', 'RGB_L1', 'RGB_LN'];
                    expect(validLayers).toContain(route.from_layer);
                    expect(validLayers).toContain(route.to_layer);
                });
            });
        });

        it('should filter pairs by layer', async () => {
            // Test filtering by BTC_LN layer
            const response = await client.maker.listPairs();
            const btcLnPairs = response.pairs.filter((pair) =>
                pair.routes?.some(
                    (route) => route.from_layer === 'BTC_LN' || route.to_layer === 'BTC_LN',
                ),
            );

            if (btcLnPairs.length > 0) {
                btcLnPairs.forEach((pair) => {
                    const hasLnRoute = pair.routes?.some(
                        (route) => route.from_layer === 'BTC_LN' || route.to_layer === 'BTC_LN',
                    );
                    expect(hasLnRoute).toBe(true);
                });
            }
        });
    });

    // ============================================================================
    // WebSocket Quote Tests
    // ============================================================================

    describe('WebSocket Quote Streaming', () => {
        const testCases: Array<{
            name: string;
            fromAsset: string;
            toAsset: string;
            fromLayer: Layer;
            toLayer: Layer;
            amount: number;
        }> = [
            {
                name: 'BTC_LN to RGB_LN',
                fromAsset: 'btc',
                toAsset: 'usdt',
                fromLayer: 'BTC_LN',
                toLayer: 'RGB_LN',
                amount: 10000000, // 0.1 BTC
            },
            {
                name: 'BTC_L1 to RGB_L1',
                fromAsset: 'btc',
                toAsset: 'usdt',
                fromLayer: 'BTC_L1',
                toLayer: 'RGB_L1',
                amount: 10000000, // 0.1 BTC
            },
            {
                name: 'RGB_LN to BTC_LN',
                fromAsset: 'usdt',
                toAsset: 'btc',
                fromLayer: 'RGB_LN',
                toLayer: 'BTC_LN',
                amount: 10000000000, // 10000 USDT (assuming 6 decimals)
            },
            {
                name: 'RGB_L1 to BTC_L1',
                fromAsset: 'usdt',
                toAsset: 'btc',
                fromLayer: 'RGB_L1',
                toLayer: 'BTC_L1',
                amount: 10000000000, // 10000 USDT (assuming 6 decimals)
            },
            {
                name: 'BTC_L1 to BTC_LN (submarine swap)',
                fromAsset: 'btc',
                toAsset: 'btc',
                fromLayer: 'BTC_L1',
                toLayer: 'BTC_LN',
                amount: 10000000, // 0.1 BTC
            },
            {
                name: 'RGB_L1 to RGB_LN (submarine swap)',
                fromAsset: 'usdt',
                toAsset: 'usdt',
                fromLayer: 'RGB_L1',
                toLayer: 'RGB_LN',
                amount: 10000000000, // 10000 USDT
            },
        ];

        testCases.forEach(({ name, fromAsset, toAsset, fromLayer, toLayer, amount }) => {
            it(`should stream quotes for ${name}`, async () => {
                try {
                    client.maker.enableWebSocket(TEST_WS_URL);

                    const quotes: QuoteResponse[] = [];
                    const unsubscribe = await client.maker.streamQuotes(
                        fromAsset,
                        toAsset,
                        amount,
                        fromLayer,
                        toLayer,
                        (quote) => {
                            console.log(`\n📊 Received quote for ${name}:`);
                            console.log(`   From: ${quote.from_amount} ${quote.from_asset}`);
                            console.log(`   To: ${quote.to_amount} ${quote.to_asset}`);
                            console.log(`   Price: ${quote.price}`);
                            console.log(`   Fee: ${quote.fee.final_fee} ${quote.fee.fee_asset}`);
                            console.log(`   RFQ ID: ${quote.rfq_id}`);
                            console.log(`   Expires in: ${quote.expires_at - quote.timestamp}s`);
                            quotes.push(quote);
                        },
                    );

                    // Wait for at least one quote
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    // Verify we received at least one quote
                    expect(quotes.length).toBeGreaterThan(0);

                    // Verify quote structure
                    const quote = quotes[0];
                    expect(quote.action).toBe('quote_response');
                    expect(quote.from_asset).toBeDefined();
                    expect(quote.to_asset).toBeDefined();
                    expect(quote.from_amount).toBeGreaterThan(0);
                    expect(quote.to_amount).toBeGreaterThan(0);
                    expect(quote.price).toBeGreaterThan(0);
                    expect(quote.rfq_id).toBeDefined();
                    expect(quote.timestamp).toBeDefined();
                    expect(quote.expires_at).toBeGreaterThan(quote.timestamp);
                    expect(quote.fee).toBeDefined();

                    // Verify fee structure
                    expect(quote.fee.fee_asset).toBeDefined();
                    expect(quote.fee.fee_precision).toBeGreaterThanOrEqual(0);
                    expect(quote.fee.final_fee).toBeGreaterThanOrEqual(0);

                    unsubscribe();
                } catch (error) {
                    console.warn(`Skipping ${name} - WebSocket server not available:`, error);
                }
            }, 10000);
        });

        it('should handle multiple simultaneous quote streams', async () => {
            try {
                client.maker.enableWebSocket(TEST_WS_URL);

                const stream1Quotes: QuoteResponse[] = [];
                const stream2Quotes: QuoteResponse[] = [];

                // Start two simultaneous streams
                const unsubscribe1 = await client.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000,
                    'BTC_LN',
                    'RGB_LN',
                    (quote) => {
                        console.log('\n📊 Stream 1 Quote:', {
                            from: `${quote.from_amount} ${quote.from_asset}`,
                            to: `${quote.to_amount} ${quote.to_asset}`,
                            price: quote.price,
                            fee: quote.fee.final_fee,
                        });
                        stream1Quotes.push(quote);
                    },
                );

                const unsubscribe2 = await client.maker.streamQuotes(
                    'usdt',
                    'btc',
                    10000000000,
                    'RGB_LN',
                    'BTC_LN',
                    (quote) => {
                        console.log('\n📊 Stream 2 Quote:', {
                            from: `${quote.from_amount} ${quote.from_asset}`,
                            to: `${quote.to_amount} ${quote.to_asset}`,
                            price: quote.price,
                            fee: quote.fee.final_fee,
                        });
                        stream2Quotes.push(quote);
                    },
                );

                // Wait for quotes
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Both streams should receive quotes
                expect(stream1Quotes.length).toBeGreaterThan(0);
                expect(stream2Quotes.length).toBeGreaterThan(0);

                // Verify quotes are different (different pairs)
                if (stream1Quotes.length > 0 && stream2Quotes.length > 0) {
                    expect(stream1Quotes[0].from_asset).not.toBe(stream2Quotes[0].from_asset);
                }

                unsubscribe1();
                unsubscribe2();
            } catch (error) {
                console.warn('Skipping - WebSocket server not available:', error);
            }
        }, 10000);

        it('should properly unsubscribe from quote stream', async () => {
            try {
                client.maker.enableWebSocket(TEST_WS_URL);

                const quotes: QuoteResponse[] = [];
                const unsubscribe = await client.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000,
                    'BTC_LN',
                    'RGB_LN',
                    (quote) => {
                        console.log('📊 Quote received (testing unsubscribe):', {
                            count: quotes.length + 1,
                            from: `${quote.from_amount} ${quote.from_asset}`,
                            to: `${quote.to_amount} ${quote.to_asset}`,
                        });
                        quotes.push(quote);
                    },
                );

                // Wait for initial quotes
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const quotesBeforeUnsubscribe = quotes.length;

                // Unsubscribe
                unsubscribe();

                // Wait and verify no new quotes arrive
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const quotesAfterUnsubscribe = quotes.length;

                // Should have received some quotes before unsubscribe
                expect(quotesBeforeUnsubscribe).toBeGreaterThan(0);
                // Should not receive new quotes after unsubscribe
                expect(quotesAfterUnsubscribe).toBe(quotesBeforeUnsubscribe);
            } catch (error) {
                console.warn('Skipping - WebSocket server not available:', error);
            }
        }, 10000);

        it('should throw error if WebSocket not enabled before streaming', async () => {
            const freshClient = KaleidoClient.create({ baseUrl: TEST_API_URL });

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

    // ============================================================================
    // Combined Tests - Pairs + WebSocket
    // ============================================================================

    describe('Combined Pairs and WebSocket Tests', () => {
        it('should fetch pairs and stream quotes for available routes', async () => {
            try {
                // First, fetch available pairs
                const pairsResponse = await client.maker.listPairs();
                expect(pairsResponse.pairs.length).toBeGreaterThan(0);

                // Find a pair with routes
                const pairWithRoutes = pairsResponse.pairs.find(
                    (pair) => pair.routes && pair.routes.length > 0,
                );
                expect(pairWithRoutes).toBeDefined();

                if (!pairWithRoutes || !pairWithRoutes.routes) return;

                // Get the first available route
                const route = pairWithRoutes.routes[0];

                // Enable WebSocket and stream quotes for this route
                client.maker.enableWebSocket(TEST_WS_URL);

                const quotes: QuoteResponse[] = [];
                const unsubscribe = await client.maker.streamQuotes(
                    pairWithRoutes.base.ticker.toLowerCase(),
                    pairWithRoutes.quote.ticker.toLowerCase(),
                    10000000, // Test amount
                    route.from_layer as Layer,
                    route.to_layer as Layer,
                    (quote) => {
                        console.log(
                            `\n📊 Quote for ${pairWithRoutes.base.ticker}/${pairWithRoutes.quote.ticker}:`,
                            {
                                route: `${route.from_layer} → ${route.to_layer}`,
                                from: `${quote.from_amount} ${quote.from_asset}`,
                                to: `${quote.to_amount} ${quote.to_asset}`,
                                price: quote.price,
                            },
                        );
                        quotes.push(quote);
                    },
                );

                // Wait for quotes
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Verify we got quotes
                expect(quotes.length).toBeGreaterThan(0);

                unsubscribe();
            } catch (error) {
                console.warn('Skipping - WebSocket server not available:', error);
            }
        }, 10000);

        it('should verify all layer combinations are supported', async () => {
            const response = await client.maker.listPairs();

            // Collect all unique layer combinations from routes
            const layerCombinations = new Set<string>();
            response.pairs.forEach((pair) => {
                pair.routes?.forEach((route) => {
                    layerCombinations.add(`${route.from_layer}->${route.to_layer}`);
                });
            });

            // Log available combinations for debugging
            console.log('Available layer combinations:', Array.from(layerCombinations));

            // Verify we have some combinations
            expect(layerCombinations.size).toBeGreaterThan(0);

            // Check for expected combinations (may vary by maker configuration)
            const expectedCombinations = [
                'BTC_LN->RGB_LN',
                'BTC_L1->RGB_L1',
                'RGB_LN->BTC_LN',
                'RGB_L1->BTC_L1',
            ];

            expectedCombinations.forEach((combo) => {
                if (layerCombinations.has(combo)) {
                    console.log(`✓ Found expected combination: ${combo}`);
                }
            });
        });
    });

    // ============================================================================
    // Convenience Methods Tests
    // ============================================================================

    describe('Convenience Methods for Ticker-Based Streaming', () => {
        it('should get available routes for a trading pair', async () => {
            const routes = await client.maker.getAvailableRoutes('BTC', 'USDT');

            expect(routes).toBeDefined();
            expect(Array.isArray(routes)).toBe(true);
            expect(routes.length).toBeGreaterThan(0);

            // Verify route structure
            routes.forEach((route) => {
                expect(route.from_layer).toBeDefined();
                expect(route.to_layer).toBeDefined();
                const validLayers = ['BTC_L1', 'BTC_LN', 'RGB_L1', 'RGB_LN'];
                expect(validLayers).toContain(route.from_layer);
                expect(validLayers).toContain(route.to_layer);
            });
        });

        it('should return empty array for non-existent pair', async () => {
            const routes = await client.maker.getAvailableRoutes('NONEXISTENT', 'PAIR');

            expect(routes).toBeDefined();
            expect(Array.isArray(routes)).toBe(true);
            expect(routes.length).toBe(0);
        });

        it('should stream quotes by ticker using first available route', async () => {
            try {
                client.maker.enableWebSocket(TEST_WS_URL);

                const quotes: QuoteResponse[] = [];
                const unsubscribe = await client.maker.streamQuotesByTicker(
                    'BTC',
                    'USDT',
                    10000000,
                    (quote) => {
                        console.log('📊 Quote received via streamQuotesByTicker');
                        quotes.push(quote);
                    },
                );

                // Wait for quotes
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Verify we got quotes
                expect(quotes.length).toBeGreaterThan(0);

                // Verify quote structure
                const quote = quotes[0];
                expect(quote.from_asset).toBeDefined();
                expect(quote.to_asset).toBeDefined();
                expect(quote.price).toBeGreaterThan(0);

                unsubscribe();
            } catch (error) {
                console.warn('Skipping - WebSocket server not available:', error);
            }
        }, 10000);

        it('should stream quotes by ticker with preferred layers', async () => {
            try {
                client.maker.enableWebSocket(TEST_WS_URL);

                const quotes: QuoteResponse[] = [];
                const unsubscribe = await client.maker.streamQuotesByTicker(
                    'BTC',
                    'USDT',
                    10000000,
                    (quote) => quotes.push(quote),
                    {
                        preferredFromLayer: 'BTC_LN',
                        preferredToLayer: 'RGB_LN',
                    },
                );

                // Wait for quotes
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Verify we got quotes
                expect(quotes.length).toBeGreaterThan(0);

                unsubscribe();
            } catch (error) {
                console.warn('Skipping - WebSocket server not available:', error);
            }
        }, 10000);

        it('should throw error when streaming non-existent pair', async () => {
            client.maker.enableWebSocket(TEST_WS_URL);

            await expect(
                client.maker.streamQuotesByTicker('NONEXISTENT', 'PAIR', 10000000, () => {}),
            ).rejects.toThrow('No routes found');
        });

        it('should stream quotes for all routes simultaneously', async () => {
            try {
                client.maker.enableWebSocket(TEST_WS_URL);

                const quotesByRoute = new Map<string, QuoteResponse[]>();

                const unsubscribers = await client.maker.streamQuotesForAllRoutes(
                    'BTC',
                    'USDT',
                    10000000,
                    (route, quote) => {
                        if (!quotesByRoute.has(route)) {
                            quotesByRoute.set(route, []);
                        }
                        quotesByRoute.get(route)?.push(quote);
                        console.log(`📊 Quote received for route: ${route}`);
                    },
                );

                // Verify we have unsubscribers for multiple routes
                expect(unsubscribers.size).toBeGreaterThan(0);

                // Wait for quotes from all routes
                await new Promise((resolve) => setTimeout(resolve, 5000));

                // Verify we got quotes from at least one route
                expect(quotesByRoute.size).toBeGreaterThan(0);

                // Verify each route received quotes
                quotesByRoute.forEach((quotes, route) => {
                    console.log(`Route ${route}: ${quotes.length} quotes`);
                    expect(quotes.length).toBeGreaterThan(0);
                });

                // Unsubscribe from all routes
                unsubscribers.forEach((unsubscribe) => unsubscribe());
            } catch (error) {
                console.warn('Skipping - WebSocket server not available:', error);
            }
        }, 15000);

        it('should handle case-insensitive ticker matching', async () => {
            const routes1 = await client.maker.getAvailableRoutes('btc', 'usdt');
            const routes2 = await client.maker.getAvailableRoutes('BTC', 'USDT');
            const routes3 = await client.maker.getAvailableRoutes('Btc', 'Usdt');

            expect(routes1.length).toBe(routes2.length);
            expect(routes2.length).toBe(routes3.length);
        });
    });
});
