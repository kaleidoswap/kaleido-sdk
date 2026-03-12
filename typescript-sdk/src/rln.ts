/**
 * Kaleidoswap SDK – RGB Lightning Node
 *
 * Entry point for direct RGB Lightning Node (RLN) access.
 * Provides the RlnClient class and all node-specific types.
 *
 * @example
 * import { RlnClient } from 'kaleidoswap-sdk/rln';
 * import type { NodeInfoResponse, Channel } from 'kaleidoswap-sdk/rln';
 *
 * // RlnClient can also be accessed via KaleidoClient.rln when nodeUrl is configured:
 * import { KaleidoClient } from 'kaleidoswap-sdk';
 * import type { KaleidoConfig } from 'kaleidoswap-sdk';
 */

export { RlnClient } from './rln-client.js';
export * from './node-types-ext.js';
