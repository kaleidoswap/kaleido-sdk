/**
 * Re-exports from generated API types and operation payloads.
 */

import type { operations, components } from './generated/api-types.js';

// Re-export enums as values (type + runtime)
export {
    BitcoinNetwork,
    Layer,
    OrderState,
    PaymentState,
    PaymentStatus,
    ReceiverAddressFormat,
    SwapOrderStatus,
    SwapStatus,
} from './generated/api-types.js';

// Helper types (internal)
type RequestBody<T extends keyof operations> = operations[T] extends {
    requestBody?: { content: { 'application/json': infer R } };
}
    ? R
    : never;

type ResponseSuccess<T extends keyof operations> = operations[T] extends {
    responses: { 200: { content: { 'application/json': infer R } } };
}
    ? R
    : operations[T] extends { responses: { 201: { content: { 'application/json': infer R } } } }
      ? R
      : never;

// ============================================================================
// Market API Operation Types  (Python-matching primary names)
// ============================================================================

// Market / Assets
export type AssetsResponse = ResponseSuccess<'getMarketAssets'>;
export type TradingPairsResponse = ResponseSuccess<'getMarketPairs'>;

// Quotes
export type PairQuoteRequest = RequestBody<'requestMarketQuote'>;
export type PairQuoteResponse = ResponseSuccess<'requestMarketQuote'>;

// Routes
export type RoutesRequest = RequestBody<'getMarketPairRoutes'>;
export type RoutesResponse = ResponseSuccess<'getMarketPairRoutes'>;
export type DiscoverRoutesRequest = RequestBody<'discoverMarketRoutes'>;
export type DiscoverRoutesResponse = ResponseSuccess<'discoverMarketRoutes'>;
export type ReachabilityMatrixResponse = ResponseSuccess<'getMarketRouteMatrix'>;

// Swap Orders
export type CreateSwapOrderRequest = RequestBody<'createSwapOrder'>;
export type CreateSwapOrderResponse = ResponseSuccess<'createSwapOrder'>;
export type SwapOrderStatusRequest = RequestBody<'getSwapOrderStatus'>;
export type SwapOrderStatusResponse = ResponseSuccess<'getSwapOrderStatus'>;
export type OrderHistoryResponse = ResponseSuccess<'listSwapOrderHistory'>;
export type OrderStatsResponse = ResponseSuccess<'getSwapOrderAnalytics'>;
export type SwapOrderRateDecisionRequest = RequestBody<'submitSwapOrderRateDecision'>;
export type SwapOrderRateDecisionResponse = ResponseSuccess<'submitSwapOrderRateDecision'>;

// Atomic Swaps
export type SwapRequest = RequestBody<'initiateAtomicSwap'>;
export type SwapResponse = ResponseSuccess<'initiateAtomicSwap'>;
export type ConfirmSwapRequest = RequestBody<'executeAtomicSwap'>;
export type ConfirmSwapResponse = ResponseSuccess<'executeAtomicSwap'>;
export type SwapStatusRequest = RequestBody<'getAtomicSwapStatus'>;
export type SwapStatusResponse = ResponseSuccess<'getAtomicSwapStatus'>;
export type SwapNodeInfoResponse = ResponseSuccess<'getSwapNodeInfo'>;

// LSPS1 - Liquidity Service
export type LspInfoResponse = ResponseSuccess<'getLspInfo'>;
export type NetworkInfoResponse = ResponseSuccess<'getLspNetworkInfo'>;
export type CreateOrderRequest = RequestBody<'createLspOrder'>;
export type ChannelOrderResponse = ResponseSuccess<'createLspOrder'>;
export type OrderRequest = RequestBody<'getLspOrder'>;
export type GetLspOrderResponse = ResponseSuccess<'getLspOrder'>;
export type EstimateLspFeesRequest = RequestBody<'estimateLspFees'>;
export type EstimateLspFeesResponse = ResponseSuccess<'estimateLspFees'>;
export type RateDecisionRequest = RequestBody<'submitLspRateDecision'>;
export type RateDecisionResponse = ResponseSuccess<'submitLspRateDecision'>;

// ============================================================================
// Schema types (matching Python SDK exports)
// ============================================================================

export type ApiComponents = components;
export type AssetResponseModel = components['schemas']['AssetResponseModel'];
export type TradingPairResponseModel = components['schemas']['TradingPairResponseModel'];
export type Quote = components['schemas']['PairQuoteResponse'];
export type SwapOrder = components['schemas']['SwapOrder'];

// Sub-schema types
export type Swap = components['schemas']['Swap'];
export type TradableAssetResponseModel = components['schemas']['TradableAssetResponseModel'];
export type TradingLimits = components['schemas']['TradingLimits'];
export type MultiHopRoute = components['schemas']['MultiHopRoute'];
export type RouteStep = components['schemas']['RouteStep'];
export type SwapLeg = components['schemas']['SwapLeg'];
export type SwapLegInput = components['schemas']['SwapLegInput'];
export type SwapRoute = components['schemas']['SwapRoute'];
export type ReceiverAddress = components['schemas']['ReceiverAddress'];
export type OrderHistorySummary = components['schemas']['OrderHistorySummary'];
export type PaginationMeta = components['schemas']['PaginationMeta'];
export type EstimateFeesResponse = components['schemas']['EstimateFeesResponse'];
export type ChannelDetails = components['schemas']['ChannelDetails'];
export type PaymentDetails = components['schemas']['PaymentDetails'];
export type PaymentBolt11 = components['schemas']['PaymentBolt11'];
export type PaymentOnchain = components['schemas']['PaymentOnchain'];
