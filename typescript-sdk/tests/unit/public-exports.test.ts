import { describe, expect, it } from 'vitest';
import {
    AssetPairMapper,
    PrecisionHandler,
    createAssetPairMapper,
    createPrecisionHandler,
    parseRawAmount,
    toDisplayAmount,
} from '../../src/index.js';
import type {
    AssetPairMappedAsset,
    MappedAsset,
    OrderSizeLimits,
    ValidationResult,
} from '../../src/index.js';

describe('public utility exports', () => {
    it('exports runtime utility helpers from the package root', () => {
        expect(typeof parseRawAmount).toBe('function');
        expect(typeof toDisplayAmount).toBe('function');
        expect(typeof createPrecisionHandler).toBe('function');
        expect(typeof createAssetPairMapper).toBe('function');
        expect(PrecisionHandler).toBeTypeOf('function');
        expect(AssetPairMapper).toBeTypeOf('function');
    });

    it('exports utility types from the package root', () => {
        const precisionAsset: MappedAsset = {
            asset_id: 'btc',
            ticker: 'BTC',
            precision: 8,
            min_order_size: 1,
            max_order_size: 100,
        };
        const validation: ValidationResult = {
            valid: true,
            rawAmount: 10,
            minRawAmount: 1,
            maxRawAmount: 100,
        };
        const limits: OrderSizeLimits = {
            minDisplayAmount: 0.01,
            maxDisplayAmount: 1,
            minRawAmount: 1,
            maxRawAmount: 100,
            precision: 8,
        };
        const pairAsset: AssetPairMappedAsset = {
            asset_id: 'btc',
            ticker: 'BTC',
            name: 'Bitcoin',
            precision: 8,
            is_active: true,
            min_order_size: 1,
            max_order_size: 100,
            trading_pairs: ['usdt'],
            protocol_ids: { BTC: 'btc' },
        };

        expect(precisionAsset.ticker).toBe('BTC');
        expect(validation.valid).toBe(true);
        expect(limits.precision).toBe(8);
        expect(pairAsset.name).toBe('Bitcoin');
    });
});
