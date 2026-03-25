/**
 * Unit Tests - Precision Utilities
 *
 * Tests precision conversion functions
 */

import { describe, it, expect } from 'vitest';
import {
    toRawAmount,
    toDisplayAmount,
    PrecisionHandler,
    createPrecisionHandler,
    type MappedAsset,
} from '../../src/utils/index.js';
import { ValidationError } from '../../src/errors.js';

describe('Precision Utilities', () => {
    describe('toRawAmount', () => {
        it('should convert BTC to satoshis (8 decimals)', () => {
            expect(toRawAmount(1, 8)).toBe(100000000);
            expect(toRawAmount(0.5, 8)).toBe(50000000);
            expect(toRawAmount(0.00000001, 8)).toBe(1);
        });

        it('should convert USDT to atomic units (6 decimals)', () => {
            expect(toRawAmount(100, 6)).toBe(100000000);
            expect(toRawAmount(0.000001, 6)).toBe(1);
        });

        it('should handle precision 0', () => {
            expect(toRawAmount(100, 0)).toBe(100);
        });

        it('should reject values with too many decimal places', () => {
            expect(() => toRawAmount(0.000000001, 8)).toThrow(ValidationError);
            expect(() => toRawAmount(1.234567891, 8)).toThrow('more than 8 decimal places');
        });

        it('should reject non-finite values', () => {
            expect(() => toRawAmount(Number.NaN, 8)).toThrow('must be finite');
            expect(() => toRawAmount(Number.POSITIVE_INFINITY, 8)).toThrow('must be finite');
        });
    });

    describe('toDisplayAmount', () => {
        it('should convert satoshis to BTC', () => {
            expect(toDisplayAmount(100000000, 8)).toBe(1);
            expect(toDisplayAmount(50000000, 8)).toBe(0.5);
            expect(toDisplayAmount(1, 8)).toBe(0.00000001);
        });

        it('should convert USDT atomic to display', () => {
            expect(toDisplayAmount(100000000, 6)).toBe(100);
        });
    });

    describe('PrecisionHandler', () => {
        const mockAssets: MappedAsset[] = [
            {
                asset_id: 'btc',
                ticker: 'BTC',
                precision: 8,
                min_order_size: 1000, // 0.00001 BTC
                max_order_size: 100000000, // 1 BTC
            },
            {
                asset_id: 'usdt',
                ticker: 'USDT',
                precision: 6,
                min_order_size: 1000000, // 1 USDT
                max_order_size: 1000000000, // 1000 USDT
            },
        ];

        it('should create handler from assets', () => {
            const handler = createPrecisionHandler(mockAssets);
            expect(handler).toBeInstanceOf(PrecisionHandler);
        });

        it('should throw error with empty assets array', () => {
            expect(() => new PrecisionHandler([])).toThrow('empty assets array');
        });

        it('should convert amounts correctly', () => {
            const handler = new PrecisionHandler(mockAssets);

            expect(handler.toRawAmount(1, 'btc')).toBe(100000000);
            expect(handler.toDisplayAmount(100000000, 'btc')).toBe(1);
        });

        it('should reject extra precision in handler conversion', () => {
            const handler = new PrecisionHandler(mockAssets);

            expect(() => handler.toRawAmount(0.000000001, 'btc')).toThrow(
                'more than 8 decimal places',
            );
        });

        it('should throw error for unknown asset', () => {
            const handler = new PrecisionHandler(mockAssets);

            expect(() => handler.toRawAmount(1, 'unknown')).toThrow('not found');
        });

        it('should validate order sizes', () => {
            const handler = new PrecisionHandler(mockAssets);
            const btc = mockAssets[0];

            // Valid amount
            const validResult = handler.validateOrderSize(0.0001, btc);
            expect(validResult.valid).toBe(true);

            // Too small
            const tooSmallResult = handler.validateOrderSize(0.000001, btc);
            expect(tooSmallResult.valid).toBe(false);
            expect(tooSmallResult.error).toContain('below minimum');

            // Too large
            const tooLargeResult = handler.validateOrderSize(10, btc);
            expect(tooLargeResult.valid).toBe(false);
            expect(tooLargeResult.error).toContain('above maximum');
        });

        it('should surface invalid precision in order size validation', () => {
            const handler = new PrecisionHandler(mockAssets);
            const btc = mockAssets[0];

            const invalidPrecisionResult = handler.validateOrderSize(0.000000001, btc);
            expect(invalidPrecisionResult.valid).toBe(false);
            expect(invalidPrecisionResult.error).toContain('more than 8 decimal places');
        });

        it('should format display amounts', () => {
            const handler = new PrecisionHandler(mockAssets);

            expect(handler.formatDisplayAmount(1.12345678, 'btc')).toBe('1.12345678');
            expect(handler.formatDisplayAmount(100.5, 'usdt')).toBe('100.500000');
        });

        it('should reject extra precision while formatting', () => {
            const handler = new PrecisionHandler(mockAssets);

            expect(() => handler.formatDisplayAmount(1.123456789, 'btc')).toThrow(
                'more than 8 decimal places',
            );
        });

        it('should get order size limits', () => {
            const handler = new PrecisionHandler(mockAssets);
            const btc = mockAssets[0];

            const limits = handler.getOrderSizeLimits(btc);

            expect(limits.minDisplayAmount).toBe(0.00001);
            expect(limits.maxDisplayAmount).toBe(1);
            expect(limits.minRawAmount).toBe(1000);
            expect(limits.maxRawAmount).toBe(100000000);
            expect(limits.precision).toBe(8);
        });
    });
});
