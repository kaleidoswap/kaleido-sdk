/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ConfirmSwapRequest } from '../models/ConfirmSwapRequest';
import type { ConfirmSwapResponse } from '../models/ConfirmSwapResponse';
import type { NodeInfoResponse } from '../models/NodeInfoResponse';
import type { SwapRequest } from '../models/SwapRequest';
import type { SwapResponse } from '../models/SwapResponse';
import type { SwapStatusRequest } from '../models/SwapStatusRequest';
import type { SwapStatusResponse } from '../models/SwapStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SwapsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get Node Info
   * @returns NodeInfoResponse Successful Response
   * @throws ApiError
   */
  public getNodeInfoApiV1SwapsNodeinfoGet(): CancelablePromise<NodeInfoResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/swaps/nodeinfo',
    });
  }
  /**
   * Initiate Swap
   * @param requestBody
   * @returns SwapResponse Successful Response
   * @throws ApiError
   */
  public initiateSwapApiV1SwapsInitPost(requestBody: SwapRequest): CancelablePromise<SwapResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/swaps/init',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Confirm Swap
   * @param requestBody
   * @returns ConfirmSwapResponse Successful Response
   * @throws ApiError
   */
  public confirmSwapApiV1SwapsExecutePost(
    requestBody: ConfirmSwapRequest
  ): CancelablePromise<ConfirmSwapResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/swaps/execute',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Get Swap Status
   * @param requestBody
   * @returns SwapStatusResponse Successful Response
   * @throws ApiError
   */
  public getSwapStatusApiV1SwapsAtomicStatusPost(
    requestBody: SwapStatusRequest
  ): CancelablePromise<SwapStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/swaps/atomic/status',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
