/**
 * Kaleidoswap SDK Client
 *
 * This is a thin wrapper around the auto-generated OpenAPI clients,
 * providing convenience methods, retry logic, and enhanced error handling.
 *
 * Generated clients used internally:
 * - KaleidoApiClient (for Kaleidoswap Maker API)
 * - RgbNodeClient (for RGB Lightning Node API)
 */

import { HttpClientConfig } from './http/client';
import { WebSocketClient } from './websocket/client';
import WebSocket from 'ws';
import {
  createAssetPairMapper,
  createPrecisionHandler,
  MappedAsset,
  AssetPairMapper,
  PrecisionHandler,
} from './utils';

// Import generated clients
import { KaleidoApiClient } from './generated/kaleido/KaleidoApiClient';
import { RgbNodeClient } from './generated/rgb-node/RgbNodeClient';

// Import types from generated code
import type {
  // Kaleidoswap API types
  AssetsResponse,
  PairResponse,
  PairQuoteRequest,
  PairQuoteResponse,
  SwapRequest,
  SwapResponse,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  SwapStatusResponse,
  GetInfoResponseModel,
  NetworkInfoResponse,
  CreateOrderRequest,
  OrderResponse,
  OrderHistoryResponse,
  OrderStatsResponse,
  CreateSwapOrderRequest,
  CreateSwapOrderResponse,
  SwapOrderStatusResponse,
  Swap,
} from './generated/kaleido';

// Import enum values (not as types since we use them as values)
import { SwapStatus, SwapOrderStatus } from './generated/kaleido';

import type {
  // RGB Node API types
  ListChannelsResponse,
  OpenChannelRequest,
  OpenChannelResponse,
  CloseChannelRequest,
  GetChannelIdRequest,
  GetChannelIdResponse,
  ListPeersResponse,
  ConnectPeerRequest,
  DisconnectPeerRequest,
  ListPaymentsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  SendPaymentRequest,
  SendPaymentResponse,
  KeysendRequest,
  KeysendResponse,
  LNInvoiceRequest,
  LNInvoiceResponse,
  DecodeLNInvoiceRequest,
  DecodeLNInvoiceResponse,
  InvoiceStatusRequest,
  InvoiceStatusResponse,
  AddressResponse,
  BtcBalanceRequest,
  BtcBalanceResponse,
  SendBtcRequest,
  SendBtcResponse,
  ListTransactionsRequest,
  ListTransactionsResponse,
  ListUnspentsRequest,
  ListUnspentsResponse,
  EstimateFeeRequest,
  EstimateFeeResponse,
  AssetBalanceRequest,
  AssetBalanceResponse,
  AssetMetadataRequest,
  AssetMetadataResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  CreateUtxosRequest,
  ListTransfersRequest,
  ListTransfersResponse,
  FailTransfersRequest,
  FailTransfersResponse,
  RefreshRequest,
  RgbInvoiceRequest,
  RgbInvoiceResponse,
  DecodeRGBInvoiceRequest,
  DecodeRGBInvoiceResponse,
  SendAssetRequest,
  SendAssetResponse,
  IssueAssetNIARequest,
  IssueAssetNIAResponse,
  IssueAssetUDARequest,
  IssueAssetUDAResponse,
  IssueAssetCFARequest,
  IssueAssetCFAResponse,
  PostAssetMediaRequest,
  PostAssetMediaResponse,
  GetAssetMediaRequest,
  GetAssetMediaResponse,
  ListSwapsResponse,
  GetSwapRequest,
  GetSwapResponse,
  MakerInitRequest,
  MakerInitResponse,
  MakerExecuteRequest,
  TakerRequest,
  InitRequest,
  InitResponse,
  UnlockRequest,
  NetworkInfoResponse as RgbNetworkInfoResponse,
  NodeInfoResponse as RgbNodeInfoResponse,
  BackupRequest,
  RestoreRequest,
  ChangePasswordRequest,
  CheckIndexerUrlRequest,
  CheckIndexerUrlResponse,
  CheckProxyEndpointRequest,
  SignMessageRequest,
  SignMessageResponse,
  SendOnionMessageRequest,
  RevokeTokenRequest,
  EmptyResponse,
} from './generated/rgb-node';

// Type aliases for backward compatibility
export type AssetResponse = AssetsResponse;

export interface KaleidoConfig extends Omit<HttpClientConfig, 'baseUrl'> {
  baseUrl?: string;
  nodeUrl?: string;
  wsUrl?: string;
  apiKey?: string;
  authToken?: string;
}

export class KaleidoClient {
  // Generated API clients
  private readonly kaleidoApi: KaleidoApiClient;
  private readonly rgbNodeApi: RgbNodeClient | null;

  // WebSocket client
  private readonly wsClient: WebSocketClient;

