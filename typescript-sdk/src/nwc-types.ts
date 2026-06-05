/**
 * Nostr Wallet Connect (NIP-47) client types.
 *
 * These mirror the NIP-47 request params / response results. Amounts are in
 * millisatoshis, per the spec.
 */

/** Standard NIP-47 methods. */
export type NwcStandardMethod =
  | 'get_info'
  | 'get_balance'
  | 'make_invoice'
  | 'pay_invoice'
  | 'pay_keysend'
  | 'lookup_invoice'
  | 'list_transactions';

/**
 * KaleidoSwap RLN extension methods (namespaced `rln_`). These ride the same
 * NWC envelope but expose RGB + node features beyond standard NIP-47. Results
 * are the raw RLN responses (see the rgb-lightning-node API).
 */
export type NwcRlnMethod =
  | 'rln_node_info'
  | 'rln_list_assets'
  | 'rln_asset_balance'
  | 'rln_rgb_invoice'
  | 'rln_decode_rgb_invoice'
  | 'rln_send_asset'
  | 'rln_list_channels'
  | 'rln_get_address';

export type NwcMethod = NwcStandardMethod | NwcRlnMethod;

/** Standard NIP-47 error codes. */
export type NwcErrorCode =
  | 'RATE_LIMITED'
  | 'NOT_IMPLEMENTED'
  | 'INSUFFICIENT_BALANCE'
  | 'QUOTA_EXCEEDED'
  | 'RESTRICTED'
  | 'UNAUTHORIZED'
  | 'INTERNAL'
  | 'OTHER'
  | 'PAYMENT_FAILED'
  | 'NOT_FOUND';

/** Parsed `nostr+walletconnect://` connection URI. */
export interface NwcConnectionInfo {
  /** Wallet-service public key (hex, x-only). */
  walletPubkey: string;
  /** Relay URLs to send requests to / listen on. */
  relays: string[];
  /** Client secret key (hex) — this app's identity. */
  secret: string;
  /** Optional lightning address advertised by the wallet. */
  lud16?: string;
}

export interface NwcGetInfoResult {
  alias?: string;
  color?: string;
  pubkey?: string;
  network?: string;
  block_height?: number;
  block_hash?: string;
  methods: string[];
  notifications?: string[];
}

export interface NwcGetBalanceResult {
  /** Balance in millisatoshis. */
  balance: number;
}

export interface NwcMakeInvoiceParams {
  /** Amount in millisatoshis. */
  amount: number;
  description?: string;
  description_hash?: string;
  /** Expiry in seconds. */
  expiry?: number;
}

export interface NwcInvoice {
  type?: 'incoming' | 'outgoing';
  state?: 'pending' | 'settled' | 'expired' | 'failed';
  invoice?: string;
  description?: string;
  description_hash?: string;
  preimage?: string;
  payment_hash?: string;
  /** Amount in millisatoshis. */
  amount?: number;
  /** Fees paid in millisatoshis. */
  fees_paid?: number;
  created_at?: number;
  expires_at?: number;
  settled_at?: number;
  metadata?: unknown;
}

export interface NwcPayInvoiceParams {
  invoice: string;
  /** Optional amount in millisatoshis (for zero-amount invoices). */
  amount?: number;
}

export interface NwcPayInvoiceResult {
  preimage: string;
  fees_paid?: number;
}

export interface NwcKeysendTlvRecord {
  type: number;
  value: string;
}

export interface NwcPayKeysendParams {
  /** Amount in millisatoshis. */
  amount: number;
  /** Destination node pubkey (hex). */
  pubkey: string;
  preimage?: string;
  tlv_records?: NwcKeysendTlvRecord[];
}

export interface NwcPayKeysendResult {
  preimage: string;
  fees_paid?: number;
}

export interface NwcLookupInvoiceParams {
  payment_hash?: string;
  invoice?: string;
}

export interface NwcListTransactionsParams {
  from?: number;
  until?: number;
  limit?: number;
  offset?: number;
  unpaid?: boolean;
  type?: 'incoming' | 'outgoing';
}

export interface NwcClientOptions {
  /** Per-request timeout in milliseconds (default 60000). */
  timeoutMs?: number;
}
