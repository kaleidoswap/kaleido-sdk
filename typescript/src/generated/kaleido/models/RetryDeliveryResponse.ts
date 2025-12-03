/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { RetryDeliveryStatus } from './RetryDeliveryStatus';
/**
 * Response model for /retry_delivery endpoint
 */
export type RetryDeliveryResponse = {
  /**
   * Status of the request
   */
  status: RetryDeliveryStatus;
  /**
   * Human-readable message about the result
   */
  message: string;
};
