/**
 * Nostr Wallet Connect (NIP-47) client.
 *
 * Connects to an NWC wallet service (e.g. the KaleidoSwap desktop hub) using a
 * `nostr+walletconnect://` connection string and exposes typed wallet methods.
 * Requests are NIP-04 encrypted to the wallet pubkey, published as kind 23194
 * events, and correlated to kind 23195 responses.
 *
 * Requires a global `WebSocket` (browsers, React Native, and extension service
 * workers have one). In Node, install one via nostr-tools'
 * `useWebSocketImplementation`.
 *
 * @example
 * import { NWCClient } from 'kaleido-sdk/nwc';
 * const nwc = new NWCClient('nostr+walletconnect://<pubkey>?relay=wss://...&secret=...');
 * const { balance } = await nwc.getBalance();
 * await nwc.payInvoice({ invoice: 'lnbc...' });
 * nwc.close();
 */

import {
    SimplePool,
    finalizeEvent,
    getPublicKey,
    nip04,
    nip44,
    type Event,
    type Filter,
} from 'nostr-tools';

import type {
    NwcClientOptions,
    NwcConnectionInfo,
    NwcErrorCode,
    NwcGetBalanceResult,
    NwcGetInfoResult,
    NwcInvoice,
    NwcListTransactionsParams,
    NwcLookupInvoiceParams,
    NwcMakeInvoiceParams,
    NwcMethod,
    NwcPayInvoiceParams,
    NwcPayInvoiceResult,
    NwcPayKeysendParams,
    NwcPayKeysendResult,
} from './nwc-types.js';
import type {
    AddressResponse,
    AssetBalanceRequest,
    AssetBalanceResponse,
    DecodeRGBInvoiceRequest,
    DecodeRGBInvoiceResponse,
    ListAssetsResponse,
    ListChannelsResponse,
    NodeInfoResponse,
    RgbInvoiceRequest,
    RgbInvoiceResponse,
    SendRgbRequest,
    SendRgbResponse,
} from './node-types-ext.js';

const NWC_KIND_REQUEST = 23194;
const NWC_KIND_RESPONSE = 23195;
const DEFAULT_TIMEOUT_MS = 60_000;
const URI_SCHEME = 'nostr+walletconnect://';

/** Error returned by an NWC wallet service. */
export class NwcError extends Error {
    readonly code: NwcErrorCode | string;
    constructor(code: NwcErrorCode | string, message: string) {
        super(message);
        this.name = 'NwcError';
        this.code = code;
    }
}

