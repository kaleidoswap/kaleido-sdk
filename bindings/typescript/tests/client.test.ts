import { createClient, KaleidoConfig, toSmallestUnits, toDisplayUnits } from '../src';

describe('KaleidoClient', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
        maxRetries: 3,
        cacheTtl: 60,
    };

    describe('createClient', () => {
        it('should create a client without node URL', () => {
            const client = createClient(testConfig);
            expect(client).toBeDefined();
            expect(client.hasNode()).toBe(false);
        });

        it('should create a client with node URL', () => {
            const client = createClient({
                ...testConfig,
                nodeUrl: 'http://localhost:3000',
            });
            expect(client).toBeDefined();
            expect(client.hasNode()).toBe(true);
        });
    });

    describe('Client Methods', () => {
        let client: any;

        beforeEach(() => {
            client = createClient(testConfig);
        });

        it('should list assets and return typed objects', async () => {
            const assets = await client.listAssets();
            // Now returns typed Asset[] instead of JSON string
            expect(Array.isArray(assets)).toBe(true);

            if (assets.length > 0) {
                const asset = assets[0];
                expect(asset).toHaveProperty('assetId');
                expect(asset).toHaveProperty('ticker');
                expect(asset).toHaveProperty('name');
            }
        });

        it('should list assets and return JSON string when raw:true', async () => {
            const assets = await client.listAssets({ raw: true });
            expect(typeof assets).toBe('string');

            // Verify it's valid JSON
            const parsed = JSON.parse(assets);
            expect(Array.isArray(parsed)).toBe(true);
        });

        it('should list pairs and return typed objects', async () => {
            const pairs = await client.listPairs();
            // Now returns typed TradingPair[] instead of JSON string
            expect(Array.isArray(pairs)).toBe(true);

            if (pairs.length > 0) {
                const pair = pairs[0];
                expect(pair).toHaveProperty('baseAsset');
                expect(pair).toHaveProperty('quoteAsset');
            }
        });

        it('should list pairs and return JSON string when raw:true', async () => {
            const pairs = await client.listPairs({ raw: true });
            expect(typeof pairs).toBe('string');

            // Verify it's valid JSON
            const parsed = JSON.parse(pairs);
            expect(Array.isArray(parsed)).toBe(true);
        });

        // Quote tests require valid asset IDs which depend on the environment
        // Skip for now as they require live API with proper RGB assets
        it.skip('should get quote by ticker with typed response', async () => {
            const quote = await client.getQuoteByPair('BTC/USDT', 100000, null);
            expect(quote).toHaveProperty('rfqId');
            expect(quote).toHaveProperty('fromAsset');
            expect(quote).toHaveProperty('toAsset');
        });

        it.skip('should get quote by ticker with raw response', async () => {
            const quote = await client.getQuoteByPair('BTC/USDT', 100000, null, { raw: true });
            expect(typeof quote).toBe('string');

            const parsed = JSON.parse(quote);
            expect(parsed).toBeDefined();
        });

        it.skip('should get quote by pair ticker with to_amount', async () => {
            const quote = await client.getQuoteByPair('BTC/USDT', null, 100000);
            expect(quote).toHaveProperty('rfqId');
            expect(quote.toAmount).toBe(100000);
        });
    });
});

describe('Utility Functions', () => {
    describe('toSmallestUnits', () => {
        it('should convert 1 BTC to satoshis (8 decimals)', () => {
            const result = toSmallestUnits(1.0, 8);
            expect(result).toBe(100000000);
        });

        it('should convert 0.5 BTC to satoshis', () => {
            const result = toSmallestUnits(0.5, 8);
            expect(result).toBe(50000000);
        });

        it('should handle different precisions', () => {
            expect(toSmallestUnits(1.0, 2)).toBe(100);
            expect(toSmallestUnits(1.0, 0)).toBe(1);
        });

        it('should handle fractional amounts', () => {
            const result = toSmallestUnits(1.23456789, 8);
            // Due to floating point precision, allow for +/- 1
            expect(result >= 123456788 && result <= 123456789).toBe(true);
        });
    });

    describe('toDisplayUnits', () => {
        it('should convert 100,000,000 satoshis to 1 BTC', () => {
            const result = toDisplayUnits(100000000, 8);
            expect(result).toBe(1.0);
        });

        it('should convert 50,000,000 satoshis to 0.5 BTC', () => {
            const result = toDisplayUnits(50000000, 8);
            expect(result).toBe(0.5);
        });

        it('should handle different precisions', () => {
            expect(toDisplayUnits(100, 2)).toBe(1.0);
            expect(toDisplayUnits(1, 0)).toBe(1.0);
        });

        it('should handle fractional satoshis', () => {
            const result = toDisplayUnits(123456789, 8);
            expect(result).toBe(1.23456789);
        });
    });
});

