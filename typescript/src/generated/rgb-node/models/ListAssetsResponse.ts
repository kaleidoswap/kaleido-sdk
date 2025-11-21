/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetCFA } from './AssetCFA';
import type { AssetNIA } from './AssetNIA';
import type { AssetUDA } from './AssetUDA';
export type ListAssetsResponse = {
  nia?: Array<AssetNIA>;
  uda?: Array<AssetUDA>;
  cfa?: Array<AssetCFA>;
};
