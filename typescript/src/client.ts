import { HttpClient, HttpClientConfig } from './http/client';
import {
  AssetError,
  NodeError,
  PairError,
  QuoteError,
  SwapError
} from './types/exceptions';
import { components } from './types';

export interface KaleidoConfig extends HttpClientConfig {
  nodeUrl: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  type: string;
}

export type AssetResponse = components['schemas']['AssetsResponse']

export type TradingPair = components['schemas']['Pair'];
export type PairResponse = components['schemas']['PairResponse'];

export type Quote = components['schemas']['PairQuoteRequest']
export type PairQuoteResponse = components['schemas']['PairQuoteResponse']
export type SwapRequest = components['schemas']['SwapRequest']
export type Swap = components['schemas']['Swap']

//export interface Quote {
//  pairId: string;
//  baseAmount: number;
//  quoteAmount: number;
//  fee: number;
//  expiry: number;
//}

export class KaleidoClient {
  private readonly apiClient: HttpClient;
  private readonly nodeClient: HttpClient;

  constructor(config: KaleidoConfig) {
    const { nodeUrl, ...apiConfig } = config;
    this.apiClient = new HttpClient(apiConfig);
    this.nodeClient = new HttpClient({
      ...apiConfig,
      baseUrl: nodeUrl
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

  async executeMakerSwap(swapId: string): Promise<Swap> {
    try {
      return await this.apiClient.post<Swap>(`/swaps/maker/${swapId}/execute`, {});
    } catch (error) {
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
  
  async confirmSwap(swapId: string): Promise<Swap> {
    try {
      const pubkey = await this.getNodePubkey();
      return await this.nodeClient.post<Swap>(`/swaps/taker/${swapId}/execute`, {
        pubkey
      });
    } catch (error) {
      throw new SwapError(
        `Failed to confirm swap: ${error instanceof Error ? error.message : String(error)}`
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
} 