/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { PaymentStatus } from './PaymentStatus';
import type { SwapOrderSide } from './SwapOrderSide';
import type { SwapOrderStatus } from './SwapOrderStatus';
import type { SwapSettlement } from './SwapSettlement';
export type SwapOrder = {
  /**
   * Order ID
   */
  id: string;
  /**
   * RFQ that produced the quote
   */
  rfq_id: string;
  maker_pubkey?: string | null;
  side: SwapOrderSide;
  /**
   * Input settlement type: ONCHAIN or LIGHTNING
   */
  from_type: SwapSettlement;
  from_asset: string;
  /**
   * Amount of the asset to swap from. Must be greater than zero.
   */
  from_amount: number;
  /**
   * Output settlement type: ONCHAIN or LIGHTNING
   */
  to_type: SwapSettlement;
  to_asset: string;
  /**
   * Amount of the asset to swap to. Must be greater than zero.
   */
  to_amount: number;
  price: number;
  pay_in: SwapSettlement;
  pay_out: SwapSettlement;
  ln_invoice?: string | null;
  onchain_address?: string | null;
  min_onchain_conf?: number | null;
  rgb_recipient_id?: string | null;
  rgb_invoice?: string | null;
  dest_bolt11?: string | null;
  dest_onchain_address?: string | null;
  dest_rgb_invoice?: string | null;
  refund_address?: string | null;
  payment_hash?: string | null;
  payment_secret?: string | null;
  swapstring?: string | null;
  status?: SwapOrderStatus;
  created_at?: number;
  expires_at?: number | null;
  filled_at?: number | null;
  refund_txid?: string | null;
  requires_manual_refund?: boolean | null;
  payment_status?: PaymentStatus | null;
  /**
   * Payment difference in satoshis. Positive for overpayment, negative for underpayment, zero for exact payment
   */
  payment_difference?: number | null;
  last_payment_check?: number | null;
  email?: string | null;
  failure_reason?: string | null;
};
