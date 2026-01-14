/**
 * Sub-client interfaces and implementations for organized API access
 */

import {
    Asset,
    TradingPair,
    Quote,
    NodeInfo,
} from './index';

/**
 * Market API client for assets, pairs, and quotes operations.
 */
export interface IMarketClient {
    /** List all available assets */
    listAssets(): Promise<Asset[]>;

    /** List all available trading pairs */
    listPairs(): Promise<TradingPair[]>;

    /** Get a quote for a trading pair by ticker */
    getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<Quote>;

    /** Get the best quote for an asset */
    getBestQuote(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<Quote>;

    /** List only active assets */
    listActiveAssets(): Promise<Asset[]>;

    /** List only active trading pairs */
    listActivePairs(): Promise<TradingPair[]>;

    /** Get an asset by its ticker */
    getAssetByTicker(ticker: string): Promise<Asset>;

    /** Get a trading pair by ticker */
    getPairByTicker(ticker: string): Promise<TradingPair>;

    /** Get a quote by asset tickers */
    getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null, fromLayer?: string, toLayer?: string): Promise<Quote>;
}

/**
 * Orders API client for order management operations.
 */
export interface IOrdersClient {
    /** Get swap order status */
    getSwapOrderStatus(orderId: string): Promise<any>;

    /** Get order history */
    getOrderHistory(status?: string | null, limit?: number, skip?: number): Promise<any>;

    /** Get order analytics/stats */
    getOrderAnalytics(): Promise<any>;
}

/**
 * Swaps API client for swap operations.
 */
export interface ISwapsClient {
    /** Get swap node information */
    getNodeInfo(): Promise<NodeInfo>;

    /** Get swap status */
    getSwapStatus(paymentHash: string): Promise<any>;

    /** Wait for swap completion */
    waitForSwapCompletion(paymentHash: string, timeoutSecs: number, pollIntervalSecs: number): Promise<any>;
}

/**
 * LSP API client for Lightning Service Provider operations.
 */
export interface ILspClient {
    /** Get LSP information */
    getLspInfo(): Promise<any>;

    /** Get LSP network information */
    getLspNetworkInfo(): Promise<NodeInfo>;

    /** Get LSP order */
    getLspOrder(orderId: string): Promise<any>;

    /** Estimate LSP fees */
    estimateLspFees(channelSize: number): Promise<string>;
}

/**
 * RGB Node API client for node operations.
 */
export interface INodeClient {
    /** Get RGB node information */
    getRgbNodeInfo(): Promise<NodeInfo>;

    /** List channels */
    listChannels(): Promise<any[]>;

    /** List peers */
    listPeers(): Promise<any[]>;

    /** List node assets */
    listNodeAssets(): Promise<Asset[]>;

    /** Get asset balance */
    getAssetBalance(assetId: string): Promise<any>;

    /** Get onchain address */
    getOnchainAddress(): Promise<any>;

    /** Get BTC balance */
    getBtcBalance(): Promise<any>;

    /** Decode Lightning invoice */
    decodeLnInvoice(invoice: string): Promise<any>;

    /** List payments */
    listPayments(): Promise<any[]>;

    /** Initialize wallet */
    initWallet(password: string): Promise<string>;

    /** Unlock wallet */
    unlockWallet(password: string): Promise<string>;

    /** Lock wallet */
    lockWallet(): Promise<string>;
}

// ============================================================================
// Class Implementations
// ============================================================================

export class MarketClient implements IMarketClient {
    constructor(private inner: any, private parse: <T>(json: string) => T) { }

    async listAssets(): Promise<Asset[]> {
        const json = await this.inner.listAssets();
        return this.parse<Asset[]>(json);
    }

    async listPairs(): Promise<TradingPair[]> {
        const json = await this.inner.listPairs();
        return this.parse<TradingPair[]>(json);
    }

    async getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<Quote> {
        const json = await this.inner.getQuoteByPair(ticker, fromAmount, toAmount);
        return this.parse<Quote>(json);
    }

