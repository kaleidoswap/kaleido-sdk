/**
 * Kaleidoswap SDK – Nostr Wallet Connect (NIP-47)
 *
 * Entry point for connecting to an NWC wallet service (e.g. the KaleidoSwap
 * desktop hub) as a client.
 *
 * @example
 * import { NWCClient } from 'kaleido-sdk/nwc';
 * import type { NwcGetBalanceResult } from 'kaleido-sdk/nwc';
 *
 * const nwc = new NWCClient(connectionUri);
 * const { balance } = await nwc.getBalance();
 */

export { NWCClient, NwcError, parseNwcUri } from './nwc-client.js';
export * from './nwc-types.js';
