/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

/**
 * Response after user makes rate decision
 */
export type RateDecisionResponse = {
  order_id: string;
  decision_accepted: boolean;
  message: string;
  refund_txid?: string | null;
};
