/**
 * Kaleidoswap SDK for TypeScript/Node.js
 *
 * Native TypeScript bindings to the Rust Kaleidoswap SDK using napi-rs.
 * All methods are async and return Promises.
 */

// Import the napi-rs generated native bindings
// @ts-ignore - napi generated module
const nativeBinding = require('../index.node');

// Re-export types and classes from native binding
const NativeKaleidoClient = nativeBinding.KaleidoClient;
export const QuoteStream = nativeBinding.QuoteStream;
export const toSmallestUnits = nativeBinding.toSmallestUnits;
export const toDisplayUnits = nativeBinding.toDisplayUnits;

// Import sub-clients
import {
    MarketClient,
    OrdersClient,
    SwapsClient,
    LspClient,
    NodeClient,
    IMarketClient,
    IOrdersClient,
    ISwapsClient,
    ILspClient,
    INodeClient,
} from './sub-clients';

// Re-export sub-client interfaces
export {
    IMarketClient,
    IOrdersClient,
    ISwapsClient,
    ILspClient,
    INodeClient,
    MarketClient,
    OrdersClient,
    SwapsClient,
    LspClient,
    NodeClient,
};

// Import and re-export exceptions
export {
    KaleidoError,
    APIError,
    NetworkError,
    ValidationError,
    QuoteExpiredError,
    InsufficientBalanceError,
    NodeNotConfiguredError,
    AuthenticationError,
    RateLimitError,
    ChannelNotFoundError,
    OrderNotFoundError,
} from './exceptions';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface KaleidoConfig {
    baseUrl: string;
    nodeUrl?: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
    cacheTtl?: number;
}

export type Layer =
    | 'BTC_L1' | 'BTC_LN' | 'BTC_SPARK' | 'BTC_ARKADE' | 'BTC_LIQUID'
    | 'BTC_CASHU' | 'RGB_L1' | 'RGB_LN' | 'TAPASS_L1' | 'TAPASS_LN'
    | 'LIQUID_LIQUID' | 'ARKADE_ARKADE' | 'SPARK_SPARK';

export type ReceiverAddressFormat =
    | 'BTC_ADDRESS' | 'BOLT11' | 'BOLT12' | 'LN_ADDRESS' | 'RGB_INVOICE'
    | 'LIQUID_ADDRESS' | 'LIQUID_INVOICE' | 'SPARK_ADDRESS' | 'SPARK_INVOICE'
    | 'ARKADE_ADDRESS' | 'ARKADE_INVOICE' | 'CASHU_TOKEN';

export interface SwapLeg {
    asset_id: string;
    name: string;
    ticker: string;
    layer: Layer;
    amount: number;
    precision: number;
}

export interface ReceiverAddress {
    address: string;
    format: ReceiverAddressFormat;
}

export interface CreateOrderRequest {
    client_pubkey: string;
    lsp_balance_sat: number;
    client_balance_sat: number;
    required_channel_confirmations: number;
    funding_confirms_within_blocks: number;
    channel_expiry_blocks: number;
    token?: string | null;
    refund_onchain_address?: string | null;
    announce_channel?: boolean | null;
    asset_id?: string | null;
    lsp_asset_amount?: number | null;
    client_asset_amount?: number | null;
    rfq_id?: string | null;
    email?: string | null;
}

export interface CreateSwapOrderRequest {
    rfq_id: string;
    from_asset: SwapLeg;
    to_asset: SwapLeg;
    receiver_address: ReceiverAddress;
    min_onchain_conf?: number | null;
    refund_address?: string | null;
    email?: string | null;
}

export interface SwapRequest {
    rfq_id: string;
    from_asset: string;
    from_amount: number;
    to_asset: string;
    to_amount: number;
}

export interface ConfirmSwapRequest {
    swapstring: string;
    taker_pubkey: string;
    payment_hash: string;
}

export interface ConnectPeerRequest {
    peer_pubkey_and_addr: string;
}

export interface RetryDeliveryRequest {
    order_id: string;
}

/** Asset balance information */
export interface AssetBalance {
    settled: number;
    future: number;
    spendable: number;
    offchainOutbound: number;
    offchainInbound: number;
}

