"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testUtils_1 = require("../testUtils");
const client_1 = require("../http/client");
jest.setTimeout(30000);
describe('KaleidoClient Onchain Operations', () => {
    let client;
    let serverError = null;
    beforeEach(async () => {
        // Reset state for each test
        client = (0, testUtils_1.createTestClient)(true);
        serverError = null;
        console.log('Running test with base URL:', client['apiClient']['baseUrl']);
        // Check if server is available
        try {
            const healthClient = new client_1.HttpClient({
                baseUrl: 'http://localhost:8000'
            });
            await healthClient.get('/health');
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('fetch failed')) {
                serverError = 'Server is not running';
            }
            else {
                serverError = error instanceof Error ? error.message : String(error);
            }
            console.warn('Server is not available. Test will be skipped. Make sure the server is running at http://localhost:8000');
            console.warn('Error:', serverError);
        }
    });
    const conditionalTest = (name, fn) => {
        if (serverError) {
            test.skip(`${name} (${serverError})`, fn);
        }
        else {
            test(name, fn);
        }
    };
    describe('asset operations', () => {
        conditionalTest('should list onchain assets', async () => {
            const assets = await client.onchainListAssets();
            expect(Array.isArray(assets)).toBe(true);
            if (assets.length > 0) {
                expect(assets[0]).toHaveProperty('asset_id');
                expect(assets[0]).toHaveProperty('name');
                expect(assets[0]).toHaveProperty('ticker');
                expect(assets[0]).toHaveProperty('precision');
            }
        });
        conditionalTest('should get specific onchain asset', async () => {
            const assets = await client.onchainListAssets();
            if (assets.length > 0) {
                const asset = await client.onchainGetAsset(assets[0].asset_id);
                expect(asset).toHaveProperty('asset_id');
                expect(asset).toHaveProperty('name');
                expect(asset).toHaveProperty('ticker');
                expect(asset).toHaveProperty('precision');
            }
            else {
                console.warn('Test skipped: No assets available');
            }
        });
        conditionalTest('should list supported assets', async () => {
            const assets = await client.onchainListSupportedAssets();
            expect(Array.isArray(assets)).toBe(true);
        });
        conditionalTest('should get asset balance', async () => {
            const assets = await client.onchainListAssets();
            if (assets.length > 0) {
                const balance = await client.onchainGetAssetBalance(assets[0].asset_id);
                expect(balance).toHaveProperty('balance');
                expect(typeof balance.balance).toBe('number');
            }
            else {
                console.warn('Test skipped: No assets available');
            }
        });
    });
    describe('trading pair operations', () => {
        conditionalTest('should list trading pairs', async () => {
            const pairs = await client.onchainListTradingPairs();
            expect(Array.isArray(pairs)).toBe(true);
            if (pairs.length > 0) {
                expect(pairs[0]).toHaveProperty('pair_id');
                expect(pairs[0]).toHaveProperty('base_asset');
                expect(pairs[0]).toHaveProperty('quote_asset');
            }
        });
        conditionalTest('should get trading pair tickers', async () => {
            const tickers = await client.onchainGetPairTickers();
            expect(Array.isArray(tickers)).toBe(true);
        });
        conditionalTest('should get specific trading pair', async () => {
            const pairs = await client.onchainListTradingPairs();
            if (pairs.length > 0) {
                const pair = await client.onchainGetTradingPair(pairs[0].pair_id);
                expect(pair).toHaveProperty('pair_id');
                expect(pair).toHaveProperty('base_asset');
                expect(pair).toHaveProperty('quote_asset');
            }
            else {
                console.warn('Test skipped: No trading pairs available');
            }
        });
        conditionalTest('should get trading pair by assets', async () => {
            const pairs = await client.onchainListTradingPairs();
            if (pairs.length > 0) {
                const pair = await client.onchainGetTradingPairByAssets(pairs[0].base_asset, pairs[0].quote_asset);
                expect(pair).toHaveProperty('pair_id');
                expect(pair.base_asset).toBe(pairs[0].base_asset);
                expect(pair.quote_asset).toBe(pairs[0].quote_asset);
            }
            else {
                console.warn('Test skipped: No trading pairs available');
            }
        });
    });
    describe('wallet operations', () => {
        conditionalTest('should get wallet status', async () => {
            const status = await client.onchainGetWalletStatus();
            expect(status).toHaveProperty('is_online');
            expect(status).toHaveProperty('btc_balance');
            expect(status).toHaveProperty('btc_spendable');
        });
        conditionalTest('should get wallet balances', async () => {
            const balances = await client.onchainGetWalletBalances();
            expect(balances).toHaveProperty('btc_balance');
            expect(balances).toHaveProperty('btc_spendable');
            expect(balances).toHaveProperty('rgb_balances');
            expect(Array.isArray(balances.rgb_balances)).toBe(true);
        });
        conditionalTest('should sync wallet', async () => {
            const result = await client.onchainSyncWallet();
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('message');
        });
        conditionalTest('should get new address', async () => {
            const address = await client.onchainGetNewAddress();
            expect(address).toBeDefined();
        });
    });
    describe('quote operations', () => {
        conditionalTest('should get market prices', async () => {
            const prices = await client.onchainGetMarketPrices();
            expect(Array.isArray(prices)).toBe(true);
            if (prices.length > 0) {
                expect(prices[0]).toHaveProperty('pair');
                expect(prices[0]).toHaveProperty('price');
            }
        });
        conditionalTest('should get quotes health', async () => {
            const health = await client.onchainGetQuotesHealth();
            expect(health).toBeDefined();
        });
        conditionalTest('should refresh prices', async () => {
            const result = await client.onchainRefreshPrices();
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('message');
        });
        conditionalTest('should estimate fees', async () => {
            const fees = await client.onchainEstimateFees('btc', 'rgb', 0.001);
            expect(fees).toHaveProperty('service_fee');
            expect(fees).toHaveProperty('network_fee');
            expect(fees).toHaveProperty('total_fee');
        });
    });
    describe('order operations', () => {
        const createTestOrder = async () => {
            const order = {
                from_asset_type: 'btc',
                from_amount: 0.001,
                to_asset_type: 'rgb'
            };
            const result = await client.onchainCreateOrder(order);
            return result.order_id;
        };
        conditionalTest('should create order', async () => {
            const order = {
                from_asset_type: 'btc',
                from_amount: 0.001,
                to_asset_type: 'rgb'
            };
            const result = await client.onchainCreateOrder(order);
            expect(result).toHaveProperty('order_id');
        });
        conditionalTest('should get order', async () => {
            const orderId = await createTestOrder();
            const order = await client.onchainGetOrder(orderId);
            expect(order).toHaveProperty('order_id');
            expect(order.order_id).toBe(orderId);
        });
        conditionalTest('should update order payment', async () => {
            const orderId = await createTestOrder();
            const update = {
                payout_address: 'bc1qtest'
            };
            const result = await client.onchainUpdateOrderPayment(orderId, update);
            expect(result).toHaveProperty('order_id');
            expect(result.order_id).toBe(orderId);
        });
        conditionalTest('should get orders by status', async () => {
            const orders = await client.onchainGetOrdersByStatus('pending');
            expect(Array.isArray(orders)).toBe(true);
        });
        conditionalTest('should get expired orders', async () => {
            const orders = await client.onchainGetExpiredOrders();
            expect(Array.isArray(orders)).toBe(true);
        });
        conditionalTest('should get order statistics', async () => {
            const stats = await client.onchainGetOrderStatistics();
            expect(stats).toBeDefined();
        });
        conditionalTest('should cancel order', async () => {
            const orderId = await createTestOrder();
            const result = await client.onchainCancelOrder(orderId);
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('message');
        });
    });
});
//# sourceMappingURL=client.onchain.test.js.map