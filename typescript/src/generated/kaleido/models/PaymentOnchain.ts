/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { PaymentState } from './PaymentState';
export type PaymentOnchain = {
  state: PaymentState;
  expires_at: string;
  fee_total_sat: number;
  order_total_sat: number;
  address: string;
  min_fee_for_0conf: number;
  min_onchain_payment_confirmations: number;
  refund_onchain_address: string | null;
  payment_status?: string | null;
  /**
   * Payment difference in satoshis. Positive for overpayment, negative for underpayment, zero for exact payment
   */
  payment_difference?: number | null;
  last_payment_check?: number | null;
};
