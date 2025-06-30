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
} from './types/exceptions';

import { 
  AssetResponse,
  TradingPair,
  PairResponse,
  PairQuoteResponse,
  SwapRequest,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  Swap,
  Asset,
 } from './types/index'

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
    const wsBaseUrl = wsUrl || apiConfig.baseUrl.replace('http', 'ws');
    this.wsClient = new WebSocketClient({
      ...apiConfig,
      baseUrl: wsBaseUrl
    });
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

  async getAssetMetadata(assetId: string): Promise<Asset> {
    try {
      return await this.apiClient.get<Asset>(`/market/assets/${assetId}`);
    } catch (error) {
      throw new AssetError(
        `Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`
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
      const quoteId = `quote_${Date.now()}`;
      let timeoutId: NodeJS.Timeout;

      const quoteMessage = {
        action: 'quote_request',
        request_id: quoteId,
        from_asset: fromAsset,
        to_asset: toAsset,
        from_amount: fromAmount,
        timestamp: Math.floor(Date.now() / 1000)
      };

      timeoutId = setTimeout(() => {
        this.wsClient.off('quote_response', quoteHandler);
        reject(new TimeoutError('Quote request timed out'));
      }, 30000);

      const quoteHandler = (response: any) => {
        if (response.request_id === quoteId) {
          clearTimeout(timeoutId);
          this.wsClient.off('quote_response', quoteHandler);

          if (response.error) {
            reject(new QuoteError(response.error.message || 'Failed to get quote'));
          } else {
            resolve(response.data || {});
          }
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
} 