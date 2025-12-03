/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { BitcoinNetwork } from './BitcoinNetwork';
export type DecodeLNInvoiceResponse = {
  amt_msat?: number;
  expiry_sec?: number;
  timestamp?: number;
  asset_id?: string;
  asset_amount?: number;
  payment_hash?: string;
  payment_secret?: string;
  payee_pubkey?: string;
  network?: BitcoinNetwork;
};
