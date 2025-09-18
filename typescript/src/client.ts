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
  PairResponse,
  PairQuoteResponse,
  SwapRequest,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  Swap,
  Pair,
  CreateOrderRequest,
} from './index';

export interface KaleidoConfig extends HttpClientConfig {
  nodeUrl?: string;
  wsUrl?: string;
}

export class KaleidoClient {
  private readonly apiClient: HttpClient;
  private readonly nodeClient: HttpClient | null;
  private readonly wsClient: WebSocketClient;

  constructor(config: KaleidoConfig) {
    const { nodeUrl, wsUrl, ...apiConfig } = config;
    this.apiClient = new HttpClient(apiConfig);
    this.nodeClient = nodeUrl ? new HttpClient({
      ...apiConfig,
      baseUrl: nodeUrl
    }) : null;
    
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

  async connectPeer(connectionUrl: string): Promise<any> { // TODO: type
    if (!this.nodeClient) {
      throw new NodeError('Node URL is required for connecting peers');
    }
    try {
      return await this.nodeClient.post('/connectpeer', { peer_pubkey_and_addr: connectionUrl });
    } catch (error) {
      throw new Error(`Failed to connect peer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAssetMetadata(assetId: string): Promise<any> { // TODO: type
    if (!this.nodeClient) {
      throw new NodeError('Node URL is required for getting asset metadata');
    }
    try {
      return await this.nodeClient.post('/assetmetadata', { asset_id: assetId });
    } catch (error) {
      throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNodeInfo(): Promise<{ pubkey: string }> {
    if (!this.nodeClient) {
      throw new NodeError('Node URL is required for getting node info');
    }
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

  async getPairByAssets(baseAsset: string, quoteAsset: string): Promise<Pair | null> {
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
    amount: number,
    amountType: 'from' | 'to' = 'from'
  ): Promise<PairQuoteResponse> {
    try {
      const requestBody = amountType === 'from'
        ? {
            from_asset: fromAsset,
            to_asset: toAsset,
            from_amount: amount
          }
        : {
            from_asset: fromAsset,
            to_asset: toAsset,
            to_amount: amount
          };

      return await this.apiClient.post<PairQuoteResponse>(
        '/market/quote',
        requestBody
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
    amount: number,
    amountType: 'from' | 'to' = 'from'
  ): Promise<PairQuoteResponse> {
    if (this.wsClient.getConnectionState() !== WebSocket.OPEN) {
      await this.wsClient.connect();
    }

    return new Promise<PairQuoteResponse>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const quoteMessage = amountType === 'from'
        ? {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            from_amount: amount,
            timestamp: Math.floor(Date.now() / 1000)
          }
        : {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            to_amount: amount,
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
    if (!this.nodeClient) {
      throw new NodeError('Node URL is required for whitelisting trades');
    }
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
  
  async getSwapStatus(orderId: any): Promise<Swap> {
    if (!this.nodeClient) {
      throw new NodeError('Node URL is required for getting swap status');
    }
    try {
      return await this.nodeClient.post<Swap>(`/swaps/orders_status`, {
        order_id: orderId
      });
    } catch (error) {
      throw new SwapError(
        `Failed to get swap status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * TODO: Explain this function
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

  /**
   * Create a new swap order based on an RFQ
   * @param request - The create order request containing RFQ ID and settlement details
   * @returns Promise that resolves with the created order response
   */
  async createOrder(request: CreateOrderRequest): Promise<any> {
    try {
      return await this.apiClient.post<any>(
        '/swaps/orders',
        request
      );
    } catch (error) {
      throw new SwapError(
        `Failed to create swap order: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get the status of a swap order
   * @param request - The order status request containing the order ID
   * @returns Promise that resolves with the order status response
   */
  async getOrderStatus(request: string): Promise<any> {
    try {
      return await this.apiClient.post<any>(
        '/swaps/orders_status',
        request
      );
    } catch (error) {
      throw new SwapError(
        `Failed to get swap order status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

}
