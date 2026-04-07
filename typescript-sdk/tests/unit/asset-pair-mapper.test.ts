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
});
