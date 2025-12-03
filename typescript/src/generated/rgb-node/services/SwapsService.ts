/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { EmptyResponse } from '../models/EmptyResponse';
import type { GetSwapRequest } from '../models/GetSwapRequest';
import type { GetSwapResponse } from '../models/GetSwapResponse';
import type { ListSwapsResponse } from '../models/ListSwapsResponse';
import type { MakerExecuteRequest } from '../models/MakerExecuteRequest';
import type { MakerInitRequest } from '../models/MakerInitRequest';
import type { MakerInitResponse } from '../models/MakerInitResponse';
import type { TakerRequest } from '../models/TakerRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SwapsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get a swap
   * Get a swap by its payment hash
   * @param requestBody
   * @returns GetSwapResponse Successful operation
   * @throws ApiError
   */
  public postGetswap(requestBody?: GetSwapRequest): CancelablePromise<GetSwapResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/getswap',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List swaps
   * List the node's swaps
   * @returns ListSwapsResponse Successful operation
   * @throws ApiError
   */
  public getListswaps(): CancelablePromise<ListSwapsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/listswaps',
    });
  }
  /**
   * Execute a maker swap
   * Execute a swap on the maker side
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postMakerexecute(requestBody?: MakerExecuteRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/makerexecute',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Init a maker swap
   * Init a swap on the maker side
   * @param requestBody
   * @returns MakerInitResponse Successful operation
   * @throws ApiError
   */
  public postMakerinit(requestBody?: MakerInitRequest): CancelablePromise<MakerInitResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/makerinit',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Accept a swap
   * Accept a swap on the taker side
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postTaker(requestBody?: TakerRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/taker',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
