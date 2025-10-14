"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWebSocketTest = exports.testWhiteListTrade = exports.assetListResponse = exports.getPairAssetIds = exports.createTestOrder = exports.getTestTradingPair = exports.getTestRgbAsset = exports.createTestClient = exports.testOnchainConfig = exports.testConfig = void 0;
const client_1 = require("./client");
exports.testConfig = {
    nodeUrl: process.env.TEST_NODE_URL || 'http://localhost:3001',
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1/',
    apiKey: process.env.TEST_API_KEY || '',
    get wsUrl() {
        if (process.env.TEST_WS_URL) {
            return process.env.TEST_WS_URL;
        }
        const url = new URL(this.baseUrl);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        url.pathname = '/api/v1/market/ws/testclient';
        return url.toString();
    }
};
// Add onchain test config
exports.testOnchainConfig = {
    ...exports.testConfig,
    // Override baseUrl for onchain API if needed
    baseUrl: process.env.TEST_ONCHAIN_BASE_URL || 'http://localhost:8000/',
};
const createTestClient = (isOnchain = false) => {
    const config = isOnchain ? exports.testOnchainConfig : exports.testConfig;
    const client = new client_1.KaleidoClient({
        nodeUrl: config.nodeUrl,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        wsUrl: config.wsUrl
    });
    if (process.env.DEBUG_WS) {
        console.log('Created test client with WebSocket URL:', config.wsUrl);
    }
    return client;
};
exports.createTestClient = createTestClient;
// Helper function to get test RGB asset
const getTestRgbAsset = async (client) => {
    const assets = await client.onchainListAssets();
    const rgbAsset = assets.find(a => a.asset_id && a.asset_id.startsWith('rgb'));
    if (!rgbAsset) {
        throw new Error('No RGB asset found for testing');
    }
    return rgbAsset;
};
exports.getTestRgbAsset = getTestRgbAsset;
// Helper function to get test BTC/RGB trading pair
const getTestTradingPair = async (client) => {
    const pairs = await client.onchainListTradingPairs();
    const btcRgbPair = pairs.find(p => (p.base_asset === 'BTC' && p.quote_asset.startsWith('RGB')) ||
        (p.quote_asset === 'BTC' && p.base_asset.startsWith('RGB')));
    if (!btcRgbPair) {
        throw new Error('No BTC/RGB trading pair found for testing');
    }
    return btcRgbPair;
};
exports.getTestTradingPair = getTestTradingPair;
// Helper function to create a test order
const createTestOrder = async (client) => {
    const order = {
        from_asset_type: 'btc',
        from_amount: 0.001,
        to_asset_type: 'rgb'
    };
    return await client.onchainCreateOrder(order);
};
exports.createTestOrder = createTestOrder;
const getPairAssetIds = async (client) => {
    const response = await client.listPairs();
    const pairs = response.pairs;
    if (pairs && pairs.length > 0) {
        const pair = pairs[0];
        return {
            baseAssetId: pair.base_asset_id,
            quoteAssetId: pair.quote_asset_id
        };
    }
    throw new Error("No pair was found.");
};
exports.getPairAssetIds = getPairAssetIds;
const assetListResponse = async (client) => {
    try {
        const assetsResponse = await client.listAssets();
        const assetsList = assetsResponse.assets || [];
        // Find USDT asset_id
        const toAssetObj = assetsList.find(a => a.ticker === "USDT");
        const toAsset = toAssetObj?.asset_id;
        // Hardcode BTC as fromAsset (by ticker, not asset_id)
        const fromAsset = "BTC";
        const fromAmount = 10000000; // 0.1 BTC in satoshis
        if (!toAsset) {
            throw new Error('Required asset (USDT) for testing not found');
        }
        return { fromAsset, toAsset, fromAmount };
    }
    catch (error) {
        console.error('Error in assetListResponse:', error);
        throw error;
    }
};
exports.assetListResponse = assetListResponse;
const testWhiteListTrade = async (client, maxRetries = 3, retryDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} to initialize swap...`);
            // Get assets and quote
            const assetsResponse = await (0, exports.assetListResponse)(client);
            const quote = await client.getQuoteWS(assetsResponse.fromAsset, assetsResponse.toAsset, assetsResponse.fromAmount);
            console.log('Got quote, initializing swap...');
            // Initialize the swap
            const initResult = await client.initMakerSwap(quote.rfq_id, quote.from_asset, quote.to_asset, quote.from_amount, quote.to_amount); // the response type only has SwapResponse...
            if (!initResult.swapstring) {
                throw new Error('No swapstring returned from initMakerSwap');
            }
            console.log('Swap initialized, whitelisting trade...');
            // Whitelist the trade
            await client.whitelistTrade(initResult.swapstring);
            return initResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check if we should retry
            const isRetryable = errorMessage.includes('Not enough liquidity') ||
                errorMessage.includes('400') ||
                errorMessage.includes('Bad Request');
            if (!isRetryable || attempt >= maxRetries) {
                console.error(`Failed to initialize swap (attempt ${attempt}/${maxRetries}):`, errorMessage);
                throw error;
            }
            console.warn(`Retryable error (${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    return null;
};
exports.testWhiteListTrade = testWhiteListTrade;
const withWebSocketTest = async (testFn, timeout = 30000) => {
    const client = (0, exports.createTestClient)();
    try {
        await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('WebSocket test timed out'));
            }, timeout);
            testFn(client)
                .then(() => {
                clearTimeout(timer);
                resolve();
            })
                .catch(reject);
        });
    }
    finally {
        // Clean up WebSocket connection
        if (client.wsClient) {
            await client.wsClient.disconnect();
        }
    }
};
exports.withWebSocketTest = withWebSocketTest;
//# sourceMappingURL=testUtils.js.map