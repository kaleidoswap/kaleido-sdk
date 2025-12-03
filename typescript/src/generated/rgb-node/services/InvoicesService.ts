/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { DecodeLNInvoiceRequest } from '../models/DecodeLNInvoiceRequest';
import type { DecodeLNInvoiceResponse } from '../models/DecodeLNInvoiceResponse';
import type { InvoiceStatusRequest } from '../models/InvoiceStatusRequest';
import type { InvoiceStatusResponse } from '../models/InvoiceStatusResponse';
import type { LNInvoiceRequest } from '../models/LNInvoiceRequest';
import type { LNInvoiceResponse } from '../models/LNInvoiceResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class InvoicesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Decode a LN invoice
   * Decode the provided LN invoice string
   * @param requestBody
   * @returns DecodeLNInvoiceResponse Successful operation
   * @throws ApiError
   */
  public postDecodelninvoice(
    requestBody?: DecodeLNInvoiceRequest
  ): CancelablePromise<DecodeLNInvoiceResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/decodelninvoice',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get an invoice status
   * Get the status of the provided LN invoice
   * @param requestBody
   * @returns InvoiceStatusResponse Successful operation
   * @throws ApiError
   */
  public postInvoicestatus(
    requestBody?: InvoiceStatusRequest
  ): CancelablePromise<InvoiceStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/invoicestatus',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get a LN invoice
   * Get a LN invoice to receive a payment
   * @param requestBody
   * @returns LNInvoiceResponse Successful operation
   * @throws ApiError
   */
  public postLninvoice(requestBody?: LNInvoiceRequest): CancelablePromise<LNInvoiceResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/lninvoice',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