  // Cached utilities for enhanced methods
  private assetMapper: AssetPairMapper | null = null;
  private precisionHandler: PrecisionHandler | null = null;

  constructor(config: KaleidoConfig) {
    const { nodeUrl, wsUrl, baseUrl, authToken, ...apiConfig } = config;
    const finalBaseUrl =
      baseUrl || process.env.KALEIDO_API_URL || 'https://api.regtest.kaleidoswap.com';

    // Initialize generated clients
    this.kaleidoApi = new KaleidoApiClient({
      BASE: finalBaseUrl,
      // Add other config options as needed
    });

    this.rgbNodeApi = nodeUrl
      ? new RgbNodeClient({
        BASE: nodeUrl,
        HEADERS: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      })
      : null;

    // Initialize WebSocket client
    let wsBaseUrl: string;
    if (wsUrl) {
      wsBaseUrl = wsUrl;
    } else {
      const url = new URL(finalBaseUrl);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsBaseUrl = url.toString();
    }

    this.wsClient = new WebSocketClient({
      ...apiConfig,
      baseUrl: wsBaseUrl,
    });
  }

  public get node(): RgbNodeClient {
    this.ensureNodeClient();
    return this.rgbNodeApi!;
  }

  public get maker(): KaleidoApiClient {
    return this.kaleidoApi;
  }

  private ensureNodeClient(): void {
    if (!this.rgbNodeApi) {
      throw new Error(
        'Node URL is required for this operation. Please provide nodeUrl in the client configuration.'
      );
    }
  }

  private async getUtilities(): Promise<{
    assetMapper: AssetPairMapper;
    precisionHandler: PrecisionHandler;
  }> {
    // Use cached utilities if available
    if (this.assetMapper && this.precisionHandler) {
      return {
        assetMapper: this.assetMapper,
        precisionHandler: this.precisionHandler,
      };
    }

    // Initialize utilities
    const pairs = await this.listPairs();
    this.assetMapper = createAssetPairMapper(pairs);
    const allAssets = this.assetMapper.getAllAssets();
    this.precisionHandler = createPrecisionHandler(allAssets);

    return {
      assetMapper: this.assetMapper,
      precisionHandler: this.precisionHandler,
    };
  }

  private async resolveAssetIdentifier(identifier: string): Promise<MappedAsset> {
    if (identifier.includes('rgb:') || identifier.length > 20) {
      const asset = await this.getAssetById(identifier);
      if (!asset) {
        throw new Error(`Asset with ID '${identifier}' not found`);
      }
      return asset;
    } else {
      const asset = await this.getAssetByTicker(identifier);
      if (!asset) {
        throw new Error(`Asset with ticker '${identifier}' not found`);
      }
      return asset;
    }
  }

  private async resolvePairIdentifier(
    pairOrFromAsset: string | { baseAsset: MappedAsset; quoteAsset: MappedAsset },
    toAsset?: string
  ): Promise<{ baseAsset: MappedAsset; quoteAsset: MappedAsset }> {
    if (typeof pairOrFromAsset === 'object') {
      return pairOrFromAsset;
    }

    if (toAsset) {
      const baseAsset = await this.resolveAssetIdentifier(pairOrFromAsset);
      const quoteAsset = await this.resolveAssetIdentifier(toAsset);
      return { baseAsset, quoteAsset };
    }

    const separators = ['/', '-'];
    let baseTicker: string | undefined;
    let quoteTicker: string | undefined;

    for (const separator of separators) {
      if (pairOrFromAsset.includes(separator)) {
        [baseTicker, quoteTicker] = pairOrFromAsset.split(separator);
        break;
      }
    }

    if (!baseTicker || !quoteTicker) {
      throw new Error(
        `Invalid pair format: '${pairOrFromAsset}'. Use format like 'BTC/USDT' or 'BTC-USDT'`
      );
    }

    const baseAsset = await this.resolveAssetIdentifier(baseTicker.trim());
    const quoteAsset = await this.resolveAssetIdentifier(quoteTicker.trim());

    return { baseAsset, quoteAsset };
  }

  async getAssetByTicker(ticker: string): Promise<MappedAsset | null> {
    const pairs = await this.listPairs();
    const assetMapper = createAssetPairMapper(pairs);
    return assetMapper.findByTicker(ticker) || null;
  }

  async getAssetById(assetId: string): Promise<MappedAsset | null> {
    const pairs = await this.listPairs();
    const assetMapper = createAssetPairMapper(pairs);
    return assetMapper.findById(assetId) || null;
  }

