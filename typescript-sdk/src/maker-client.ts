/**
 * Maker Client - Market Operations
 *
 * Type-safe client matching the exact OpenAPI specification.
 * All methods correspond directly to actual API endpoints.
 */

import { HttpClient } from './http-client.js';
import { toRawAmount, toDisplayAmount } from './utils/index.js';
import { assertResponse } from './errors.js';
import { WSClient } from './ws-client.js';
import { createLogger, LogState } from './logging.js';
import type { ComponentLogger } from './logging.js';
import type { QuoteResponse } from './types/ws.js';
import type { Layer } from './api-types-ext.js';
import type {
    AssetsResponse,
    TradingPairsResponse,
    PairQuoteRequest,
    PairQuoteResponse,
    RoutesRequest,
    RoutesResponse,
    DiscoverRoutesRequest,
    DiscoverRoutesResponse,
    CreateSwapOrderRequest,
    CreateSwapOrderResponse,
    SwapOrderStatusRequest,
    SwapOrderStatusResponse,
    OrderHistoryResponse,
    OrderStatsResponse,
    SwapOrderRateDecisionRequest,
    SwapOrderRateDecisionResponse,
    SwapRequest,
    SwapResponse,
    ConfirmSwapRequest,
    ConfirmSwapResponse,
    SwapStatusRequest,
    SwapStatusResponse,
    SwapNodeInfoResponse,
    GetInfoResponseModel,
    NetworkInfoResponse,
    CreateOrderRequest,
    ChannelOrderResponse,
    GetOrderRequest,
    GetLspOrderResponse,
    EstimateLspFeesRequest,
    EstimateLspFeesResponse,
    RateDecisionRequest,
    RateDecisionResponse,
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

export class MakerClient {
    private http: HttpClient;
    private ws?: WSClient;
    private readonly _log: ComponentLogger;
    private readonly _logState: LogState;

    constructor(http: HttpClient, logState: LogState = new LogState()) {
        this.http = http;
        this._logState = logState;
        this._log = createLogger('maker', logState);
    }

    // ============================================================================
    // WebSocket Support
    // ============================================================================

    /**
     * Enable WebSocket for real-time updates
     *
     * @param wsUrl - WebSocket server URL (e.g. ws://localhost:8000/ws)
     * @param userId - Optional client/user UUID for the path .../ws/<userId>. If not provided, the client generates one.
     * @returns WSClient instance (use ws.clientId to read the UUID used)
     */
    enableWebSocket(wsUrl: string, userId?: string): WSClient {
        this.ws = new WSClient({ url: wsUrl, userId }, this._logState);
        return this.ws;
    }

    /**
     * Stream real-time quote updates with automatic polling.
     *
     * The server sends one quote per request, so this function automatically
     * requests new quotes at the specified interval to provide continuous updates.
     *
     * Use this for monitoring price changes over time. For a single one-time quote,
     * use `getQuote()` instead (simpler HTTP request, no WebSocket needed).
     *
     * @param from_asset - Source asset ticker
     * @param to_asset - Destination asset ticker
     * @param from_amount - Amount to convert (in smallest units)
     * @param from_layer - Source layer
     * @param to_layer - Destination layer
     * @param onUpdate - Callback for quote updates
     * @param pollInterval - Milliseconds between quote requests (default: 2000)
     * @returns Stop function (stops polling and unsubscribes from updates)
     *
     * @example
     * ```typescript
     * const stop = await client.maker.streamQuotes(
     *   'BTC',
     *   'USDT',
     *   10000000, // 0.1 BTC
     *   'BTC_LN',
     *   'RGB_LN',
     *   (quote) => console.log('Quote:', quote),
     *   2000, // poll every 2 seconds
     * );
     *
     * // Quotes arrive every 2 seconds via callback
     * await new Promise(resolve => setTimeout(resolve, 30000));
     *
     * // Stop streaming
     * stop();
     * ```
     */
    async streamQuotes(
        from_asset: string,
        to_asset: string,
        from_amount: number | null,
        from_layer: Layer | null,
        to_layer: Layer | null,
        onUpdate: (quote: QuoteResponse) => void,
        pollInterval: number = 2000,
    ): Promise<() => void> {
        if (!this.ws) {
            throw new Error('WebSocket not enabled. Call enableWebSocket() first.');
        }

        if (!this.ws.isConnected()) {
            await this.ws.connect();
        }

        const normalizedFromAsset = from_asset.toUpperCase();
        const normalizedToAsset = to_asset.toUpperCase();
        const matchesRequestedQuote = (quote: QuoteResponse): boolean => {
            const fromLeg = quote.from_asset as
                | { ticker?: string; layer?: string }
                | string
                | undefined;
            const toLeg = quote.to_asset as
                | { ticker?: string; layer?: string }
                | string
                | undefined;

            const quoteFromTicker =
                typeof fromLeg === 'string'
                    ? fromLeg.toUpperCase()
                    : fromLeg?.ticker?.toUpperCase();
            const quoteToTicker =
                typeof toLeg === 'string' ? toLeg.toUpperCase() : toLeg?.ticker?.toUpperCase();
            const quoteFromLayer = typeof fromLeg === 'string' ? undefined : fromLeg?.layer;
            const quoteToLayer = typeof toLeg === 'string' ? undefined : toLeg?.layer;

            return (
                quoteFromTicker === normalizedFromAsset &&
                quoteToTicker === normalizedToAsset &&
                (from_layer == null || quoteFromLayer === from_layer) &&
                (to_layer == null || quoteToLayer === to_layer)
            );
        };

        const onMatchingQuote = (quote: QuoteResponse) => {
            if (matchesRequestedQuote(quote)) {
                onUpdate(quote);
            }
        };

        // Subscribe only to quotes matching this request.
        this.ws.on('quoteResponse', onMatchingQuote);

        // Quote request parameters
        const quoteParams = {
            from_asset: normalizedFromAsset,
            to_asset: normalizedToAsset,
            from_amount,
            to_amount: null as null,
            from_layer,
            to_layer,
        };

        this._log.info(
            'streamQuotes() started: %s -> %s pollInterval=%dms',
            normalizedFromAsset,
            normalizedToAsset,
            pollInterval,
        );

        // Send initial quote request
        this.ws.requestQuote(quoteParams);

        // Set up periodic polling for continuous quote updates
        let pollingTimer: ReturnType<typeof setInterval> | undefined;
        let stopped = false;

        pollingTimer = setInterval(() => {
            if (!stopped && this.ws && this.ws.isConnected()) {
                this.ws.requestQuote(quoteParams);
            }
        }, pollInterval);

        // Return stop function
        return () => {
            stopped = true;
            if (pollingTimer !== undefined) {
                clearInterval(pollingTimer);
                pollingTimer = undefined;
            }
            if (this.ws) {
                this.ws.off('quoteResponse', onMatchingQuote);
            }
            this._log.info(
                'streamQuotes() stopped: %s -> %s',
                normalizedFromAsset,
                normalizedToAsset,
            );
        };
    }

    /**
     * Get available routes for a trading pair by ticker symbols
     *
     * @example
     * ```typescript
     * const routes = await client.maker.getAvailableRoutes('BTC', 'USDT');
     * console.log('Available routes:', routes);
     * // [{ from_layer: 'BTC_LN', to_layer: 'RGB_LN' }, ...]
     * ```
     */
    async getAvailableRoutes(
        fromTicker: string,
        toTicker: string,
    ): Promise<Array<{ from_layer: string; to_layer: string }>> {
        const pairsResponse = await this.listPairs();

        // Find matching pair (case-insensitive) - try direct match first
        const pair = pairsResponse.pairs.find(
            (p) =>
                p.base.ticker.toUpperCase() === fromTicker.toUpperCase() &&
                p.quote.ticker.toUpperCase() === toTicker.toUpperCase(),
        );

        // If not found, try inverse pair
        if (!pair) {
            const inversePair = pairsResponse.pairs.find(
                (p) =>
                    p.base.ticker.toUpperCase() === toTicker.toUpperCase() &&
                    p.quote.ticker.toUpperCase() === fromTicker.toUpperCase(),
            );

            // If inverse pair found, swap the layers in the routes
            if (inversePair && inversePair.routes) {
                return inversePair.routes.map((route) => ({
                    from_layer: route.to_layer,
                    to_layer: route.from_layer,
                }));
            }
        }

        if (!pair || !pair.routes) {
            return [];
        }

        return pair.routes;
    }

    /**
     * Stream quotes using ticker symbols with automatic route discovery
     *
     * @param fromTicker - Source asset ticker
     * @param toTicker - Destination asset ticker
     * @param amount - Amount to convert (in smallest units)
     * @param onUpdate - Callback for quote updates
     * @param options - Optional settings including preferred layers and poll interval
     * @returns Stop function
     *
     * @example
     * ```typescript
     * // Stream quotes for BTC -> USDT using first available route
     * const stop = await client.maker.streamQuotesByTicker(
     *   'BTC',
     *   'USDT',
     *   10000000, // 0.1 BTC
     *   (quote) => console.log('Quote:', quote)
     * );
     *
     * // With preferred layers and custom poll interval
     * const stop2 = await client.maker.streamQuotesByTicker(
     *   'BTC',
     *   'USDT',
     *   10000000,
     *   (quote) => console.log('Quote:', quote),
     *   { preferredFromLayer: 'BTC_LN', preferredToLayer: 'RGB_LN', pollInterval: 3000 }
     * );
     * ```
     */
    async streamQuotesByTicker(
        fromTicker: string,
        toTicker: string,
        amount: number,
        onUpdate: (quote: QuoteResponse) => void,
        options?: {
            preferredFromLayer?: Layer;
            preferredToLayer?: Layer;
            pollInterval?: number;
        },
    ): Promise<() => void> {
        const routes = await this.getAvailableRoutes(fromTicker, toTicker);

        if (routes.length === 0) {
            throw new Error(
                `No routes found for ${fromTicker}/${toTicker}. Pair may not exist or is not active.`,
            );
        }

        // Find preferred route or use first available
        let selectedRoute = routes[0];
        if (options?.preferredFromLayer && options?.preferredToLayer) {
            const preferredRoute = routes.find(
                (r) =>
                    r.from_layer === options.preferredFromLayer &&
                    r.to_layer === options.preferredToLayer,
            );
            if (preferredRoute) {
                selectedRoute = preferredRoute;
            }
        }

        // Stream quotes using the selected route
        return this.streamQuotes(
            fromTicker.toUpperCase(),
            toTicker.toUpperCase(),
            amount,
            selectedRoute.from_layer as Layer,
            selectedRoute.to_layer as Layer,
            onUpdate,
            options?.pollInterval,
        );
    }

    /**
     * Stream quotes for all available routes of a trading pair
     *
     * @param fromTicker - Source asset ticker
     * @param toTicker - Destination asset ticker
     * @param amount - Amount to convert (in smallest units)
     * @param onUpdate - Callback receiving (routeKey, quote)
     * @param pollInterval - Milliseconds between quote requests (default: 2000)
     * @returns Map of route keys to stop functions
     *
     * @example
     * ```typescript
     * const stoppers = await client.maker.streamQuotesForAllRoutes(
     *   'BTC',
     *   'USDT',
     *   10000000,
     *   (route, quote) => {
     *     console.log(`Quote for ${route}:`, quote);
     *   }
     * );
     *
     * // Later: stop all routes
     * for (const stop of stoppers.values()) stop();
     * ```
     */
    async streamQuotesForAllRoutes(
        fromTicker: string,
        toTicker: string,
        amount: number,
        onUpdate: (route: string, quote: QuoteResponse) => void,
        pollInterval: number = 2000,
    ): Promise<Map<string, () => void>> {
        const routes = await this.getAvailableRoutes(fromTicker, toTicker);

        if (routes.length === 0) {
            throw new Error(
                `No routes found for ${fromTicker}/${toTicker}. Pair may not exist or is not active.`,
            );
        }

        const stoppers = new Map<string, () => void>();

        // Subscribe to each route
        for (const route of routes) {
            const routeKey = `${route.from_layer}->${route.to_layer}`;

            const stop = await this.streamQuotes(
                fromTicker.toUpperCase(),
                toTicker.toUpperCase(),
                amount,
                route.from_layer as Layer,
                route.to_layer as Layer,
                (quote) => onUpdate(routeKey, quote),
                pollInterval,
            );

            stoppers.set(routeKey, stop);
        }

        return stoppers;
    }

    // ============================================================================
    // Market API - /api/v1/market/*
    // ============================================================================

    async listAssets(): Promise<AssetsResponse> {
        this._log.debug('listAssets()');
        const result = assertResponse(await this.http.maker.GET('/api/v1/market/assets'));
        this._log.debug('listAssets() -> %d assets', result.assets?.length ?? 0);
        return result;
    }

    async listPairs(): Promise<TradingPairsResponse> {
        this._log.debug('listPairs()');
        const result = assertResponse(await this.http.maker.GET('/api/v1/market/pairs'));
        this._log.debug('listPairs() -> %d pairs', result.pairs?.length ?? 0);
        return result;
    }

    async getQuote(body: PairQuoteRequest): Promise<PairQuoteResponse> {
        this._log.debug('getQuote()');
        const result = assertResponse(await this.http.maker.POST('/api/v1/market/quote', { body }));
        this._log.info(
            'getQuote() -> rfq_id=%s price=%s expires_at=%s',
            result.rfq_id,
            result.price,
            result.expires_at,
        );
        return result;
    }

    async getPairRoutes(body: RoutesRequest): Promise<RoutesResponse> {
        this._log.debug('getPairRoutes()');
        return assertResponse(await this.http.maker.POST('/api/v1/market/pairs/routes', { body }));
    }

    async getMarketRoutes(body: DiscoverRoutesRequest): Promise<DiscoverRoutesResponse> {
        this._log.debug('getMarketRoutes()');
        return assertResponse(await this.http.maker.POST('/api/v1/market/routes', { body }));
    }

    // Note: /api/v1/market/routes/matrix endpoint not in OpenAPI spec

    // ============================================================================
    // Swap Orders API - /api/v1/swaps/orders/*
    // ============================================================================

    async createSwapOrder(body: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse> {
        this._log.info('createSwapOrder(): rfq_id=%s', body.rfq_id);
        const result = assertResponse(await this.http.maker.POST('/api/v1/swaps/orders', { body }));
        this._log.info('createSwapOrder() -> order_id=%s', result.id);
        return result;
    }

    async getSwapOrderStatus(body: SwapOrderStatusRequest): Promise<SwapOrderStatusResponse> {
        this._log.debug('getSwapOrderStatus(): order_id=%s', body.order_id);
        return assertResponse(await this.http.maker.POST('/api/v1/swaps/orders/status', { body }));
    }

    async getOrderHistory(params?: {
        status?: string;
        limit?: number;
        skip?: number;
    }): Promise<OrderHistoryResponse> {
        return assertResponse(
            await this.http.maker.GET('/api/v1/swaps/orders/history', {
                params: params ? { query: params as Record<string, unknown> } : undefined,
            }),
        );
    }

    async getOrderAnalytics(): Promise<OrderStatsResponse> {
        return assertResponse(await this.http.maker.GET('/api/v1/swaps/orders/analytics'));
    }

    async submitRateDecision(
        body: SwapOrderRateDecisionRequest,
    ): Promise<SwapOrderRateDecisionResponse> {
        return assertResponse(
            await this.http.maker.POST('/api/v1/swaps/orders/rate_decision', { body }),
        );
    }

    // ============================================================================
    // Atomic Swaps API - /api/v1/swaps/*
    // ============================================================================

    async initSwap(body: SwapRequest): Promise<SwapResponse> {
        this._log.info('initSwap(): rfq_id=%s', body.rfq_id);
        const result = assertResponse(await this.http.maker.POST('/api/v1/swaps/init', { body }));
        this._log.info('initSwap() -> payment_hash=%s', result.payment_hash);
        return result;
    }

    async executeSwap(body: ConfirmSwapRequest): Promise<ConfirmSwapResponse> {
        this._log.info('executeSwap(): payment_hash=%s', body.payment_hash);
        const result = assertResponse(
            await this.http.maker.POST('/api/v1/swaps/execute', { body }),
        );
        this._log.info('executeSwap() -> status=%s', result.status);
        return result;
    }

    async getAtomicSwapStatus(body: SwapStatusRequest): Promise<SwapStatusResponse> {
        this._log.debug('getAtomicSwapStatus()');
        return assertResponse(await this.http.maker.POST('/api/v1/swaps/atomic/status', { body }));
    }

    async getSwapNodeInfo(): Promise<SwapNodeInfoResponse> {
        return assertResponse(await this.http.maker.GET('/api/v1/swaps/nodeinfo'));
    }

    // ============================================================================
    // LSPS1 API - /api/v1/lsps1/*
    // ============================================================================

    async getLspInfo(): Promise<GetInfoResponseModel> {
        return assertResponse(await this.http.maker.GET('/api/v1/lsps1/get_info'));
    }

    async getLspNetworkInfo(): Promise<NetworkInfoResponse> {
        return assertResponse(await this.http.maker.GET('/api/v1/lsps1/network_info'));
    }

    async createLspOrder(body: CreateOrderRequest): Promise<ChannelOrderResponse> {
        return assertResponse(await this.http.maker.POST('/api/v1/lsps1/create_order', { body }));
    }

    async getLspOrder(body: GetOrderRequest): Promise<GetLspOrderResponse> {
        return assertResponse(await this.http.maker.POST('/api/v1/lsps1/get_order', { body }));
    }

    async estimateLspFees(body: EstimateLspFeesRequest): Promise<EstimateLspFeesResponse> {
        return assertResponse(await this.http.maker.POST('/api/v1/lsps1/estimate_fees', { body }));
    }

    async submitLspRateDecision(body: RateDecisionRequest): Promise<RateDecisionResponse> {
        return assertResponse(await this.http.maker.POST('/api/v1/lsps1/rate_decision', { body }));
    }

    async retryAssetDelivery(body: RetryDeliveryRequest): Promise<RetryDeliveryResponse> {
        return assertResponse(await this.http.maker.POST('/api/v1/lsps1/retry_delivery', { body }));
    }

    // ============================================================================
    // Convenience Methods
    // ============================================================================

    async waitForSwapCompletion(orderId: string, options: SwapCompletionOptions = {}) {
        const { timeout = 300000, pollInterval = 2000, onStatusUpdate } = options;
        const startTime = Date.now();

        this._log.info(
            'waitForSwapCompletion(): order_id=%s timeout=%ds',
            orderId,
            Math.round(timeout / 1000),
        );

        while (Date.now() - startTime < timeout) {
            try {
                const statusResponse = await this.getSwapOrderStatus({ order_id: orderId });
                const order = statusResponse.order;

                if (order) {
                    this._log.debug(
                        'waitForSwapCompletion() status poll: order_id=%s status=%s',
                        orderId,
                        order.status,
                    );

                    if (onStatusUpdate) {
                        onStatusUpdate(order.status);
                    }

                    if (
                        order.status === 'FILLED' ||
                        order.status === 'FAILED' ||
                        order.status === 'EXPIRED' ||
                        order.status === 'CANCELLED'
                    ) {
                        this._log.info(
                            'waitForSwapCompletion(): order_id=%s terminal state=%s',
                            orderId,
                            order.status,
                        );
                        return order;
                    }
                }
            } catch (error) {
                this._log.warn('waitForSwapCompletion() status check error: %s', error);
            }

            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        this._log.error(
            'waitForSwapCompletion(): order_id=%s timed out after %ds',
            orderId,
            Math.round(timeout / 1000),
        );
        throw new Error(`Swap completion timeout after ${timeout}ms for order ${orderId}`);
    }

    toRaw(amount: number, precision: number): number {
        return toRawAmount(amount, precision);
    }

    toDisplay(rawAmount: number, precision: number): number {
        return toDisplayAmount(rawAmount, precision);
    }
}
