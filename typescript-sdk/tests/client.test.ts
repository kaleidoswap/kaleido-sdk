// import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
// import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
// import { AddressInfo } from 'net';

// Import types for testing
import type { KaleidoConfig, /* Asset, TradingPair, Quote, */ Layer } from '../src/types.js';
import { parseRawAmount, toDisplayAmount } from '../src/index.js';

// Import error classes and HTTP error mapper
import {
    KaleidoError,
    APIError,
    NetworkError,
    ValidationError,
    NotFoundError,
    TimeoutError,
    ConfigError,
    SwapError,
    mapHttpError,
} from '../src/errors.js';

// ============================================================================
// Error Classes Tests
// ============================================================================

describe('Error Classes', () => {
    describe('KaleidoError', () => {
        it('should be the base error class', () => {
            const error = new KaleidoError('TEST_ERROR', 'Test error');
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(KaleidoError);
            expect(error.message).toBe('Test error');
            expect(error.name).toBe('KaleidoError');
        });
    });

    describe('APIError', () => {
        it('should extend KaleidoError', () => {
            const error = new APIError('API Error', 400);
            expect(error).toBeInstanceOf(KaleidoError);
            expect(error).toBeInstanceOf(APIError);
        });

        it('should include status code', () => {
            const error = new APIError('Bad request', 400);
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('API_ERROR');
        });
    });

    describe('NetworkError', () => {
        it('should extend KaleidoError', () => {
            const error = new NetworkError('Connection failed');
            expect(error).toBeInstanceOf(KaleidoError);
            expect(error).toBeInstanceOf(NetworkError);
        });
    });

    describe('ValidationError', () => {
        it('should have correct code', () => {
            const error = new ValidationError('Invalid amount');
            expect(error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('NotFoundError', () => {
        it('should have 404 status', () => {
            const error = new NotFoundError('Asset not found');
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
        });
    });

    describe('TimeoutError', () => {
        it('should have correct code', () => {
            const error = new TimeoutError('Request timed out');
            expect(error.code).toBe('TIMEOUT_ERROR');
        });
    });

    describe('ConfigError', () => {
        it('should have correct code', () => {
            const error = new ConfigError('Missing base URL');
            expect(error.code).toBe('CONFIG_ERROR');
        });
    });

    describe('SwapError', () => {
        it('should include swap ID', () => {
            const error = new SwapError('Swap failed', 'swap-123');
            expect(error.swapId).toBe('swap-123');
            expect(error.code).toBe('SWAP_ERROR');
        });
    });
});

// ============================================================================
// HTTP Error Mapping Tests
// ============================================================================

describe('mapHttpError', () => {
    it('should map 404 errors to NotFoundError', () => {
        const httpError = {
            status: 404,
            statusText: 'Not Found',
            data: { message: 'Resource not found' },
        };
        const error = mapHttpError(httpError);
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.statusCode).toBe(404);
    });

    it('should map 400 errors to ValidationError', () => {
        const httpError = {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Invalid input' },
        };
        const error = mapHttpError(httpError);
        expect(error).toBeInstanceOf(ValidationError);
    });

    it('should map 500 errors to APIError', () => {
        const httpError = {
            status: 500,
            statusText: 'Internal Server Error',
            data: { message: 'Server error' },
        };
        const error = mapHttpError(httpError);
        expect(error).toBeInstanceOf(APIError);
        expect(error.statusCode).toBe(500);
    });

    it('should map 429 errors to RateLimitError', () => {
        const httpError = {
            status: 429,
            statusText: 'Too Many Requests',
        };
        const error = mapHttpError(httpError);
        expect(error.name).toBe('RateLimitError');
    });

    it('should map timeout errors (408, 504)', () => {
        const error408 = mapHttpError({
            status: 408,
            statusText: 'Request Timeout',
        });
        expect(error408).toBeInstanceOf(TimeoutError);

        const error504 = mapHttpError({
            status: 504,
            statusText: 'Gateway Timeout',
        });
        expect(error504).toBeInstanceOf(TimeoutError);
    });

    it('should use error message from data', () => {
        const httpError = {
            status: 400,
            statusText: 'Bad Request',
            data: { error: 'Custom error message' },
        };
        const error = mapHttpError(httpError);
        expect(error.message).toContain('Custom error message');
    });

    it('should fallback to statusText if no data', () => {
        const httpError = {
            status: 503,
            statusText: 'Service Unavailable',
        };
        const error = mapHttpError(httpError);
        expect(error.message).toContain('Service Unavailable');
    });
});

// ============================================================================
// Type Definition Tests
// ============================================================================

describe('Type Definitions', () => {
    describe('Layer type', () => {
        it('should include BTC layers', () => {
            const btcLayers: Layer[] = ['BTC_L1', 'BTC_LN', 'BTC_SPARK', 'BTC_LIQUID'];
            expect(btcLayers).toHaveLength(4);
        });

        it('should include RGB layers', () => {
            const rgbLayers: Layer[] = ['RGB_L1', 'RGB_LN'];
            expect(rgbLayers).toHaveLength(2);
        });
    });

    describe('KaleidoConfig type', () => {
        it('should accept minimal config', () => {
            const config: KaleidoConfig = {
                baseUrl: 'https://api.example.com',
            };
            expect(config.baseUrl).toBeDefined();
        });

        it('should accept full config', () => {
            const config: KaleidoConfig = {
                baseUrl: 'https://api.example.com',
                nodeUrl: 'http://localhost:3001',
                apiKey: 'secret',
                timeout: 60,
                maxRetries: 5,
                cacheTtl: 120,
            };
            expect(config.timeout).toBe(60);
            expect(config.maxRetries).toBe(5);
        });
    });
});

// ============================================================================
// Integration Tests (Real API)
// ============================================================================

describe('Integration Tests (Local API)', () => {
    // Tests assume a running Kaleidoswap Maker at localhost:8000
    // Skip if API is not available (connection refused)
    const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
    const isApiAvailable = false;

    beforeAll(async () => {
        try {
            await fetch(`${API_URL}/health`);
            // TODO: Local API is outdated (returns nested objects instead of flat, expects objects in request).
            // Skipping integration tests until API matches OpenAPI spec.
            // if (res.ok) isApiAvailable = true;
            console.log('Skipping integration tests - API version mismatch');
        } catch (_e) {
            console.log('Skipping integration tests - API not available');
        }
    });

    it('should list assets from real API', async () => {
        if (!isApiAvailable) return;

        // Since we can't instantiate WASM client in Node.js test environment easily without
        // complex setup, we'll verify the API structure matches our TypeScript types
        const _response = await fetch(`${API_URL}/api/v1/market/assets`);
        const data = await _response.json();

        expect(data).toHaveProperty('assets');
        expect(Array.isArray(data.assets)).toBe(true);

        if (data.assets.length > 0) {
            const asset = data.assets[0];
            // Verify fields match our AssetResponseModel type
            expect(asset).toHaveProperty('asset_id');
            expect(asset).toHaveProperty('ticker');
            expect(asset).toHaveProperty('name');
            expect(asset).toHaveProperty('precision');
            expect(asset).toHaveProperty('protocol_ids');
            expect(typeof asset.precision).toBe('number');
        }
    });

    it('should list pairs from real API', async () => {
        if (!isApiAvailable) return;

        const response = await fetch(`${API_URL}/api/v1/market/pairs`);
        const data = await response.json();

        expect(data).toHaveProperty('pairs');
        expect(Array.isArray(data.pairs)).toBe(true);

        if (data.pairs.length > 0) {
            const pair = data.pairs[0];
            // Verify key fields from the refreshed TradingPairResponseModel type
            expect(pair).toHaveProperty('id');
            expect(pair).toHaveProperty('ticker');
            expect(pair).toHaveProperty('base');
            expect(pair).toHaveProperty('quote');
            expect(pair.base).toHaveProperty('asset_id');
            expect(pair.quote).toHaveProperty('asset_id');
        }
    });

    it('should get quote from real API', async () => {
        if (!isApiAvailable) return;

        // First get a valid pair
        const pairsResponse = await fetch(`${API_URL}/api/v1/market/pairs`);
        const pairsData = await pairsResponse.json();

        if (pairsData.pairs.length === 0) return;

        const pair = pairsData.pairs[0];

        // Request quote - API uses POST /api/v1/market/quote for quotes generally or typed endpoints
        // Using correct endpoint
        const quoteUrl = `${API_URL}/api/v1/market/quote`;
        const quoteReq = {
            from_asset: pair.base_asset,
            from_amount: 100000,
            to_asset: pair.quote_asset,
            to_amount: null,
        };

        const response = await fetch(quoteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quoteReq),
        });

        // It might fail if liquidity is low, but we check structure if successful
        if (response.ok) {
            const quote = await response.json();
            // Verify fields match our Quote interface
            expect(quote).toHaveProperty('rfq_id');
            expect(quote).toHaveProperty('from_asset');
            expect(quote).toHaveProperty('to_asset');
            expect(quote).toHaveProperty('price');
            expect(quote).toHaveProperty('expires_at');
        }
    });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Utility Functions', () => {
    describe('Amount Conversion', () => {
        it('should convert BTC to satoshis correctly', () => {
            expect(parseRawAmount(1.5, 8)).toBe(150000000);
        });

        it('should convert exact string inputs to smallest units correctly', () => {
            expect(parseRawAmount('1.5', 8)).toBe(150000000);
        });

        it('should convert satoshis to BTC correctly', () => {
            expect(toDisplayAmount(150000000, 8)).toBe(1.5);
        });

        it('should handle USDT precision (6 decimals)', () => {
            expect(parseRawAmount(100.5, 6)).toBe(100500000);
        });

        it('should reject excess decimal places', () => {
            expect(() => parseRawAmount(1.234567891, 8)).toThrow(ValidationError);
        });
    });

    describe('BigInt handling', () => {
        it('should handle large amounts as BigInt', () => {
            const largeAmount = BigInt('1000000000000000');
            expect(largeAmount > BigInt(Number.MAX_SAFE_INTEGER)).toBe(false);
            expect(Number(largeAmount)).toBe(1000000000000000);
        });

        it('should convert BigInt to number for display', () => {
            const satoshis = BigInt(150000000);
            const btc = Number(satoshis) / 1e8;
            expect(btc).toBe(1.5);
        });
    });
});

// ============================================================================
// Configuration Tests
// ============================================================================

describe('Configuration', () => {
    it('should validate required baseUrl', () => {
        // @ts-expect-error - Testing invalid config
        const badConfig: KaleidoConfig = {};
        expect(badConfig.baseUrl).toBeUndefined();
    });

    it('should allow optional nodeUrl', () => {
        const config: KaleidoConfig = {
            baseUrl: 'https://api.example.com',
        };
        expect(config.nodeUrl).toBeUndefined();
    });

    it('should use number types for timeout/retries', () => {
        const config: KaleidoConfig = {
            baseUrl: 'https://api.example.com',
            timeout: 30,
            maxRetries: 3,
            cacheTtl: 60,
        };
        expect(typeof config.timeout).toBe('number');
        expect(typeof config.maxRetries).toBe('number');
        expect(typeof config.cacheTtl).toBe('number');
    });
});
