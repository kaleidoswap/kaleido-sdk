/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { SwapStatus } from './SwapStatus';
export type Swap = {
  qty_from?: number;
  qty_to?: number;
  from_asset?: string;
  to_asset?: string;
  payment_hash?: string;
  status?: SwapStatus;
  requested_at?: number;
  initiated_at?: number;
  expires_at?: number;
  completed_at?: number;
};
