/**
 * Market API Types
 *
 * Type definitions for the Kaleidoswap Maker/Market API.
 * Import these types when working with market operations: fetching assets,
 * getting quotes, managing trading pairs, creating swap orders, or
 * interacting with the LSPS1 liquidity service.
 *
 * @example
 * import type { GetQuoteRequest, GetQuoteResponse } from 'kaleidoswap-sdk/types/market';
 * import type { Asset, TradingPair, SwapOrder } from 'kaleidoswap-sdk/types/market';
 */

export type {
    // -------------------------------------------------------------------------
    // Schema types - common models used across market operations
    // -------------------------------------------------------------------------

    /** An asset available for trading (e.g. BTC, USDT) */
    Asset,

    /** A tradeable pair between two assets */
    TradingPair,

    /** A price quote for a swap */
    Quote,

    /** A swap order */
    SwapOrder,

    /** The status of a swap order */
    SwapOrderStatus,

    /** Network layers supported for asset transfers (e.g. "BTC_LN", "RGB_LN") */
    Layer,

    /** Receiver address formats (e.g. "BOLT11", "RGB_INVOICE") */
    ReceiverAddressFormat,

    /** Raw access to all API schema components for advanced usage */
    ApiComponents,

    // -------------------------------------------------------------------------
    // Market / Assets
    // -------------------------------------------------------------------------

    /** Response for listing all assets available on the market */
    MarketListAssetsResponse,

    /** Response for listing all trading pairs */
    ListPairsResponse,

    // -------------------------------------------------------------------------
    // Routes
    // -------------------------------------------------------------------------

    /** Request body for fetching routes for a specific pair */
    GetPairRoutesRequest,

    /** Response containing routes for a specific pair */
    GetPairRoutesResponse,

    /** Request body for discovering routes across the market */
    DiscoverRoutesRequest,

    /** Response containing discovered routes */
    DiscoverRoutesResponse,

    /** Response for the full route matrix */
    GetRouteMatrixResponse,

    // -------------------------------------------------------------------------
    // Quotes
    // -------------------------------------------------------------------------

    /** Request body for getting a price quote */
    GetQuoteRequest,

    /** Response containing a price quote */
    GetQuoteResponse,

    // -------------------------------------------------------------------------
    // Swap Orders
    // -------------------------------------------------------------------------

    /** Request body for creating a new swap order */
    CreateSwapOrderRequest,

    /** Response after a swap order is created */
    CreateSwapOrderResponse,

    /** Request body for checking the status of a swap order */
    GetSwapOrderStatusRequest,

    /** Response containing the current status of a swap order */
    GetSwapOrderStatusResponse,

    /** Response containing the order history list */
    GetOrderHistoryResponse,

    /** Response containing order analytics/statistics */
    GetOrderStatsResponse,

    /** Request body for submitting a rate decision on a swap order */
    SwapOrderRateDecisionRequest,

    /** Response after submitting a rate decision */
    SwapOrderRateDecisionResponse,

    // -------------------------------------------------------------------------
    // Atomic Swaps
    // -------------------------------------------------------------------------

    /** Request body for initiating an atomic swap */
    InitiateSwapRequest,

    /** Response after initiating an atomic swap */
    InitiateSwapResponse,

    /** Request body for confirming/executing an atomic swap */
    ConfirmSwapRequest,

    /** Response after confirming an atomic swap */
    ConfirmSwapResponse,

    /** Request body for checking atomic swap status */
    GetSwapStatusRequest,

    /** Response containing the current atomic swap status */
    GetSwapStatusResponse,

    /** Response containing the maker's node info */
    GetNodeInfoResponse,

    // -------------------------------------------------------------------------
    // LSPS1 - Liquidity Service
    // -------------------------------------------------------------------------

    /** Response containing LSP service information */
    GetLspInfoResponse,

    /** Response containing LSP network information */
    GetLspNetworkInfoResponse,

    /** Request body for creating an LSP channel order */
    CreateLspOrderRequest,

    /** Response after creating an LSP channel order */
    CreateLspOrderResponse,

    /** Request body for fetching an existing LSP order */
    GetLspOrderRequest,

    /** Response containing the LSP order details */
    GetLspOrderResponse,

    /** Request body for estimating LSP fees */
    EstimateLspFeesRequest,

    /** Response containing the estimated LSP fees */
    EstimateLspFeesResponse,

    /** Request body for submitting a rate decision on an LSP order */
    LspRateDecisionRequest,

    /** Response after submitting an LSP rate decision */
    LspRateDecisionResponse,

    /** Request body for retrying asset delivery */
    RetryDeliveryRequest,

    /** Response after requesting an asset delivery retry */
    RetryDeliveryResponse,

    // -------------------------------------------------------------------------
    // Backward compatibility aliases
    // -------------------------------------------------------------------------

    /** @deprecated Use GetSwapOrderStatusResponse */
    SwapOrderStatusResponse,

    /** @deprecated Use GetOrderHistoryResponse */
    OrderHistoryResponse,

    /** @deprecated Use GetOrderStatsResponse */
    OrderStatsResponse,

    /** @deprecated Use GetLspInfoResponse */
    LspInfo,

    /** @deprecated Use GetLspNetworkInfoResponse */
    NetworkInfo,
} from '../api-types-ext.js';
