/**
 * NWC transport for the RGB Lightning Node.
 *
 * Lets `RlnClient` operate the node over Nostr Wallet Connect instead of HTTP,
 * so an app can drive a remote/firewalled node through relays with no direct
 * `nodeUrl`. It implements the minimal [`RlnNodeClient`] surface by mapping the
 * RLN endpoints to the hub's `rln_*` passthrough methods (which return the raw
 * RLN responses), so the existing typed RlnClient methods work unchanged.
 *
 * Coverage is the subset the hub exposes over NWC (node info, RGB assets,
 * channels, on-chain address). Lightning wallet ops (pay/invoice/balance) have
 * NWC-native shapes — use {@link NWCClient} directly for those. Unsupported
 * endpoints reject with a clear error.
 */

import { HttpClient } from './http-client.js';
import { LogState } from './logging.js';
import { NWCClient } from './nwc-client.js';
import { RlnClient, type RlnNodeClient } from './rln-client.js';
import type { NwcRlnMethod } from './nwc-types.js';

type NodeResult = { data?: any; error?: unknown; response?: Response };

/** RLN endpoints reachable over NWC, mapped to their `rln_*` method. */
const GET_METHODS: Record<string, NwcRlnMethod> = {
  '/nodeinfo': 'rln_node_info',
  '/listchannels': 'rln_list_channels',
};

const POST_METHODS: Record<string, NwcRlnMethod> = {
  '/address': 'rln_get_address',
  '/listassets': 'rln_list_assets',
  '/assetbalance': 'rln_asset_balance',
  '/rgbinvoice': 'rln_rgb_invoice',
  '/decodergbinvoice': 'rln_decode_rgb_invoice',
  '/sendrgb': 'rln_send_asset',
};

export class NwcRlnNodeClient implements RlnNodeClient {
  constructor(private readonly nwc: NWCClient) {}

  GET(path: string): Promise<NodeResult> {
    return this.call(GET_METHODS[path], path, undefined);
  }

  POST(path: string, init?: { body?: unknown }): Promise<NodeResult> {
    return this.call(POST_METHODS[path], path, init?.body);
  }

  private async call(
    method: NwcRlnMethod | undefined,
    path: string,
    body: unknown
  ): Promise<NodeResult> {
    if (!method) {
      return {
        error: {
          message: `RLN endpoint '${path}' is not available over the NWC transport`,
        },
      };
    }
    try {
      const params =
        body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
      const data = await this.nwc.request<any>(method, params);
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? { message: err.message } : err };
    }
  }
}

/**
 * Build an {@link RlnClient} that talks to the node over NWC.
 *
 * @example
 * import { NWCClient } from 'kaleido-sdk/nwc';
 * import { createNwcRlnClient } from 'kaleido-sdk/nwc';
 * const rln = createNwcRlnClient(new NWCClient(connectionUri));
 * const info = await rln.getNodeInfo();
 * const assets = await rln.listAssets();
 */
export function createNwcRlnClient(
  nwc: NWCClient,
  logState: LogState = new LogState()
): RlnClient {
  return new RlnClient(new HttpClient({}), logState, new NwcRlnNodeClient(nwc));
}