function hexToBytes(hex: string): Uint8Array {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    if (clean.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

/** Parse a `nostr+walletconnect://` URI into its components. */
export function parseNwcUri(uri: string): NwcConnectionInfo {
    const trimmed = uri.trim();
    if (!trimmed.startsWith(URI_SCHEME)) {
        throw new Error('Invalid NWC URI: missing nostr+walletconnect:// scheme');
    }
    const withoutScheme = trimmed.slice(URI_SCHEME.length);
    const queryIndex = withoutScheme.indexOf('?');
    if (queryIndex === -1) {
        throw new Error('Invalid NWC URI: missing query parameters');
    }
    const walletPubkey = withoutScheme.slice(0, queryIndex).toLowerCase();
    const params = new URLSearchParams(withoutScheme.slice(queryIndex + 1));

    const relays = params.getAll('relay').filter(Boolean);
    const secret = params.get('secret') ?? '';
    const lud16 = params.get('lud16') ?? undefined;

    if (!walletPubkey) throw new Error('Invalid NWC URI: missing wallet pubkey');
    if (relays.length === 0) throw new Error('Invalid NWC URI: missing relay');
    if (!secret) throw new Error('Invalid NWC URI: missing secret');

    return { walletPubkey, relays, secret, lud16 };
}

export class NWCClient {
    private readonly pool: SimplePool;
    private readonly walletPubkey: string;
    private readonly relays: string[];
    private readonly secretBytes: Uint8Array;
    /** This client's own pubkey (derived from the connection secret). */
    readonly clientPubkey: string;
    readonly lud16?: string;
    private readonly timeoutMs: number;
    private readonly encryption: 'nip44' | 'nip04';
    /** Cached NIP-44 conversation key for this connection. */
    private readonly convKey: Uint8Array;

    constructor(uri: string, options: NwcClientOptions = {}) {
        const info = parseNwcUri(uri);
        this.walletPubkey = info.walletPubkey;
        this.relays = info.relays;
        this.secretBytes = hexToBytes(info.secret);
        this.clientPubkey = getPublicKey(this.secretBytes);
        this.lud16 = info.lud16;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.encryption = options.encryption ?? 'nip44';
        this.convKey = nip44.getConversationKey(this.secretBytes, this.walletPubkey);
        this.pool = new SimplePool();
    }

    private encryptContent(plaintext: string): string {
        return this.encryption === 'nip44'
            ? nip44.encrypt(plaintext, this.convKey)
            : nip04.encrypt(this.secretBytes, this.walletPubkey, plaintext);
    }

    /** Decrypt a response, detecting the scheme (NIP-04 carries a `?iv=` marker). */
    private decryptContent(payload: string): string {
        return payload.includes('?iv=')
            ? nip04.decrypt(this.secretBytes, this.walletPubkey, payload)
            : nip44.decrypt(payload, this.convKey);
    }

    /** Low-level NIP-47 request/response round-trip. */
    async request<T>(method: NwcMethod, params: Record<string, unknown>): Promise<T> {
        const content = this.encryptContent(JSON.stringify({ method, params }));

        const reqEvent = finalizeEvent(
            {
                kind: NWC_KIND_REQUEST,
                created_at: Math.floor(Date.now() / 1000),
                tags: [['p', this.walletPubkey]],
                content,
            },
            this.secretBytes,
        );

        const filter: Filter = {
            kinds: [NWC_KIND_RESPONSE],
            authors: [this.walletPubkey],
            '#e': [reqEvent.id],
        };

        return new Promise<T>((resolve, reject) => {
            let settled = false;
            const sub = this.pool.subscribeMany(this.relays, filter, {
                onevent: (event: Event) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    sub.close();
                    try {
                        const decrypted = this.decryptContent(event.content);
                        const response = JSON.parse(decrypted) as {
                            error?: { code: string; message: string } | null;
                            result?: T;
                        };
                        if (response.error) {
                            reject(new NwcError(response.error.code, response.error.message));
                        } else {
                            resolve(response.result as T);
                        }
                    } catch (err) {
                        reject(err instanceof Error ? err : new Error(String(err)));
                    }
                },
            });

            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                sub.close();
                reject(new NwcError('OTHER', `NWC request '${method}' timed out`));
            }, this.timeoutMs);

            Promise.any(this.pool.publish(this.relays, reqEvent)).catch((err) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                sub.close();
                reject(
                    new NwcError(
                        'OTHER',
                        `Failed to publish NWC request to any relay: ${String(err)}`,
                    ),
                );
            });
        });
    }

    getInfo(): Promise<NwcGetInfoResult> {
        return this.request<NwcGetInfoResult>('get_info', {});
    }

    getBalance(): Promise<NwcGetBalanceResult> {
        return this.request<NwcGetBalanceResult>('get_balance', {});
    }

    makeInvoice(params: NwcMakeInvoiceParams): Promise<NwcInvoice> {
        return this.request<NwcInvoice>('make_invoice', { ...params });
    }

    payInvoice(params: NwcPayInvoiceParams): Promise<NwcPayInvoiceResult> {
        return this.request<NwcPayInvoiceResult>('pay_invoice', { ...params });
    }

    payKeysend(params: NwcPayKeysendParams): Promise<NwcPayKeysendResult> {
        return this.request<NwcPayKeysendResult>('pay_keysend', { ...params });
    }

    lookupInvoice(params: NwcLookupInvoiceParams): Promise<NwcInvoice> {
        return this.request<NwcInvoice>('lookup_invoice', { ...params });
    }

    async listTransactions(params: NwcListTransactionsParams = {}): Promise<NwcInvoice[]> {
        const result = await this.request<{ transactions: NwcInvoice[] }>('list_transactions', {
            ...params,
        });
        return result?.transactions ?? [];
    }

    // --- KaleidoSwap RLN extensions (rln_*) -------------------------------------
    // The hub proxies these to the matching rgb-lightning-node endpoint and
    // returns the raw RLN response, so they're typed with the RLN response types.

    /** Full RLN node info (`/nodeinfo`). */
    rlnNodeInfo(): Promise<NodeInfoResponse> {
        return this.request<NodeInfoResponse>('rln_node_info', {});
    }

    /** List RGB assets (`/listassets`). */
    rlnListAssets(params: Record<string, unknown> = {}): Promise<ListAssetsResponse> {
        return this.request<ListAssetsResponse>('rln_list_assets', params);
    }

    /** RGB asset balance (`/assetbalance`). */
    rlnAssetBalance(params: AssetBalanceRequest): Promise<AssetBalanceResponse> {
        return this.request<AssetBalanceResponse>('rln_asset_balance', params);
    }

    /** Create an RGB invoice (`/rgbinvoice`). */
    rlnRgbInvoice(params: RgbInvoiceRequest): Promise<RgbInvoiceResponse> {
        return this.request<RgbInvoiceResponse>('rln_rgb_invoice', params);
    }

    /** Decode an RGB invoice (`/decodergbinvoice`). */
    rlnDecodeRgbInvoice(params: DecodeRGBInvoiceRequest): Promise<DecodeRGBInvoiceResponse> {
        return this.request<DecodeRGBInvoiceResponse>('rln_decode_rgb_invoice', params);
    }

    /** Send RGB assets (`/sendrgb`). */
    rlnSendAsset(params: SendRgbRequest): Promise<SendRgbResponse> {
        return this.request<SendRgbResponse>('rln_send_asset', params);
    }

    /** List Lightning channels (`/listchannels`). */
    rlnListChannels(): Promise<ListChannelsResponse> {
        return this.request<ListChannelsResponse>('rln_list_channels', {});
    }

    /** Get a new on-chain address (`/address`). */
    rlnGetAddress(): Promise<AddressResponse> {
        return this.request<AddressResponse>('rln_get_address', {});
    }

    /** Close all relay connections. Call when the client is no longer needed. */
    close(): void {
        this.pool.close(this.relays);
    }
}
