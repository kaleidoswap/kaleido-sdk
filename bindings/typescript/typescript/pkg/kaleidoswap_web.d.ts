/* tslint:disable */
/* eslint-disable */
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */

type ReadableStreamType = "bytes";

export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  start(controller: ReadableByteStreamController): void;
  cancel(): void;
  readonly autoAllocateChunkSize: number;
  readonly type: ReadableStreamType;
}

export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  abort(reason: any): Promise<any>;
  close(): Promise<any>;
  write(chunk: any): Promise<any>;
}

export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}

export class KaleidoClient {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a new Kaleidoswap client
   */
  constructor(config: KaleidoConfig);
  /**
   * Check if the client has a node URL configured
   */
  hasNode(): boolean;
  /**
   * Access the RGB/Lightning Node API
   */
  readonly rln: RlnClient;
  /**
   * Access the Market (Maker) API
   */
  readonly maker: MakerClient;
}

export class KaleidoConfig {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Set API key
   */
  setApiKey(api_key?: string | null): void;
  /**
   * Get base URL
   */
  getBaseUrl(): string;
  /**
   * Set node URL
   */
  setNodeUrl(node_url?: string | null): void;
  /**
   * Create a default configuration with a base URL
   */
  static withDefaults(base_url: string): KaleidoConfig;
  /**
   * Create a new configuration
   */
  constructor(base_url: string, node_url: string | null | undefined, api_key: string | null | undefined, timeout: number, max_retries: number, cache_ttl: number);
}

export class MakerClient {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * List all available trading pairs
   * Returns a Promise that resolves to an array of TradingPair objects
   */
  listPairs(): Promise<any>;
  /**
   * List all available assets
   * Returns a Promise that resolves to an array of Asset objects
   */
  listAssets(): Promise<any>;
  /**
   * Execute/Confirm a swap
   */
  executeSwap(request: any): Promise<any>;
  /**
   * Get LSP information
   */
  getLspInfo(): Promise<any>;
  /**
   * Get node information
   */
  getNodeInfo(): Promise<any>;
  /**
   * Get swap status by payment hash
   */
  getSwapStatus(payment_hash: string): Promise<any>;
  /**
   * Create a swap order
   * Request should be a CreateSwapOrderRequest object
   */
  createSwapOrder(request: any): Promise<any>;
  /**
   * Estimate LSP fees
   */
  estimateLspFees(channel_size: number): Promise<any>;
  /**
   * Get order history
   */
  getOrderHistory(status: string | null | undefined, limit: number, skip: number): Promise<any>;
  /**
   * Get a quote by trading pair ticker
   * from_layer and to_layer should be "BTC_LN", "BTC_L1", "RGB_LN", "RGB_L1", etc.
   */
  getQuoteByPair(ticker: string, from_amount: number | null | undefined, to_amount: number | null | undefined, from_layer: string, to_layer: string): Promise<any>;
  /**
   * List only active trading pairs
   */
  listActivePairs(): Promise<any>;
  /**
   * Get a trading pair by ticker (e.g., "BTC/USDT")
   */
  getPairByTicker(ticker: string): Promise<any>;
  /**
   * List only active assets
   */
  listActiveAssets(): Promise<any>;
  /**
   * Get an asset by ticker
   */
  getAssetByTicker(ticker: string): Promise<any>;
  /**
   * Get order analytics
   */
  getOrderAnalytics(): Promise<any>;
  /**
   * Get a quote by asset tickers (convenience method)
   */
  getQuoteByAssets(from_ticker: string, to_ticker: string, from_amount: number | null | undefined, to_amount: number | null | undefined, from_layer: string, to_layer: string): Promise<any>;
  /**
   * Get LSP network information
   */
  getLspNetworkInfo(): Promise<any>;
  /**
   * Get swap order status
   */
  getSwapOrderStatus(order_id: string): Promise<any>;
  /**
   * Initialize a swap directly with the Maker
   */
  initSwap(request: any): Promise<any>;
}

export class RlnClient {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * List peers on the RGB node
   */
  listPeers(): Promise<any>;
  /**
   * Initialize the node wallet
   */
  initWallet(password: string): Promise<any>;
  /**
   * Lock the node wallet
   */
  lockWallet(): Promise<any>;
  /**
   * Connect to a peer on the RGB node
   */
  connectPeer(request: any): Promise<any>;
  /**
   * Open a channel on the RGB node
   */
  openChannel(request: any): Promise<any>;
  /**
   * Close a channel on the RGB node
   */
  closeChannel(request: any): Promise<any>;
  /**
   * List channels on the RGB node
   */
  listChannels(): Promise<any>;
  /**
   * List payments on the node
   */
  listPayments(): Promise<any>;
  /**
   * Unlock the node wallet
   */
  unlockWallet(password: string): Promise<any>;
  /**
   * Get BTC balance from the node
   */
  getBtcBalance(): Promise<any>;
  /**
   * Whitelist a trade (if using a User Node)
   */
  whitelistTrade(swapstring: string): Promise<any>;
  /**
   * Get the taker's pubkey from the local RGB Lightning Node.
   * This is a convenience method that extracts just the pubkey from getRgbNodeInfo.
   */
  getTakerPubkey(): Promise<any>;
  /**
   * List RGB assets on the node
   */
  listNodeAssets(): Promise<any>;
  /**
   * Create a Lightning invoice on the node
   */
  createLnInvoice(amt_msat?: number | null, expiry_sec?: number | null, asset_amount?: number | null, asset_id?: string | null): Promise<any>;
  /**
   * Decode a Lightning invoice
   */
  decodeLnInvoice(invoice: string): Promise<any>;
  /**
   * Get asset balance from the node
   */
  getAssetBalance(asset_id: string): Promise<any>;
  /**
   * Get RGB node information from the taker's local RGB Lightning Node.
   * Returns pubkey and other node info needed for swap execution.
   */
  getRgbNodeInfo(): Promise<any>;
  /**
   * Get a Bitcoin address from the node
   */
  getOnchainAddress(): Promise<any>;
  /**
   * Send a keysend payment
   */
  keysend(request: any): Promise<any>;
}

/**
 * Get SDK name
 */
export function getSdkName(): string;

/**
 * Get SDK version
 */
export function getVersion(): string;

export function init_panic_hook(): void;

/**
 * Convert smallest units to display units
 */
export function toDisplayUnits(amount: number, precision: number): number;

/**
 * Convert display units to smallest units
 */
export function toSmallestUnits(amount: number, precision: number): number;
