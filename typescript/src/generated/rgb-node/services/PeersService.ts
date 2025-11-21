/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ConnectPeerRequest } from '../models/ConnectPeerRequest';
import type { DisconnectPeerRequest } from '../models/DisconnectPeerRequest';
import type { EmptyResponse } from '../models/EmptyResponse';
import type { ListPeersResponse } from '../models/ListPeersResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PeersService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Connect to a peer
   * Connect to the provided LN peer
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postConnectpeer(requestBody?: ConnectPeerRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/connectpeer',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Disconnect from a peer
   * Disconnect from the provided LN peer
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postDisconnectpeer(requestBody?: DisconnectPeerRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/disconnectpeer',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List peers
   * List the node's LN peers
   * @returns ListPeersResponse Successful operation
   * @throws ApiError
   */
  public getListpeers(): CancelablePromise<ListPeersResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/listpeers',
    });
  }
}