/** Asset information */
export interface Asset {
    assetId: string;
    ticker: string;
    name: string;
    details?: string;
    precision: number;
    issuedSupply: number;
    timestamp: number;
    addedAt: number;
    balance: AssetBalance;
    isActive?: boolean;
}

/** Trading pair information */
export interface TradingPair {
    id?: string;
    baseAsset: string;
    baseAssetId: string;
    basePrecision: number;
    quoteAsset: string;
    quoteAssetId: string;
    quotePrecision: number;
    isActive: boolean;
    minBaseOrderSize: number;
    maxBaseOrderSize: number;
    minQuoteOrderSize: number;
    maxQuoteOrderSize: number;
}

/** Fee information */
export interface Fee {
    baseFee: number;
    variableFee: number;
    feeRate: number;
    finalFee: number;
    feeAsset: string;
    feeAssetPrecision: number;
}

/** Quote information */
export interface Quote {
    rfqId: string;
    fromAsset: string;
    fromAmount: number;
    toAsset: string;
    toAmount: number;
    price: number;
    fee: Fee;
    timestamp: number;
    expiresAt: number;
}

/** Node information */
export interface NodeInfo {
    pubkey?: string;
    network?: string;
    blockHeight?: number;
}

/**
 * Interface for real-time quote stream via WebSocket
 */
export interface IQuoteStream {
    /** Receive the next quote update (blocking with timeout). Returns null on timeout. */
    recv(timeoutSecs: number): Promise<string | null>;

    /** Check if the stream is still connected */
    isConnected(): boolean;

    /** Close the stream and clean up resources */
    close(): void;
}

/**
 * TypeScript interface for the KaleidoClient with async methods.
 * 
 * Access organized API clients via properties:
 * - client.market: Market operations (assets, pairs, quotes)
 * - client.orders: Order management
 * - client.swaps: Swap operations
 * - client.lsp: Lightning Service Provider operations
 * - client.node: RGB Node operations (if configured)
 * 
 * By default, methods return parsed TypeScript objects for better DX.
 * Pass `{ raw: true }` to get JSON strings for backwards compatibility.
 */
export interface IKaleidoClient {
    // Sub-client properties
    readonly market: IMarketClient;
    readonly orders: IOrdersClient;
    readonly swaps: ISwapsClient;
    readonly lsp: ILspClient;
    readonly node: INodeClient | null;

    // Configuration checks
    hasNode(): boolean;

