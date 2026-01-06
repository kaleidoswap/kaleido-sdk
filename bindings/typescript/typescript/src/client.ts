/**
 * Kaleidoswap SDK Client
 *
 * Main entry point for interacting with the Kaleidoswap protocol.
 * Works in both browser and Node.js environments via WebAssembly.
 */

import { mapWasmError } from './errors.js';
import type {
    Asset,
    TradingPair,
    Quote,
    CreateSwapOrderResponse,
    SwapOrderStatusResponse,
    LspInfo,
    NetworkInfo,
    ChannelFees,
    KaleidoConfig,
    CreateSwapOrderRequest,
    OrderHistoryResponse,
    OrderStatsResponse,
    Layer,
} from './types.js';

// WASM module types (will be provided by wasm-pack output)
interface WasmConfig {
    new(
        baseUrl: string,
        nodeUrl: string | null,
        apiKey: string | null,
        timeout: number,
        maxRetries: number,
        cacheTtl: number
    ): WasmConfig;
}

interface WasmClient {
    new(config: WasmConfig): WasmClient;
    hasNode(): boolean;
    listAssets(): Promise<Asset[]>;
    listPairs(): Promise<TradingPair[]>;
    listActiveAssets(): Promise<Asset[]>;
    listActivePairs(): Promise<TradingPair[]>;
    getAssetByTicker(ticker: string): Promise<Asset>;
    getPairByTicker(ticker: string): Promise<TradingPair>;
    getQuoteByPair(
        ticker: string,
        fromAmount: number | null,
        toAmount: number | null,
        fromLayer: string,
        toLayer: string
    ): Promise<Quote>;
    getQuoteByAssets(
        fromTicker: string,
        toTicker: string,
        fromAmount: number | null,
        toAmount: number | null,
        fromLayer: string,
        toLayer: string
    ): Promise<Quote>;
    getNodeInfo(): Promise<NetworkInfo>;
    getSwapStatus(paymentHash: string): Promise<unknown>;
    createSwapOrder(request: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse>;
    getSwapOrderStatus(orderId: string): Promise<SwapOrderStatusResponse>;
    getOrderHistory(status: string | null, limit: number, skip: number): Promise<OrderHistoryResponse>;
    getOrderAnalytics(): Promise<OrderStatsResponse>;
    getLspInfo(): Promise<LspInfo>;
    getLspNetworkInfo(): Promise<NetworkInfo>;
    estimateLspFees(channelSize: number): Promise<ChannelFees>;
}

interface WasmModule {
    KaleidoConfig: { new(...args: ConstructorParameters<WasmConfig>): WasmConfig };
    KaleidoClient: { new(config: WasmConfig): WasmClient };
    toSmallestUnits: (amount: number, precision: number) => number;
    toDisplayUnits: (amount: number, precision: number) => number;
    getVersion: () => string;
    getSdkName: () => string;
}

// Module state
let wasmModule: WasmModule | null = null;
let initPromise: Promise<WasmModule> | null = null;

/**
 * Initialize the WASM module
 * This is called automatically by KaleidoClient.create()
 */
async function initWasm(): Promise<WasmModule> {
    if (wasmModule) {
        return wasmModule;
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        // Dynamic import of WASM module
        // Import from pkg-node for Node.js/Next.js environment
        // @ts-ignore - pkg-node is generated during build
        const mod = await import('../pkg-node/kaleidoswap_sdk.js') as unknown as WasmModule;
        wasmModule = mod;
        return mod;
    })();

    return initPromise;
}

/**
 * Kaleidoswap SDK Client
 *
 * Provides a typed interface for interacting with the Kaleidoswap protocol.
 * All amount values are BigInt for precision with large numbers.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from '@kaleidoswap/sdk';
 *
 * const client = await KaleidoClient.create({
 *     baseUrl: 'https://api.kaleidoswap.com'
 * });
 *
 * const assets = await client.listAssets();
 * console.log(assets[0].ticker); // "BTC"
 * ```
 */
export class KaleidoClient {
    private inner: WasmClient;
    private config: KaleidoConfig;

    private constructor(inner: WasmClient, config: KaleidoConfig) {
        this.inner = inner;
        this.config = config;
    }

    /**
     * Create a new KaleidoClient instance
     *
     * @param config - Client configuration
     * @returns Promise resolving to initialized client
     */
    static async create(config: KaleidoConfig): Promise<KaleidoClient> {
        const wasm = await initWasm();

        const wasmConfig = new wasm.KaleidoConfig(
            config.baseUrl,
            config.nodeUrl ?? null,
            config.apiKey ?? null,
            config.timeout ?? 30,
            config.maxRetries ?? 3,
            config.cacheTtl ?? 60
        );

        const inner = new wasm.KaleidoClient(wasmConfig);
        return new KaleidoClient(inner, config);
    }

    /**
     * Check if RGB Lightning Node is configured
     */
    hasNode(): boolean {
        return this.inner.hasNode();
    }

    // =========================================================================
    // Market Operations
    // =========================================================================

