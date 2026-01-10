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
import type { QuoteResponse, QuoteRequest } from './ws-types.js';
import type { Layer } from './types.js';

/**
 * Options for waiting for swap completion
 */
export interface SwapCompletionOptions {
    timeout?: number;
    pollInterval?: number;
    onStatusUpdate?: (status: string) => void;
}

/**
 * Helper to handle openapi-fetch error responses
 */
function handleError(error: any): never {
    throw mapHttpError({
        status: error?.status || 500,
        statusText: 'API Error',
        data: error
    });
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

    async listAssets() {
        const { data, error } = await this.http.maker.GET('/api/v1/market/assets');
        if (error) handleError(error);
        return data;
    }

    async listPairs() {
        const { data, error } = await this.http.maker.GET('/api/v1/market/pairs');
        if (error) handleError(error);
        return data;
    }

    async getQuote(body: any): Promise<any> {
        // Note: OpenAPI spec expects nested structure but API may accept flat structure
        // Using 'any' until spec is clarified
        const { data, error } = await this.http.maker.POST('/api/v1/market/quote', { body });
        if (error) handleError(error);
        return data;
    }

    async getPairRoutes(body: {
        pair_id?: string;
        base_asset_id?: string;
        quote_asset_id?: string;
        pair_ticker?: string;
        base_ticker?: string;
        quote_ticker?: string;
    }) {
        const { data, error } = await this.http.maker.POST('/api/v1/market/pairs/routes', { body });
        if (error) handleError(error);
        return data;
    }

    async getMarketRoutes(body: any): Promise<any> {
        // Note: Using any temporarily - layers should be Layer enum type
        const { data, error } = await this.http.maker.POST('/api/v1/market/routes', { body });
        if (error) handleError(error);
        return data;
    }

    // Note: /api/v1/market/routes/matrix endpoint not in OpenAPI spec

    // ============================================================================
    // Swap Orders API - /api/v1/swaps/orders/*
    // ============================================================================

    async createSwapOrder(body: any) {
        const { data, error } = await this.http.maker.POST('/api/v1/swaps/orders', { body });
        if (error) handleError(error);
        return data;
    }

    async getSwapOrderStatus(body: { order_id: string }) {
        const { data, error } = await this.http.maker.POST('/api/v1/swaps/orders/status', { body });
        if (error) handleError(error);
        return data;
    }

    async getOrderHistory(params?: {
        status?: string;
        limit?: number;
        skip?: number;
    }) {
        const { data, error } = await this.http.maker.GET('/api/v1/swaps/orders/history', {
            params: params ? { query: params as any } : undefined
        });
        if (error) handleError(error);
        return data;
    }

    async getOrderAnalytics() {
        const { data, error } = await this.http.maker.GET('/api/v1/swaps/orders/analytics');
        if (error) handleError(error);
        return data;
    }

    async submitRateDecision(body: any) {
        const { data, error } = await this.http.maker.POST('/api/v1/swaps/orders/rate_decision', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Atomic Swaps API - /api/v1/swaps/*
    // ============================================================================

    async initSwap(body: any) {
        const { data, error } = await this.http.maker.POST('/api/v1/swaps/init', { body });
        if (error) handleError(error);
        return data;
    }

    async executeSwap(body: any) {
        const { data, error } = await this.http.maker.POST('/api/v1/swaps/execute', { body });
        if (error) handleError(error);
        return data;
    }

    async getAtomicSwapStatus(body: { payment_hash: string }) {
        const { data, error } = await this.http.maker.POST('/api/v1/swaps/atomic/status', { body });
        if (error) handleError(error);
        return data;
    }

    async getSwapNodeInfo() {
        const { data, error } = await this.http.maker.GET('/api/v1/swaps/nodeinfo');
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // LSPS1 API - /api/v1/lsps1/*
    // ============================================================================

    async getLspInfo(): Promise<any> {
        const { data, error } = await this.http.maker.GET('/api/v1/lsps1/get_info');
        if (error) handleError(error);
        return data;
    }

    async getLspNetworkInfo(): Promise<any> {
        const { data, error } = await this.http.maker.GET('/api/v1/lsps1/network_info');
        if (error) handleError(error);
        return data;
    }

    async createLspOrder(body: any) {
        const { data, error } = await this.http.maker.POST('/api/v1/lsps1/create_order', { body });
        if (error) handleError(error);
        return data;
    }

    async getLspOrder(body: { order_id: string }) {
        const { data, error } = await this.http.maker.POST('/api/v1/lsps1/get_order', { body });
        if (error) handleError(error);
        return data;
    }

    async estimateLspFees(body: any): Promise<any> {
        // Note: Actual endpoint requires full order details, not just channel_size_sat
        const { data, error } = await this.http.maker.POST('/api/v1/lsps1/estimate_fees', { body });
        if (error) handleError(error);
        return data;
    }

    async submitLspRateDecision(body: any) {
        const { data, error } = await this.http.maker.POST('/api/v1/lsps1/rate_decision', { body });
        if (error) handleError(error);
        return data;
    }

    async retryAssetDelivery(body: { order_id: string }) {
        const { data, error } = await this.http.maker.POST('/api/v1/lsps1/retry_delivery', { body });
        if (error) handleError(error);
        return data;
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
