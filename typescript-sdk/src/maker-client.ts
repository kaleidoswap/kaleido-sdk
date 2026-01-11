/**
 * Maker Client - Market Operations
 * 
 * Type-safe client matching the exact OpenAPI specification.
 * All methods correspond directly to actual API endpoints.
 */

import { HttpClient } from './http-client.js';
import { toRawAmount, toDisplayAmount } from './utils/index.js';
import { mapHttpError } from './errors.js';
import { WSClient } from './ws-client.js';
import type { QuoteResponse } from './ws-types.js';
import type { Layer } from './types.js';
import type {
    MarketListAssetsResponse,
    ListPairsResponse,
    GetQuoteRequest,
    GetQuoteResponse,
    GetPairRoutesRequest,
    GetPairRoutesResponse,
    DiscoverRoutesRequest,
    DiscoverRoutesResponse,

    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    GetSwapOrderStatusRequest,
    GetSwapOrderStatusResponse,
    GetOrderHistoryResponse,
    GetOrderStatsResponse,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,
    InitiateSwapRequest,
    InitiateSwapResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    GetSwapStatusRequest,
    GetSwapStatusResponse,
    GetNodeInfoResponse,
    GetLspInfoResponse,
    GetLspNetworkInfoResponse,
    CreateLspOrderRequest,
    CreateLspOrderResponse,
    GetLspOrderRequest,
    GetLspOrderResponse,
    EstimateLspFeesRequest,
    EstimateLspFeesResponse,
    LspRateDecisionRequest,
    LspRateDecisionResponse,
    RetryDeliveryRequest,
    RetryDeliveryResponse,
} from './api-types-ext.js';

/**
 * Options for waiting for swap completion
 */
export interface SwapCompletionOptions {
    timeout?: number;
    pollInterval?: number;
    onStatusUpdate?: (status: string) => void;
}

/**
 * Unwrap openapi-fetch response - returns data or throws error
 * This eliminates non-null assertions throughout the codebase
 */
function unwrapResponse<T>(result: { data?: T; error?: unknown }): T {
    if (result.error) {
        const err = result.error as { status?: number };
        throw mapHttpError({
            status: err?.status || 500,
            statusText: 'API Error',
            data: result.error,
        });
    }
    // At this point, data must exist since there's no error
    return result.data as T;
}

export class MakerClient {
    private http: HttpClient;
    private ws?: WSClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    // ============================================================================
    // WebSocket Support
    // ============================================================================

    /**
     * Enable WebSocket for real-time updates
     */
    enableWebSocket(wsUrl: string): WSClient {
        this.ws = new WSClient({ url: wsUrl });
        return this.ws;
    }

    /**
     * Stream real-time quote updates
     * 
     * @example
     * ```typescript
     * const unsubscribe = await client.maker.streamQuotes(
     *   'btc',
     *   'usdt',
     *   10000000, // 0.1 BTC
     *   'BTC_LN',
     *   'RGB_LN',
     *   (quote) => console.log('Quote:', quote)
     * );
     * 
     * // Later: unsubscribe();
     * ```
     */
    async streamQuotes(
        from_asset: string,
        to_asset: string,
        from_amount: number | null,
        from_layer: Layer | null,
        to_layer: Layer | null,
        onUpdate: (quote: QuoteResponse) => void
    ): Promise<() => void> {
        if (!this.ws) {
            throw new Error('WebSocket not enabled. Call enableWebSocket() first.');
        }

        if (!this.ws.isConnected()) {
            await this.ws.connect();
        }

        // Subscribe to quote updates
        this.ws.on('quoteResponse', onUpdate);

        // Send initial quote request
        this.ws.requestQuote({
            from_asset,
            to_asset,
            from_amount,
            to_amount: null,
            from_layer,
            to_layer,
        });

        // Return unsubscribe function
        return () => {
            if (this.ws) {
                this.ws.off('quoteResponse', onUpdate);
            }
        };
    }

    // ============================================================================
    // Market API - /api/v1/market/*
    // ============================================================================

