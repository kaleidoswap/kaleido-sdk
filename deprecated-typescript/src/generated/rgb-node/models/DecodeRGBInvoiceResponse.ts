/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetSchema } from './AssetSchema';
import type { Assignment } from './Assignment';
import type { BitcoinNetwork } from './BitcoinNetwork';
import type { RecipientType } from './RecipientType';
export type DecodeRGBInvoiceResponse = {
  recipient_id?: string;
  recipient_type?: RecipientType;
  asset_schema?: AssetSchema;
  asset_id?: string;
  assignment?: Assignment;
  network?: BitcoinNetwork;
  expiration_timestamp?: number;
  transport_endpoints?: Array<string>;
};
