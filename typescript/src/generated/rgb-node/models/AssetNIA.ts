/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetBalanceResponse } from './AssetBalanceResponse';
import type { Media } from './Media';
export type AssetNIA = {
  asset_id?: string;
  ticker?: string;
  name?: string;
  details?: string;
  precision?: number;
  issued_supply?: number;
  timestamp?: number;
  added_at?: number;
  balance?: AssetBalanceResponse;
  media?: Media;
};
