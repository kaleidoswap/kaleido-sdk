import { describe, expect, it } from 'vitest';
import { createAssetPairMapper } from '../../src/index.js';
import type { TradingPairsResponse } from '../../src/api-types-ext.js';

describe('AssetPairMapper', () => {
    it('uses canonical API asset_id values instead of protocol_ids-derived IDs', () => {
        const pairsResponse: TradingPairsResponse = {
            pairs: [
                {
                    id: 'btc-rgbusdt',
                    ticker: 'BTC/RGBUSDT',
                    base_asset: 'BTC',
                    base_asset_id: 'btc-canonical',
                    quote_asset: 'RGBUSDT',
                    quote_asset_id: 'usdt-canonical',
                    is_active: true,
                    base: {
                        ticker: 'BTC',
                        asset_id: 'btc-canonical',
                        name: 'Bitcoin',
                        precision: 8,
                        protocol_ids: {
                            BTC: 'btc-network-id',
                        },
                        endpoints: [
                            {
                                layer: 'BTC_LN',
                                min_amount: 1000,
                                max_amount: 1000000,
                                is_active: true,
                            },
                        ],
                    },
                    quote: {
                        ticker: 'RGBUSDT',
                        asset_id: 'usdt-canonical',
                        name: 'Tether USD',
                        precision: 8,
                        protocol_ids: {
                            RGB: 'rgb-protocol-id',
                        },
                        endpoints: [
                            {
                                layer: 'RGB_LN',
                                min_amount: 2000,
                                max_amount: 2000000,
                                is_active: true,
                            },
                        ],
                    },
                },
            ],
            total: 1,
            limit: 1,
            offset: 0,
            timestamp: 1710000000,
        };

        const mapper = createAssetPairMapper(pairsResponse);

        expect(mapper.findById('btc-canonical')?.ticker).toBe('BTC');
        expect(mapper.findById('usdt-canonical')?.ticker).toBe('RGBUSDT');
        expect(mapper.findById('btc-network-id')).toBeUndefined();
        expect(mapper.findById('rgb-protocol-id')).toBeUndefined();
        expect(mapper.findByTicker('BTC')?.asset_id).toBe('btc-canonical');
        expect(mapper.findByTicker('RGBUSDT')?.asset_id).toBe('usdt-canonical');
        expect(mapper.canTrade('btc-canonical', 'usdt-canonical')).toBe(true);
    });

    // ========================================================================
    // Parity coverage with python-sdk TestAssetPairMapper
    // ========================================================================

    const buildPairsResponse = (): TradingPairsResponse => ({
        pairs: [
            {
                id: 'pair_btc_usdt',
                ticker: 'BTC/USDT',
                base_asset: 'BTC',
                base_asset_id: 'asset_btc',
                quote_asset: 'USDT',
                quote_asset_id: 'asset_usdt',
                is_active: true,
                base: {
                    ticker: 'BTC',
                    asset_id: 'asset_btc',
                    name: 'Bitcoin',
                    precision: 8,
                    protocol_ids: { native: 'btc' },
                    endpoints: [
                        {
                            layer: 'BTC_LN',
                            min_amount: 1000,
                            max_amount: 1_000_000_000,
                            is_active: true,
                        },
                    ],
                },
                quote: {
                    ticker: 'USDT',
                    asset_id: 'asset_usdt',
                    name: 'Tether',
                    precision: 6,
                    protocol_ids: { rgb: 'usdt-rgb' },
                    endpoints: [
                        {
                            layer: 'RGB_LN',
                            min_amount: 1,
                            max_amount: 10_000_000,
                            is_active: true,
                        },
                    ],
                },
            },
        ],
        total: 1,
        limit: 100,
        offset: 0,
        timestamp: 0,
    });

    it('findByTicker is case-insensitive and surfaces min/max limits', () => {
        const mapper = createAssetPairMapper(buildPairsResponse());

        const btc = mapper.findByTicker('btc'); // lower-case input
        expect(btc).toBeDefined();
        expect(btc?.asset_id).toBe('asset_btc');
        expect(btc?.min_order_size).toBe(1000);
        expect(btc?.max_order_size).toBe(1_000_000_000);

        expect(mapper.findById('asset_usdt')).toBeDefined();
        expect(mapper.findById('asset_missing')).toBeUndefined();
    });

    it('canTrade and canTradeByTicker correctly resolve trading partners', () => {
        const mapper = createAssetPairMapper(buildPairsResponse());

        expect(mapper.canTrade('asset_btc', 'asset_usdt')).toBe(true);
        expect(mapper.canTrade('asset_btc', 'asset_other')).toBe(false);
        expect(mapper.canTradeByTicker('BTC', 'USDT')).toBe(true);

        const partners = mapper.getTradingPartners('asset_btc');
        expect(partners).toHaveLength(1);
        expect(partners[0].asset_id).toBe('asset_usdt');
    });

    it('findPairByTickers respects base/quote direction and getActivePairs filters', () => {
        const mapper = createAssetPairMapper(buildPairsResponse());

        expect(mapper.findPairByTickers('BTC', 'USDT')).toBeDefined();
        expect(mapper.findPairByTickers('USDT', 'BTC')).toBeUndefined(); // direction matters
        expect(mapper.getActivePairs()).toHaveLength(1);
    });
});