    // Market Operations (legacy flat access)
    listAssets(options?: { raw?: boolean }): Promise<Asset[] | string>;
    listPairs(options?: { raw?: boolean }): Promise<TradingPair[] | string>;
    getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null, options?: { raw?: boolean }): Promise<Quote | string>;
    getBestQuote(ticker: string, fromAmount?: number | null, toAmount?: number | null, options?: { raw?: boolean }): Promise<Quote | string>;

    // Swap Operations
    getNodeInfo(options?: { raw?: boolean }): Promise<NodeInfo | string>;
    getSwapStatus(paymentHash: string, options?: { raw?: boolean }): Promise<any | string>;
    waitForSwapCompletion(paymentHash: string, timeoutSecs: number, pollIntervalSecs: number): Promise<string>;
    checkSwapStatus(paymentHash: string, options?: { raw?: boolean }): Promise<any | string>;

    // Order Operations  
    getSwapOrderStatus(orderId: string): Promise<string>;
    getOrderHistory(status: string | null, limit: number, skip: number): Promise<string>;
    getOrderAnalytics(): Promise<string>;
    swapOrderRateDecision(orderId: string, accept: boolean): Promise<string>;

    // LSP Operations
    getLspInfo(options?: { raw?: boolean }): Promise<any | string>;
    getLspNetworkInfo(options?: { raw?: boolean }): Promise<NodeInfo | string>;
    getLspOrder(orderId: string, options?: { raw?: boolean }): Promise<any | string>;
    estimateLspFees(channelSize: number): Promise<string>;

    // RGB Lightning Node Operations
    getRgbNodeInfo(options?: { raw?: boolean }): Promise<NodeInfo | string>;
    listChannels(options?: { raw?: boolean }): Promise<any[] | string>;
    listPeers(options?: { raw?: boolean }): Promise<any[] | string>;
    listNodeAssets(options?: { raw?: boolean }): Promise<Asset[] | string>;
    getAssetBalance(assetId: string, options?: { raw?: boolean }): Promise<any | string>;
    getOnchainAddress(options?: { raw?: boolean }): Promise<any | string>;
    getBtcBalance(options?: { raw?: boolean }): Promise<any | string>;
    whitelistTrade(swapstring: string): Promise<string>;
    decodeLnInvoice(invoice: string, options?: { raw?: boolean }): Promise<any | string>;
    listPayments(options?: { raw?: boolean }): Promise<any[] | string>;
    initWallet(password: string): Promise<string>;
    unlockWallet(password: string): Promise<string>;
    lockWallet(): Promise<string>;

    // Convenience Methods
    getAssetByTicker(ticker: string, options?: { raw?: boolean }): Promise<Asset | string>;
    getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null, fromLayer?: string, toLayer?: string, options?: { raw?: boolean }): Promise<Quote | string>;
    completeSwapFromQuote(quoteJson: string): Promise<string>;
    completeSwap(quoteJson: string): Promise<string>; // Alias for backwards compatibility
    getPairByTicker(ticker: string, options?: { raw?: boolean }): Promise<TradingPair | string>;

    // Additional convenience methods for feature parity
    listActiveAssets(options?: { raw?: boolean }): Promise<Asset[] | string>;
    listActivePairs(options?: { raw?: boolean }): Promise<TradingPair[] | string>;
    estimateSwapFees(ticker: string, amount: number): Promise<number>;
    findAssetByTicker(ticker: string, options?: { raw?: boolean }): Promise<Asset | string>;
    findPairByTicker(ticker: string, options?: { raw?: boolean }): Promise<TradingPair | string>;

    // Legacy Support Methods (Strongly Typed)
    createLspOrder(request: CreateOrderRequest): Promise<string>;
    createSwapOrder(request: CreateSwapOrderRequest): Promise<string>;
    initSwap(request: SwapRequest): Promise<string>;
    executeSwap(request: ConfirmSwapRequest): Promise<string>;
    retryDelivery(orderId: string): Promise<string>;
    connectPeer(request: ConnectPeerRequest): Promise<string>;

    // WebSocket Streaming
    createQuoteStream(pairTicker: string): Promise<IQuoteStream>;

    // WebSocket Operations
    connectWebsocket(): Promise<void>;
    disconnectWebsocket(): Promise<void>;
    isWebsocketConnected(): Promise<boolean>;
    subscribeToPair(pairId: string): Promise<void>;
    unsubscribeFromPair(pairId: string): Promise<void>;
    getQuoteWebsocket(ticker: string, fromAmount?: number | null, toAmount?: number | null, layer?: string): Promise<string>;
    onWebsocketEvent(event: string, handlerId: string): Promise<void>;
    reconnectWebsocket(): Promise<void>;

    // Display Amount Utilities
    toRaw(displayAmount: number, asset: Asset | string): Promise<number>;
    toDisplay(rawAmount: number, asset: Asset | string): Promise<number>;
    convertAmount(amount: number, asset: Asset | string, to: 'raw' | 'display'): Promise<number>;

    // Validation & Trade Helpers
    canTrade(baseTicker: string, quoteTicker: string): Promise<boolean>;
    validateAmount(amount: number, assetIdentifier: string): Promise<{
        valid: boolean;
        rawAmount: number;
        displayAmount: number;
        errors: string[];
    }>;
    refreshCache(): void;
}

// ============================================================================
// Client Implementation
// ============================================================================

// Wrapper class to match the interface and handle object serialization
export class KaleidoClient implements IKaleidoClient {
    private inner: any;
    private _marketClient: IMarketClient | null = null;
    private _ordersClient: IOrdersClient | null = null;
    private _swapsClient: ISwapsClient | null = null;
    private _lspClient: ILspClient | null = null;
    private _nodeClient: INodeClient | null = null;

    constructor(config: KaleidoConfig) {
        // Ensure all required fields have defaults for Rust FFI
        const fullConfig = {
            baseUrl: config.baseUrl,
            nodeUrl: config.nodeUrl,
            apiKey: config.apiKey,
            timeout: config.timeout || 30.0,
            maxRetries: config.maxRetries || 3,
            cacheTtl: config.cacheTtl || 60,
        };
        this.inner = new NativeKaleidoClient(fullConfig);
    }