describe('Configuration', () => {
    it('should use default values for optional parameters', () => {
        const config: KaleidoConfig = {
            baseUrl: 'https://api.example.com'
        };
        const client = createClient(config);
        expect(client).toBeDefined();
    });

    it('should accept all configuration parameters', () => {
        const config: KaleidoConfig = {
            baseUrl: 'https://api.example.com',
            nodeUrl: 'https://node.example.com',
            timeout: 60.0,
            maxRetries: 5,
            cacheTtl: 120
        };
        const client = createClient(config);
        expect(client).toBeDefined();
        expect(client.hasNode()).toBe(true);
    });
});

describe('Sub-Client Pattern', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        nodeUrl: 'http://localhost:3000',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Market Sub-Client', () => {
        it('should have market property', () => {
            expect(client.market).toBeDefined();
        });

        it('should access listAssets via market sub-client', async () => {
            const assets = await client.market.listAssets();
            expect(Array.isArray(assets)).toBe(true);
        });

        it('should access listPairs via market sub-client', async () => {
            const pairs = await client.market.listPairs();
            expect(Array.isArray(pairs)).toBe(true);
        });

        it.skip('should access getQuoteByPair via market sub-client', async () => {
            const quote = await client.market.getQuoteByPair('BTC/USDT', 100000);
            expect(quote).toHaveProperty('rfqId');
        });

        it.skip('should access getBestQuote via market sub-client', async () => {
            const quote = await client.market.getBestQuote('BTC/USDT', 100000);
            expect(quote).toHaveProperty('rfqId');
        });
    });

    describe('Orders Sub-Client', () => {
        it('should have orders property', () => {
            expect(client.orders).toBeDefined();
        });

        it('should have getOrderHistory method', () => {
            expect(typeof client.orders.getOrderHistory).toBe('function');
        });

        it('should have getOrderAnalytics method', () => {
            expect(typeof client.orders.getOrderAnalytics).toBe('function');
        });
    });

    describe('Swaps Sub-Client', () => {
        it('should have swaps property', () => {
            expect(client.swaps).toBeDefined();
        });

        it('should have getNodeInfo method', () => {
            expect(typeof client.swaps.getNodeInfo).toBe('function');
        });

        it('should have getSwapStatus method', () => {
            expect(typeof client.swaps.getSwapStatus).toBe('function');
        });
    });

    describe('LSP Sub-Client', () => {
        it('should have lsp property', () => {
            expect(client.lsp).toBeDefined();
        });

        it('should have getLspInfo method', () => {
            expect(typeof client.lsp.getLspInfo).toBe('function');
        });

        it('should have getLspNetworkInfo method', () => {
            expect(typeof client.lsp.getLspNetworkInfo).toBe('function');
        });
    });

    describe('Node Sub-Client', () => {
        it('should have node property when configured', () => {
            // Node is configured with nodeUrl in testConfig
            expect(client.node).toBeDefined();
            expect(client.node).not.toBeNull();
        });

        it('should return null when node not configured', () => {
            const clientNoNode = createClient({
                baseUrl: 'https://api.regtest.kaleidoswap.com'
            });
            expect(clientNoNode.node).toBeNull();
        });

        it('should have getRgbNodeInfo method when configured', () => {
            if (client.node) {
                expect(typeof client.node.getRgbNodeInfo).toBe('function');
            }
        });

        it('should have listChannels method when configured', () => {
            if (client.node) {
                expect(typeof client.node.listChannels).toBe('function');
            }
        });
    });

    describe('Backward Compatibility', () => {
        it('should support flat access pattern', async () => {
            // Ensure flat method access still works
            const assets = await client.listAssets();
            expect(Array.isArray(assets)).toBe(true);
        });

        it('should support both patterns simultaneously', async () => {
            const assetsFlat = await client.listAssets();
            const assetsSubClient = await client.market.listAssets();

            expect(Array.isArray(assetsFlat)).toBe(true);
            expect(Array.isArray(assetsSubClient)).toBe(true);
        });
    });
});

