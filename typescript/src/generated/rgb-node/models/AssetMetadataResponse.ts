/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetSchema } from './AssetSchema';
import type { Token } from './Token';
export type AssetMetadataResponse = {
  asset_schema?: AssetSchema;
  issued_supply?: number;
  timestamp?: number;
  name?: string;
  precision?: number;
  ticker?: string;
  details?: string;
  token?: Token;
};
