/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { GetPaymentRequest } from '../models/GetPaymentRequest';
import type { GetPaymentResponse } from '../models/GetPaymentResponse';
import type { KeysendRequest } from '../models/KeysendRequest';
import type { KeysendResponse } from '../models/KeysendResponse';
import type { ListPaymentsResponse } from '../models/ListPaymentsResponse';
import type { SendPaymentRequest } from '../models/SendPaymentRequest';
import type { SendPaymentResponse } from '../models/SendPaymentResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PaymentsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get a payment
   * Get a payment by its payment hash
   * @param requestBody
   * @returns GetPaymentResponse Successful operation
   * @throws ApiError
   */
  public postGetpayment(requestBody?: GetPaymentRequest): CancelablePromise<GetPaymentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/getpayment',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Send to a peer spontaneously
   * Send bitcoins and RGB assets to a LN peer spontaneously (without a LN invoice)
   * @param requestBody
   * @returns KeysendResponse Successful operation
   * @throws ApiError
   */
  public postKeysend(requestBody?: KeysendRequest): CancelablePromise<KeysendResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/keysend',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List payments
   * List the node's LN payments
   * @returns ListPaymentsResponse Successful operation
   * @throws ApiError
   */
  public getListpayments(): CancelablePromise<ListPaymentsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/listpayments',
    });
  }
  /**
   * Send a payment
   * Pay the provided LN invoice
   * @param requestBody
   * @returns SendPaymentResponse Successful operation
   * @throws ApiError
   */
  public postSendpayment(requestBody?: SendPaymentRequest): CancelablePromise<SendPaymentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/sendpayment',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