    // === Sub-Client Properties ===

    get market(): IMarketClient {
        if (!this._marketClient) {
            this._marketClient = new MarketClient(this.inner, (json) => JSON.parse(json));
        }
        return this._marketClient;
    }

    get orders(): IOrdersClient {
        if (!this._ordersClient) {
            this._ordersClient = new OrdersClient(this.inner, (json) => JSON.parse(json));
        }
        return this._ordersClient;
    }

    get swaps(): ISwapsClient {
        if (!this._swapsClient) {
            this._swapsClient = new SwapsClient(this.inner, (json) => JSON.parse(json));
        }
        return this._swapsClient;
    }

    get lsp(): ILspClient {
        if (!this._lspClient) {
            this._lspClient = new LspClient(this.inner, (json) => JSON.parse(json));
        }
        return this._lspClient;
    }

    get node(): INodeClient | null {
        // Check if node is configured
        if (!this.hasNode()) {
            return null;
        }
        if (!this._nodeClient) {
            this._nodeClient = new NodeClient(this.inner, (json) => JSON.parse(json));
        }
        return this._nodeClient;
    }

    // === Configuration Methods ===

    hasNode(): boolean {
        return this.inner.hasNode ? this.inner.hasNode() : false;
    }

    /**
     * Helper to handle JSON response from native binding.
     * By default, returns parsed TypeScript objects for better developer experience.
     * Pass `{ raw: true }` to get JSON strings for backwards compatibility.
     * 
     * @param jsonStr - JSON string from native binding
     * @param raw - If true, return raw JSON string instead of parsed object
     */
    private _parseResponse<T>(jsonStr: string, raw?: boolean): T | string {
        if (raw) {
            return jsonStr;
        }
        return JSON.parse(jsonStr) as T;
    }

    // === Market Operations ===

    async listAssets(options?: { raw?: boolean }): Promise<Asset[] | string> {
        const json = await this.inner.listAssets();
        return this._parseResponse<Asset[]>(json, options?.raw);
    }

    async listPairs(options?: { raw?: boolean }): Promise<TradingPair[] | string> {
        const json = await this.inner.listPairs();
        return this._parseResponse<TradingPair[]>(json, options?.raw);
    }

