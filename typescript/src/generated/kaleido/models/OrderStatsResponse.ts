/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type OrderStatsResponse = {
  /**
   * Count of orders by status
   */
  status_counts: Record<string, number>;
  /**
   * Total volume of filled orders
   */
  filled_orders_volume: number;
  /**
   * Total count of filled orders
   */
  filled_orders_count: number;
};
