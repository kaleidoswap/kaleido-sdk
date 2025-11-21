/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

/**
 * Request for user to accept new rate or request refund for a swap order
 */
export type SwapOrderRateDecisionRequest = {
  /**
   * Swap order ID
   */
  order_id: string;
  /**
   * True to accept new rate, False to request refund
   */
  accept_new_rate: boolean;
};
