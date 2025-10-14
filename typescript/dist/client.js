"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KaleidoClient = void 0;
const client_1 = require("./http/client");
const client_2 = require("./websocket/client");
const ws_1 = __importDefault(require("ws"));
const index_1 = require("./index");
class KaleidoClient {
    constructor(config) {
        const { nodeUrl, wsUrl, ...apiConfig } = config;
        this.apiClient = new client_1.HttpClient(apiConfig);
        this.nodeClient = new client_1.HttpClient({
            ...apiConfig,
            baseUrl: nodeUrl
        });
        // Determine WebSocket URL
        let wsBaseUrl;
        if (wsUrl) {
            wsBaseUrl = wsUrl;
        }
        else {
            // Convert http:// or https:// to ws:// or wss://
            const url = new URL(apiConfig.baseUrl);
            url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            wsBaseUrl = url.toString();
        }
        this.wsClient = new client_2.WebSocketClient({
            ...apiConfig,
            baseUrl: wsBaseUrl
        });
        if (process.env.DEBUG_WS) {
            console.log('Initialized WebSocket client with URL:', wsBaseUrl);
        }
    }
    async getLspInfo() {
        try {
            return await this.apiClient.get('/lsps1/get_info');
        }
        catch (error) {
            throw new Error(`Failed to get LSP info: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getLspConnectionUrl() {
        const lspInfo = await this.getLspInfo();
        return lspInfo?.lsp_connection_url;
    }
    async getLspNetworkInfo() {
        try {
            return await this.apiClient.get('/lsps1/network_info');
        }
        catch (error) {
            throw new Error(`Failed to get LSP network info: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async createOrder(order) {
        try {
            return await this.apiClient.post('/lsps1/create_order', order);
        }
        catch (error) {
            throw new Error(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getOrder(orderId) {
        try {
            return await this.apiClient.post('/lsps1/get_order', { order_id: orderId });
        }
        catch (error) {
            throw new Error(`Failed to get order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async connectPeer(connectionUrl) {
        try {
            return await this.nodeClient.post('/connectpeer', { peer_pubkey_and_addr: connectionUrl });
        }
        catch (error) {
            throw new Error(`Failed to connect peer: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listPeers() {
        try {
            return await this.nodeClient.get('/listpeers');
        }
        catch (error) {
            throw new Error(`Failed to list peers: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getOnchainAddress() {
        try {
            return await this.nodeClient.post('/address', {});
        }
        catch (error) {
            throw new Error(`Failed to get onchain address: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getAssetMetadata(assetId) {
        try {
            return await this.nodeClient.post('/assetmetadata', { asset_id: assetId });
        }
        catch (error) {
            throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getNodeInfo() {
        try {
            return await this.nodeClient.get('/nodeinfo');
        }
        catch (error) {
            throw new index_1.NodeError(`Failed to get node info: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getNodePubkey() {
        const info = await this.getNodeInfo();
        return info.pubkey;
    }
    async listAssets() {
        try {
            return await this.apiClient.get('/market/assets');
        }
        catch (error) {
            throw new index_1.AssetError(`Failed to list assets: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listPairs() {
        try {
            return await this.apiClient.get('/market/pairs');
        }
        catch (error) {
            throw new index_1.PairError(`Failed to list pairs: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getPairByAssets(baseAsset, quoteAsset) {
        try {
            const response = await this.listPairs();
            const pairs = response.pairs;
            for (const pair of pairs) {
                if (pair.base_asset_id === baseAsset && pair.quote_asset_id === quoteAsset) {
                    return pair;
                }
                if (pair.quote_asset_id === baseAsset && pair.base_asset_id === quoteAsset) {
                    return pair;
                }
            }
            return null;
        }
        catch (error) {
            throw new index_1.PairError(`Failed to get trading pair: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getQuote(fromAsset, toAsset, fromAmount) {
        try {
            return await this.apiClient.post('/market/quote', {
                from_asset: fromAsset,
                to_asset: toAsset,
                from_amount: fromAmount
            });
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to get quote: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getQuoteWS(fromAsset, toAsset, fromAmount) {
        if (this.wsClient.getConnectionState() !== ws_1.default.OPEN) {
            await this.wsClient.connect();
        }
        return new Promise((resolve, reject) => {
            let timeoutId;
            const quoteMessage = {
                action: 'quote_request',
                from_asset: fromAsset,
                to_asset: toAsset,
                from_amount: fromAmount,
                timestamp: Math.floor(Date.now() / 1000)
            };
            console.log('Sending quote message:', quoteMessage);
            timeoutId = setTimeout(() => {
                this.wsClient.off('quote_response', quoteHandler);
                reject(new index_1.TimeoutError('Quote request timed out'));
            }, 30000);
            const quoteHandler = (response) => {
                console.log('quoteHandler received:', response);
                clearTimeout(timeoutId);
                this.wsClient.off('quote_response', quoteHandler);
                if (response.error) {
                    reject(new index_1.QuoteError(response.error.message || 'Failed to get quote'));
                }
                else if (response.data) {
                    resolve(response.data);
                }
                else {
                    resolve(response);
                }
            };
            this.wsClient.on('quote_response', quoteHandler);
            this.wsClient.send(quoteMessage).catch((error) => {
                clearTimeout(timeoutId);
                this.wsClient.off('quote_response', quoteHandler);
                reject(new index_1.WebSocketError(`Failed to send quote request: ${error.message}`));
            });
        });
    }
    async initMakerSwap(rfqId, fromAsset, toAsset, fromAmount, toAmount) {
        try {
            return await this.apiClient.post('/swaps/init', {
                rfq_id: rfqId,
                from_asset: fromAsset,
                to_asset: toAsset,
                from_amount: fromAmount,
                to_amount: toAmount,
            });
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to initialize maker swap: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeMakerSwap(request) {
        try {
            console.log('Executing maker swap with request:', JSON.stringify({
                swapstring: request.swapstring ? `${request.swapstring.substring(0, 20)}...` : 'undefined',
                payment_hash: request.payment_hash,
                taker_pubkey: request.taker_pubkey
            }, null, 2));
            const response = await this.apiClient.post('/swaps/execute', {
                swapstring: request.swapstring,
                payment_hash: request.payment_hash,
                taker_pubkey: request.taker_pubkey
            });
            console.log('Maker swap executed successfully:', response);
            return response;
        }
        catch (error) {
            console.error('Error executing maker swap:', error);
            throw new index_1.SwapError(`Failed to execute maker swap: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async whitelistTrade(swapstring) {
        try {
            return await this.nodeClient.post('/taker', {
                swapstring,
            });
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to whitelist trade: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getSwapStatus(paymentHash) {
        try {
            return await this.nodeClient.post(`/swaps/status`, {
                payment_hash: paymentHash
            });
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to get swap status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Waits for a swap to reach a terminal state (Succeeded, Failed, or Expired)
     * @param paymentHash - The payment hash of the swap to monitor
     * @param timeoutSeconds - Maximum time to wait in seconds (default: 300)
     * @param pollIntervalSeconds - Time between status checks in seconds (default: 5)
     * @returns Promise that resolves with the final swap status
     * @throws {TimeoutError} If the swap doesn't complete within the timeout
     * @throws {SwapError} If there's an error checking the swap status
     */
    async waitForSwapCompletion(paymentHash, timeoutSeconds = 300, pollIntervalSeconds = 5) {
        const startTime = Date.now();
        const timeoutMs = timeoutSeconds * 1000;
        const pollIntervalMs = pollIntervalSeconds * 1000;
        while (true) {
            const swap = await this.getSwapStatus(paymentHash);
            // Check if swap has reached a terminal state
            if (swap.status && ['Succeeded', 'Failed', 'Expired'].includes(swap.status)) {
                return swap;
            }
            // Check if we've exceeded the timeout
            if (Date.now() - startTime >= timeoutMs) {
                throw new index_1.TimeoutError(`Swap ${paymentHash} did not complete within ${timeoutSeconds} seconds`);
            }
            // Wait before polling again
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }
    }
    // Onchain Asset Methods
    async onchainListAssets() {
        try {
            return await this.apiClient.get('/api/v1/assets/list');
        }
        catch (error) {
            throw new index_1.AssetError(`Failed to list onchain assets: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetAsset(assetId) {
        try {
            return await this.apiClient.get(`/api/v1/assets/${assetId}`);
        }
        catch (error) {
            throw new index_1.AssetError(`Failed to get onchain asset: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainListSupportedAssets() {
        try {
            return await this.apiClient.get('/api/v1/assets/supported/list');
        }
        catch (error) {
            throw new index_1.AssetError(`Failed to list supported onchain assets: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetAssetBalance(assetId) {
        try {
            return await this.apiClient.get(`/api/v1/assets/balance/${assetId}`);
        }
        catch (error) {
            throw new index_1.AssetError(`Failed to get onchain asset balance: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Onchain Trading Pair Methods
    async onchainListTradingPairs() {
        try {
            return await this.apiClient.get('/api/v1/pairs/');
        }
        catch (error) {
            throw new index_1.PairError(`Failed to list onchain trading pairs: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainCreateTradingPair(pair) {
        try {
            return await this.apiClient.post('/api/v1/pairs/', pair);
        }
        catch (error) {
            throw new index_1.PairError(`Failed to create onchain trading pair: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetPairTickers() {
        try {
            return await this.apiClient.get('/api/v1/pairs/tickers');
        }
        catch (error) {
            throw new index_1.PairError(`Failed to get onchain pair tickers: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetTradingPair(pairId) {
        try {
            return await this.apiClient.get(`/api/v1/pairs/${pairId}`);
        }
        catch (error) {
            throw new index_1.PairError(`Failed to get onchain trading pair: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetTradingPairByAssets(baseAsset, quoteAsset) {
        try {
            return await this.apiClient.get(`/api/v1/pairs/by-assets/${baseAsset}/${quoteAsset}`);
        }
        catch (error) {
            throw new index_1.PairError(`Failed to get onchain trading pair by assets: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Order Methods
    async onchainCreateOrder(order) {
        try {
            return await this.apiClient.post('/api/v1/orders/create', order);
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to create onchain order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetOrder(orderId) {
        try {
            return await this.apiClient.get(`/api/v1/orders/${orderId}`);
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to get onchain order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainUpdateOrderPayment(orderId, payment) {
        try {
            return await this.apiClient.post(`/api/v1/orders/${orderId}/payment`, payment);
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to update onchain order payment: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainCancelOrder(orderId) {
        try {
            return await this.apiClient.post(`/api/v1/orders/${orderId}/cancel`, {});
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to cancel onchain order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetOrdersByStatus(status) {
        try {
            return await this.apiClient.get(`/api/v1/orders/status/${status}`);
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to get onchain orders by status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetExpiredOrders() {
        try {
            return await this.apiClient.get('/api/v1/orders/expired/list');
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to get expired onchain orders: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetOrderStatistics() {
        try {
            return await this.apiClient.get('/api/v1/orders/statistics/summary');
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to get onchain order statistics: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Wallet Methods
    async onchainGetWalletStatus() {
        try {
            return await this.apiClient.get('/api/v1/wallet/status');
        }
        catch (error) {
            throw new Error(`Failed to get wallet status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetWalletBalances() {
        try {
            return await this.apiClient.get('/api/v1/wallet/balances');
        }
        catch (error) {
            throw new Error(`Failed to get wallet balances: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainSyncWallet() {
        try {
            return await this.apiClient.post('/api/v1/wallet/sync', {});
        }
        catch (error) {
            throw new Error(`Failed to sync wallet: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainCreateAllocations(numAllocations = 5) {
        try {
            return await this.apiClient.post(`/api/v1/wallet/allocations/create?num_allocations=${numAllocations}`, {});
        }
        catch (error) {
            throw new Error(`Failed to create allocations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetNewAddress() {
        try {
            return await this.apiClient.get('/api/v1/wallet/address/new');
        }
        catch (error) {
            throw new Error(`Failed to get new address: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGenerateRgbInvoice(assetId, amount) {
        try {
            const queryParams = amount !== undefined ? `?asset_id=${assetId}&amount=${amount}` : `?asset_id=${assetId}`;
            return await this.apiClient.post(`/api/v1/wallet/invoice/rgb${queryParams}`, {});
        }
        catch (error) {
            throw new Error(`Failed to generate RGB invoice: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetBtcTransactions(limit = 50) {
        try {
            return await this.apiClient.get(`/api/v1/wallet/transactions/btc?limit=${limit}`);
        }
        catch (error) {
            throw new Error(`Failed to get BTC transactions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainValidateBitcoinAddress(address) {
        try {
            return await this.apiClient.post(`/api/v1/wallet/validate/address?address=${address}`, {});
        }
        catch (error) {
            throw new Error(`Failed to validate Bitcoin address: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainValidateRgbInvoice(invoice) {
        try {
            return await this.apiClient.post(`/api/v1/wallet/validate/rgb-invoice?invoice=${invoice}`, {});
        }
        catch (error) {
            throw new Error(`Failed to validate RGB invoice: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Quote Methods
    async onchainGetQuote(fromAssetType, toAssetType, fromAmount, fromAssetId, toAssetId) {
        try {
            let queryParams = `?from_asset_type=${fromAssetType}&to_asset_type=${toAssetType}&from_amount=${fromAmount}`;
            if (fromAssetId)
                queryParams += `&from_asset_id=${fromAssetId}`;
            if (toAssetId)
                queryParams += `&to_asset_id=${toAssetId}`;
            return await this.apiClient.post(`/api/v1/quotes/get${queryParams}`, {});
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to get quote: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetMarketPrices() {
        try {
            return await this.apiClient.get('/api/v1/quotes/prices');
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to get market prices: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetPairPrice(pair) {
        try {
            return await this.apiClient.get(`/api/v1/quotes/price/${pair}`);
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to get pair price: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainEstimateFees(fromAssetType, toAssetType, fromAmount) {
        try {
            return await this.apiClient.get(`/api/v1/quotes/fees/estimate?from_asset_type=${fromAssetType}&to_asset_type=${toAssetType}&from_amount=${fromAmount}`);
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to estimate fees: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainGetQuotesHealth() {
        try {
            return await this.apiClient.get('/api/v1/quotes/health');
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to get quotes health: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onchainRefreshPrices() {
        try {
            return await this.apiClient.post('/api/v1/quotes/refresh', {});
        }
        catch (error) {
            throw new index_1.QuoteError(`Failed to refresh prices: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Swaps Operations
    async getSwapOrderStatus(orderId) {
        try {
            return await this.apiClient.post('/swaps/orders_status', { order_id: orderId });
        }
        catch (error) {
            throw new index_1.SwapError(`Failed to get swap order status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.KaleidoClient = KaleidoClient;
