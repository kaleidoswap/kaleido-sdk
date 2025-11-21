/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { SwapSettlement } from './SwapSettlement';
export type CreateSwapOrderRequest = {
  /**
   * RFQ ID cannot be empty
   */
  rfq_id: string;
  /**
   * Input type: ONCHAIN or LIGHTNING
   */
  from_type: SwapSettlement;
  /**
   * Output type: ONCHAIN or LIGHTNING
   */
  to_type: SwapSettlement;
  min_onchain_conf?: number | null;
  dest_bolt11?: string | null;
  dest_onchain_address?: string | null;
  dest_rgb_invoice?: string | null;
  refund_address?: string | null;
  /**
   * Optional email for notifications
   */
  email?: string | null;
};
