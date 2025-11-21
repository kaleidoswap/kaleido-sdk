/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type NodeInfoResponse = {
  pubkey?: string;
  num_channels?: number;
  num_usable_channels?: number;
  local_balance_sat?: number;
  eventual_close_fees_sat?: number;
  pending_outbound_payments_sat?: number;
  num_peers?: number;
  account_xpub_vanilla?: string;
  account_xpub_colored?: string;
  max_media_upload_size_mb?: number;
  rgb_htlc_min_msat?: number;
  rgb_channel_capacity_min_sat?: number;
  channel_capacity_min_sat?: number;
  channel_capacity_max_sat?: number;
  channel_asset_min_amount?: number;
  channel_asset_max_amount?: number;
  network_nodes?: number;
  network_channels?: number;
};