  async getPairByTicker(
    baseTicker: string,
    quoteTicker: string
  ): Promise<{
    baseAsset: MappedAsset;
    quoteAsset: MappedAsset;
    canTrade: boolean;
  } | null> {
    const { assetMapper } = await this.getUtilities();

    const baseAsset = assetMapper.findByTicker(baseTicker);
    const quoteAsset = assetMapper.findByTicker(quoteTicker);

    if (!baseAsset || !quoteAsset) {
      return null;
    }

    return {
      baseAsset,
      quoteAsset,
      canTrade: assetMapper.canTrade(baseAsset.asset_id, quoteAsset.asset_id),
    };
  }

  // Overload signatures for getQuoteByAssets
  async getQuoteByAssets(
    pair: string,
    amount: number
  ): Promise<
    PairQuoteResponse & {
      fromAsset: MappedAsset;
      toAsset: MappedAsset;
      fromDisplayAmount: number;
      toDisplayAmount: number;
    }
  >;
  async getQuoteByAssets(
    pair: { baseAsset: MappedAsset; quoteAsset: MappedAsset },
    amount: number
  ): Promise<
    PairQuoteResponse & {
      fromAsset: MappedAsset;
      toAsset: MappedAsset;
      fromDisplayAmount: number;
      toDisplayAmount: number;
    }
  >;
  async getQuoteByAssets(
    fromAssetIdentifier: string,
    toAssetIdentifier: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<
    PairQuoteResponse & {
      fromAsset: MappedAsset;
      toAsset: MappedAsset;
      fromDisplayAmount: number;
      toDisplayAmount: number;
    }
  >;
  // Implementation
  async getQuoteByAssets(
    pairOrFromAsset: string | { baseAsset: MappedAsset; quoteAsset: MappedAsset },
    toAssetOrAmount: string | number,
    fromAmount?: number,
    toAmount?: number
  ): Promise<
    PairQuoteResponse & {
      fromAsset: MappedAsset;
      toAsset: MappedAsset;
      fromDisplayAmount: number;
      toDisplayAmount: number;
    }
  > {
    const { assetMapper, precisionHandler } = await this.getUtilities();

    let resolvedFromAsset: MappedAsset;
    let resolvedToAsset: MappedAsset;
    let finalFromAmount: number | undefined;
    let finalToAmount: number | undefined;

    // Handle different call signatures
    if (typeof pairOrFromAsset === 'string' && typeof toAssetOrAmount === 'number') {
      // Signature 1: getQuoteByAssets('BTC/USDT', 0.001)
      const pair = await this.resolvePairIdentifier(pairOrFromAsset);
      resolvedFromAsset = pair.baseAsset;
      resolvedToAsset = pair.quoteAsset;
      finalFromAmount = toAssetOrAmount;
      finalToAmount = undefined;
    } else if (typeof pairOrFromAsset === 'object' && typeof toAssetOrAmount === 'number') {
      // Signature 2: getQuoteByAssets(pairObject, 0.001)
      resolvedFromAsset = pairOrFromAsset.baseAsset;
      resolvedToAsset = pairOrFromAsset.quoteAsset;
      finalFromAmount = toAssetOrAmount;
      finalToAmount = undefined;
    } else if (typeof pairOrFromAsset === 'string' && typeof toAssetOrAmount === 'string') {
      // Signature 3: getQuoteByAssets('BTC', 'USDT', 0.001, undefined)
      resolvedFromAsset = await this.resolveAssetIdentifier(pairOrFromAsset);
      resolvedToAsset = await this.resolveAssetIdentifier(toAssetOrAmount);
      finalFromAmount = fromAmount;
      finalToAmount = toAmount;
    } else {
      throw new Error(
        'Invalid parameters. Use getQuoteByAssets(pair, amount) or getQuoteByAssets(fromAsset, toAsset, amount)'
      );
    }

    // Check if trading pair is valid
    if (!assetMapper.canTrade(resolvedFromAsset.asset_id, resolvedToAsset.asset_id)) {
      throw new Error(
        `Cannot trade ${resolvedFromAsset.ticker} for ${resolvedToAsset.ticker}. No active trading pair found.`
      );
    }

    let rawFromAmount: number | undefined;
    let rawToAmount: number | undefined;

    // Convert from amount to raw/atomic units
    if (finalFromAmount !== undefined) {
      const validation = precisionHandler.validateOrderSize(finalFromAmount, resolvedFromAsset);
      if (!validation.valid) {
        throw new Error(`Invalid order size: ${validation.error || 'Unknown validation error'}`);
      }
      rawFromAmount = validation.rawAmount;
    }

    // Convert to amount to raw/atomic units
    if (finalToAmount !== undefined) {
      const validation = precisionHandler.validateOrderSize(finalToAmount, resolvedToAsset);
      if (!validation.valid) {
        throw new Error(`Invalid order size: ${validation.error || 'Unknown validation error'}`);
      }
      rawToAmount = validation.rawAmount;
    }

    // Get quote from API
    const quote = await this.getQuote(
      resolvedFromAsset.asset_id,
      resolvedToAsset.asset_id,
      rawFromAmount,
      rawToAmount
    );

    return {
      ...quote,
      fromAsset: resolvedFromAsset,
      toAsset: resolvedToAsset,
      fromDisplayAmount: precisionHandler.toDisplayAmount(
        quote.from_amount,
        resolvedFromAsset.asset_id
      ),
      toDisplayAmount: precisionHandler.toDisplayAmount(quote.to_amount, resolvedToAsset.asset_id),
    };
  }

  async getQuoteByPair(
    pair: string,
    amount: number,
    fromAmount?: boolean
  ): Promise<
    PairQuoteResponse & {
      fromAsset: MappedAsset;
      toAsset: MappedAsset;
      fromDisplayAmount: number;
      toDisplayAmount: number;
    }
  > {
    const pairInfo = await this.resolvePairIdentifier(pair);

    // By default, interpret amount as the base asset (from) amount
    if (fromAmount !== false) {
      return this.getQuoteByAssets(
        pairInfo.baseAsset.ticker,
        pairInfo.quoteAsset.ticker,
        amount,
        undefined
      );
    } else {
      // Interpret amount as the quote asset (to) amount
      return this.getQuoteByAssets(
        pairInfo.baseAsset.ticker,
        pairInfo.quoteAsset.ticker,
        undefined,
        amount
      );
    }
  }

  // ============================================================
  // LSPS1 / LSP Methods (using generated Kaleidoswap API client)
  // ============================================================

  async getLspInfo(): Promise<GetInfoResponseModel> {
    return await this.kaleidoApi.lsps1.getInfoApiV1Lsps1GetInfoGet();
  }

  async getLspConnectionUrl(): Promise<string> {
    const lspInfo = await this.getLspInfo();
    return lspInfo.lsp_connection_url;
  }

  async getLspNetworkInfo(): Promise<NetworkInfoResponse> {
    return await this.kaleidoApi.lsps1.getNetworkInfoApiV1Lsps1NetworkInfoGet();
  }

  async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    return await this.kaleidoApi.lsps1.createOrderApiV1Lsps1CreateOrderPost(request);
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    return await this.kaleidoApi.lsps1.getOrderApiV1Lsps1GetOrderPost({ order_id: orderId });
  }

