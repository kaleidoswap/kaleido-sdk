import { HttpClient, HttpClientConfig } from './http/client';
import { WebSocketClient } from './websocket/client';
import WebSocket from 'ws';

import {
  AssetError,
  NodeError,
  PairError,
  QuoteError,
  SwapError,
  TimeoutError,
  WebSocketError,
  AssetResponse,
  TradingPair,
  PairResponse,
  PairQuoteResponse,
  SwapRequest,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  Swap,
  ClientAsset,
  Pair
} from './index';

// Order types
export type OrderStatusType = 'pending' | 'payment_pending' | 'payment_confirmed' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled';

export interface OrderCreate {
  from_asset_type: 'btc' | 'rgb';
  from_asset_id?: string;
  from_amount: number;
  to_asset_type: 'btc' | 'rgb';
  to_asset_id?: string;
  session_id?: string;
}

export interface OrderResponse {
  id: number;
  order_id: string;
  from_asset_type: 'btc' | 'rgb';
  from_asset_id: string | null;
  from_amount: number;
  to_asset_type: 'btc' | 'rgb';
  to_asset_id: string | null;
  to_amount: number;
  exchange_rate: number;
  service_fee: number;
  network_fee: number;
  deposit_address: string | null;
  deposit_rgb_invoice: string | null;
  payout_address: string | null;
  payout_rgb_invoice: string | null;
  status: OrderStatusType;
  payment_txid: string | null;
  payout_txid: string | null;
  created_at: string;
  updated_at: string | null;
  expires_at: string;
  session_id: string | null;
}

export interface OrderPaymentUpdate {
  payout_address?: string;
  payout_rgb_invoice?: string;
}

export interface APIResponse {
  success: boolean;
  message: string;
  data?: Record<string, any> | null;
}

// Wallet types
export interface WalletStatus {
  is_online: boolean;
  btc_balance: number;
  btc_spendable: number;
  last_sync: string | null;
  sync_height: number;
  next_address_index: number;
}

export interface AssetBalance {
  asset_id: string;
  settled: number;
  future: number;
  spendable: number;
}

export interface WalletBalances {
  btc_balance: number;
  btc_spendable: number;
  rgb_balances: AssetBalance[];
}

// Quote types
export interface OrderQuote {
  from_asset_type: 'btc' | 'rgb';
  from_asset_id?: string | null;
  from_amount: number;
  to_asset_type: 'btc' | 'rgb';
  to_asset_id?: string | null;
  to_amount: number;
  exchange_rate: number;
  service_fee: number;
  network_fee: number;
  total_fee: number;
  valid_for_seconds: number;
}

export interface MarketPrice {
  pair: string;
  price: number;
  volume_24h?: number;
  price_change_24h?: number;
}

export interface FeeEstimate {
  service_fee: number;
  network_fee: number;
  total_fee: number;
}

export interface OnchainTradingPairResponse extends Pair {
  is_active: boolean;
  min_trade_amount: number;
  max_trade_amount: number | null;
  last_price: number | null;
  volume_24h: number | null;
  price_change_24h: number | null;
  maker_fee: number | null;
  taker_fee: number | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface OnchainTradingPairCreate {
  base_asset: string;
  quote_asset: string;
  base_asset_id: string;
  quote_asset_id: string;
  is_active?: boolean;
  min_trade_amount?: number;
  max_trade_amount?: number | null;
}

export interface KaleidoConfig extends HttpClientConfig {
  nodeUrl: string;
  wsUrl?: string;
}

export class KaleidoClient {
  private readonly apiClient: HttpClient;
  private readonly nodeClient: HttpClient;
  private readonly wsClient: WebSocketClient;

  constructor(config: KaleidoConfig) {
    const { nodeUrl, wsUrl, ...apiConfig } = config;
    this.apiClient = new HttpClient(apiConfig);
    this.nodeClient = new HttpClient({
      ...apiConfig,
      baseUrl: nodeUrl
    });
    
    // Determine WebSocket URL
    let wsBaseUrl: string;
    if (wsUrl) {
      wsBaseUrl = wsUrl;
    } else {
      // Convert http:// or https:// to ws:// or wss://
      const url = new URL(apiConfig.baseUrl);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsBaseUrl = url.toString();
    }
    
    this.wsClient = new WebSocketClient({
      ...apiConfig,
      baseUrl: wsBaseUrl
    });
    
    if (process.env.DEBUG_WS) {
      console.log('Initialized WebSocket client with URL:', wsBaseUrl);
    }
  }