describe('Convenience Methods', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Active Filtering', () => {
        it('should have listActiveAssets method', () => {
            expect(typeof client.listActiveAssets).toBe('function');
        });

        it('should have listActivePairs method', () => {
            expect(typeof client.listActivePairs).toBe('function');
        });

        it('should list active assets with typed response', async () => {
            const assets = await client.listActiveAssets();
            expect(Array.isArray(assets)).toBe(true);
        });

        it('should list active pairs with typed response', async () => {
            const pairs = await client.listActivePairs();
            expect(Array.isArray(pairs)).toBe(true);
        });
    });

    describe('Find Methods', () => {
        it('should have findAssetByTicker method', () => {
            expect(typeof client.findAssetByTicker).toBe('function');
        });

        it('should have findPairByTicker method', () => {
            expect(typeof client.findPairByTicker).toBe('function');
        });
    });

    describe('Fee Estimation', () => {
        it('should have estimateSwapFees method', () => {
            expect(typeof client.estimateSwapFees).toBe('function');
        });
    });
});

// Integration tests (require running API)
describe.skip('Integration Tests', () => {
    const client = createClient({
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
        maxRetries: 3,
        cacheTtl: 60,
    });

    it('should list assets', async () => {
        const assets = await client.listAssets();
        expect(typeof assets).toBe('string');
        expect(assets.length).toBeGreaterThan(0);
    });

    it('should list pairs', async () => {
        const pairs = await client.listPairs();
        expect(typeof pairs).toBe('string');
        expect(pairs.length).toBeGreaterThan(0);
    });

    it('should get a quote', async () => {
        const quote = await client.getQuoteByPair('BTC/USDT', 100000);
        expect(typeof quote).toBe('string');
        if (typeof quote === 'string') {
            expect(quote.length).toBeGreaterThan(0);
        }
    });
});

