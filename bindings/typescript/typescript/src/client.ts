/**
 * Kaleidoswap SDK Client
 *
 * Main entry point for interacting with the Kaleidoswap protocol.
 * Works in both browser and Node.js environments via WebAssembly.
 */

import { mapWasmError } from './errors.js';
import type {
  Asset,
  TradingPair,
  Quote,
  CreateSwapOrderResponse,
  SwapOrderStatusResponse,
  LspInfo,
  NetworkInfo,
  ChannelFees,
  KaleidoConfig,
  CreateSwapOrderRequest,
  OrderHistoryResponse,
  OrderStatsResponse,
  Layer,
  // Node API types
  RgbNodeInfoResponse,
  ListChannelsResponse,
  OpenChannelRequest,
  OpenChannelResponse,
  CloseChannelRequest,
  ListPeersResponse,
  ConnectPeerRequest,
  ListAssetsResponse,
  AssetBalanceResponse,
  AddressResponse,
  BtcBalanceResponse,
  LNInvoiceResponse,
  DecodeLNInvoiceResponse,
  KeysendRequest,
  KeysendResponse,
  ListPaymentsResponse,
  InitResponse,
} from './types.js';

// WASM module types (will be provided by wasm-pack output)
interface WasmConfig {
  free?(): void;
}

interface WasmClient {
  free?(): void;
  hasNode(): boolean;
  get maker(): WasmMakerClient;
  get rln(): WasmRlnClient;
}

interface WasmMakerClient {
  listAssets(): Promise<Asset[]>;
  listPairs(): Promise<TradingPair[]>;
  listActiveAssets(): Promise<Asset[]>;
  listActivePairs(): Promise<TradingPair[]>;
  getAssetByTicker(ticker: string): Promise<Asset>;
  getPairByTicker(ticker: string): Promise<TradingPair>;
  getQuoteByPair(
    ticker: string,
    fromAmount: number | null,
    toAmount: number | null,
    fromLayer: string,
    toLayer: string,
  ): Promise<Quote>;
  getQuoteByAssets(
    fromTicker: string,
    toTicker: string,
    fromAmount: number | null,
    toAmount: number | null,
    fromLayer: string,
    toLayer: string,
  ): Promise<Quote>;
  getNodeInfo(): Promise<NetworkInfo>;
  getSwapStatus(paymentHash: string): Promise<unknown>;
  createSwapOrder(request: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse>;
  getSwapOrderStatus(orderId: string): Promise<SwapOrderStatusResponse>;
  getOrderHistory(
    status: string | null,
    limit: number,
    skip: number,
  ): Promise<OrderHistoryResponse>;
  getOrderAnalytics(): Promise<OrderStatsResponse>;
  getLspInfo(): Promise<LspInfo>;
  getLspNetworkInfo(): Promise<NetworkInfo>;
  estimateLspFees(channelSize: number): Promise<ChannelFees>;
}

interface WasmRlnClient {
  getRgbNodeInfo(): Promise<RgbNodeInfoResponse>;
  getTakerPubkey(): Promise<string>;
  listChannels(): Promise<ListChannelsResponse>;
  openChannel(request: OpenChannelRequest): Promise<OpenChannelResponse>;
  closeChannel(request: CloseChannelRequest): Promise<void>;
  listPeers(): Promise<ListPeersResponse>;
  connectPeer(request: ConnectPeerRequest): Promise<void>;
  listNodeAssets(): Promise<ListAssetsResponse>;
  getAssetBalance(assetId: string): Promise<AssetBalanceResponse>;
  getOnchainAddress(): Promise<AddressResponse>;
  getBtcBalance(): Promise<BtcBalanceResponse>;
  createLnInvoice(
    amtMsat: number | null,
    expirySec: number | null,
    assetAmount: number | null,
    assetId: string | null,
  ): Promise<LNInvoiceResponse>;
  decodeLnInvoice(invoice: string): Promise<DecodeLNInvoiceResponse>;
  keysend(request: KeysendRequest): Promise<KeysendResponse>;
  listPayments(): Promise<ListPaymentsResponse>;
  initWallet(password: string): Promise<InitResponse>;
  unlockWallet(password: string): Promise<void>;
  lockWallet(): Promise<void>;
}

interface WasmModule {
  KaleidoConfig: {
    new(
      baseUrl: string,
      nodeUrl: string | null,
      apiKey: string | null,
      timeout: number,
      maxRetries: number,
      cacheTtl: number,
    ): WasmConfig;
  };
  KaleidoClient: { new(config: WasmConfig): WasmClient };
  toSmallestUnits: (amount: number, precision: number) => number;
  toDisplayUnits: (amount: number, precision: number) => number;
  getVersion: () => string;
  getSdkName: () => string;
}

// Module state
let wasmModule: WasmModule | null = null;
let initPromise: Promise<WasmModule> | null = null;

/**
 * Initialize the WASM module
 * This is called automatically by KaleidoClient.create()
 */
async function initWasm(): Promise<WasmModule> {
  if (wasmModule) {
    return wasmModule;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    let mod: WasmModule;

    if (typeof window === 'undefined') {
      // Server-side (Node.js)
      // pkg-node is generated during build
      mod = (await import('../pkg/kaleidoswap_sdk.js')) as unknown as WasmModule;
    } else {
      // Client-side (Browser)
      // pkg is generated during build
      const browserMod = await import('../pkg/kaleidoswap_web.js');
      mod = browserMod as unknown as WasmModule;
    }

    wasmModule = mod;
    return mod;
  })();

