/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type PairQuoteRequest = {
  from_asset: string;
  /**
   * Amount of from_asset to convert. Either from_amount or to_amount must be provided, but not both.
   */
  from_amount?: number | null;
  to_asset: string;
  /**
   * Desired amount of to_asset to receive. Either from_amount or to_amount must be provided, but not both.
   */
  to_amount?: number | null;
};