// Method signature tests - verify all methods exist
describe('Client Method Signatures', () => {
    const client = createClient({
        baseUrl: 'https://api.example.com',
        nodeUrl: 'http://localhost:3000',
    });

    describe('Market Methods', () => {
        it('should have listAssets method', () => {
            expect(typeof client.listAssets).toBe('function');
        });

        it('should have listPairs method', () => {
            expect(typeof client.listPairs).toBe('function');
        });

        it('should have getQuoteByPair method', () => {
            expect(typeof client.getQuoteByPair).toBe('function');
        });
    });

    describe('Swap Methods', () => {
        it('should have getNodeInfo method', () => {
            expect(typeof client.getNodeInfo).toBe('function');
        });

        it('should have getSwapStatus method', () => {
            expect(typeof client.getSwapStatus).toBe('function');
        });

        it('should have waitForSwapCompletion method', () => {
            expect(typeof client.waitForSwapCompletion).toBe('function');
        });
    });

    describe('Order Methods', () => {
        it('should have getSwapOrderStatus method', () => {
            expect(typeof client.getSwapOrderStatus).toBe('function');
        });

        it('should have getOrderHistory method', () => {
            expect(typeof client.getOrderHistory).toBe('function');
        });

        it('should have getOrderAnalytics method', () => {
            expect(typeof client.getOrderAnalytics).toBe('function');
        });

        it('should have swapOrderRateDecision method', () => {
            expect(typeof client.swapOrderRateDecision).toBe('function');
        });
    });

    describe('LSP Methods', () => {
        it('should have getLspInfo method', () => {
            expect(typeof client.getLspInfo).toBe('function');
        });

        it('should have getLspNetworkInfo method', () => {
            expect(typeof client.getLspNetworkInfo).toBe('function');
        });

        it('should have getLspOrder method', () => {
            expect(typeof client.getLspOrder).toBe('function');
        });

        it('should have estimateLspFees method', () => {
            expect(typeof client.estimateLspFees).toBe('function');
        });
    });

    describe('RGB Node Methods', () => {
        it('should have getRgbNodeInfo method', () => {
            expect(typeof client.getRgbNodeInfo).toBe('function');
        });

        it('should have listChannels method', () => {
            expect(typeof client.listChannels).toBe('function');
        });

        it('should have listPeers method', () => {
            expect(typeof client.listPeers).toBe('function');
        });

        it('should have listNodeAssets method', () => {
            expect(typeof client.listNodeAssets).toBe('function');
        });

        it('should have getAssetBalance method', () => {
            expect(typeof client.getAssetBalance).toBe('function');
        });

        it('should have getOnchainAddress method', () => {
            expect(typeof client.getOnchainAddress).toBe('function');
        });

        it('should have getBtcBalance method', () => {
            expect(typeof client.getBtcBalance).toBe('function');
        });

        it('should have whitelistTrade method', () => {
            expect(typeof client.whitelistTrade).toBe('function');
        });

        it('should have decodeLnInvoice method', () => {
            expect(typeof client.decodeLnInvoice).toBe('function');
        });

        it('should have listPayments method', () => {
            expect(typeof client.listPayments).toBe('function');
        });
    });

    describe('Wallet Methods', () => {
        it('should have initWallet method', () => {
            expect(typeof client.initWallet).toBe('function');
        });

        it('should have unlockWallet method', () => {
            expect(typeof client.unlockWallet).toBe('function');
        });

        it('should have lockWallet method', () => {
            expect(typeof client.lockWallet).toBe('function');
        });
    });

    describe('Convenience Methods', () => {
        it('should have getAssetByTicker method', () => {
            expect(typeof client.getAssetByTicker).toBe('function');
        });

        it('should have getQuoteByAssets method', () => {
            expect(typeof client.getQuoteByAssets).toBe('function');
        });

        it('should have completeSwap method', () => {
            expect(typeof client.completeSwap).toBe('function');
        });

        it('should have getPairByTicker method', () => {
            expect(typeof client.getPairByTicker).toBe('function');
        });
    });

    describe('WebSocket Streaming Methods', () => {
        it('should have createQuoteStream method', () => {
            expect(typeof client.createQuoteStream).toBe('function');
        });
    });
});

describe('QuoteStream', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
        maxRetries: 3,
        cacheTtl: 60,
    };

    // Skip integration tests as they require a live WebSocket server
    describe.skip('Integration Tests', () => {
        it('should create a quote stream', async () => {
            const client = createClient(testConfig);
            const stream = await client.createQuoteStream('BTC/USDT');

            expect(stream).toBeDefined();
            expect(typeof stream.recv).toBe('function');
            expect(typeof stream.isConnected).toBe('function');
            expect(typeof stream.close).toBe('function');

            stream.close();
        });

        it('should receive quotes from stream', async () => {
            const client = createClient(testConfig);
            const stream = await client.createQuoteStream('BTC/USDT');

            // Wait for a quote with 5 second timeout
            const quote = await stream.recv(5.0);

            if (quote) {
                expect(typeof quote).toBe('string');
                const parsed = JSON.parse(quote);
                expect(parsed).toBeDefined();
            }

            stream.close();
        });

        it('should track connection status', async () => {
            const client = createClient(testConfig);
            const stream = await client.createQuoteStream('BTC/USDT');

            expect(stream.isConnected()).toBe(true);

            stream.close();

            expect(stream.isConnected()).toBe(false);
        });

        it('should return null on timeout', async () => {
            const client = createClient(testConfig);
            const stream = await client.createQuoteStream('NONEXISTENT/PAIR');

            // Very short timeout should return null
            const quote = await stream.recv(0.1);
            expect(quote).toBeNull();

            stream.close();
        });
    });
});

// ============================================================================
// Quote Operations Tests
// ============================================================================

