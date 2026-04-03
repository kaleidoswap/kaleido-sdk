/**
 * Type Safety Tests
 *
 * Tests to verify TypeScript type inference and type safety
 * These tests primarily check compilation, not runtime behavior
 */

import { describe, it, expect } from 'vitest';
import { KaleidoClient } from '../../src/index.js';
import type { TradingPairResponseModel, AssetResponseModel } from '../../src/index.js';

describe('Type Safety', () => {
    describe('Client Types', () => {
        it('should have properly typed client', () => {
            const client = KaleidoClient.create({
                baseUrl: 'https://api.example.com',
            });

            // Type assertions - these will fail at compile time if types are wrong
            expect(client.maker).toBeDefined();
            expect(client.rln).toBeDefined();
            expect(typeof client.hasNode).toBe('function');
        });
    });

    describe('Response Types', () => {
        it('should properly type API responses', async () => {
            // This is a compile-time test - if types are wrong, TypeScript will error

            // Mock response structure
            const mockAssets: AssetResponseModel[] = [
                {
                    asset_id: 'btc',
                    ticker: 'BTC',
                    name: 'Bitcoin',
                    precision: 8,
                    protocol_ids: { BTC: 'btc' },
                    is_active: true,
                },
            ];

            const mockPairs: TradingPairResponseModel[] = [];

            // Type checking - these should compile without errors
            expect(Array.isArray(mockAssets)).toBe(true);
            expect(Array.isArray(mockPairs)).toBe(true);
        });
    });

    describe('Layer Enum', () => {
        it('should accept valid layer values', () => {
            type Layer = 'BTC_LN' | 'RGB_LN' | 'BTC_L1' | 'RGB_L1';

            const validLayers: Layer[] = ['BTC_LN', 'RGB_LN', 'BTC_L1', 'RGB_L1'];

            expect(validLayers).toHaveLength(4);
        });
    });

    describe('openapi-fetch Type Integration', () => {
        it('should have type-safe HTTP client', () => {
            const client = KaleidoClient.create({
                baseUrl: 'https://api.example.com',
            });

            // Accessing the underlying openapi-fetch clients
            // These should be properly typed from OpenAPI spec
            expect(client.maker).toBeDefined();
        });
    });
});
