/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type OrderOptions = {
  min_required_channel_confirmations?: number;
  min_funding_confirms_within_blocks?: number;
  min_onchain_payment_confirmations?: number | null;
  supports_zero_channel_reserve?: boolean;
  min_onchain_payment_size_sat?: number | null;
  max_channel_expiry_blocks?: number;
  min_initial_client_balance_sat?: number;
  max_initial_client_balance_sat?: number;
  min_initial_lsp_balance_sat?: number;
  max_initial_lsp_balance_sat?: number;
  min_channel_balance_sat?: number;
  max_channel_balance_sat?: number;
};
