/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { SwapStatus } from './SwapStatus';
export type Swap = {
  qty_from: number;
  qty_to: number;
  from_asset?: string | null;
  to_asset?: string | null;
  payment_hash: string;
  status: SwapStatus;
  requested_at: number;
  initiated_at?: number | null;
  expires_at: number;
  completed_at?: number | null;
};
