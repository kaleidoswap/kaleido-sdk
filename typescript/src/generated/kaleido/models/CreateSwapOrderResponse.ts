/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { SwapOrderStatus } from './SwapOrderStatus';
import type { SwapSettlement } from './SwapSettlement';
export type CreateSwapOrderResponse = {
  id: string;
  rfq_id: string;
  pay_in: SwapSettlement;
  ln_invoice?: string | null;
  onchain_address?: string | null;
  rgb_recipient_id?: string | null;
  rgb_invoice?: string | null;
  status: SwapOrderStatus;
};
