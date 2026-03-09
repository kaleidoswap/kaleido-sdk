/**
 * Extended API Types
 *
 * Re-exports types from generated API types for easier consumption.
 * This file extracts operation types (request/response) from the generated
 * OpenAPI types and exports them with simpler names.
 */

import type { operations, components } from './generated/api-types.js';

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

// Market API Types
export type MarketListAssetsResponse = ResponseSuccess<'list_assets_api_v1_market_assets_get'>;
export type ListPairsResponse = ResponseSuccess<'get_pairs_api_v1_market_pairs_get'>;
export type GetQuoteRequest = RequestBody<'get_quote_api_v1_market_quote_post'>;
export type GetQuoteResponse = ResponseSuccess<'get_quote_api_v1_market_quote_post'>;
export type GetPairRoutesRequest = RequestBody<'get_pair_routes_api_v1_market_pairs_routes_post'>;
export type GetPairRoutesResponse =
    ResponseSuccess<'get_pair_routes_api_v1_market_pairs_routes_post'>;
export type DiscoverRoutesRequest = RequestBody<'discover_routes_api_v1_market_routes_post'>;
export type DiscoverRoutesResponse = ResponseSuccess<'discover_routes_api_v1_market_routes_post'>;
export type GetRouteMatrixResponse =
    ResponseSuccess<'get_route_matrix_api_v1_market_routes_matrix_get'>;

// Swap Order API Types
export type CreateSwapOrderRequest = RequestBody<'create_swap_order_api_v1_swaps_orders_post'>;
export type CreateSwapOrderResponse = ResponseSuccess<'create_swap_order_api_v1_swaps_orders_post'>;
export type GetSwapOrderStatusRequest =
    RequestBody<'get_swap_order_status_api_v1_swaps_orders_status_post'>;
export type GetSwapOrderStatusResponse =
    ResponseSuccess<'get_swap_order_status_api_v1_swaps_orders_status_post'>;
export type GetOrderHistoryResponse =
    ResponseSuccess<'get_order_history_api_v1_swaps_orders_history_get'>;
export type GetOrderStatsResponse =
    ResponseSuccess<'get_order_stats_api_v1_swaps_orders_analytics_get'>;
export type SwapOrderRateDecisionRequest =
    RequestBody<'handle_swap_order_rate_decision_api_v1_swaps_orders_rate_decision_post'>;
export type SwapOrderRateDecisionResponse =
    ResponseSuccess<'handle_swap_order_rate_decision_api_v1_swaps_orders_rate_decision_post'>;

// Atomic Swap API Types
export type InitiateSwapRequest = RequestBody<'initiate_swap_api_v1_swaps_init_post'>;
export type InitiateSwapResponse = ResponseSuccess<'initiate_swap_api_v1_swaps_init_post'>;
export type ConfirmSwapRequest = RequestBody<'confirm_swap_api_v1_swaps_execute_post'>;
export type ConfirmSwapResponse = ResponseSuccess<'confirm_swap_api_v1_swaps_execute_post'>;
export type GetSwapStatusRequest = RequestBody<'get_swap_status_api_v1_swaps_atomic_status_post'>;
export type GetSwapStatusResponse =
    ResponseSuccess<'get_swap_status_api_v1_swaps_atomic_status_post'>;
export type GetNodeInfoResponse = ResponseSuccess<'get_node_info_api_v1_swaps_nodeinfo_get'>;

// LSPS1 API Types
export type GetLspInfoResponse = ResponseSuccess<'get_info_api_v1_lsps1_get_info_get'>;
export type GetLspNetworkInfoResponse =
    ResponseSuccess<'get_network_info_api_v1_lsps1_network_info_get'>;
export type CreateLspOrderRequest = RequestBody<'create_order_api_v1_lsps1_create_order_post'>;
export type CreateLspOrderResponse = ResponseSuccess<'create_order_api_v1_lsps1_create_order_post'>;
export type GetLspOrderRequest = RequestBody<'get_order_api_v1_lsps1_get_order_post'>;
export type GetLspOrderResponse = ResponseSuccess<'get_order_api_v1_lsps1_get_order_post'>;
export type EstimateLspFeesRequest = RequestBody<'estimate_fees_api_v1_lsps1_estimate_fees_post'>;
export type EstimateLspFeesResponse =
    ResponseSuccess<'estimate_fees_api_v1_lsps1_estimate_fees_post'>;
export type LspRateDecisionRequest =
    RequestBody<'handle_rate_decision_api_v1_lsps1_rate_decision_post'>;
export type LspRateDecisionResponse =
    ResponseSuccess<'handle_rate_decision_api_v1_lsps1_rate_decision_post'>;
export type RetryDeliveryRequest = RequestBody<'retry_delivery_api_v1_lsps1_retry_delivery_post'>;
export type RetryDeliveryResponse =
    ResponseSuccess<'retry_delivery_api_v1_lsps1_retry_delivery_post'>;

// Re-export commonly used schema types
// We don't export 'components' to avoid collision, but allow access via ApiComponents
export type ApiComponents = components;
export type Asset = components['schemas']['Asset'];
export type TradingPair = components['schemas']['TradingPair'];
export type Quote = components['schemas']['PairQuoteResponse'];
export type SwapOrder = components['schemas']['SwapOrder'];
export type SwapOrderStatus = components['schemas']['SwapOrderStatus'];
export type Layer = components['schemas']['Layer'];
export type ReceiverAddressFormat = components['schemas']['ReceiverAddressFormat'];

// Aliases for backward compatibility with types.ts
export type SwapOrderStatusResponse = GetSwapOrderStatusResponse;
export type OrderHistoryResponse = GetOrderHistoryResponse;
export type OrderStatsResponse = GetOrderStatsResponse;
export type LspInfo = GetLspInfoResponse;
export type NetworkInfo = GetLspNetworkInfoResponse;
