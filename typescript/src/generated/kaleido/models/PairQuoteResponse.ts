/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Fee } from './Fee';
export type PairQuoteResponse = {
  rfq_id: string;
  from_asset: string;
  /**
   * Amount of from_asset in its smallest unit (e.g., millisatoshis for BTC if precision is 11)
   */
  from_amount: number;
  to_asset: string;
  /**
   * Amount of to_asset in its smallest unit, after applying price and fees.
   */
  to_amount: number;
  /**
   * Price of 1 whole unit of from_asset (e.g., 1 BTC) in terms of the smallest unit of to_asset (e.g., USDT with precision 6). Matches PriceData.price for the given rfq_id.
   */
  price: number;
  fee: Fee;
  timestamp: number;
  expires_at: number;
};
