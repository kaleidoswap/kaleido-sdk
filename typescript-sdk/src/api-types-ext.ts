/**
 * Extended API Types
 *
 * Re-exports types from generated API types for easier consumption.
 * This file extracts operation types (request/response) from the generated
 * OpenAPI types and exports them with simpler names matching the Python SDK.
 */

import type { operations, components } from './generated/api-types.js';

// Re-export enums as values (type + runtime) — mirrors Python StrEnum exports
export {
    AssetDeliveryStatus,
    BitcoinNetwork,
    Layer,
    OrderState,
    PaymentState,
    PaymentStatus,
    ReceiverAddressFormat,
    RetryDeliveryStatus,
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
export type AssetsResponse = ResponseSuccess<'list_assets_api_v1_market_assets_get'>;
export type TradingPairsResponse = ResponseSuccess<'get_pairs_api_v1_market_pairs_get'>;

// Quotes
export type PairQuoteRequest = RequestBody<'get_quote_api_v1_market_quote_post'>;
export type PairQuoteResponse = ResponseSuccess<'get_quote_api_v1_market_quote_post'>;

// Routes
export type RoutesRequest = RequestBody<'get_pair_routes_api_v1_market_pairs_routes_post'>;
export type RoutesResponse = ResponseSuccess<'get_pair_routes_api_v1_market_pairs_routes_post'>;
export type DiscoverRoutesRequest = RequestBody<'discover_routes_api_v1_market_routes_post'>;
export type DiscoverRoutesResponse = ResponseSuccess<'discover_routes_api_v1_market_routes_post'>;
export type ReachabilityMatrixResponse =
    ResponseSuccess<'get_route_matrix_api_v1_market_routes_matrix_get'>;

// Swap Orders
export type CreateSwapOrderRequest = RequestBody<'create_swap_order_api_v1_swaps_orders_post'>;
export type CreateSwapOrderResponse = ResponseSuccess<'create_swap_order_api_v1_swaps_orders_post'>;
export type SwapOrderStatusRequest =
    RequestBody<'get_swap_order_status_api_v1_swaps_orders_status_post'>;
export type SwapOrderStatusResponse =
    ResponseSuccess<'get_swap_order_status_api_v1_swaps_orders_status_post'>;
export type OrderHistoryResponse =
    ResponseSuccess<'get_order_history_api_v1_swaps_orders_history_get'>;
export type OrderStatsResponse =
    ResponseSuccess<'get_order_stats_api_v1_swaps_orders_analytics_get'>;
export type SwapOrderRateDecisionRequest =
    RequestBody<'handle_swap_order_rate_decision_api_v1_swaps_orders_rate_decision_post'>;
export type SwapOrderRateDecisionResponse =
    ResponseSuccess<'handle_swap_order_rate_decision_api_v1_swaps_orders_rate_decision_post'>;

// Atomic Swaps
export type SwapRequest = RequestBody<'initiate_swap_api_v1_swaps_init_post'>;
export type SwapResponse = ResponseSuccess<'initiate_swap_api_v1_swaps_init_post'>;
export type ConfirmSwapRequest = RequestBody<'confirm_swap_api_v1_swaps_execute_post'>;
export type ConfirmSwapResponse = ResponseSuccess<'confirm_swap_api_v1_swaps_execute_post'>;
export type SwapStatusRequest = RequestBody<'get_swap_status_api_v1_swaps_atomic_status_post'>;
export type SwapStatusResponse = ResponseSuccess<'get_swap_status_api_v1_swaps_atomic_status_post'>;
export type SwapNodeInfoResponse = ResponseSuccess<'get_node_info_api_v1_swaps_nodeinfo_get'>;

// LSPS1 - Liquidity Service
export type GetInfoResponseModel = ResponseSuccess<'get_info_api_v1_lsps1_get_info_get'>;
export type NetworkInfoResponse = ResponseSuccess<'get_network_info_api_v1_lsps1_network_info_get'>;
export type CreateOrderRequest = RequestBody<'create_order_api_v1_lsps1_create_order_post'>;
export type ChannelOrderResponse = ResponseSuccess<'create_order_api_v1_lsps1_create_order_post'>;
export type GetOrderRequest = RequestBody<'get_order_api_v1_lsps1_get_order_post'>;
export type GetLspOrderResponse = ResponseSuccess<'get_order_api_v1_lsps1_get_order_post'>;
export type EstimateLspFeesRequest = RequestBody<'estimate_fees_api_v1_lsps1_estimate_fees_post'>;
export type EstimateLspFeesResponse =
    ResponseSuccess<'estimate_fees_api_v1_lsps1_estimate_fees_post'>;
export type RateDecisionRequest =
    RequestBody<'handle_rate_decision_api_v1_lsps1_rate_decision_post'>;
export type RateDecisionResponse =
    ResponseSuccess<'handle_rate_decision_api_v1_lsps1_rate_decision_post'>;
export type RetryDeliveryRequest = RequestBody<'retry_delivery_api_v1_lsps1_retry_delivery_post'>;
export type RetryDeliveryResponse =
    ResponseSuccess<'retry_delivery_api_v1_lsps1_retry_delivery_post'>;

// ============================================================================
// Schema types (matching Python SDK exports)
// ============================================================================

export type ApiComponents = components;
export type Asset = components['schemas']['Asset'];
export type TradingPair = components['schemas']['TradingPair'];
export type Quote = components['schemas']['PairQuoteResponse'];
export type SwapOrder = components['schemas']['SwapOrder'];

// Sub-schema types
export type Swap = components['schemas']['Swap'];
export type TradableAsset = components['schemas']['TradableAsset'];
export type TradingLimits = components['schemas']['TradingLimits'];
export type MultiHopRoute = components['schemas']['MultiHopRoute'];
export type RouteStep = components['schemas']['RouteStep'];
export type SwapLeg = components['schemas']['SwapLeg'];
export type SwapLegInput = components['schemas']['SwapLegInput'];
export type SwapRoute = components['schemas']['SwapRoute'];
export type ReceiverAddress = components['schemas']['ReceiverAddress'];
export type OrderHistorySummary = components['schemas']['OrderHistorySummary'];
export type PaginationMeta = components['schemas']['PaginationMeta'];
export type ChannelFees = components['schemas']['ChannelFees'];
export type ChannelDetails = components['schemas']['ChannelDetails'];
export type PaymentDetails = components['schemas']['PaymentDetails'];
export type PaymentBolt11 = components['schemas']['PaymentBolt11'];
export type PaymentOnchain = components['schemas']['PaymentOnchain'];
