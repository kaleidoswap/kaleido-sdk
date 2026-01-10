/**
 * Extended API Types
 * 
 * Re-exports types from generated API types for easier consumption.
 * This file extracts operation types (request/response) from the generated
 * OpenAPI types and exports them with simpler names.
 */

import type { operations, components } from './generated/api-types.js';

// Helper types (internal)
type RequestBody<T extends keyof operations> =
    operations[T] extends { requestBody?: { content: { 'application/json': infer R } } }
    ? R
    : never;

type ResponseSuccess<T extends keyof operations> =
    operations[T] extends { responses: { 200: { content: { 'application/json': infer R } } } }
    ? R
    : operations[T] extends { responses: { 201: { content: { 'application/json': infer R } } } }
    ? R
    : never;

// Market API Types
export type MarketListAssetsResponse = ResponseSuccess<'list_assets'>;
export type ListPairsResponse = ResponseSuccess<'get_pairs'>;
export type GetQuoteRequest = RequestBody<'get_quote'>;
export type GetQuoteResponse = ResponseSuccess<'get_quote'>;
export type GetPairRoutesRequest = RequestBody<'get_pair_routes'>;
export type GetPairRoutesResponse = ResponseSuccess<'get_pair_routes'>;
export type DiscoverRoutesRequest = RequestBody<'discover_routes'>;
export type DiscoverRoutesResponse = ResponseSuccess<'discover_routes'>;
export type GetRouteMatrixResponse = ResponseSuccess<'get_route_matrix'>;

// Swap Order API Types
export type CreateSwapOrderRequest = RequestBody<'create_swap_order'>;
export type CreateSwapOrderResponse = ResponseSuccess<'create_swap_order'>;
export type GetSwapOrderStatusRequest = RequestBody<'get_swap_order_status'>;
export type GetSwapOrderStatusResponse = ResponseSuccess<'get_swap_order_status'>;
export type GetOrderHistoryResponse = ResponseSuccess<'get_order_history'>;
export type GetOrderStatsResponse = ResponseSuccess<'get_order_stats'>;
export type SwapOrderRateDecisionRequest = RequestBody<'handle_swap_order_rate_decision'>;
export type SwapOrderRateDecisionResponse = ResponseSuccess<'handle_swap_order_rate_decision'>;

// Atomic Swap API Types
export type InitiateSwapRequest = RequestBody<'initiate_swap'>;
export type InitiateSwapResponse = ResponseSuccess<'initiate_swap'>;
export type ConfirmSwapRequest = RequestBody<'confirm_swap'>;
export type ConfirmSwapResponse = ResponseSuccess<'confirm_swap'>;
export type GetSwapStatusRequest = RequestBody<'get_swap_status'>;
export type GetSwapStatusResponse = ResponseSuccess<'get_swap_status'>;
export type GetNodeInfoResponse = ResponseSuccess<'get_node_info'>;

// LSPS1 API Types
export type GetLspInfoResponse = ResponseSuccess<'get_info'>;
export type GetLspNetworkInfoResponse = ResponseSuccess<'get_network_info'>;
export type CreateLspOrderRequest = RequestBody<'create_order'>;
export type CreateLspOrderResponse = ResponseSuccess<'create_order'>;
export type GetLspOrderRequest = RequestBody<'get_order'>;
export type GetLspOrderResponse = ResponseSuccess<'get_order'>;
export type EstimateLspFeesRequest = RequestBody<'estimate_fees'>;
export type EstimateLspFeesResponse = ResponseSuccess<'estimate_fees'>;
export type LspRateDecisionRequest = RequestBody<'handle_rate_decision'>;
export type LspRateDecisionResponse = ResponseSuccess<'handle_rate_decision'>;
export type RetryDeliveryRequest = RequestBody<'retry_delivery'>;
export type RetryDeliveryResponse = ResponseSuccess<'retry_delivery'>;

// Re-export commonly used schema types
// We don't export 'components' to avoid collision, but allow access via ApiComponents
export type ApiComponents = components;
export type Asset = components['schemas']['Asset'];
export type TradingPair = components['schemas']['TradingPair'];
export type Quote = components['schemas']['PairQuoteResponse'];
export type SwapOrder = components['schemas']['SwapOrder'];
export type SwapOrderStatus = components['schemas']['SwapOrderStatus'];
export type Layer = components['schemas']['Layer'];

// Aliases for backward compatibility with types.ts
export type SwapOrderStatusResponse = GetSwapOrderStatusResponse;
export type OrderHistoryResponse = GetOrderHistoryResponse;
export type OrderStatsResponse = GetOrderStatsResponse;
export type LspInfo = GetLspInfoResponse;
export type NetworkInfo = GetLspNetworkInfoResponse;
