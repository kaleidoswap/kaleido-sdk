/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type OpenChannelRequest = {
  peer_pubkey_and_opt_addr?: string;
  capacity_sat?: number;
  push_msat?: number;
  asset_amount?: number;
  asset_id?: string;
  public?: boolean;
  with_anchors?: boolean;
  fee_base_msat?: number;
  fee_proportional_millionths?: number;
  temporary_channel_id?: string;
};