    /**
     * List all available assets
     */
    /**
     * List all available assets
     */
    async listAssets(): Promise<Asset[]> {
        try {
            return await this.inner.listAssets();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * List all available trading pairs
     */
    async listPairs(): Promise<TradingPair[]> {
        try {
            return await this.inner.listPairs();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * List only active assets
     */
    async listActiveAssets(): Promise<Asset[]> {
        try {
            return await this.inner.listActiveAssets();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * List only active trading pairs
     */
    async listActivePairs(): Promise<TradingPair[]> {
        try {
            return await this.inner.listActivePairs();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get an asset by ticker symbol
     *
     * @param ticker - Asset ticker (e.g., "BTC", "USDT")
     */
    async getAssetByTicker(ticker: string): Promise<Asset> {
        try {
            return await this.inner.getAssetByTicker(ticker);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get a trading pair by ticker
     *
     * @param ticker - Pair ticker (e.g., "BTC/USDT")
     */
    async getPairByTicker(ticker: string): Promise<TradingPair> {
        try {
            return await this.inner.getPairByTicker(ticker);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get a quote for a trading pair
     *
     * @param ticker - Pair ticker (e.g., "BTC/USDT")
     * @param fromAmount - Source amount in smallest units (must specify either from or to)
     * @param toAmount - Destination amount in smallest units
     * @param fromLayer - Source network layer
     * @param toLayer - Destination network layer
     */
    async getQuote(
        ticker: string,
        fromAmount: number | null,
        toAmount: number | null,
        fromLayer: Layer,
        toLayer: Layer
    ): Promise<Quote> {
        try {
            return await this.inner.getQuoteByPair(ticker, fromAmount, toAmount, fromLayer, toLayer);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get a quote by asset tickers
     *
     * @param fromTicker - Source asset ticker
     * @param toTicker - Destination asset ticker
     * @param fromAmount - Source amount in smallest units
     * @param toAmount - Destination amount in smallest units
     * @param fromLayer - Source network layer
     * @param toLayer - Destination network layer
     */
    async getQuoteByAssets(
        fromTicker: string,
        toTicker: string,
        fromAmount: number | null,
        toAmount: number | null,
        fromLayer: Layer,
        toLayer: Layer
    ): Promise<Quote> {
        try {
            return await this.inner.getQuoteByAssets(
                fromTicker,
                toTicker,
                fromAmount,
                toAmount,
                fromLayer,
                toLayer
            );
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    // =========================================================================
    // Order Operations
    // =========================================================================

    /**
     * Create a swap order
     *
     * @param request - Order creation request
     */
    async createSwapOrder(request: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse> {
        try {
            return await this.inner.createSwapOrder(request);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get swap order status
     *
     * @param orderId - Order ID
     */
    async getSwapOrderStatus(orderId: string): Promise<SwapOrderStatusResponse> {
        try {
            return await this.inner.getSwapOrderStatus(orderId);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get order history
     *
     * @param status - Filter by status (optional)
     * @param limit - Maximum number of orders to return
     * @param skip - Number of orders to skip (for pagination)
     */
    async getOrderHistory(status?: string, limit: number = 10, skip: number = 0): Promise<OrderHistoryResponse> {
        try {
            return await this.inner.getOrderHistory(status ?? null, limit, skip);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get order analytics/statistics
     */
    async getOrderAnalytics(): Promise<OrderStatsResponse> {
        try {
            return await this.inner.getOrderAnalytics();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    // =========================================================================
    // Node Operations
    // =========================================================================

    /**
     * Get node information
     */
    async getNodeInfo(): Promise<NetworkInfo> {
        try {
            return await this.inner.getNodeInfo();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get swap status by payment hash
     *
     * @param paymentHash - Lightning payment hash
     */
    async getSwapStatus(paymentHash: string): Promise<unknown> {
        try {
            return await this.inner.getSwapStatus(paymentHash);
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    // =========================================================================
    // LSP Operations
    // =========================================================================

    /**
     * Get LSP information
     */
    async getLspInfo(): Promise<LspInfo> {
        try {
            return await this.inner.getLspInfo();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Get LSP network information
     */
    async getLspNetworkInfo(): Promise<NetworkInfo> {
        try {
            return await this.inner.getLspNetworkInfo();
        } catch (e) {
            throw mapWasmError(e);
        }
    }

    /**
     * Estimate fees for opening an LSP channel
     *
     * @param channelSize - Desired channel capacity in satoshis
     */
    async estimateLspFees(channelSize: number): Promise<ChannelFees> {
        try {
            return await this.inner.estimateLspFees(channelSize);
        } catch (e) {
            throw mapWasmError(e);
        }
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert display units to smallest units (e.g., BTC to satoshis)
 *
 * @param amount - Amount in display units
 * @param precision - Decimal precision (e.g., 8 for BTC)
 * @returns Amount in smallest units as number
 */
export async function toSmallestUnits(amount: number, precision: number): Promise<number> {
    const wasm = await initWasm();
    return wasm.toSmallestUnits(amount, precision);
}

/**
 * Convert smallest units to display units (e.g., satoshis to BTC)
 *
 * @param amount - Amount in smallest units
 * @param precision - Decimal precision (e.g., 8 for BTC)
 * @returns Amount in display units
 */
export async function toDisplayUnits(amount: number, precision: number): Promise<number> {
    const wasm = await initWasm();
    return wasm.toDisplayUnits(amount, precision);
}

/**
 * Get SDK version
 */
export async function getVersion(): Promise<string> {
    const wasm = await initWasm();
    return wasm.getVersion();
}

/**
 * Get SDK name
 */
export async function getSdkName(): Promise<string> {
    const wasm = await initWasm();
    return wasm.getSdkName();
}
