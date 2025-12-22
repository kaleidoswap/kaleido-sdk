/**
 * Kaleidoswap SDK for TypeScript/Node.js
 *
 * Native TypeScript bindings to the Rust Kaleidoswap SDK using napi-rs.
 * All methods are async and return Promises.
 */

// Import the napi-rs generated native bindings
// @ts-ignore - napi generated module
const nativeBinding = require('../kaleidoswap.node');

// Re-export types and classes from native binding
const NativeKaleidoClient = nativeBinding.KaleidoClient;
export const QuoteStream = nativeBinding.QuoteStream;
export const toSmallestUnits = nativeBinding.toSmallestUnits;
export const toDisplayUnits = nativeBinding.toDisplayUnits;

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
 * TypeScript interface for the KaleidoClient with async methods
 */
export interface IKaleidoClient {
    // Market Operations (async, returns JSON string)
    listAssets(): Promise<string>;
    listPairs(): Promise<string>;
    getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string>;
    getBestQuote(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string>;

    // Swap Operations
    checkSwapStatus(paymentHash: string): Promise<string>;

    // LSP Operations
    getLspInfo(): Promise<string>;
    getLspNetworkInfo(): Promise<string>;
    getLspOrder(orderId: string): Promise<string>;
    estimateLspFees(channelSize: number): Promise<string>;

    // RGB Lightning Node Operations
    getRgbNodeInfo(): Promise<string>;
    listChannels(): Promise<string>;
    listPeers(): Promise<string>;
    listNodeAssets(): Promise<string>;
    getAssetBalance(assetId: string): Promise<string>;
    getOnchainAddress(): Promise<string>;
    getBtcBalance(): Promise<string>;
    whitelistTrade(swapstring: string): Promise<string>;
    decodeLnInvoice(invoice: string): Promise<string>;
    listPayments(): Promise<string>;
    initWallet(password: string): Promise<string>;
    unlockWallet(password: string): Promise<string>;
    lockWallet(): Promise<string>;

    // Convenience Methods
    getAssetByTicker(ticker: string): Promise<string>;
    getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string>;
    completeSwapFromQuote(quoteJson: string): Promise<string>;
    getPairByTicker(ticker: string): Promise<string>;

    // Legacy Support Methods (Strongly Typed)
    createLspOrder(request: CreateOrderRequest): Promise<string>;
    createSwapOrder(request: CreateSwapOrderRequest): Promise<string>;
    initSwap(request: SwapRequest): Promise<string>;
    executeSwap(request: ConfirmSwapRequest): Promise<string>;
    retryDelivery(orderId: string): Promise<string>;
    connectPeer(request: ConnectPeerRequest): Promise<string>;

    // WebSocket Streaming
    createQuoteStream(pairTicker: string): Promise<IQuoteStream>;
}

// ============================================================================
// Client Implementation
// ============================================================================

// Wrapper class to match the interface and handle object serialization
export class KaleidoClient implements IKaleidoClient {
    private inner: any;

    constructor(config: KaleidoConfig) {
        this.inner = new NativeKaleidoClient(config);
    }

    async listAssets(): Promise<string> { return this.inner.listAssets(); }
    async listPairs(): Promise<string> { return this.inner.listPairs(); }
    async getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string> { return this.inner.getQuoteByPair(ticker, fromAmount, toAmount); }
    async getBestQuote(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string> { return this.inner.getBestQuote(ticker, fromAmount, toAmount); }

    async checkSwapStatus(paymentHash: string): Promise<string> { return this.inner.checkSwapStatus(paymentHash); }

    async getLspInfo(): Promise<string> { return this.inner.getLspInfo(); }
    async getLspNetworkInfo(): Promise<string> { return this.inner.getLspNetworkInfo(); }
    async getLspOrder(orderId: string): Promise<string> { return this.inner.getLspOrder(orderId); }
    async estimateLspFees(channelSize: number): Promise<string> { return this.inner.estimateLspFees(channelSize); }

    async getRgbNodeInfo(): Promise<string> { return this.inner.getRgbNodeInfo(); }
    async listChannels(): Promise<string> { return this.inner.listChannels(); }
    async listPeers(): Promise<string> { return this.inner.listPeers(); }
    async listNodeAssets(): Promise<string> { return this.inner.listNodeAssets(); }
    async getAssetBalance(assetId: string): Promise<string> { return this.inner.getAssetBalance(assetId); }
    async getOnchainAddress(): Promise<string> { return this.inner.getOnchainAddress(); }
    async getBtcBalance(): Promise<string> { return this.inner.getBtcBalance(); }
    async whitelistTrade(swapstring: string): Promise<string> { return this.inner.whitelistTrade(swapstring); }
    async decodeLnInvoice(invoice: string): Promise<string> { return this.inner.decodeLnInvoice(invoice); }
    async listPayments(): Promise<string> { return this.inner.listPayments(); }

    async initWallet(password: string): Promise<string> { return this.inner.initWallet(password); }
    async unlockWallet(password: string): Promise<string> { return this.inner.unlockWallet(password); }
    async lockWallet(): Promise<string> { return this.inner.lockWallet(); }

    async getAssetByTicker(ticker: string): Promise<string> { return this.inner.getAssetByTicker(ticker); }
    async getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string> { return this.inner.getQuoteByAssets(fromTicker, toTicker, fromAmount, toAmount); }
    async completeSwapFromQuote(quoteJson: string): Promise<string> { return this.inner.completeSwapFromQuote(quoteJson); }
    async getPairByTicker(ticker: string): Promise<string> { return this.inner.getPairByTicker(ticker); }

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

    // Explicitly re-declare extra methods if they exist on inner but not in interface
    async getSwapOrderStatus(orderId: string): Promise<string> { return this.inner.getSwapOrderStatus(orderId); }
    async getOrderHistory(status: string | null, limit: number, skip: number): Promise<string> { return this.inner.getOrderHistory(status, limit, skip); }
    async getOrderAnalytics(): Promise<string> { return this.inner.getOrderAnalytics(); }
    async swapOrderRateDecision(orderId: string, accept: boolean): Promise<string> { return this.inner.swapOrderRateDecision(orderId, accept); }
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
