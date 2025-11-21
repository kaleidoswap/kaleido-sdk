/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { HTLCStatus } from './HTLCStatus';
export type Payment = {
  amt_msat?: number;
  asset_amount?: number;
  asset_id?: string;
  payment_hash?: string;
  inbound?: boolean;
  status?: HTLCStatus;
  created_at?: number;
  updated_at?: number;
  payee_pubkey?: string;
};
