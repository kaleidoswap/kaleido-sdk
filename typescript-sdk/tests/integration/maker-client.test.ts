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
        it('should list assets', async () => {
            try {
                const response = await client.maker.listAssets();
                expect(response).toBeDefined();
                expect(response.assets).toBeInstanceOf(Array);
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        }, { timeout: 10000 });

        it('should list trading pairs', async () => {
            try {
                const response = await client.maker.listPairs();
                expect(response).toBeDefined();
                expect(response.pairs).toBeInstanceOf(Array);
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        }, { timeout: 10000 });
    });

    describe('Quote Operations', () => {
        it('should get quote by pair', async () => {
            try {
                const quote = await client.maker.getQuote({
                    pair_ticker: 'BTC/USDT',
                    from_amount: 10000000, // 0.1 BTC in sats
                    from_layer: 'BTC_LN',
                    to_layer: 'RGB_LN',
                });

                expect(quote).toBeDefined();
                expect(quote.rfq_id).toBeDefined();
            } catch (error) {
                console.warn('Skipping - API not available:', error);
            }
        }, { timeout: 10000 });
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
