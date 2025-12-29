/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { PaymentState } from './PaymentState';
export type PaymentBolt11 = {
  state: PaymentState;
  expires_at: string;
  fee_total_sat: number;
  order_total_sat: number;
  invoice: string;
};
