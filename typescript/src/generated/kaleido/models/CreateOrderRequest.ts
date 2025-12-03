/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type CreateOrderRequest = {
  client_pubkey: string;
  lsp_balance_sat: number;
  client_balance_sat: number;
  required_channel_confirmations: number;
  funding_confirms_within_blocks: number;
  channel_expiry_blocks: number;
  token?: string | null;
  refund_onchain_address?: string | null;
  announce_channel?: boolean;
  asset_id?: string | null;
  lsp_asset_amount?: number | null;
  client_asset_amount?: number | null;
  rfq_id?: string | null;
  /**
   * Optional email for notifications
   */
  email?: string | null;
};
