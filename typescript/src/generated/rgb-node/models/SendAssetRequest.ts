/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssignmentFungible } from './AssignmentFungible';
import type { WitnessData } from './WitnessData';
export type SendAssetRequest = {
  asset_id?: string;
  assignment?: AssignmentFungible;
  recipient_id?: string;
  witness_data?: WitnessData;
  donation?: boolean;
  fee_rate?: number;
  min_confirmations?: number;
  transport_endpoints?: Array<string>;
  skip_sync?: boolean;
};