    async listAssets(): Promise<MarketListAssetsResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/market/assets'));
    }

    async listPairs(): Promise<ListPairsResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/market/pairs'));
    }

    async getQuote(body: GetQuoteRequest): Promise<GetQuoteResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/market/quote', { body }));
    }

    async getPairRoutes(body: GetPairRoutesRequest): Promise<GetPairRoutesResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/market/pairs/routes', { body }));
    }

    async getMarketRoutes(body: DiscoverRoutesRequest): Promise<DiscoverRoutesResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/market/routes', { body }));
    }

    // Note: /api/v1/market/routes/matrix endpoint not in OpenAPI spec

    // ============================================================================
    // Swap Orders API - /api/v1/swaps/orders/*
    // ============================================================================

    async createSwapOrder(body: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/swaps/orders', { body }));
    }

    async getSwapOrderStatus(body: GetSwapOrderStatusRequest): Promise<GetSwapOrderStatusResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/swaps/orders/status', { body }));
    }

    async getOrderHistory(params?: {
        status?: string;
        limit?: number;
        skip?: number;
    }): Promise<GetOrderHistoryResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/swaps/orders/history', {
            params: params ? { query: params as Record<string, unknown> } : undefined
        }));
    }

    async getOrderAnalytics(): Promise<GetOrderStatsResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/swaps/orders/analytics'));
    }

    async submitRateDecision(body: SwapOrderRateDecisionRequest): Promise<SwapOrderRateDecisionResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/swaps/orders/rate_decision', { body }));
    }

    // ============================================================================
    // Atomic Swaps API - /api/v1/swaps/*
    // ============================================================================

    async initSwap(body: InitiateSwapRequest): Promise<InitiateSwapResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/swaps/init', { body }));
    }

    async executeSwap(body: ConfirmSwapRequest): Promise<ConfirmSwapResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/swaps/execute', { body }));
    }

    async getAtomicSwapStatus(body: GetSwapStatusRequest): Promise<GetSwapStatusResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/swaps/atomic/status', { body }));
    }

    async getSwapNodeInfo(): Promise<GetNodeInfoResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/swaps/nodeinfo'));
    }

    // ============================================================================
    // LSPS1 API - /api/v1/lsps1/*
    // ============================================================================

    async getLspInfo(): Promise<GetLspInfoResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/lsps1/get_info'));
    }

    async getLspNetworkInfo(): Promise<GetLspNetworkInfoResponse> {
        return unwrapResponse(await this.http.maker.GET('/api/v1/lsps1/network_info'));
    }

    async createLspOrder(body: CreateLspOrderRequest): Promise<CreateLspOrderResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/lsps1/create_order', { body }));
    }

    async getLspOrder(body: GetLspOrderRequest): Promise<GetLspOrderResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/lsps1/get_order', { body }));
    }

    async estimateLspFees(body: EstimateLspFeesRequest): Promise<EstimateLspFeesResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/lsps1/estimate_fees', { body }));
    }

    async submitLspRateDecision(body: LspRateDecisionRequest): Promise<LspRateDecisionResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/lsps1/rate_decision', { body }));
    }

    async retryAssetDelivery(body: RetryDeliveryRequest): Promise<RetryDeliveryResponse> {
        return unwrapResponse(await this.http.maker.POST('/api/v1/lsps1/retry_delivery', { body }));
    }

    // ============================================================================
    // Convenience Methods
    // ============================================================================

    async waitForSwapCompletion(
        orderId: string,
        options: SwapCompletionOptions = {},
    ) {
        const { timeout = 300000, pollInterval = 2000, onStatusUpdate } = options;
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const statusResponse = await this.getSwapOrderStatus({ order_id: orderId });
                const order = statusResponse.order;

                if (order && onStatusUpdate) {
                    onStatusUpdate(order.status);
                }

                if (order && (
                    order.status === 'FILLED' ||
                    order.status === 'FAILED' ||
                    order.status === 'EXPIRED' ||
                    order.status === 'CANCELLED'
                )) {
                    return order;
                }
            } catch (error) {
                console.warn('Error checking swap status:', error);
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error(`Swap completion timeout after ${timeout}ms for order ${orderId}`);
    }

    toRaw(amount: number, precision: number): number {
        return toRawAmount(amount, precision);
    }

    toDisplay(rawAmount: number, precision: number): number {
        return toDisplayAmount(rawAmount, precision);
    }
}