  async getOrderHistory(params?: {
    status?: SwapOrderStatus | null;
    limit?: number;
    skip?: number;
  }): Promise<OrderHistoryResponse> {
    return await this.kaleidoApi.swapOrders.getOrderHistoryApiV1SwapsOrdersHistoryGet(
      params?.status,
      params?.limit,
      params?.skip
    );
  }

  /**
   * Get swap order analytics/statistics (standardized method name)
   */
  async getSwapOrderAnalytics(): Promise<OrderStatsResponse> {
    return await this.kaleidoApi.swapOrders.getOrderStatsApiV1SwapsOrdersAnalyticsGet();
  }

  // ============================================================
  // Market Methods (using generated Kaleidoswap API client)
  // ============================================================

  async listAssets(): Promise<AssetResponse> {
    return await this.kaleidoApi.market.listAssetsApiV1MarketAssetsGet();
  }

  async listPairs(): Promise<PairResponse> {
    return await this.kaleidoApi.market.getPairsApiV1MarketPairsGet();
  }

  async getQuote(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    const requestBody: PairQuoteRequest =
      fromAmount !== undefined
        ? {
          from_asset: fromAsset,
          to_asset: toAsset,
          from_amount: fromAmount,
        }
        : {
          from_asset: fromAsset,
          to_asset: toAsset,
          to_amount: toAmount,
        };

    return await this.kaleidoApi.market.getQuoteApiV1MarketQuotePost(requestBody);
  }

  async getQuoteWebSocket(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    if (this.wsClient.getConnectionState() !== WebSocket.OPEN) {
      await this.wsClient.connect();
    }

    return new Promise<PairQuoteResponse>((resolve, reject) => {
      const quoteMessage =
        fromAmount !== undefined
          ? {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            from_amount: fromAmount,
            timestamp: Math.floor(Date.now() / 1000),
          }
          : {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            to_amount: toAmount,
            timestamp: Math.floor(Date.now() / 1000),
          };

      const timeoutId = setTimeout(() => {
        this.wsClient.off('quote_response', quoteHandler);
        reject(new Error('Quote request timed out'));
      }, 30000);

      const quoteHandler = (
        response: { error?: { message?: string }; data?: PairQuoteResponse } | PairQuoteResponse
      ) => {
        clearTimeout(timeoutId);
        this.wsClient.off('quote_response', quoteHandler);

        if ('error' in response && response.error) {
          reject(new Error(response.error.message || 'Failed to get quote'));
        } else if ('data' in response && response.data) {
          resolve(response.data);
        } else {
          resolve(response as PairQuoteResponse);
        }
      };

      this.wsClient.on('quote_response', quoteHandler);

      this.wsClient.send(quoteMessage).catch(error => {
        clearTimeout(timeoutId);
        this.wsClient.off('quote_response', quoteHandler);
        reject(
          new Error(
            `Failed to send quote request: ${error instanceof Error ? error.message : String(error)
            }`
          )
        );
      });
    });
  }

