/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetsResponse } from '../models/AssetsResponse';
import type { PairQuoteRequest } from '../models/PairQuoteRequest';
import type { PairQuoteResponse } from '../models/PairQuoteResponse';
import type { PairResponse } from '../models/PairResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MarketService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * List Assets
   * @returns AssetsResponse Successful Response
   * @throws ApiError
   */
  public listAssetsApiV1MarketAssetsGet(): CancelablePromise<AssetsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/market/assets',
    });
  }
  /**
   * Get Pairs
   * @returns PairResponse Successful Response
   * @throws ApiError
   */
  public getPairsApiV1MarketPairsGet(): CancelablePromise<PairResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/v1/market/pairs',
    });
  }
  /**
   * Get Quote
   * @param requestBody
   * @returns PairQuoteResponse Successful Response
   * @throws ApiError
   */
  public getQuoteApiV1MarketQuotePost(
    requestBody: PairQuoteRequest
  ): CancelablePromise<PairQuoteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/v1/market/quote',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
