/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetDeliveryStatus } from './AssetDeliveryStatus';
import type { ChannelDetails } from './ChannelDetails';
import type { OrderState } from './OrderState';
import type { PaymentDetails } from './PaymentDetails';
export type OrderResponse = {
  order_id: string;
  client_pubkey: string;
  lsp_balance_sat: number;
  client_balance_sat: number;
  required_channel_confirmations: number;
  funding_confirms_within_blocks: number;
  channel_expiry_blocks: number;
  token?: string | null;
  created_at?: string;
  announce_channel: boolean;
  order_state: OrderState;
  payment: PaymentDetails;
  channel?: ChannelDetails | null;
  asset_id?: string | null;
  lsp_asset_amount?: number | null;
  client_asset_amount?: number | null;
  rfq_id?: string | null;
  asset_price_sat?: number | null;
  asset_delivery_status?: AssetDeliveryStatus | null;
  asset_delivery_payment_hash?: string | null;
  asset_delivery_completed_at?: string | null;
  asset_delivery_error?: string | null;
};