describe('Quote Operations', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
        maxRetries: 3,
        cacheTtl: 60,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    it('should have getQuoteByPair method', () => {
        expect(typeof client.getQuoteByPair).toBe('function');
    });

    it('should have getQuoteByAssets method', () => {
        expect(typeof client.getQuoteByAssets).toBe('function');
    });

    describe.skip('Integration - Quote by Pair', () => {
        it('should get quote with fromAmount', async () => {
            const quote = await client.getQuoteByPair('BTC/USDT', 100000, null);
            expect(typeof quote).toBe('string');
            const parsed = JSON.parse(quote);
            expect(parsed.from_amount).toBeDefined();
            expect(parsed.to_amount).toBeDefined();
        });

        it('should get quote with toAmount', async () => {
            const quote = await client.getQuoteByPair('BTC/USDT', null, 100000);
            expect(typeof quote).toBe('string');
            const parsed = JSON.parse(quote);
            expect(parsed.from_amount).toBeDefined();
        });

        it('should get quote by assets', async () => {
            const quote = await client.getQuoteByAssets('BTC', 'USDT', 100000, null);
            expect(typeof quote).toBe('string');
        });
    });
});

// ============================================================================
// Swap Flow Tests
// ============================================================================

describe('Swap Flow Operations', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        nodeUrl: 'http://localhost:3000',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Method Signatures', () => {
        it('should have getSwapStatus method', () => {
            expect(typeof client.getSwapStatus).toBe('function');
        });

        it('should have waitForSwapCompletion method', () => {
            expect(typeof client.waitForSwapCompletion).toBe('function');
        });

        it('should have completeSwap method', () => {
            expect(typeof client.completeSwap).toBe('function');
        });

        it('should have whitelistTrade method', () => {
            expect(typeof client.whitelistTrade).toBe('function');
        });
    });

    describe.skip('Integration - Swap Status', () => {
        it('should get swap status by payment hash', async () => {
            const status = await client.getSwapStatus('test_payment_hash');
            expect(typeof status).toBe('string');
        });
    });
});

// ============================================================================
// Order Management Tests
// ============================================================================

describe('Order Management', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Method Signatures', () => {
        it('should have getSwapOrderStatus method', () => {
            expect(typeof client.getSwapOrderStatus).toBe('function');
        });

        it('should have getOrderHistory method', () => {
            expect(typeof client.getOrderHistory).toBe('function');
        });

        it('should have getOrderAnalytics method', () => {
            expect(typeof client.getOrderAnalytics).toBe('function');
        });

        it('should have swapOrderRateDecision method', () => {
            expect(typeof client.swapOrderRateDecision).toBe('function');
        });
    });

    describe.skip('Integration - Order Operations', () => {
        it('should get order history', async () => {
            const history = await client.getOrderHistory(null, 10, 0);
            expect(typeof history).toBe('string');
        });

        it('should get order analytics', async () => {
            const analytics = await client.getOrderAnalytics();
            expect(typeof analytics).toBe('string');
        });
    });
});

// ============================================================================
// LSP Operations Tests
// ============================================================================

describe('LSP Operations', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Method Signatures', () => {
        it('should have getLspInfo method', () => {
            expect(typeof client.getLspInfo).toBe('function');
        });

        it('should have getLspNetworkInfo method', () => {
            expect(typeof client.getLspNetworkInfo).toBe('function');
        });

        it('should have getLspOrder method', () => {
            expect(typeof client.getLspOrder).toBe('function');
        });

        it('should have estimateLspFees method', () => {
            expect(typeof client.estimateLspFees).toBe('function');
        });
    });

    describe.skip('Integration - LSP Info', () => {
        it('should get LSP info', async () => {
            const info = await client.getLspInfo();
            expect(typeof info).toBe('string');
            const parsed = JSON.parse(info);
            expect(parsed.lsp_connection_url).toBeDefined();
        });

        it('should get LSP network info', async () => {
            const info = await client.getLspNetworkInfo();
            expect(typeof info).toBe('string');
        });
    });
});

// ============================================================================
// Node Operations Tests
// ============================================================================

describe('Node Operations', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        nodeUrl: 'http://localhost:3000',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Method Signatures', () => {
        it('should have getRgbNodeInfo method', () => {
            expect(typeof client.getRgbNodeInfo).toBe('function');
        });

        it('should have listChannels method', () => {
            expect(typeof client.listChannels).toBe('function');
        });

        it('should have listPeers method', () => {
            expect(typeof client.listPeers).toBe('function');
        });

        it('should have listNodeAssets method', () => {
            expect(typeof client.listNodeAssets).toBe('function');
        });

        it('should have getAssetBalance method', () => {
            expect(typeof client.getAssetBalance).toBe('function');
        });

        it('should have getOnchainAddress method', () => {
            expect(typeof client.getOnchainAddress).toBe('function');
        });

        it('should have getBtcBalance method', () => {
            expect(typeof client.getBtcBalance).toBe('function');
        });

        it('should have decodeLnInvoice method', () => {
            expect(typeof client.decodeLnInvoice).toBe('function');
        });

        it('should have listPayments method', () => {
            expect(typeof client.listPayments).toBe('function');
        });
    });
});

