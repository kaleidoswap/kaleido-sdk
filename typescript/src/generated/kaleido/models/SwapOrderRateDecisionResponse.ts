/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

/**
 * Response after user makes rate decision for a swap order
 */
export type SwapOrderRateDecisionResponse = {
  order_id: string;
  decision_accepted: boolean;
  message: string;
  /**
   * Present if refund was requested and processed
   */
  refund_txid?: string | null;
};