  async getLspInfo(): Promise<any> { // TODO: type
    try {
      return await this.apiClient.get('/lsps1/get_info');
    } catch (error) {
      throw new Error(`Failed to get LSP info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getLspConnectionUrl(): Promise<any> { // TODO: type
    const lspInfo = await this.getLspInfo();
    return lspInfo?.lsp_connection_url;
  }

  async getLspNetworkInfo(): Promise<any> { // TODO: type
    try {
      return await this.apiClient.get('/lsps1/network_info');
    } catch (error) {
      throw new Error(`Failed to get LSP network info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createOrder(order: any): Promise<any> { // TODO: type
    try {
      return await this.apiClient.post('/lsps1/create_order', order);
    } catch (error) {
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getOrder(orderId: string): Promise<any> { // TODO: type
    try {
      return await this.apiClient.post('/lsps1/get_order', { order_id: orderId });
    } catch (error) {
      throw new Error(`Failed to get order: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async connectPeer(connectionUrl: string): Promise<any> { // TODO: type
    try {
      return await this.nodeClient.post('/connectpeer', { peer_pubkey_and_addr: connectionUrl });
    } catch (error) {
      throw new Error(`Failed to connect peer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listPeers(): Promise<any> { // TODO: type
    try {
      return await this.nodeClient.get('/listpeers');
    } catch (error) {
      throw new Error(`Failed to list peers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getOnchainAddress(): Promise<any> { // TODO: type
    try {
      return await this.nodeClient.post('/address', {});
    } catch (error) {
      throw new Error(`Failed to get onchain address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAssetMetadata(assetId: string): Promise<any> { // TODO: type
    try {
      return await this.nodeClient.post('/assetmetadata', { asset_id: assetId });
    } catch (error) {
      throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNodeInfo(): Promise<{ pubkey: string }> {
    try {
      return await this.nodeClient.get<{ pubkey: string }>('/nodeinfo');
    } catch (error) {
      throw new NodeError(
        `Failed to get node info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getNodePubkey(): Promise<string> {
    const info = await this.getNodeInfo();
    return info.pubkey;
  }

  async listAssets(): Promise<AssetResponse> {
    try {
      return await this.apiClient.get<AssetResponse>(
        '/market/assets'
      );
    } catch (error) {
      throw new AssetError(
        `Failed to list assets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listPairs(): Promise<PairResponse> {
    try {
      return await this.apiClient.get<PairResponse>('/market/pairs');
    } catch (error) {
      throw new PairError(
        `Failed to list pairs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getPairByAssets(baseAsset: string, quoteAsset: string): Promise<TradingPair | null> {
    try {
      const response = await this.listPairs();
      const pairs = response.pairs;
      
      for (const pair of pairs) {
        if (pair.base_asset_id === baseAsset && pair.quote_asset_id === quoteAsset) {
          return pair;
        }
        if (pair.quote_asset_id === baseAsset && pair.base_asset_id === quoteAsset) {
          return pair;
        }
      }
      return null;
    } catch (error) {
      throw new PairError(
        `Failed to get trading pair: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getQuote(
    fromAsset: string,
    toAsset: string,
    fromAmount: number
  ): Promise<PairQuoteResponse> {
    try {
      return await this.apiClient.post<PairQuoteResponse>(
        '/market/quote',
        {
          from_asset: fromAsset,
          to_asset: toAsset,
          from_amount: fromAmount
        }
      );
    } catch (error) {
      throw new QuoteError(
        `Failed to get quote: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getQuoteWS(
    fromAsset: string,
    toAsset: string,
    fromAmount: number
  ): Promise<PairQuoteResponse> {
    if (this.wsClient.getConnectionState() !== WebSocket.OPEN) {
      await this.wsClient.connect();
    }

    return new Promise<PairQuoteResponse>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const quoteMessage = {
        action: 'quote_request',
        from_asset: fromAsset,
        to_asset: toAsset,
        from_amount: fromAmount,
        timestamp: Math.floor(Date.now() / 1000)
      };
      console.log('Sending quote message:', quoteMessage);

      timeoutId = setTimeout(() => {
        this.wsClient.off('quote_response', quoteHandler);
        reject(new TimeoutError('Quote request timed out'));
      }, 30000);

      const quoteHandler = (response: any) => {
        console.log('quoteHandler received:', response);
        clearTimeout(timeoutId);
        this.wsClient.off('quote_response', quoteHandler);

        if (response.error) {
          reject(new QuoteError(response.error.message || 'Failed to get quote'));
        } else if (response.data) {
          resolve(response.data);
        } else {
          resolve(response);
        }
      };

      this.wsClient.on('quote_response', quoteHandler);

      this.wsClient.send(quoteMessage).catch((error) => {
        clearTimeout(timeoutId);
        this.wsClient.off('quote_response', quoteHandler);
        reject(new WebSocketError(`Failed to send quote request: ${error.message}`));
      });
    });
  }

  async initMakerSwap(
    rfqId: string,
    fromAsset: string,
    toAsset: string,
    fromAmount: number,
    toAmount: number
  ): Promise<SwapRequest> {
    try {
      return await this.apiClient.post<SwapRequest>(
        '/swaps/init',
        {
          rfq_id: rfqId,
          from_asset: fromAsset,
          to_asset: toAsset,
          from_amount: fromAmount,
          to_amount: toAmount,
      });
    } catch (error) {
      throw new SwapError(
        `Failed to initialize maker swap: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async executeMakerSwap(request: ConfirmSwapRequest): Promise<ConfirmSwapResponse> {
    try {
      console.log('Executing maker swap with request:', JSON.stringify({
        swapstring: request.swapstring ? `${request.swapstring.substring(0, 20)}...` : 'undefined',
        payment_hash: request.payment_hash,
        taker_pubkey: request.taker_pubkey
      }, null, 2));
      
      const response = await this.apiClient.post<ConfirmSwapResponse>('/swaps/execute', {
        swapstring: request.swapstring,
        payment_hash: request.payment_hash,
        taker_pubkey: request.taker_pubkey
      });
      
      console.log('Maker swap executed successfully:', response);
      return response;
    } catch (error) {
      console.error('Error executing maker swap:', error);
      throw new SwapError(
        `Failed to execute maker swap: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  async whitelistTrade(swapstring: string): Promise<Record<string, never>> {
    try {
      return await this.nodeClient.post<Record<string, never>>('/taker', {
        swapstring,
      });
    } catch (error) {
      throw new SwapError(
        `Failed to whitelist trade: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  async getSwapStatus(paymentHash: string): Promise<Swap> {
    try {
      return await this.nodeClient.post<Swap>(`/swaps/status`, {
        payment_hash: paymentHash
      });
    } catch (error) {
      throw new SwapError(
        `Failed to get swap status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Waits for a swap to reach a terminal state (Succeeded, Failed, or Expired)
   * @param paymentHash - The payment hash of the swap to monitor
   * @param timeoutSeconds - Maximum time to wait in seconds (default: 300)
   * @param pollIntervalSeconds - Time between status checks in seconds (default: 5)
   * @returns Promise that resolves with the final swap status
   * @throws {TimeoutError} If the swap doesn't complete within the timeout
   * @throws {SwapError} If there's an error checking the swap status
   */
  async waitForSwapCompletion(
    paymentHash: string,
    timeoutSeconds = 300,
    pollIntervalSeconds = 5
  ): Promise<Swap> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    const pollIntervalMs = pollIntervalSeconds * 1000;

    while (true) {
      const swap = await this.getSwapStatus(paymentHash);
      
      // Check if swap has reached a terminal state
      if (swap.status && ['Succeeded', 'Failed', 'Expired'].includes(swap.status)) {
        return swap;
      }

      // Check if we've exceeded the timeout
      if (Date.now() - startTime >= timeoutMs) {
        throw new TimeoutError(
          `Swap ${paymentHash} did not complete within ${timeoutSeconds} seconds`
        );
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  // Onchain Asset Methods
  async onchainListAssets(): Promise<ClientAsset[]> {
    try {
      return await this.apiClient.get<ClientAsset[]>('/api/v1/assets/list');
    } catch (error) {
      throw new AssetError(
        `Failed to list onchain assets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetAsset(assetId: string): Promise<ClientAsset> {
    try {
      return await this.apiClient.get<ClientAsset>(`/api/v1/assets/${assetId}`);
    } catch (error) {
      throw new AssetError(
        `Failed to get onchain asset: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainListSupportedAssets(): Promise<ClientAsset[]> {
    try {
      return await this.apiClient.get<ClientAsset[]>('/api/v1/assets/supported/list');
    } catch (error) {
      throw new AssetError(
        `Failed to list supported onchain assets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetAssetBalance(assetId: string): Promise<{ balance: number }> {
    try {
      return await this.apiClient.get<{ balance: number }>(`/api/v1/assets/balance/${assetId}`);
    } catch (error) {
      throw new AssetError(
        `Failed to get onchain asset balance: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Onchain Trading Pair Methods
  async onchainListTradingPairs(): Promise<OnchainTradingPairResponse[]> {
    try {
      return await this.apiClient.get<OnchainTradingPairResponse[]>('/api/v1/pairs/');
    } catch (error) {
      throw new PairError(
        `Failed to list onchain trading pairs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainCreateTradingPair(pair: OnchainTradingPairCreate): Promise<OnchainTradingPairResponse> {
    try {
      return await this.apiClient.post<OnchainTradingPairResponse>('/api/v1/pairs/', pair);
    } catch (error) {
      throw new PairError(
        `Failed to create onchain trading pair: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetPairTickers(): Promise<string[]> {
    try {
      return await this.apiClient.get<string[]>('/api/v1/pairs/tickers');
    } catch (error) {
      throw new PairError(
        `Failed to get onchain pair tickers: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetTradingPair(pairId: string): Promise<OnchainTradingPairResponse> {
    try {
      return await this.apiClient.get<OnchainTradingPairResponse>(`/api/v1/pairs/${pairId}`);
    } catch (error) {
      throw new PairError(
        `Failed to get onchain trading pair: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetTradingPairByAssets(baseAsset: string, quoteAsset: string): Promise<OnchainTradingPairResponse> {
    try {
      return await this.apiClient.get<OnchainTradingPairResponse>(
        `/api/v1/pairs/by-assets/${baseAsset}/${quoteAsset}`
      );
    } catch (error) {
      throw new PairError(
        `Failed to get onchain trading pair by assets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Order Methods
  async onchainCreateOrder(order: OrderCreate): Promise<OrderResponse> {
    try {
      return await this.apiClient.post<OrderResponse>('/api/v1/orders/create', order);
    } catch (error) {
      throw new SwapError(
        `Failed to create onchain order: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetOrder(orderId: string): Promise<OrderResponse> {
    try {
      return await this.apiClient.get<OrderResponse>(`/api/v1/orders/${orderId}`);
    } catch (error) {
      throw new SwapError(
        `Failed to get onchain order: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainUpdateOrderPayment(orderId: string, payment: OrderPaymentUpdate): Promise<OrderResponse> {
    try {
      return await this.apiClient.post<OrderResponse>(`/api/v1/orders/${orderId}/payment`, payment);
    } catch (error) {
      throw new SwapError(
        `Failed to update onchain order payment: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainCancelOrder(orderId: string): Promise<APIResponse> {
    try {
      return await this.apiClient.post<APIResponse>(`/api/v1/orders/${orderId}/cancel`, {});
    } catch (error) {
      throw new SwapError(
        `Failed to cancel onchain order: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetOrdersByStatus(status: OrderStatusType): Promise<OrderResponse[]> {
    try {
      return await this.apiClient.get<OrderResponse[]>(`/api/v1/orders/status/${status}`);
    } catch (error) {
      throw new SwapError(
        `Failed to get onchain orders by status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetExpiredOrders(): Promise<OrderResponse[]> {
    try {
      return await this.apiClient.get<OrderResponse[]>('/api/v1/orders/expired/list');
    } catch (error) {
      throw new SwapError(
        `Failed to get expired onchain orders: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetOrderStatistics(): Promise<Record<string, any>> {
    try {
      return await this.apiClient.get<Record<string, any>>('/api/v1/orders/statistics/summary');
    } catch (error) {
      throw new SwapError(
        `Failed to get onchain order statistics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Wallet Methods
  async onchainGetWalletStatus(): Promise<WalletStatus> {
    try {
      return await this.apiClient.get<WalletStatus>('/api/v1/wallet/status');
    } catch (error) {
      throw new Error(
        `Failed to get wallet status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetWalletBalances(): Promise<WalletBalances> {
    try {
      return await this.apiClient.get<WalletBalances>('/api/v1/wallet/balances');
    } catch (error) {
      throw new Error(
        `Failed to get wallet balances: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainSyncWallet(): Promise<APIResponse> {
    try {
      return await this.apiClient.post<APIResponse>('/api/v1/wallet/sync', {});
    } catch (error) {
      throw new Error(
        `Failed to sync wallet: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainCreateAllocations(numAllocations: number = 5): Promise<Record<string, any>> {
    try {
      return await this.apiClient.post<Record<string, any>>(`/api/v1/wallet/allocations/create?num_allocations=${numAllocations}`, {});
    } catch (error) {
      throw new Error(
        `Failed to create allocations: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetNewAddress(): Promise<Record<string, any>> {
    try {
      return await this.apiClient.get<Record<string, any>>('/api/v1/wallet/address/new');
    } catch (error) {
      throw new Error(
        `Failed to get new address: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGenerateRgbInvoice(assetId: string, amount?: number): Promise<Record<string, any>> {
    try {
      const queryParams = amount !== undefined ? `?asset_id=${assetId}&amount=${amount}` : `?asset_id=${assetId}`;
      return await this.apiClient.post<Record<string, any>>(`/api/v1/wallet/invoice/rgb${queryParams}`, {});
    } catch (error) {
      throw new Error(
        `Failed to generate RGB invoice: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetBtcTransactions(limit: number = 50): Promise<Record<string, any>> {
    try {
      return await this.apiClient.get<Record<string, any>>(`/api/v1/wallet/transactions/btc?limit=${limit}`);
    } catch (error) {
      throw new Error(
        `Failed to get BTC transactions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainValidateBitcoinAddress(address: string): Promise<Record<string, any>> {
    try {
      return await this.apiClient.post<Record<string, any>>(`/api/v1/wallet/validate/address?address=${address}`, {});
    } catch (error) {
      throw new Error(
        `Failed to validate Bitcoin address: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainValidateRgbInvoice(invoice: string): Promise<Record<string, any>> {
    try {
      return await this.apiClient.post<Record<string, any>>(`/api/v1/wallet/validate/rgb-invoice?invoice=${invoice}`, {});
    } catch (error) {
      throw new Error(
        `Failed to validate RGB invoice: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Quote Methods
  async onchainGetQuote(
    fromAssetType: 'btc' | 'rgb',
    toAssetType: 'btc' | 'rgb',
    fromAmount: number,
    fromAssetId?: string,
    toAssetId?: string
  ): Promise<OrderQuote> {
    try {
      let queryParams = `?from_asset_type=${fromAssetType}&to_asset_type=${toAssetType}&from_amount=${fromAmount}`;
      if (fromAssetId) queryParams += `&from_asset_id=${fromAssetId}`;
      if (toAssetId) queryParams += `&to_asset_id=${toAssetId}`;
      
      return await this.apiClient.post<OrderQuote>(`/api/v1/quotes/get${queryParams}`, {});
    } catch (error) {
      throw new QuoteError(
        `Failed to get quote: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetMarketPrices(): Promise<MarketPrice[]> {
    try {
      return await this.apiClient.get<MarketPrice[]>('/api/v1/quotes/prices');
    } catch (error) {
      throw new QuoteError(
        `Failed to get market prices: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetPairPrice(pair: string): Promise<Record<string, any>> {
    try {
      return await this.apiClient.get<Record<string, any>>(`/api/v1/quotes/price/${pair}`);
    } catch (error) {
      throw new QuoteError(
        `Failed to get pair price: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainEstimateFees(
    fromAssetType: 'btc' | 'rgb',
    toAssetType: 'btc' | 'rgb',
    fromAmount: number
  ): Promise<FeeEstimate> {
    try {
      return await this.apiClient.get<FeeEstimate>(
        `/api/v1/quotes/fees/estimate?from_asset_type=${fromAssetType}&to_asset_type=${toAssetType}&from_amount=${fromAmount}`
      );
    } catch (error) {
      throw new QuoteError(
        `Failed to estimate fees: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainGetQuotesHealth(): Promise<Record<string, any>> {
    try {
      return await this.apiClient.get<Record<string, any>>('/api/v1/quotes/health');
    } catch (error) {
      throw new QuoteError(
        `Failed to get quotes health: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async onchainRefreshPrices(): Promise<APIResponse> {
    try {
      return await this.apiClient.post<APIResponse>('/api/v1/quotes/refresh', {});
    } catch (error) {
      throw new QuoteError(
        `Failed to refresh prices: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}