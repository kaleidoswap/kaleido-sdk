/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AddressResponse } from '../models/AddressResponse';
import type { BtcBalanceRequest } from '../models/BtcBalanceRequest';
import type { BtcBalanceResponse } from '../models/BtcBalanceResponse';
import type { EstimateFeeRequest } from '../models/EstimateFeeRequest';
import type { EstimateFeeResponse } from '../models/EstimateFeeResponse';
import type { ListTransactionsRequest } from '../models/ListTransactionsRequest';
import type { ListTransactionsResponse } from '../models/ListTransactionsResponse';
import type { ListUnspentsRequest } from '../models/ListUnspentsRequest';
import type { ListUnspentsResponse } from '../models/ListUnspentsResponse';
import type { SendBtcRequest } from '../models/SendBtcRequest';
import type { SendBtcResponse } from '../models/SendBtcResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OnChainService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get a Bitcoin address
   * Get a new Bitcoin address from the internal BDK wallet
   * @returns AddressResponse Successful operation
   * @throws ApiError
   */
  public postAddress(): CancelablePromise<AddressResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/address',
    });
  }
  /**
   * Get the BTC balance
   * Get the node's bitcoin balance for the vanilla and colored wallets
   * @param requestBody
   * @returns BtcBalanceResponse Successful operation
   * @throws ApiError
   */
  public postBtcbalance(requestBody?: BtcBalanceRequest): CancelablePromise<BtcBalanceResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/btcbalance',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get fee estimation
   * Get on-chain fee estimation
   * @param requestBody
   * @returns EstimateFeeResponse Successful operation
   * @throws ApiError
   */
  public postEstimatefee(requestBody?: EstimateFeeRequest): CancelablePromise<EstimateFeeResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/estimatefee',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List transactions
   * List the node's on-chain transactions
   * @param requestBody
   * @returns ListTransactionsResponse Successful operation
   * @throws ApiError
   */
  public postListtransactions(
    requestBody?: ListTransactionsRequest
  ): CancelablePromise<ListTransactionsResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/listtransactions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List unspents
   * List the unspent outputs of the internal BDK wallet
   * @param requestBody
   * @returns ListUnspentsResponse Successful operation
   * @throws ApiError
   */
  public postListunspents(
    requestBody?: ListUnspentsRequest
  ): CancelablePromise<ListUnspentsResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/listunspents',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Send BTC
   * Send bitcoins on-chain
   * @param requestBody
   * @returns SendBtcResponse Successful operation
   * @throws ApiError
   */
  public postSendbtc(requestBody?: SendBtcRequest): CancelablePromise<SendBtcResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/sendbtc',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
