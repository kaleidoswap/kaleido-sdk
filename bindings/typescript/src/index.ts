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
export const KaleidoClient = nativeBinding.KaleidoClient;
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
    hasNode(): boolean;

    // Market Operations (async, returns JSON string)
    listAssets(): Promise<string>;
    listPairs(): Promise<string>;
    getQuoteByPair(ticker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string>;

    // Swap Operations
    getNodeInfo(): Promise<string>;
    getSwapStatus(paymentHash: string): Promise<string>;
    waitForSwapCompletion(paymentHash: string, timeoutSecs: number, pollIntervalSecs: number): Promise<string>;

    // Order Operations
    getSwapOrderStatus(orderId: string): Promise<string>;
    getOrderHistory(status: string | null, limit: number, skip: number): Promise<string>;
    getOrderAnalytics(): Promise<string>;
    swapOrderRateDecision(orderId: string, accept: boolean): Promise<string>;

    // LSP Operations
    getLspInfo(): Promise<string>;
    getLspNetworkInfo(): Promise<string>;
    getLspOrder(orderId: string): Promise<string>;
    estimateLspFees(channelSize: number): Promise<string>;

    // RGB Node Operations
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

    // Wallet Operations
    initWallet(password: string): Promise<string>;
    unlockWallet(password: string): Promise<string>;
    lockWallet(): Promise<string>;

    // Convenience Methods
    getAssetByTicker(ticker: string): Promise<string>;
    getQuoteByAssets(fromTicker: string, toTicker: string, fromAmount?: number | null, toAmount?: number | null): Promise<string>;
    completeSwap(rfqId: string, fromAsset: string, toAsset: string, fromAmount: number, toAmount: number): Promise<string>;
    getPairByTicker(ticker: string): Promise<string>;

    // WebSocket Streaming
    createQuoteStream(pairTicker: string): Promise<IQuoteStream>;
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
    const fullConfig = {
        baseUrl: config.baseUrl,
        nodeUrl: config.nodeUrl || undefined,
        apiKey: config.apiKey || undefined,
        timeout: config.timeout || 30.0,
        maxRetries: config.maxRetries || 3,
        cacheTtl: config.cacheTtl || 300,
    };

    return new KaleidoClient(fullConfig) as IKaleidoClient;
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
