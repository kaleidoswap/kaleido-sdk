/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { CreateSwapOrderRequest } from '../models/CreateSwapOrderRequest';
import type { CreateSwapOrderResponse } from '../models/CreateSwapOrderResponse';
import type { OrderHistoryResponse } from '../models/OrderHistoryResponse';
import type { OrderStatsResponse } from '../models/OrderStatsResponse';
import type { SwapOrderRateDecisionRequest } from '../models/SwapOrderRateDecisionRequest';
import type { SwapOrderRateDecisionResponse } from '../models/SwapOrderRateDecisionResponse';
import type { SwapOrderStatus } from '../models/SwapOrderStatus';
import type { SwapOrderStatusRequest } from '../models/SwapOrderStatusRequest';
import type { SwapOrderStatusResponse } from '../models/SwapOrderStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SwapOrdersService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Create Swap Order
   * @param requestBody
   * @returns CreateSwapOrderResponse Successful Response
   * @throws ApiError
   */
  public createSwapOrderApiV1SwapsOrdersPost(
    requestBody: CreateSwapOrderRequest
  ): CancelablePromise<CreateSwapOrderResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/swaps/orders',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Get Swap Order Status
   * @param requestBody
   * @returns SwapOrderStatusResponse Successful Response
   * @throws ApiError
   */
  public getSwapOrderStatusApiV1SwapsOrdersStatusPost(
    requestBody: SwapOrderStatusRequest
  ): CancelablePromise<SwapOrderStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/swaps/orders/status',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Get Order History
   * Get order history with optional status filtering and pagination
   * @param status
   * @param limit
   * @param skip
   * @returns OrderHistoryResponse Successful Response
   * @throws ApiError
   */
  public getOrderHistoryApiV1SwapsOrdersHistoryGet(
    status?: SwapOrderStatus | null,
    limit: number = 50,
    skip?: number
  ): CancelablePromise<OrderHistoryResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/swaps/orders/history',
      query: {
        status: status,
        limit: limit,
        skip: skip,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Get Order Stats
   * Get order statistics including counts by status and volume information
   * @returns OrderStatsResponse Successful Response
   * @throws ApiError
   */
  public getOrderStatsApiV1SwapsOrdersAnalyticsGet(): CancelablePromise<OrderStatsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/swaps/orders/analytics',
    });
  }
  /**
   * Handle Swap Order Rate Decision
   * Handle user decision on rate change for swap orders.
   * User can either accept the new market rate or request a refund.
   * @param requestBody
   * @returns SwapOrderRateDecisionResponse Successful Response
   * @throws ApiError
   */
  public handleSwapOrderRateDecisionApiV1SwapsOrdersRateDecisionPost(
    requestBody: SwapOrderRateDecisionRequest
  ): CancelablePromise<SwapOrderRateDecisionResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/swaps/orders/rate_decision',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
