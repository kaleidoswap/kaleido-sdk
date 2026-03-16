/**
 * Kaleidoswap SDK – RGB Lightning Node
 *
 * Entry point for direct RGB Lightning Node (RLN) access.
 * Provides the RlnClient class and all node-specific types.
 *
 * @example
 * import { RlnClient } from 'kaleido-sdk/rln';
 * import type { NodeInfoResponse, Channel } from 'kaleido-sdk/rln';
 *
 * // RlnClient can also be accessed via KaleidoClient.rln when nodeUrl is configured:
 * import { KaleidoClient } from 'kaleido-sdk';
 * import type { KaleidoConfig } from 'kaleido-sdk';
 */

export { RlnClient } from './rln-client.js';
export * from './node-types-ext.js';