  return initPromise;
}

export class MakerClient {
  private inner: WasmMakerClient;

  constructor(inner: WasmMakerClient) {
    this.inner = inner;
  }

  async listAssets(): Promise<Asset[]> {
    try {
      return await this.inner.listAssets();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listPairs(): Promise<TradingPair[]> {
    try {
      return await this.inner.listPairs();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listActiveAssets(): Promise<Asset[]> {
    try {
      return await this.inner.listActiveAssets();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listActivePairs(): Promise<TradingPair[]> {
    try {
      return await this.inner.listActivePairs();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getAssetByTicker(ticker: string): Promise<Asset> {
    try {
      return await this.inner.getAssetByTicker(ticker);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getPairByTicker(ticker: string): Promise<TradingPair> {
    try {
      return await this.inner.getPairByTicker(ticker);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getQuote(
    ticker: string,
    fromAmount: number | null,
    toAmount: number | null,
    fromLayer: Layer,
    toLayer: Layer,
  ): Promise<Quote> {
    try {
      return await this.inner.getQuoteByPair(ticker, fromAmount, toAmount, fromLayer, toLayer);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getQuoteByAssets(
    fromTicker: string,
    toTicker: string,
    fromAmount: number | null,
    toAmount: number | null,
    fromLayer: Layer,
    toLayer: Layer,
  ): Promise<Quote> {
    try {
      return await this.inner.getQuoteByAssets(
        fromTicker,
        toTicker,
        fromAmount,
        toAmount,
        fromLayer,
        toLayer,
      );
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async createSwapOrder(request: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse> {
    try {
      return await this.inner.createSwapOrder(request);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getSwapOrderStatus(orderId: string): Promise<SwapOrderStatusResponse> {
    try {
      return await this.inner.getSwapOrderStatus(orderId);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getOrderHistory(
    status?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<OrderHistoryResponse> {
    try {
      return await this.inner.getOrderHistory(status ?? null, limit, skip);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getOrderAnalytics(): Promise<OrderStatsResponse> {
    try {
      return await this.inner.getOrderAnalytics();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getNodeInfo(): Promise<NetworkInfo> {
    try {
      return await this.inner.getNodeInfo();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getSwapStatus(paymentHash: string): Promise<unknown> {
    try {
      return await this.inner.getSwapStatus(paymentHash);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getLspInfo(): Promise<LspInfo> {
    try {
      return await this.inner.getLspInfo();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getLspNetworkInfo(): Promise<NetworkInfo> {
    try {
      return await this.inner.getLspNetworkInfo();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async estimateLspFees(channelSize: number): Promise<ChannelFees> {
    try {
      return await this.inner.estimateLspFees(channelSize);
    } catch (e) {
      throw mapWasmError(e);
    }
  }
}

export class RlnClient {
  private inner: WasmRlnClient;

  constructor(inner: WasmRlnClient) {
    this.inner = inner;
  }

  async getRgbNodeInfo(): Promise<RgbNodeInfoResponse> {
    try {
      return await this.inner.getRgbNodeInfo();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getTakerPubkey(): Promise<string> {
    try {
      return await this.inner.getTakerPubkey();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listChannels(): Promise<ListChannelsResponse> {
    try {
      return await this.inner.listChannels();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async openChannel(request: OpenChannelRequest): Promise<OpenChannelResponse> {
    try {
      return await this.inner.openChannel(request);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async closeChannel(request: CloseChannelRequest): Promise<void> {
    try {
      return await this.inner.closeChannel(request);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listPeers(): Promise<ListPeersResponse> {
    try {
      return await this.inner.listPeers();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async connectPeer(request: ConnectPeerRequest): Promise<void> {
    try {
      return await this.inner.connectPeer(request);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listNodeAssets(): Promise<ListAssetsResponse> {
    try {
      return await this.inner.listNodeAssets();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getAssetBalance(assetId: string): Promise<AssetBalanceResponse> {
    try {
      return await this.inner.getAssetBalance(assetId);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getOnchainAddress(): Promise<AddressResponse> {
    try {
      return await this.inner.getOnchainAddress();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async getBtcBalance(): Promise<BtcBalanceResponse> {
    try {
      return await this.inner.getBtcBalance();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async createLnInvoice(
    amtMsat?: number,
    expirySec?: number,
    assetAmount?: number,
    assetId?: string,
  ): Promise<LNInvoiceResponse> {
    try {
      return await this.inner.createLnInvoice(
        amtMsat ?? null,
        expirySec ?? null,
        assetAmount ?? null,
        assetId ?? null,
      );
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async decodeLnInvoice(invoice: string): Promise<DecodeLNInvoiceResponse> {
    try {
      return await this.inner.decodeLnInvoice(invoice);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async keysend(request: KeysendRequest): Promise<KeysendResponse> {
    try {
      return await this.inner.keysend(request);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async listPayments(): Promise<ListPaymentsResponse> {
    try {
      return await this.inner.listPayments();
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async initWallet(password: string): Promise<InitResponse> {
    try {
      return await this.inner.initWallet(password);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async unlockWallet(password: string): Promise<void> {
    try {
      return await this.inner.unlockWallet(password);
    } catch (e) {
      throw mapWasmError(e);
    }
  }

  async lockWallet(): Promise<void> {
    try {
      return await this.inner.lockWallet();
    } catch (e) {
      throw mapWasmError(e);
    }
  }
}

/**
 * Kaleidoswap SDK Client
 *
 * Provides a typed interface for interacting with the Kaleidoswap protocol.
 * Amount values are JavaScript numbers for API compatibility.
 * Note: For high-precision operations with large satoshi values, consider
 * converting to BigInt to avoid precision loss beyond 2^53.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from '@kaleidoswap/sdk';
 *
 * const client = await KaleidoClient.create({
 *     baseUrl: 'https://api.kaleidoswap.com'
 * });
 *
 * const assets = await client.maker.listAssets();
 * console.log(assets[0].ticker); // "BTC"
 * ```
 */
export class KaleidoClient {
  private inner: WasmClient;
  private config: KaleidoConfig;
  private _maker: MakerClient;
  private _rln: RlnClient;

  private constructor(inner: WasmClient, config: KaleidoConfig) {
    this.inner = inner;
    this.config = config;
    this._maker = new MakerClient(inner.maker);
    this._rln = new RlnClient(inner.rln);
  }

  /**
   * Create a new KaleidoClient instance
   *
   * @param config - Client configuration
   * @returns Promise resolving to initialized client
   */
  static async create(config: KaleidoConfig): Promise<KaleidoClient> {
    const wasm = await initWasm();

    const wasmConfig = new wasm.KaleidoConfig(
      config.baseUrl,
      config.nodeUrl ?? null,
      config.apiKey ?? null,
      config.timeout ?? 30,
      config.maxRetries ?? 3,
      config.cacheTtl ?? 60,
    );

    const inner = new wasm.KaleidoClient(wasmConfig);
    return new KaleidoClient(inner, config);
  }

  /**
   * Check if RGB Lightning Node is configured
   */
  hasNode(): boolean {
    return this.inner.hasNode();
  }

  /**
   * Access Market (Maker) Operations
   */
  get maker(): MakerClient {
    return this._maker;
  }

  /**
   * Access RGB/Lightning Node Operations
   */
  get rln(): RlnClient {
    return this._rln;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert display units to smallest units (e.g., BTC to satoshis)
 *
 * @param amount - Amount in display units
 * @param precision - Decimal precision (e.g., 8 for BTC)
 * @returns Amount in smallest units as number
 */
export async function toSmallestUnits(amount: number, precision: number): Promise<number> {
  const wasm = await initWasm();
  return wasm.toSmallestUnits(amount, precision);
}

/**
 * Convert smallest units to display units (e.g., satoshis to BTC)
 *
 * @param amount - Amount in smallest units
 * @param precision - Decimal precision (e.g., 8 for BTC)
 * @returns Amount in display units
 */
export async function toDisplayUnits(amount: number, precision: number): Promise<number> {
  const wasm = await initWasm();
  return wasm.toDisplayUnits(amount, precision);
}

/**
 * Get SDK version
 */
export async function getVersion(): Promise<string> {
  const wasm = await initWasm();
  return wasm.getVersion();
}

/**
 * Get SDK name
 */
export async function getSdkName(): Promise<string> {
  const wasm = await initWasm();
  return wasm.getSdkName();
}
