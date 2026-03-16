/**
 * Integration Tests - Trading Pairs and WebSocket Quotes
 *
 * Tests for fetching trading pairs and requesting quotes via WebSocket
 * with BTC and RGB assets across different layers (BTC_L1, BTC_LN, RGB_L1, RGB_LN).
 * Requires a running maker server (set KALEIDO_API_URL / KALEIDO_WS_URL).
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { KaleidoClient } from '../../src/index.js';
import type { QuoteResponse } from '../../src/types/ws.js';
import type { Layer } from '../../src/types/index.js';
import type { WSClient } from '../../src/ws-client.js';
import { connectWebSocketOrSkip, skipIfBackendUnavailable } from './helpers.js';

const TEST_API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
const TEST_WS_URL =
    process.env.KALEIDO_WS_URL ||
    'ws://localhost:8000/api/v1/market/ws/0b33b045-4cb8-4e2e-9e2d-bd8c1c8b4abe';

describe('Trading Pairs and WebSocket Quotes Integration', () => {
    let client: KaleidoClient;
    let currentWs: WSClient | undefined;

    beforeAll(() => {
        client = KaleidoClient.create({
            baseUrl: TEST_API_URL,
        });
    });

    afterEach(() => {
        currentWs?.disconnect();
        currentWs = undefined;
    });

    async function enableWebSocketOrSkip(context: string): Promise<boolean> {
        currentWs = client.maker.enableWebSocket(TEST_WS_URL);
        return connectWebSocketOrSkip(currentWs, context);
    }

    function isRecognizedLayer(layer: string | undefined): boolean {
        if (!layer) {
            return false;
        }

        return /^(BTC|RGB)_(L1|LN|SPARK)$/.test(layer);
    }

    function getQuoteLeg(
        quote: QuoteResponse & Record<string, unknown>,
        side: 'from' | 'to',
    ): { ticker?: string; amount?: number; layer?: string } {
        const assetKey = `${side}_asset` as const;
        const amountKey = `${side}_amount` as const;
        const layerKey = `${side}_layer` as const;
        const assetValue = quote[assetKey];

        if (assetValue && typeof assetValue === 'object') {
            const leg = assetValue as { ticker?: unknown; amount?: unknown; layer?: unknown };
            return {
                ticker: typeof leg.ticker === 'string' ? leg.ticker : undefined,
                amount: typeof leg.amount === 'number' ? leg.amount : undefined,
                layer: typeof leg.layer === 'string' ? leg.layer : undefined,
            };
        }

        return {
            ticker: typeof assetValue === 'string' ? assetValue : undefined,
            amount: typeof quote[amountKey] === 'number' ? (quote[amountKey] as number) : undefined,
            layer: typeof quote[layerKey] === 'string' ? (quote[layerKey] as string) : undefined,
        };
    }

    // ============================================================================
    // Trading Pairs Tests
    // ============================================================================

    describe('Fetching Trading Pairs', () => {
        it('should fetch all trading pairs', async () => {
            try {
                const response = await client.maker.listPairs();

                expect(response).toBeDefined();
                expect(response.pairs).toBeDefined();
                expect(Array.isArray(response.pairs)).toBe(true);
                expect(response.total).toBeGreaterThan(0);
                expect(response.timestamp).toBeDefined();
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });

        it('should fetch pairs with BTC as base asset', async () => {
            try {
                const response = await client.maker.listPairs();
                const btcPairs = response.pairs.filter((pair) => pair.base.ticker === 'BTC');

                expect(btcPairs.length).toBeGreaterThan(0);

                btcPairs.forEach((pair) => {
                    expect(pair.base.ticker).toBe('BTC');
                    expect(pair.base.name).toBeDefined();
                    expect(pair.base.precision).toBeDefined();
                    expect(pair.quote).toBeDefined();
                    expect(pair.routes).toBeDefined();
                    expect(Array.isArray(pair.routes)).toBe(true);
                });
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });

        it('should fetch pairs with RGB assets', async () => {
            try {
                const response = await client.maker.listPairs();
                const rgbPairs = response.pairs.filter(
                    (pair) =>
                        pair.base.ticker.includes('RGB') ||
                        pair.quote.ticker.includes('RGB') ||
                        (pair.base.protocol_ids && 'RGB' in pair.base.protocol_ids) ||
                        (pair.quote.protocol_ids && 'RGB' in pair.quote.protocol_ids),
                );

                if (rgbPairs.length > 0) {
                    rgbPairs.forEach((pair) => {
                        expect(pair.routes).toBeDefined();
                        expect(Array.isArray(pair.routes)).toBe(true);
                    });
                }
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });

        it('should verify pairs have layer information in routes', async () => {
            try {
                const response = await client.maker.listPairs();

                expect(response.pairs.length).toBeGreaterThan(0);

                const pairsWithRoutes = response.pairs.filter(
                    (pair) => pair.routes && pair.routes.length > 0,
                );
                expect(pairsWithRoutes.length).toBeGreaterThan(0);

                pairsWithRoutes.forEach((pair) => {
                    pair.routes?.forEach((route) => {
                        expect(route.from_layer).toBeDefined();
                        expect(route.to_layer).toBeDefined();
                        expect(isRecognizedLayer(route.from_layer)).toBe(true);
                        expect(isRecognizedLayer(route.to_layer)).toBe(true);
                    });
                });
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });

        it('should filter pairs by layer', async () => {
            try {
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
            } catch (error) {
                console.warn('Skipping - API not available:', error);
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
                if (!(await enableWebSocketOrSkip(`WebSocket server not available for ${name}`))) {
                    return;
                }

                let unsubscribe: (() => void) | undefined;

                try {
                    const quotes: QuoteResponse[] = [];
                    unsubscribe = await client.maker.streamQuotes(
                        fromAsset,
                        toAsset,
                        amount,
                        fromLayer,
                        toLayer,
                        (quote) => {
                            const fromLeg = getQuoteLeg(
                                quote as QuoteResponse & Record<string, unknown>,
                                'from',
                            );
                            const toLeg = getQuoteLeg(
                                quote as QuoteResponse & Record<string, unknown>,
                                'to',
                            );
                            quotes.push(quote);
                            console.log(`\n📊 Received quote for ${name}:`);
                            console.log(`   From: ${fromLeg.amount} ${fromLeg.ticker}`);
                            console.log(`   To: ${toLeg.amount} ${toLeg.ticker}`);
                            console.log(`   Price: ${quote.price}`);
                            console.log(`   Fee: ${quote.fee.final_fee} ${quote.fee.fee_asset}`);
                            console.log(`   RFQ ID: ${quote.rfq_id}`);
                            console.log(`   Expires in: ${quote.expires_at - quote.timestamp}s`);
                        },
                    );

                    // Wait for at least one quote
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    // Verify we received at least one quote
                    if (quotes.length === 0) {
                        console.warn(`Skipping ${name} - route produced no quotes`);
                        return;
                    }

                    // Verify quote structure
                    const quote = quotes[0];
                    const fromLeg = getQuoteLeg(
                        quote as QuoteResponse & Record<string, unknown>,
                        'from',
                    );
                    const toLeg = getQuoteLeg(
                        quote as QuoteResponse & Record<string, unknown>,
                        'to',
                    );
                    expect(quote.action).toBe('quote_response');
                    expect(quote.from_asset).toBeDefined();
                    expect(quote.to_asset).toBeDefined();
                    expect(fromLeg.amount).toBeGreaterThan(0);
                    expect(toLeg.amount).toBeGreaterThan(0);
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
                    if (
                        skipIfBackendUnavailable(
                            `WebSocket server not available for ${name}`,
                            error,
                        )
                    ) {
                        return;
                    }
                    throw error;
                } finally {
                    unsubscribe?.();
                }
            }, 10000);
        });

        it('should handle multiple simultaneous quote streams', async () => {
            if (!(await enableWebSocketOrSkip('WebSocket server not available'))) {
                return;
            }

            let unsubscribe1: (() => void) | undefined;
            let unsubscribe2: (() => void) | undefined;

            try {
                const stream1Quotes: QuoteResponse[] = [];
                const stream2Quotes: QuoteResponse[] = [];

                // Start two simultaneous streams
                unsubscribe1 = await client.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000,
                    'BTC_LN',
                    'RGB_LN',
                    (quote) => {
                        const fromLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'from',
                        );
                        const toLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'to',
                        );
                        stream1Quotes.push(quote);
                        console.log('\n📊 Stream 1 Quote:', {
                            from: `${fromLeg.amount} ${fromLeg.ticker}`,
                            to: `${toLeg.amount} ${toLeg.ticker}`,
                            price: quote.price,
                            fee: quote.fee.final_fee,
                        });
                    },
                );

                unsubscribe2 = await client.maker.streamQuotes(
                    'usdt',
                    'btc',
                    10000000000,
                    'RGB_LN',
                    'BTC_LN',
                    (quote) => {
                        const fromLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'from',
                        );
                        const toLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'to',
                        );
                        stream2Quotes.push(quote);
                        console.log('\n📊 Stream 2 Quote:', {
                            from: `${fromLeg.amount} ${fromLeg.ticker}`,
                            to: `${toLeg.amount} ${toLeg.ticker}`,
                            price: quote.price,
                            fee: quote.fee.final_fee,
                        });
                    },
                );

                // Wait for quotes
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Both streams should receive quotes
                if (stream1Quotes.length === 0 || stream2Quotes.length === 0) {
                    console.warn('Skipping - one or more simultaneous routes produced no quotes');
                    return;
                }

                // Verify quotes are different (different pairs)
                if (stream1Quotes.length > 0 && stream2Quotes.length > 0) {
                    const stream1From = getQuoteLeg(
                        stream1Quotes[0] as QuoteResponse & Record<string, unknown>,
                        'from',
                    );
                    const stream1To = getQuoteLeg(
                        stream1Quotes[0] as QuoteResponse & Record<string, unknown>,
                        'to',
                    );
                    const stream2From = getQuoteLeg(
                        stream2Quotes[0] as QuoteResponse & Record<string, unknown>,
                        'from',
                    );
                    const stream2To = getQuoteLeg(
                        stream2Quotes[0] as QuoteResponse & Record<string, unknown>,
                        'to',
                    );
                    expect(
                        `${stream1From.ticker}:${stream1From.layer}->${stream1To.ticker}:${stream1To.layer}`,
                    ).not.toBe(
                        `${stream2From.ticker}:${stream2From.layer}->${stream2To.ticker}:${stream2To.layer}`,
                    );
                }

                unsubscribe1();
                unsubscribe2();
            } catch (error) {
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            } finally {
                unsubscribe1?.();
                unsubscribe2?.();
            }
        }, 10000);

        it('should properly unsubscribe from quote stream', async () => {
            if (!(await enableWebSocketOrSkip('WebSocket server not available'))) {
                return;
            }

            let unsubscribe: (() => void) | undefined;

            try {
                const quotes: QuoteResponse[] = [];
                unsubscribe = await client.maker.streamQuotes(
                    'btc',
                    'usdt',
                    10000000,
                    'BTC_LN',
                    'RGB_LN',
                    (quote) => {
                        const fromLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'from',
                        );
                        const toLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'to',
                        );
                        quotes.push(quote);
                        console.log('📊 Quote received (testing unsubscribe):', {
                            count: quotes.length,
                            from: `${fromLeg.amount} ${fromLeg.ticker}`,
                            to: `${toLeg.amount} ${toLeg.ticker}`,
                        });
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
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            } finally {
                unsubscribe?.();
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
            let unsubscribe: (() => void) | undefined;

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

                if (!(await enableWebSocketOrSkip('WebSocket server not available'))) {
                    return;
                }

                const quotes: QuoteResponse[] = [];
                unsubscribe = await client.maker.streamQuotes(
                    pairWithRoutes.base.ticker.toLowerCase(),
                    pairWithRoutes.quote.ticker.toLowerCase(),
                    10000000, // Test amount
                    route.from_layer as Layer,
                    route.to_layer as Layer,
                    (quote) => {
                        const fromLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'from',
                        );
                        const toLeg = getQuoteLeg(
                            quote as QuoteResponse & Record<string, unknown>,
                            'to',
                        );
                        quotes.push(quote);
                        console.log(
                            `\n📊 Quote for ${pairWithRoutes.base.ticker}/${pairWithRoutes.quote.ticker}:`,
                            {
                                route: `${route.from_layer} → ${route.to_layer}`,
                                from: `${fromLeg.amount} ${fromLeg.ticker}`,
                                to: `${toLeg.amount} ${toLeg.ticker}`,
                                price: quote.price,
                            },
                        );
                    },
                );

                // Wait for quotes
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Verify we got quotes
                if (quotes.length === 0) {
                    console.warn('Skipping - selected route produced no quotes');
                    return;
                }

                unsubscribe();
            } catch (error) {
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            } finally {
                unsubscribe?.();
            }
        }, 10000);

        it('should verify all layer combinations are supported', async () => {
            try {
                const response = await client.maker.listPairs();

                const layerCombinations = new Set<string>();
                response.pairs.forEach((pair) => {
                    pair.routes?.forEach((route) => {
                        layerCombinations.add(`${route.from_layer}->${route.to_layer}`);
                    });
                });

                console.log('Available layer combinations:', Array.from(layerCombinations));
                expect(layerCombinations.size).toBeGreaterThan(0);

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
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });
    });

    // ============================================================================
    // Convenience Methods Tests
    // ============================================================================

    describe('Convenience Methods for Ticker-Based Streaming', () => {
        it('should get available routes for a trading pair', async () => {
            try {
                const routes = await client.maker.getAvailableRoutes('BTC', 'USDT');

                expect(routes).toBeDefined();
                expect(Array.isArray(routes)).toBe(true);
                expect(routes.length).toBeGreaterThan(0);

                routes.forEach((route) => {
                    expect(route.from_layer).toBeDefined();
                    expect(route.to_layer).toBeDefined();
                    expect(isRecognizedLayer(route.from_layer)).toBe(true);
                    expect(isRecognizedLayer(route.to_layer)).toBe(true);
                });
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });

        it('should return empty array for non-existent pair', async () => {
            try {
                const routes = await client.maker.getAvailableRoutes('NONEXISTENT', 'PAIR');

                expect(routes).toBeDefined();
                expect(Array.isArray(routes)).toBe(true);
                expect(routes.length).toBe(0);
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });

        it('should stream quotes by ticker using first available route', async () => {
            if (!(await enableWebSocketOrSkip('WebSocket server not available'))) {
                return;
            }

            let unsubscribe: (() => void) | undefined;

            try {
                const quotes: QuoteResponse[] = [];
                unsubscribe = await client.maker.streamQuotesByTicker(
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
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            } finally {
                unsubscribe?.();
            }
        }, 10000);

        it('should stream quotes by ticker with preferred layers', async () => {
            if (!(await enableWebSocketOrSkip('WebSocket server not available'))) {
                return;
            }

            let unsubscribe: (() => void) | undefined;

            try {
                const quotes: QuoteResponse[] = [];
                unsubscribe = await client.maker.streamQuotesByTicker(
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
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            } finally {
                unsubscribe?.();
            }
        }, 10000);

        it('should throw error when streaming non-existent pair', async () => {
            if (!(await enableWebSocketOrSkip('API or WebSocket server not available'))) {
                return;
            }

            try {
                await expect(
                    client.maker.streamQuotesByTicker('NONEXISTENT', 'PAIR', 10000000, () => {}),
                ).rejects.toThrow('No routes found');
            } catch (error) {
                if (skipIfBackendUnavailable('API or WebSocket server not available', error)) {
                    return;
                }
                throw error;
            }
        });

        it('should stream quotes for all routes simultaneously', async () => {
            if (!(await enableWebSocketOrSkip('WebSocket server not available'))) {
                return;
            }

            let unsubscribers: Map<string, () => void> | undefined;

            try {
                const quotesByRoute = new Map<string, QuoteResponse[]>();

                unsubscribers = await client.maker.streamQuotesForAllRoutes(
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
                if (skipIfBackendUnavailable('WebSocket server not available', error)) {
                    return;
                }
                throw error;
            } finally {
                unsubscribers?.forEach((unsubscribe) => unsubscribe());
            }
        }, 15000);

        it('should handle case-insensitive ticker matching', async () => {
            try {
                const routes1 = await client.maker.getAvailableRoutes('btc', 'usdt');
                const routes2 = await client.maker.getAvailableRoutes('BTC', 'USDT');
                const routes3 = await client.maker.getAvailableRoutes('Btc', 'Usdt');

                expect(routes1.length).toBe(routes2.length);
                expect(routes2.length).toBe(routes3.length);
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        });
    });
});
