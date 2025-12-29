/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ChannelFees } from '../models/ChannelFees';
import type { CreateOrderRequest } from '../models/CreateOrderRequest';
import type { GetInfoResponseModel } from '../models/GetInfoResponseModel';
import type { GetOrderRequest } from '../models/GetOrderRequest';
import type { NetworkInfoResponse } from '../models/NetworkInfoResponse';
import type { OrderResponse } from '../models/OrderResponse';
import type { RateDecisionRequest } from '../models/RateDecisionRequest';
import type { RateDecisionResponse } from '../models/RateDecisionResponse';
import type { RetryDeliveryRequest } from '../models/RetryDeliveryRequest';
import type { RetryDeliveryResponse } from '../models/RetryDeliveryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class Lsps1Service {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get Info
   * @returns GetInfoResponseModel Successful Response
   * @throws ApiError
   */
  public getInfoApiV1Lsps1GetInfoGet(): CancelablePromise<GetInfoResponseModel> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/lsps1/get_info',
    });
  }
  /**
   * Get Network Info
   * Get network information including current blockchain height and network type.
   * @returns NetworkInfoResponse Successful Response
   * @throws ApiError
   */
  public getNetworkInfoApiV1Lsps1NetworkInfoGet(): CancelablePromise<NetworkInfoResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/lsps1/network_info',
    });
  }
  /**
   * Create Order
   * @param requestBody
   * @returns OrderResponse Successful Response
   * @throws ApiError
   */
  public createOrderApiV1Lsps1CreateOrderPost(
    requestBody: CreateOrderRequest
  ): CancelablePromise<OrderResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/lsps1/create_order',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Estimate Fees
   * Estimate channel fees based on the provided parameters without creating an order.
   * For asset purchases (client_asset_amount > 0), rfq_id must be provided to calculate accurate fees.
   * @param requestBody
   * @returns ChannelFees Successful Response
   * @throws ApiError
   */
  public estimateFeesApiV1Lsps1EstimateFeesPost(
    requestBody: CreateOrderRequest
  ): CancelablePromise<ChannelFees> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/lsps1/estimate_fees',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Get Order
   * @param requestBody
   * @returns OrderResponse Successful Response
   * @throws ApiError
   */
  public getOrderApiV1Lsps1GetOrderPost(
    requestBody: GetOrderRequest
  ): CancelablePromise<OrderResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/lsps1/get_order',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Handle Rate Decision
   * Handle user decision on rate change for LSPS1 orders.
   * User can either accept the new market rate or request a refund.
   * @param requestBody
   * @returns RateDecisionResponse Successful Response
   * @throws ApiError
   */
  public handleRateDecisionApiV1Lsps1RateDecisionPost(
    requestBody: RateDecisionRequest
  ): CancelablePromise<RateDecisionResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/lsps1/rate_decision',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Retry Delivery
   * Endpoint for clients to queue their order for immediate retry of asset delivery.
   *
   * This allows users to bypass the exponential backoff delay by queueing their order
   * for priority processing. The order will be processed by the background loop within
   * 60 seconds. Useful when a user comes back online after being offline during
   * scheduled retry windows.
   *
   * Args:
   * request: Contains the order_id
   *
   * Returns:
   * RetryDeliveryResponse with status and message
   * @param requestBody
   * @returns RetryDeliveryResponse Successful Response
   * @throws ApiError
   */
  public retryDeliveryApiV1Lsps1RetryDeliveryPost(
    requestBody: RetryDeliveryRequest
  ): CancelablePromise<RetryDeliveryResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/lsps1/retry_delivery',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
