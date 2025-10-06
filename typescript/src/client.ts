import { HttpClient, HttpClientConfig } from './http/client';
import { WebSocketClient } from './websocket/client';
import WebSocket from 'ws';

import { ErrorFactory } from './types/errorFactory';
import {
  AssetError,
  NodeError,
  PairError,
  QuoteError,
  Swap,
  SwapError,
  SwapRequest,
  SwapResponse,
  TimeoutError,
  WebSocketError,
  AssetResponse,
  PairResponse,
  PairQuoteResponse,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  GetInfoResponseModel,
  CreateOrderRequest,
  NetworkInfoResponse,
} from './index';

export interface KaleidoConfig extends Omit<HttpClientConfig, 'baseUrl'> {
  baseUrl?: string;
  nodeUrl?: string;
  wsUrl?: string;
}

export class KaleidoClient {
  private readonly apiClient: HttpClient;
  private readonly nodeClient: HttpClient | null;
  private readonly wsClient: WebSocketClient;

  constructor(config: KaleidoConfig) {
    const { nodeUrl, wsUrl, baseUrl, ...apiConfig } = config;
    const finalBaseUrl = baseUrl || process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1';
    
    this.apiClient = new HttpClient({ ...apiConfig, baseUrl: finalBaseUrl });
    this.nodeClient = nodeUrl ? new HttpClient({
      ...apiConfig,
      baseUrl: nodeUrl
    }) : null;
    
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
      baseUrl: wsBaseUrl
    });
    
    if (process.env.DEBUG_WS) {
      console.log('Initialized WebSocket client with URL:', wsBaseUrl);
    }
  }

  private ensureNodeClient(): void {
    if (!this.nodeClient) {
      throw ErrorFactory.createNodeError(
        'node operation',
        'Node URL is required for this operation. Please provide nodeUrl in the client configuration.'
      );
    }
  }

  async getLspInfo(): Promise<GetInfoResponseModel> {
    try {
      return await this.apiClient.get('/lsps1/get_info');
    } catch (error) {
      throw ErrorFactory.fromUnknownError(error, 'Failed to get LSP info', 'getLspInfo');
    }
  }

  async getLspConnectionUrl(): Promise<string> {
    const lspInfo = await this.getLspInfo();
    return lspInfo?.lsp_connection_url;
  }

  async getLspNetworkInfo(): Promise<NetworkInfoResponse> {
    try {
      return await this.apiClient.get('/lsps1/network_info');
    } catch (error) {
      throw ErrorFactory.fromUnknownError(error, 'Failed to get LSP network info', 'getLspNetworkInfo');
    }
  }

  async connectPeer(connectionUrl: string): Promise<any> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.post('/connectpeer', { peer_pubkey_and_addr: connectionUrl });
    } catch (error) {
      throw ErrorFactory.fromUnknownError(error, 'Failed to connect peer', 'connectPeer');
    }
  }

  async getAssetMetadata(assetId: string): Promise<any> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.post('/assetmetadata', { asset_id: assetId });
    } catch (error) {
      throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNodeInfo(): Promise<{ pubkey: string }> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.get<{ pubkey: string }>('/nodeinfo');
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

  async assetList(): Promise<AssetResponse> {
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

  async pairList(): Promise<PairResponse> {
    try {
      return await this.apiClient.get<PairResponse>('/market/pairs');
    } catch (error) {
      throw new PairError(
        `Failed to list pairs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async quoteRequest(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    try {
      const requestBody = fromAmount ? {
            from_asset: fromAsset,
            to_asset: toAsset,
            from_amount: fromAmount
          }
        : {
            from_asset: fromAsset,
            to_asset: toAsset,
            to_amount: toAmount
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

  async quoteRequestWS(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    if (this.wsClient.getConnectionState() !== WebSocket.OPEN) {
      await this.wsClient.connect();
    }

    return new Promise<PairQuoteResponse>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const quoteMessage = fromAmount
        ? {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            from_amount: fromAmount,
            timestamp: Math.floor(Date.now() / 1000)
          }
        : {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            to_amount: toAmount,
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

  async initMakerSwap(request: SwapRequest): Promise<SwapResponse> {
    try {
      return await this.apiClient.post<SwapResponse>(
        '/swaps/init',
        {
          rfq_id: request.rfq_id,
          from_asset: request.from_asset,
          to_asset: request.to_asset,
          from_amount: request.from_amount,
          to_amount: request.to_amount,
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
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.post<Record<string, never>>('/taker', {
        swapstring,
      });
    } catch (error) {
      throw new SwapError(
        `Failed to whitelist trade: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  async atomicSwapStatus(orderId: any): Promise<Swap> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.post<Swap>(`/swaps/atomic/status`, {
        order_id: orderId
      });
    } catch (error) {
      throw new SwapError(
        `Failed to get swap status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async waitForSwapCompletion(
    paymentHash: string,
    timeoutSeconds = 300,
    pollIntervalSeconds = 5
  ): Promise<Swap> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    const pollIntervalMs = pollIntervalSeconds * 1000;

    while (true) {
      const swap = await this.atomicSwapStatus(paymentHash);
      
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

  async swapOrderStatus(request: string): Promise<any> {
    try {
      return await this.apiClient.post<any>(
        '/swaps/orders/status',
        request
      );
    } catch (error) {
      throw new SwapError(
        `Failed to get swap order status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async swapOrderAnalytic(): Promise<any> {
    try {
      return await this.apiClient.get<any>('/swaps/orders/analytics');
    } catch (error) {
      throw new SwapError(
        `Failed to get swap orders analytics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
