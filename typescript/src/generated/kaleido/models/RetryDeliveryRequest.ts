/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

/**
 * Request model for /retry_delivery endpoint to trigger immediate keysend retry
 */
export type RetryDeliveryRequest = {
  /**
   * Order ID to retry asset delivery for
   */
  order_id: string;
};
