/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ChannelStatus } from './ChannelStatus';
export type Channel = {
  channel_id?: string;
  funding_txid?: string;
  peer_pubkey?: string;
  peer_alias?: string;
  short_channel_id?: number;
  status?: ChannelStatus;
  ready?: boolean;
  capacity_sat?: number;
  local_balance_sat?: number;
  outbound_balance_msat?: number;
  inbound_balance_msat?: number;
  next_outbound_htlc_limit_msat?: number;
  next_outbound_htlc_minimum_msat?: number;
  is_usable?: boolean;
  public?: boolean;
  asset_id?: string;
  asset_local_amount?: number;
  asset_remote_amount?: number;
};
