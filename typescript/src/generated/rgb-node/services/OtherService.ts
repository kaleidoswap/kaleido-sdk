/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { BackupRequest } from '../models/BackupRequest';
import type { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import type { CheckIndexerUrlRequest } from '../models/CheckIndexerUrlRequest';
import type { CheckIndexerUrlResponse } from '../models/CheckIndexerUrlResponse';
import type { CheckProxyEndpointRequest } from '../models/CheckProxyEndpointRequest';
import type { EmptyResponse } from '../models/EmptyResponse';
import type { InitRequest } from '../models/InitRequest';
import type { InitResponse } from '../models/InitResponse';
import type { NetworkInfoResponse } from '../models/NetworkInfoResponse';
import type { NodeInfoResponse } from '../models/NodeInfoResponse';
import type { RestoreRequest } from '../models/RestoreRequest';
import type { RevokeTokenRequest } from '../models/RevokeTokenRequest';
import type { SendOnionMessageRequest } from '../models/SendOnionMessageRequest';
import type { SignMessageRequest } from '../models/SignMessageRequest';
import type { SignMessageResponse } from '../models/SignMessageResponse';
import type { UnlockRequest } from '../models/UnlockRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OtherService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Backup the node
   * Create a backup of the node's data
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postBackup(requestBody?: BackupRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/backup',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Change the password
   * Change the node's password
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postChangepassword(requestBody?: ChangePasswordRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/changepassword',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Check an indexer URL
   * Check the given indexer URL is valid
   * @param requestBody
   * @returns CheckIndexerUrlResponse Successful operation
   * @throws ApiError
   */
  public postCheckindexerurl(
    requestBody?: CheckIndexerUrlRequest
  ): CancelablePromise<CheckIndexerUrlResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/checkindexerurl',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Check a proxy endpoint
   * Check the given proxy endpoint is valid
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postCheckproxyendpoint(
    requestBody?: CheckProxyEndpointRequest
  ): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/checkproxyendpoint',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Init the node
   * Initialize a new node
   * @param requestBody
   * @returns InitResponse Successful operation
   * @throws ApiError
   */
  public postInit(requestBody?: InitRequest): CancelablePromise<InitResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/init',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Lock the node
   * Lock an unlocked node
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postLock(): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/lock',
    });
  }
  /**
   * Get network info
   * Get info on the Bitcoin network where the LN is running
   * @returns NetworkInfoResponse Successful operation
   * @throws ApiError
   */
  public getNetworkinfo(): CancelablePromise<NetworkInfoResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/networkinfo',
    });
  }
  /**
   * Get node info
   * Get the LN node's info
   * @returns NodeInfoResponse Successful operation
   * @throws ApiError
   */
  public getNodeinfo(): CancelablePromise<NodeInfoResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/nodeinfo',
    });
  }
  /**
   * Restore the node
   * Restore a node from a backup file
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postRestore(requestBody?: RestoreRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/restore',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Revoke a token
   * Revoke an authentication token
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postRevoketoken(requestBody?: RevokeTokenRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/revoketoken',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Send an onion message
   * Send an onion message via the LN
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postSendonionmessage(
    requestBody?: SendOnionMessageRequest
  ): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/sendonionmessage',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Shutdown the node
   * Gracefully shutdown the node
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postShutdown(): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/shutdown',
    });
  }
  /**
   * Sign a message
   * Sign the provided message
   * @param requestBody
   * @returns SignMessageResponse Successful operation
   * @throws ApiError
   */
  public postSignmessage(requestBody?: SignMessageRequest): CancelablePromise<SignMessageResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/signmessage',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Unlock the node
   * Unlock a locked node
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postUnlock(requestBody?: UnlockRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/unlock',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
