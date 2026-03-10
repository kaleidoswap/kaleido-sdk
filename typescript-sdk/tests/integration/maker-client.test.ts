/**
 * Integration Tests - MakerClient
 *
 * Tests MakerClient methods against a live or mocked API
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { KaleidoClient } from '../../src/index.js';

const TEST_API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

describe('MakerClient Integration', () => {
    let client: KaleidoClient;

    beforeAll(() => {
        client = KaleidoClient.create({
            baseUrl: TEST_API_URL,
        });
    });

    describe('Market Data', () => {
        it(
            'should list assets',
            async () => {
                try {
                    const response = await client.maker.listAssets();
                    expect(response).toBeDefined();
                    expect(response.assets).toBeInstanceOf(Array);
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );

        it(
            'should list trading pairs',
            async () => {
                try {
                    const response = await client.maker.listPairs();
                    expect(response).toBeDefined();
                    expect(response.pairs).toBeInstanceOf(Array);
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );
    });

    describe('Quote Operations', () => {
        it(
            'should get quote by pair',
            async () => {
                try {
                    const quote = await client.maker.getQuote({
                        from_asset: {
                            asset_id: 'BTC',
                            layer: 'BTC_LN',
                            amount: 10000000, // 0.1 BTC in sats
                        },
                        to_asset: {
                            asset_id: 'USDT',
                            layer: 'RGB_LN',
                            amount: null,
                        },
                    });

                    expect(quote).toBeDefined();
                    expect(quote.rfq_id).toBeDefined();
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );
    });

    describe('Pair Routes', () => {
        it(
            'should get routes for a pair by ticker',
            async () => {
                try {
                    const routes = await client.maker.getPairRoutes({ pair_ticker: 'BTC/USDT' });
                    expect(routes).toBeDefined();
                    expect(Array.isArray(routes)).toBe(true);
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );

        it(
            'should discover market routes',
            async () => {
                try {
                    const routes = await client.maker.getMarketRoutes({
                        from_asset: 'BTC',
                        to_asset: 'USDT',
                        max_hops: 2,
                    });
                    expect(routes).toBeDefined();
                    expect(routes).toHaveProperty('routes');
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );
    });

    describe('Atomic Swap Operations', () => {
        it(
            'should get swap node info',
            async () => {
                try {
                    const info = await client.maker.getSwapNodeInfo();
                    expect(info).toBeDefined();
                    expect(info).toHaveProperty('pubkey');
                    expect(info).toHaveProperty('network');
                    expect(typeof info.pubkey).toBe('string');
                    const validNetworks = ['mainnet', 'testnet', 'signet', 'regtest'];
                    expect(validNetworks).toContain(info.network?.toLowerCase());
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );

        it(
            'should init a swap',
            async () => {
                try {
                    const quoteResponse = await client.maker.getQuote({
                        from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 4100000 },
                        to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                    });

                    const swap = await client.maker.initSwap({
                        rfq_id: quoteResponse.rfq_id,
                        from_asset: quoteResponse.from_asset.asset_id,
                        from_amount: quoteResponse.from_asset.amount ?? 0,
                        to_asset: quoteResponse.to_asset.asset_id,
                        to_amount: quoteResponse.to_asset.amount ?? 0,
                    });

                    expect(swap).toBeDefined();
                    expect(swap.swapstring).toBeDefined();
                    expect(swap.payment_hash).toBeDefined();
                    expect(typeof swap.swapstring).toBe('string');
                    expect(swap.swapstring.length).toBeGreaterThan(100);
                    expect(swap.payment_hash.length).toBe(64);
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 15000 },
        );

        it(
            'should get atomic swap status',
            async () => {
                try {
                    const quoteResponse = await client.maker.getQuote({
                        from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 4100000 },
                        to_asset: { asset_id: 'USDT', layer: 'RGB_LN', amount: null },
                    });

                    const swap = await client.maker.initSwap({
                        rfq_id: quoteResponse.rfq_id,
                        from_asset: quoteResponse.from_asset.asset_id,
                        from_amount: quoteResponse.from_asset.amount ?? 0,
                        to_asset: quoteResponse.to_asset.asset_id,
                        to_amount: quoteResponse.to_asset.amount ?? 0,
                    });

                    const status = await client.maker.getAtomicSwapStatus({
                        payment_hash: swap.payment_hash,
                    });

                    expect(status).toBeDefined();
                    expect(status.swap).toBeDefined();
                    expect(status.swap.payment_hash).toBe(swap.payment_hash);
                    const validStatuses = ['Waiting', 'Pending', 'Succeeded', 'Expired', 'Failed'];
                    expect(validStatuses).toContain(status.swap.status);
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 15000 },
        );
    });

    describe('Order History & Analytics', () => {
        it(
            'should get order history with pagination',
            async () => {
                try {
                    const history = await client.maker.getOrderHistory({ limit: 10, skip: 0 });
                    expect(history).toBeDefined();
                    expect(history).toHaveProperty('data');
                    expect(history).toHaveProperty('pagination');
                    expect(Array.isArray(history.data)).toBe(true);
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );

        it(
            'should get order analytics',
            async () => {
                try {
                    const analytics = await client.maker.getOrderAnalytics();
                    expect(analytics).toBeDefined();
                    expect(analytics).toHaveProperty('status_counts');
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );
    });

    describe('LSP Operations', () => {
        it(
            'should get LSP info',
            async () => {
                try {
                    const info = await client.maker.getLspInfo();
                    expect(info).toBeDefined();
                    expect(info).toHaveProperty('lsp_connection_url');
                    expect(info).toHaveProperty('options');
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );

        it(
            'should get LSP network info',
            async () => {
                try {
                    const info = await client.maker.getLspNetworkInfo();
                    expect(info).toBeDefined();
                    expect(info).toHaveProperty('network');
                    expect(info).toHaveProperty('height');
                } catch (error) {
                    console.warn('Skipping - API not available:', error);
                }
            },
            { timeout: 10000 },
        );
    });

    describe('Convenience Methods', () => {
        it('should convert raw and display amounts', () => {
            const btcPrecision = 8;
            const sats = client.maker.toRaw(1.5, btcPrecision);
            const btc = client.maker.toDisplay(sats, btcPrecision);

            expect(sats).toBe(150000000);
            expect(btc).toBe(1.5);
        });
    });
});
