/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { SwapOrder } from './SwapOrder';
export type OrderHistoryResponse = {
  /**
   * List of orders
   */
  orders: Array<SwapOrder>;
  /**
   * Total number of orders matching the filter
   */
  total_count: number;
  /**
   * Whether there are more orders available
   */
  has_more: boolean;
};
