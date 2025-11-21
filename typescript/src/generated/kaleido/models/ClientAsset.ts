/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetBalanceResponse } from './AssetBalanceResponse';
import type { AssetIface } from './AssetIface';
import type { Media } from './Media';
export type ClientAsset = {
  asset_id: string;
  ticker: string;
  name: string;
  details?: string | null;
  precision: number;
  issued_supply: number;
  timestamp: number;
  added_at: number;
  balance: AssetBalanceResponse;
  media?: Media | null;
  asset_iface?: AssetIface | null;
  is_active?: boolean;
};
