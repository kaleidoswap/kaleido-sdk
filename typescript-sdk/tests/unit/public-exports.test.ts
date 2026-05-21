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

// ============================================================================
// Cross-SDK type-name aliases (Batch F)
// Mirrors python-sdk TestCrossSdkTypeNameAliases. Aliases are type-only in
// TypeScript (they evaporate at runtime), so we verify them via compile-time
// assignment compatibility — if the alias ever diverges from its canonical
// type, this file fails to compile, which is exactly what we want.
// ============================================================================

import type {
    ChannelOrderResponse,
    EstimateFeesRequest,
    EstimateFeesResponse,
    EstimateLspFeesRequest,
    EstimateLspFeesResponse,
    GetLspOrderResponse,
} from '../../src/index.js';
import type { CreateLNInvoiceResponse, LNInvoiceResponse } from '../../src/index.js';

describe('public type-name aliases (Batch F)', () => {
    it('EstimateLspFeesRequest <-> EstimateFeesRequest are mutually assignable', () => {
        const a: EstimateLspFeesRequest = {} as EstimateFeesRequest;
        const b: EstimateFeesRequest = {} as EstimateLspFeesRequest;
        const c: EstimateLspFeesResponse = {} as EstimateFeesResponse;
        const d: EstimateFeesResponse = {} as EstimateLspFeesResponse;
        // Reference the bindings so the compiler keeps the type checks.
        void [a, b, c, d];
        expect(true).toBe(true);
    });

    it('GetLspOrderResponse <-> ChannelOrderResponse are mutually assignable', () => {
        const a: GetLspOrderResponse = {} as ChannelOrderResponse;
        const b: ChannelOrderResponse = {} as GetLspOrderResponse;
        void [a, b];
        expect(true).toBe(true);
    });

    it('LNInvoiceResponse <-> CreateLNInvoiceResponse are mutually assignable', () => {
        const a: LNInvoiceResponse = {} as CreateLNInvoiceResponse;
        const b: CreateLNInvoiceResponse = {} as LNInvoiceResponse;
        void [a, b];
        expect(true).toBe(true);
    });
});