    async getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null, options?: { raw?: boolean }): Promise<Quote | string> {
        const json = await this.inner.getQuoteByPair(ticker, fromAmount, toAmount);
        return this._parseResponse<Quote>(json, options?.raw);
    }

    async getBestQuote(ticker: string, fromAmount?: number | null, toAmount?: number | null, options?: { raw?: boolean }): Promise<Quote | string> {
        const json = await this.inner.getBestQuote(ticker, fromAmount, toAmount);
        return this._parseResponse<Quote>(json, options?.raw);
    }

    // === Swap Operations ===

    async getNodeInfo(options?: { raw?: boolean }): Promise<NodeInfo | string> {
        const json = await this.inner.getNodeInfo();
        return this._parseResponse<NodeInfo>(json, options?.raw);
    }

    async getSwapStatus(paymentHash: string, options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.getSwapStatus(paymentHash);
        return this._parseResponse<any>(json, options?.raw);
    }

    async waitForSwapCompletion(paymentHash: string, timeoutSecs: number, pollIntervalSecs: number): Promise<string> {
        return this.inner.waitForSwapCompletion(paymentHash, timeoutSecs, pollIntervalSecs);
    }

    async checkSwapStatus(paymentHash: string, options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.checkSwapStatus(paymentHash);
        return this._parseResponse<any>(json, options?.raw);
    }

    // === LSP Operations ===

    async getLspInfo(options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.getLspInfo();
        return this._parseResponse<any>(json, options?.raw);
    }

    async getLspNetworkInfo(options?: { raw?: boolean }): Promise<NodeInfo | string> {
        const json = await this.inner.getLspNetworkInfo();
        return this._parseResponse<NodeInfo>(json, options?.raw);
    }

    async getLspOrder(orderId: string, options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.getLspOrder(orderId);
        return this._parseResponse<any>(json, options?.raw);
    }

    async estimateLspFees(channelSize: number): Promise<string> {
        return this.inner.estimateLspFees(channelSize);
    }

    // === RGB Lightning Node Operations ===

    async getRgbNodeInfo(options?: { raw?: boolean }): Promise<NodeInfo | string> {
        const json = await this.inner.getRgbNodeInfo();
        return this._parseResponse<NodeInfo>(json, options?.raw);
    }

    async listChannels(options?: { raw?: boolean }): Promise<any[] | string> {
        const json = await this.inner.listChannels();
        return this._parseResponse<any[]>(json, options?.raw);
    }

    async listPeers(options?: { raw?: boolean }): Promise<any[] | string> {
        const json = await this.inner.listPeers();
        return this._parseResponse<any[]>(json, options?.raw);
    }

    async listNodeAssets(options?: { raw?: boolean }): Promise<Asset[] | string> {
        const json = await this.inner.listNodeAssets();
        return this._parseResponse<Asset[]>(json, options?.raw);
    }

    async getAssetBalance(assetId: string, options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.getAssetBalance(assetId);
        return this._parseResponse<any>(json, options?.raw);
    }

    async getOnchainAddress(options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.getOnchainAddress();
        return this._parseResponse<any>(json, options?.raw);
    }

    async getBtcBalance(options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.getBtcBalance();
        return this._parseResponse<any>(json, options?.raw);
    }

    async whitelistTrade(swapstring: string): Promise<string> {
        return this.inner.whitelistTrade(swapstring);
    }

    async decodeLnInvoice(invoice: string, options?: { raw?: boolean }): Promise<any | string> {
        const json = await this.inner.decodeLnInvoice(invoice);
        return this._parseResponse<any>(json, options?.raw);
    }

    async listPayments(options?: { raw?: boolean }): Promise<any[] | string> {
        const json = await this.inner.listPayments();
        return this._parseResponse<any[]>(json, options?.raw);
    }

    // === Wallet Operations ===

    async initWallet(password: string): Promise<string> {
        return this.inner.initWallet(password);
    }

    async unlockWallet(password: string): Promise<string> {
        return this.inner.unlockWallet(password);
    }

    async lockWallet(): Promise<string> {
        return this.inner.lockWallet();
    }

    // === Convenience Methods ===

    async getAssetByTicker(ticker: string, options?: { raw?: boolean }): Promise<Asset | string> {
        const json = await this.inner.getAssetByTicker(ticker);
        return this._parseResponse<Asset>(json, options?.raw);
    }

    async getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null, fromLayer?: string, toLayer?: string, options?: { raw?: boolean }): Promise<Quote | string> {
        const json = await this.inner.getQuoteByAssets(fromTicker, toTicker, fromAmount, toAmount, fromLayer || 'BTC_LN', toLayer || 'RGB_L1');
        return this._parseResponse<Quote>(json, options?.raw);
    }

    async completeSwapFromQuote(quoteJson: string): Promise<string> {
        return this.inner.completeSwapFromQuote(quoteJson);
    }

    // Alias for backwards compatibility
    async completeSwap(quoteJson: string): Promise<string> {
        return this.completeSwapFromQuote(quoteJson);
    }

    async getPairByTicker(ticker: string, options?: { raw?: boolean }): Promise<TradingPair | string> {
        const json = await this.inner.getPairByTicker(ticker);
        return this._parseResponse<TradingPair>(json, options?.raw);
    }

    // Additional convenience methods for feature parity with Python
    async listActiveAssets(options?: { raw?: boolean }): Promise<Asset[] | string> {
        const json = await this.inner.listActiveAssets();
        return this._parseResponse<Asset[]>(json, options?.raw);
    }

    async listActivePairs(options?: { raw?: boolean }): Promise<TradingPair[] | string> {
        const json = await this.inner.listActivePairs();
        return this._parseResponse<TradingPair[]>(json, options?.raw);
    }

    async estimateSwapFees(ticker: string, amount: number): Promise<number> {
        return this.inner.estimateSwapFees(ticker, amount);
    }

    async findAssetByTicker(ticker: string, options?: { raw?: boolean }): Promise<Asset | string> {
        const json = await this.inner.findAssetByTicker(ticker);
        return this._parseResponse<Asset>(json, options?.raw);
    }

    async findPairByTicker(ticker: string, options?: { raw?: boolean }): Promise<TradingPair | string> {
        const json = await this.inner.findPairByTicker(ticker);
        return this._parseResponse<TradingPair>(json, options?.raw);
    }

    // === Legacy Support Methods ===

    async createLspOrder(request: CreateOrderRequest): Promise<string> {
        return this.inner.createLspOrder(JSON.stringify(request));
    }
    async createSwapOrder(request: CreateSwapOrderRequest): Promise<string> {
        return this.inner.createSwapOrder(JSON.stringify(request));
    }
    async initSwap(request: SwapRequest): Promise<string> {
        return this.inner.initSwap(JSON.stringify(request));
    }
    async executeSwap(request: ConfirmSwapRequest): Promise<string> {
        return this.inner.executeSwap(JSON.stringify(request));
    }
    async retryDelivery(orderId: string): Promise<string> {
        return this.inner.retryDelivery(orderId);
    }
    async connectPeer(request: ConnectPeerRequest): Promise<string> {
        return this.inner.connectPeer(JSON.stringify(request));
    }

    async createQuoteStream(pairTicker: string): Promise<IQuoteStream> {
        return this.inner.createQuoteStream(pairTicker);
    }

    // === WebSocket Operations ===

    async connectWebsocket(): Promise<void> {
        return this.inner.connectWebsocket();
    }

    async disconnectWebsocket(): Promise<void> {
        return this.inner.disconnectWebsocket();
    }

    async isWebsocketConnected(): Promise<boolean> {
        return this.inner.isWebsocketConnected();
    }

    async subscribeToPair(pairId: string): Promise<void> {
        return this.inner.subscribeToPair(pairId);
    }

    async unsubscribeFromPair(pairId: string): Promise<void> {
        return this.inner.unsubscribeFromPair(pairId);
    }

    async getQuoteWebsocket(
        ticker: string,
        fromAmount?: number | null,
        toAmount?: number | null,
        layer: string = 'BTC_LN'
    ): Promise<string> {
        return this.inner.getQuoteWebsocket(ticker, fromAmount, toAmount, layer);
    }

    async onWebsocketEvent(event: string, handlerId: string): Promise<void> {
        return this.inner.onWebsocketEvent(event, handlerId);
    }

    async reconnectWebsocket(): Promise<void> {
        return this.inner.reconnectWebsocket();
    }

    // === Order Management Methods ===

    async getSwapOrderStatus(orderId: string): Promise<string> {
        return this.inner.getSwapOrderStatus(orderId);
    }

    async getOrderHistory(status: string | null, limit: number, skip: number): Promise<string> {
        return this.inner.getOrderHistory(status, limit, skip);
    }

    async getOrderAnalytics(): Promise<string> {
        return this.inner.getOrderAnalytics();
    }

    async swapOrderRateDecision(orderId: string, accept: boolean): Promise<string> {
        return this.inner.swapOrderRateDecision(orderId, accept);
    }

    // === Display Amount Utilities ===

    /**
     * Convert display amount to raw atomic units.
     * 
     * @param displayAmount - Amount in display units (e.g., 1.5 BTC)
     * @param asset - Asset object or ticker string
     * @returns Raw atomic units
     */
    async toRaw(displayAmount: number, asset: Asset | string): Promise<number> {
        let precision: number;

        if (typeof asset === 'string') {
            const assetObj = await this.getAssetByTicker(asset);
            if (typeof assetObj === 'string') {
                const parsed = JSON.parse(assetObj) as Asset;
                precision = parsed.precision;
            } else {
                precision = assetObj.precision;
            }
        } else {
            precision = asset.precision;
        }

        return Math.round(displayAmount * Math.pow(10, precision));
    }

    /**
     * Convert raw atomic units to display amount.
     * 
     * @param rawAmount - Amount in raw atomic units (e.g., 150000000 sats)
     * @param asset - Asset object or ticker string
     * @returns Display amount
     */
    async toDisplay(rawAmount: number, asset: Asset | string): Promise<number> {
        let precision: number;

        if (typeof asset === 'string') {
            const assetObj = await this.getAssetByTicker(asset);
            if (typeof assetObj === 'string') {
                const parsed = JSON.parse(assetObj) as Asset;
                precision = parsed.precision;
            } else {
                precision = assetObj.precision;
            }
        } else {
            precision = asset.precision;
        }

        return rawAmount / Math.pow(10, precision);
    }

    /**
     * Convert amount between raw and display units.
     * 
     * @param amount - Amount to convert
     * @param asset - Asset object or ticker string
     * @param to - 'raw' or 'display'
     * @returns Converted amount
     */
    async convertAmount(amount: number, asset: Asset | string, to: 'raw' | 'display'): Promise<number> {
        if (to === 'raw') {
            return this.toRaw(amount, asset);
        } else if (to === 'display') {
            return this.toDisplay(amount, asset);
        } else {
            throw new Error(`Invalid 'to' value: ${to}. Must be 'raw' or 'display'.`);
        }
    }

    // === Validation & Trade Helpers ===

    /**
     * Check if a trading pair exists and is active.
     * 
     * @param baseTicker - Base asset ticker (e.g., "BTC")
     * @param quoteTicker - Quote asset ticker (e.g., "USDT")
     * @returns true if pair exists and is active
     */
    async canTrade(baseTicker: string, quoteTicker: string): Promise<boolean> {
        try {
            const pairs = await this.listPairs();
            const pairsList = typeof pairs === 'string' ? JSON.parse(pairs) : pairs;

            return pairsList.some((pair: TradingPair) =>
                (pair.baseAsset === baseTicker && pair.quoteAsset === quoteTicker) ||
                (pair.baseAsset === quoteTicker && pair.quoteAsset === baseTicker)
            );
        } catch {
            return false;
        }
    }

    /**
     * Validate an amount against asset constraints.
     * 
     * @param amount - Display amount to validate
     * @param assetIdentifier - Asset ticker or ID
     * @returns Validation result object
     */
    async validateAmount(amount: number, assetIdentifier: string): Promise<{
        valid: boolean;
        rawAmount: number;
        displayAmount: number;
        errors: string[];
    }> {
        const errors: string[] = [];
        let rawAmount = 0;

        try {
            const asset = await this.getAssetByTicker(assetIdentifier);
            const assetObj = typeof asset === 'string' ? JSON.parse(asset) as Asset : asset;

            rawAmount = await this.toRaw(amount, assetObj);

            if (amount <= 0) {
                errors.push('Amount must be positive');
            }

            if (!Number.isFinite(amount)) {
                errors.push('Amount must be a valid finite number');
            }

            if (rawAmount === 0 && amount > 0) {
                errors.push(`Amount ${amount} is too small for precision ${assetObj.precision}`);
            }
        } catch (e) {
            errors.push(`Asset not found: ${assetIdentifier}`);
        }

        return {
            valid: errors.length === 0,
            rawAmount,
            displayAmount: amount,
            errors,
        };
    }

    /**
     * Force refresh of internal caches.
     * Clears any cached data to ensure fresh data on next request.
     */
    refreshCache(): void {
        this._marketClient = null;
        this._ordersClient = null;
        this._swapsClient = null;
        this._lspClient = null;
        this._nodeClient = null;
    }
}


// ============================================================================
// Helper Functions for Typed Responses
// ============================================================================

/**
 * Parse asset list from JSON response
 */
export function parseAssets(json: string): Asset[] {
    return JSON.parse(json);
}

/**
 * Parse trading pairs from JSON response
 */
export function parsePairs(json: string): TradingPair[] {
    return JSON.parse(json);
}

/**
 * Parse quote from JSON response
 */
export function parseQuote(json: string): Quote {
    return JSON.parse(json);
}

/**
 * Parse single asset from JSON response
 */
export function parseAsset(json: string): Asset {
    return JSON.parse(json);
}

/**
 * Create a new Kaleidoswap client with async methods
 */
export function createClient(config: KaleidoConfig): IKaleidoClient {
    return new KaleidoClient(config);
}

export default {
    createClient,
    KaleidoClient,
    QuoteStream,
    toSmallestUnits,
    toDisplayUnits,
    parseAssets,
    parsePairs,
    parseQuote,
    parseAsset,
};