    async getBestQuote(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<Quote> {
        const json = await this.inner.getBestQuote(ticker, fromAmount, toAmount);
        return this.parse<Quote>(json);
    }

    async listActiveAssets(): Promise<Asset[]> {
        const json = await this.inner.listActiveAssets();
        return this.parse<Asset[]>(json);
    }

    async listActivePairs(): Promise<TradingPair[]> {
        const json = await this.inner.listActivePairs();
        return this.parse<TradingPair[]>(json);
    }

    async getAssetByTicker(ticker: string): Promise<Asset> {
        const json = await this.inner.getAssetByTicker(ticker);
        return this.parse<Asset>(json);
    }

    async getPairByTicker(ticker: string): Promise<TradingPair> {
        const json = await this.inner.getPairByTicker(ticker);
        return this.parse<TradingPair>(json);
    }

    async getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null, fromLayer?: string, toLayer?: string): Promise<Quote> {
        const json = await this.inner.getQuoteByAssets(fromTicker, toTicker, fromAmount, toAmount, fromLayer || 'BTC_LN', toLayer || 'RGB_L1');
        return this.parse<Quote>(json);
    }
}

export class OrdersClient implements IOrdersClient {
    constructor(private inner: any, private parse: <T>(json: string) => T) { }

    async getSwapOrderStatus(orderId: string): Promise<any> {
        const json = await this.inner.getSwapOrderStatus(orderId);
        return this.parse<any>(json);
    }

    async getOrderHistory(status?: string | null, limit: number = 10, skip: number = 0): Promise<any> {
        const json = await this.inner.getOrderHistory(status, limit, skip);
        return this.parse<any>(json);
    }

    async getOrderAnalytics(): Promise<any> {
        const json = await this.inner.getOrderAnalytics();
        return this.parse<any>(json);
    }
}

export class SwapsClient implements ISwapsClient {
    constructor(private inner: any, private parse: <T>(json: string) => T) { }

    async getNodeInfo(): Promise<NodeInfo> {
        const json = await this.inner.getNodeInfo();
        return this.parse<NodeInfo>(json);
    }

    async getSwapStatus(paymentHash: string): Promise<any> {
        const json = await this.inner.getSwapStatus(paymentHash);
        return this.parse<any>(json);
    }

    async waitForSwapCompletion(paymentHash: string, timeoutSecs: number, pollIntervalSecs: number): Promise<any> {
        const json = await this.inner.waitForSwapCompletion(paymentHash, timeoutSecs, pollIntervalSecs);
        return this.parse<any>(json);
    }
}

export class LspClient implements ILspClient {
    constructor(private inner: any, private parse: <T>(json: string) => T) { }

    async getLspInfo(): Promise<any> {
        const json = await this.inner.getLspInfo();
        return this.parse<any>(json);
    }

    async getLspNetworkInfo(): Promise<NodeInfo> {
        const json = await this.inner.getLspNetworkInfo();
        return this.parse<NodeInfo>(json);
    }

    async getLspOrder(orderId: string): Promise<any> {
        const json = await this.inner.getLspOrder(orderId);
        return this.parse<any>(json);
    }

    async estimateLspFees(channelSize: number): Promise<string> {
        return await this.inner.estimateLspFees(channelSize);
    }
}

export class NodeClient implements INodeClient {
    constructor(private inner: any, private parse: <T>(json: string) => T) { }

    async getRgbNodeInfo(): Promise<NodeInfo> {
        const json = await this.inner.getRgbNodeInfo();
        return this.parse<NodeInfo>(json);
    }

    async listChannels(): Promise<any[]> {
        const json = await this.inner.listChannels();
        return this.parse<any[]>(json);
    }

    async listPeers(): Promise<any[]> {
        const json = await this.inner.listPeers();
        return this.parse<any[]>(json);
    }

    async listNodeAssets(): Promise<Asset[]> {
        const json = await this.inner.listNodeAssets();
        return this.parse<Asset[]>(json);
    }

    async getAssetBalance(assetId: string): Promise<any> {
        const json = await this.inner.getAssetBalance(assetId);
        return this.parse<any>(json);
    }

    async getOnchainAddress(): Promise<any> {
        const json = await this.inner.getOnchainAddress();
        return this.parse<any>(json);
    }

    async getBtcBalance(): Promise<any> {
        const json = await this.inner.getBtcBalance();
        return this.parse<any>(json);
    }

    async decodeLnInvoice(invoice: string): Promise<any> {
        const json = await this.inner.decodeLnInvoice(invoice);
        return this.parse<any>(json);
    }

    async listPayments(): Promise<any[]> {
        const json = await this.inner.listPayments();
        return this.parse<any[]>(json);
    }

    async initWallet(password: string): Promise<string> {
        return await this.inner.initWallet(password);
    }

    async unlockWallet(password: string): Promise<string> {
        return await this.inner.unlockWallet(password);
    }

    async lockWallet(): Promise<string> {
        return await this.inner.lockWallet();
    }
}