// ============================================================================
// Helper Methods Tests
// ============================================================================

describe('Helper Methods', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Method Signatures', () => {
        it('should have getAssetByTicker method', () => {
            expect(typeof client.getAssetByTicker).toBe('function');
        });

        it('should have getPairByTicker method', () => {
            expect(typeof client.getPairByTicker).toBe('function');
        });
    });
});

// ============================================================================
// JSON Parsing Utilities Tests
// ============================================================================

describe('JSON Parsing Utilities', () => {
    it('should parse assets JSON correctly', () => {
        const { parseAssets } = require('../src');
        const json = JSON.stringify([
            { assetId: 'btc-id', ticker: 'BTC', name: 'Bitcoin', precision: 8 }
        ]);
        const assets = parseAssets(json);
        expect(Array.isArray(assets)).toBe(true);
        expect(assets[0].ticker).toBe('BTC');
    });

    it('should parse pairs JSON correctly', () => {
        const { parsePairs } = require('../src');
        const json = JSON.stringify([
            { baseAsset: 'BTC', quoteAsset: 'USDT', isActive: true }
        ]);
        const pairs = parsePairs(json);
        expect(Array.isArray(pairs)).toBe(true);
        expect(pairs[0].baseAsset).toBe('BTC');
    });

    it('should parse quote JSON correctly', () => {
        const { parseQuote } = require('../src');
        const json = JSON.stringify({
            rfqId: 'test-id',
            fromAsset: 'BTC',
            toAsset: 'USDT',
            fromAmount: 100000
        });
        const quote = parseQuote(json);
        expect(quote.rfqId).toBe('test-id');
    });

    it('should parse single asset JSON correctly', () => {
        const { parseAsset } = require('../src');
        const json = JSON.stringify({
            assetId: 'btc-id',
            ticker: 'BTC',
            precision: 8
        });
        const asset = parseAsset(json);
        expect(asset.ticker).toBe('BTC');
    });
});

// ============================================================================
// Wallet Operations Tests
// ============================================================================

describe('Wallet Operations', () => {
    const testConfig: KaleidoConfig = {
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        nodeUrl: 'http://localhost:3000',
        timeout: 30.0,
    };

    let client: any;

    beforeEach(() => {
        client = createClient(testConfig);
    });

    describe('Method Signatures', () => {
        it('should have initWallet method', () => {
            expect(typeof client.initWallet).toBe('function');
        });

        it('should have unlockWallet method', () => {
            expect(typeof client.unlockWallet).toBe('function');
        });

        it('should have lockWallet method', () => {
            expect(typeof client.lockWallet).toBe('function');
        });
    });
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe('Error Handling', () => {
    it('should handle missing baseUrl gracefully', () => {
        const client = createClient({ baseUrl: '' });
        expect(client).toBeDefined();
    });

    it('should create client without node URL', () => {
        const client = createClient({
            baseUrl: 'https://api.example.com'
        });
        expect(client).toBeDefined();
        expect(client.hasNode()).toBe(false);
    });

    it('should create client with node URL', () => {
        const client = createClient({
            baseUrl: 'https://api.example.com',
            nodeUrl: 'http://localhost:3000'
        });
        expect(client).toBeDefined();
        expect(client.hasNode()).toBe(true);
    });

    describe('Node Configuration Check', () => {
        it('hasNode should return true when node URL is set', () => {
            const client = createClient({
                baseUrl: 'https://api.example.com',
                nodeUrl: 'http://localhost:3000'
            });
            expect(client.hasNode()).toBe(true);
        });

        it('hasNode should return false when node URL is not set', () => {
            const client = createClient({
                baseUrl: 'https://api.example.com'
            });
            expect(client.hasNode()).toBe(false);
        });
    });
});