  // ============================================================
  // Swap Methods (using generated Kaleidoswap API client)
  // ============================================================

  async initMakerSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.kaleidoApi.swaps.initiateSwapApiV1SwapsInitPost(request);
  }

  async executeMakerSwap(request: ConfirmSwapRequest): Promise<ConfirmSwapResponse> {
    return await this.kaleidoApi.swaps.confirmSwapApiV1SwapsExecutePost(request);
  }

  async getSwapStatus(paymentHash: string): Promise<SwapStatusResponse> {
    return await this.kaleidoApi.swaps.getSwapStatusApiV1SwapsAtomicStatusPost({
      payment_hash: paymentHash,
    });
  }

  async createSwapOrder(request: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse> {
    return await this.kaleidoApi.swapOrders.createSwapOrderApiV1SwapsOrdersPost(request);
  }

  /**
   * Get swap order status by order ID (standardized method name)
   * @param orderId - The order ID
   */
  async getSwapOrderStatus(orderId: string): Promise<SwapOrderStatusResponse> {
    return await this.kaleidoApi.swapOrders.getSwapOrderStatusApiV1SwapsOrdersStatusPost({
      order_id: orderId,
    });
  }

  async getNodeInfo(): Promise<RgbNodeInfoResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.getNodeinfo();
  }

  async getNodePubkey(): Promise<string> {
    const info = await this.getNodeInfo();
    return info.pubkey || '';
  }

  // ============================================================
  // Convenience Swap Methods
  // ============================================================

  async waitForSwapCompletion(
    paymentHash: string,
    options: {
      timeout?: number;
      pollInterval?: number;
      onStatusUpdate?: (status: SwapStatus) => void;
    } = {}
  ): Promise<Swap> {
    this.ensureNodeClient();
    const { timeout = 300000, pollInterval = 2000, onStatusUpdate } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const statusResponse = await this.getSwapStatus(paymentHash);
        const swap = statusResponse.swap;

        if (swap && onStatusUpdate) {
          onStatusUpdate(swap.status);
        }

        if (
          swap &&
          (swap.status === SwapStatus.SUCCEEDED ||
            swap.status === SwapStatus.FAILED ||
            swap.status === SwapStatus.EXPIRED)
        ) {
          return swap;
        }
      } catch (error) {
        // Continue polling even if there's an error
        console.warn('Error checking swap status:', error);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Swap completion timeout after ${timeout}ms`);
  }

  async executeSwap(
    rfqId: string,
    fromAsset: string,
    toAsset: string,
    fromAmount: number,
    toAmount: number,
    takerPubkey: string,
    options: {
      waitForCompletion?: boolean;
      timeout?: number;
      pollInterval?: number;
    } = {}
  ): Promise<{ swapstring: string; payment_hash: string; swap?: Swap }> {
    // Step 1: Initialize the swap
    const initResponse = await this.initMakerSwap({
      rfq_id: rfqId,
      from_asset: fromAsset,
      to_asset: toAsset,
      from_amount: fromAmount,
      to_amount: toAmount,
    });
    //
    await this.whitelistTrade(initResponse.swapstring);

    // Step 2: Execute the swap
    await this.executeMakerSwap({
      swapstring: initResponse.swapstring,
      payment_hash: initResponse.payment_hash,
      taker_pubkey: takerPubkey,
    });

    // Step 3: Optionally wait for completion
    if (options.waitForCompletion) {
      const swap = await this.waitForSwapCompletion(initResponse.payment_hash, {
        timeout: options.timeout,
        pollInterval: options.pollInterval,
      });

      return {
        swapstring: initResponse.swapstring,
        payment_hash: initResponse.payment_hash,
        swap,
      };
    }

    return {
      swapstring: initResponse.swapstring,
      payment_hash: initResponse.payment_hash,
    };
  }

  async executeSwapByPair(
    pair: string,
    amount: number,
    side: 'buy' | 'sell',
    takerPubkey: string,
    options: {
      waitForCompletion?: boolean;
      timeout?: number;
      pollInterval?: number;
    } = {}
  ): Promise<{ swapstring: string; payment_hash: string; swap?: Swap }> {
    const pairInfo = await this.resolvePairIdentifier(pair);

    // Get quote based on the side (buy or sell)
    let quote;
    if (side === 'sell') {
      // Selling base asset, so amount is in base asset terms
      quote = await this.getQuoteByAssets(
        pairInfo.baseAsset.ticker,
        pairInfo.quoteAsset.ticker,
        amount,
        undefined
      );
    } else {
      // Buying base asset, so amount is in base asset terms (what we want to receive)
      quote = await this.getQuoteByAssets(
        pairInfo.quoteAsset.ticker,
        pairInfo.baseAsset.ticker,
        undefined,
        amount
      );
    }

    return this.executeSwap(
      quote.rfq_id,
      quote.fromAsset.asset_id,
      quote.toAsset.asset_id,
      quote.from_amount,
      quote.to_amount,
      takerPubkey,
      options
    );
  }

  // ============================================================
  // RGB Lightning Node Methods (using generated RGB Node client)
  // ============================================================

  async whitelistTrade(swapstring: string): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.swaps.postTaker({ swapstring });
  }

  async connectPeer(connectionUrl: string): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.peers.postConnectpeer({ peer_pubkey_and_addr: connectionUrl });
  }

  async getAssetMetadata(assetId: string): Promise<AssetMetadataResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postAssetmetadata({ asset_id: assetId });
  }

  // Channel Methods
  async listChannels(): Promise<ListChannelsResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.channels.getListchannels();
  }

  async openChannel(request: OpenChannelRequest): Promise<OpenChannelResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.channels.postOpenchannel(request);
  }

  async closeChannel(request: CloseChannelRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.channels.postClosechannel(request);
  }

  async getChannelId(request: GetChannelIdRequest): Promise<GetChannelIdResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.channels.postGetchannelid(request);
  }

  // Peer Methods
  async listPeers(): Promise<ListPeersResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.peers.getListpeers();
  }

  async connectPeerTyped(request: ConnectPeerRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.peers.postConnectpeer(request);
  }

  async disconnectPeer(request: DisconnectPeerRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.peers.postDisconnectpeer(request);
  }

  // Payment Methods
  async listPayments(): Promise<ListPaymentsResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.payments.getListpayments();
  }

  async getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.payments.postGetpayment(request);
  }

  async sendPayment(request: SendPaymentRequest): Promise<SendPaymentResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.payments.postSendpayment(request);
  }

  async keysend(request: KeysendRequest): Promise<KeysendResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.payments.postKeysend(request);
  }

  // Invoice Methods
  async createLNInvoice(request: LNInvoiceRequest): Promise<LNInvoiceResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.invoices.postLninvoice(request);
  }

  async decodeLNInvoice(request: DecodeLNInvoiceRequest): Promise<DecodeLNInvoiceResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.invoices.postDecodelninvoice(request);
  }

  async getInvoiceStatus(request: InvoiceStatusRequest): Promise<InvoiceStatusResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.invoices.postInvoicestatus(request);
  }

  // On-chain Methods
  async getAddress(): Promise<AddressResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.onChain.postAddress();
  }

  async getBtcBalance(request?: BtcBalanceRequest): Promise<BtcBalanceResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.onChain.postBtcbalance(request || {});
  }

  async sendBtc(request: SendBtcRequest): Promise<SendBtcResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.onChain.postSendbtc(request);
  }

  async listTransactions(request?: ListTransactionsRequest): Promise<ListTransactionsResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.onChain.postListtransactions(request || {});
  }

  async listUnspents(request?: ListUnspentsRequest): Promise<ListUnspentsResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.onChain.postListunspents(request || {});
  }

  async estimateFee(request: EstimateFeeRequest): Promise<EstimateFeeResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.onChain.postEstimatefee(request);
  }

  // RGB Asset Methods
  async getAssetBalance(request: AssetBalanceRequest): Promise<AssetBalanceResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postAssetbalance(request);
  }

  async getAssetMetadataTyped(request: AssetMetadataRequest): Promise<AssetMetadataResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postAssetmetadata(request);
  }

  async listRgbAssets(request?: ListAssetsRequest): Promise<ListAssetsResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postListassets(request || {});
  }

  async createUtxos(request: CreateUtxosRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postCreateutxos(request);
  }

  async listTransfers(request?: ListTransfersRequest): Promise<ListTransfersResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postListtransfers(request || {});
  }

  async failTransfers(request?: FailTransfersRequest): Promise<FailTransfersResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postFailtransfers(request || {});
  }

  async refreshTransfers(request?: RefreshRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postRefreshtransfers(request || {});
  }

  async syncRgbWallet(): Promise<EmptyResponse> {
    return await this.refreshTransfers({});
  }

  async createRgbInvoice(request: RgbInvoiceRequest): Promise<RgbInvoiceResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postRgbinvoice(request);
  }

  async decodeRgbInvoice(request: DecodeRGBInvoiceRequest): Promise<DecodeRGBInvoiceResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postDecodergbinvoice(request);
  }

  async sendAsset(request: SendAssetRequest): Promise<SendAssetResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postSendasset(request);
  }

  async issueAssetNIA(request: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postIssueassetnia(request);
  }

  async issueAssetUDA(request: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postIssueassetuda(request);
  }

  async issueAssetCFA(request: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postIssueassetcfa(request);
  }

  async postAssetMedia(request: PostAssetMediaRequest): Promise<PostAssetMediaResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postPostassetmedia(request);
  }

  async getAssetMedia(request: GetAssetMediaRequest): Promise<GetAssetMediaResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.rgb.postGetassetmedia(request);
  }

  // RGB Swap Methods
  async listSwaps(): Promise<ListSwapsResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.swaps.getListswaps();
  }

  async getSwap(request: GetSwapRequest): Promise<GetSwapResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.swaps.postGetswap(request);
  }

  async makerInit(request: MakerInitRequest): Promise<MakerInitResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.swaps.postMakerinit(request);
  }

  async makerExecute(request: MakerExecuteRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.swaps.postMakerexecute(request);
  }

  async taker(request: TakerRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.swaps.postTaker(request);
  }

  // Node Management Methods
  async initNode(request: InitRequest): Promise<InitResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postInit(request);
  }

  async unlockNode(request: UnlockRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postUnlock(request);
  }

  async lockNode(): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postLock();
  }

  async getNetworkInfo(): Promise<RgbNetworkInfoResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.getNetworkinfo();
  }

  async backupNode(request: BackupRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postBackup(request);
  }

  async restoreNode(request: RestoreRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postRestore(request);
  }

  async changePassword(request: ChangePasswordRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postChangepassword(request);
  }

  async checkIndexerUrl(request: CheckIndexerUrlRequest): Promise<CheckIndexerUrlResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postCheckindexerurl(request);
  }

  async checkProxyEndpoint(request: CheckProxyEndpointRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postCheckproxyendpoint(request);
  }

  async signMessage(request: SignMessageRequest): Promise<SignMessageResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postSignmessage(request);
  }

  async sendOnionMessage(request: SendOnionMessageRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postSendonionmessage(request);
  }

  async revokeToken(request: RevokeTokenRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postRevoketoken(request);
  }

  async shutdownNode(): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.rgbNodeApi!.other.postShutdown();
  }

  // ============================================================
  // Backward Compatibility Aliases (DEPRECATED)
  // ============================================================

  /**
   * @deprecated Use listAssets() instead. This method will be removed in v2.0.0
   */
  async assetList(): Promise<AssetResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('assetList() is deprecated. Use listAssets() instead.');
    }
    return this.listAssets();
  }

  /**
   * @deprecated Use listPairs() instead. This method will be removed in v2.0.0
   */
  async pairList(): Promise<PairResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('pairList() is deprecated. Use listPairs() instead.');
    }
    return this.listPairs();
  }

  /**
   * @deprecated Use getQuote() instead. This method will be removed in v2.0.0
   */
  async quoteRequest(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('quoteRequest() is deprecated. Use getQuote() instead.');
    }
    return this.getQuote(fromAsset, toAsset, fromAmount, toAmount);
  }

  /**
   * @deprecated Use getQuoteWebSocket() instead. This method will be removed in v2.0.0
   */
  async quoteRequestWS(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('quoteRequestWS() is deprecated. Use getQuoteWebSocket() instead.');
    }
    return this.getQuoteWebSocket(fromAsset, toAsset, fromAmount, toAmount);
  }

  /**
   * @deprecated Use getSwapStatus() instead. This method will be removed in v2.0.0
   */
  async atomicSwapStatus(paymentHash: string): Promise<SwapStatusResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('atomicSwapStatus() is deprecated. Use getSwapStatus() instead.');
    }
    return this.getSwapStatus(paymentHash);
  }

  /**
   * @deprecated Use getSwapOrderStatus() instead. This method will be removed in v2.0.0
   */
  async swapOrderStatus(orderId: string): Promise<SwapOrderStatusResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('swapOrderStatus() is deprecated. Use getSwapOrderStatus() instead.');
    }
    return this.getSwapOrderStatus(orderId);
  }

  /**
   * @deprecated Use getSwapOrderAnalytics() instead. This method will be removed in v2.0.0
   */
  async swapOrderAnalytic(): Promise<OrderStatsResponse> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('swapOrderAnalytic() is deprecated. Use getSwapOrderAnalytics() instead.');
    }
    return this.getSwapOrderAnalytics();
  }

  // ============================================================
  // Additional Convenience Methods
  // ============================================================

  /**
   * Validate an amount for a given asset
   * @param amount - The amount to validate (in display units)
   * @param assetIdentifier - Asset ticker or ID
   */
  async validateAmount(
    amount: number,
    assetIdentifier: string
  ): Promise<{
    valid: boolean;
    normalizedAmount: number;
    rawAmount: number;
    error?: string;
    minAmount?: number;
    maxAmount?: number;
  }> {
    try {
      const asset = await this.resolveAssetIdentifier(assetIdentifier);
      const { precisionHandler } = await this.getUtilities();

      const validation = precisionHandler.validateOrderSize(amount, asset);

      return {
        valid: validation.valid,
        normalizedAmount: amount,
        rawAmount: validation.rawAmount || 0,
        error: validation.error,
        minAmount: asset.min_order_size
          ? precisionHandler.toDisplayAmount(asset.min_order_size, asset.asset_id)
          : undefined,
        maxAmount: asset.max_order_size
          ? precisionHandler.toDisplayAmount(asset.max_order_size, asset.asset_id)
          : undefined,
      };
    } catch (error) {
      return {
        valid: false,
        normalizedAmount: amount,
        rawAmount: 0,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Convert between raw (atomic) amount and display amount
   * @param amount - The amount to convert
   * @param assetIdentifier - Asset ticker or ID
   * @param direction - Conversion direction ('toDisplay' or 'toRaw')
   */
  async convertAmount(
    amount: number,
    assetIdentifier: string,
    direction: 'toDisplay' | 'toRaw'
  ): Promise<number> {
    const asset = await this.resolveAssetIdentifier(assetIdentifier);
    const { precisionHandler } = await this.getUtilities();

    if (direction === 'toDisplay') {
      return precisionHandler.toDisplayAmount(amount, asset.asset_id);
    } else {
      return precisionHandler.toRawAmount(amount, asset.asset_id);
    }
  }

  /**
   * Complete an atomic swap in one call (init + execute + wait)
   * @param request - Swap initialization parameters
   * @param takerPubkey - Taker's public key
   * @param options - Options for wait behavior
   */
  async completeSwap(
    request: SwapRequest,
    takerPubkey: string,
    options: {
      timeout?: number;
      pollInterval?: number;
      onStatusUpdate?: (status: SwapStatus) => void;
    } = {}
  ): Promise<{ swapstring: string; payment_hash: string; swap: Swap }> {
    // Step 1: Initialize the swap
    const initResponse = await this.initMakerSwap(request);

    // Step 2: Whitelist the trade
    await this.whitelistTrade(initResponse.swapstring);

    // Step 3: Execute the swap
    await this.executeMakerSwap({
      swapstring: initResponse.swapstring,
      payment_hash: initResponse.payment_hash,
      taker_pubkey: takerPubkey,
    });

    // Step 4: Wait for completion
    const swap = await this.waitForSwapCompletion(initResponse.payment_hash, {
      timeout: options.timeout,
      pollInterval: options.pollInterval,
      onStatusUpdate: options.onStatusUpdate,
    });

    return {
      swapstring: initResponse.swapstring,
      payment_hash: initResponse.payment_hash,
      swap,
    };
  }

  /**
   * Create a swap order by pair ticker
   * @param pair - Trading pair (e.g., "BTC/USDT")
   * @param amount - Amount in base asset terms
   * @param request - Additional swap order parameters
   */
  async createSwapOrderByPair(
    pair: string,
    amount: number,
    request: Omit<CreateSwapOrderRequest, 'rfq_id'>
  ): Promise<CreateSwapOrderResponse> {
    const pairInfo = await this.resolvePairIdentifier(pair);

    // Get quote first
    const quote = await this.getQuoteByAssets(
      pairInfo.baseAsset.ticker,
      pairInfo.quoteAsset.ticker,
      amount,
      undefined
    );

    // Create the swap order
    return await this.createSwapOrder({
      ...request,
      rfq_id: quote.rfq_id,
    });
  }

  /**
   * Refresh internal caches for assets and pairs
   * Useful when you know the market data has changed
   */
  async refreshCache(): Promise<void> {
    this.assetMapper = null;
    this.precisionHandler = null;
    await this.getUtilities();
  }

  /**
   * Check if a trading pair exists and is tradeable
   * @param baseTicker - Base asset ticker
   * @param quoteTicker - Quote asset ticker
   */
  async canTrade(baseTicker: string, quoteTicker: string): Promise<boolean> {
    try {
      const pair = await this.getPairByTicker(baseTicker, quoteTicker);
      return pair?.canTrade || false;
    } catch {
      return false;
    }
  }
}

// Export generated types for convenience
export type {
  // Re-export commonly used types
  PairQuoteResponse,
  PairQuoteRequest,
  SwapRequest,
  SwapResponse,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  Swap,
  SwapStatus,
  GetInfoResponseModel,
  NetworkInfoResponse,
  CreateOrderRequest,
  OrderResponse,
  RgbNodeInfoResponse as NodeInfoResponse,
};
