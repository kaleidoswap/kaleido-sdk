/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Assignment } from './Assignment';
export type RgbInvoiceRequest = {
  min_confirmations?: number;
  asset_id?: string;
  assignment?: Assignment;
  duration_seconds?: number;
  witness?: boolean;
};
