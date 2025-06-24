import { HttpClient, HttpClientConfig } from './http/client';
import {
  AssetError,
  NodeError,
  PairError,
  QuoteError,
  SwapError
} from './types/exceptions';

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

export interface TradingPair {
  id: string;
  baseAsset: string;
  quoteAsset: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
}

export interface Quote {
  pairId: string;
  baseAmount: number;
  quoteAmount: number;
  fee: number;
  expiry: number;
}

export interface SwapStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  baseAmount: number;
  quoteAmount: number;
    fee: number;
    createdAt: number;
    updatedAt: number;
}

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
      return await this.nodeClient.get<{ pubkey: string }>('/api/v1/lsps1/get_info');
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

  
  async listAssets(): Promise<Asset[]> {
    try {
      return await this.apiClient.get<Asset[]>('/assets');
    } catch (error) {
      throw new AssetError(
        `Failed to list assets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async getAssetMetadata(assetId: string): Promise<Asset> {
    try {
      return await this.apiClient.get<Asset>(`/assets/${assetId}`);
    } catch (error) {
      throw new AssetError(
        `Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async listPairs(): Promise<TradingPair[]> {
    try {
      return await this.apiClient.get<TradingPair[]>('/pairs');
    } catch (error) {
      throw new PairError(
        `Failed to list pairs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async getPairByAssets(baseAsset: string, quoteAsset: string): Promise<TradingPair> {
    try {
      return await this.apiClient.get<TradingPair>(
        `/pairs/${baseAsset}/${quoteAsset}`
      );
    } catch (error) {
      throw new PairError(
        `Failed to get pair: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async getQuote(
    pairId: string,
    amount: number,
    isBase: boolean = true
  ): Promise<Quote> {
    try {
      return await this.apiClient.get<Quote>(
        `/quotes/${pairId}?amount=${amount}&isBase=${isBase}`
      );
    } catch (error) {
      throw new QuoteError(
        `Failed to get quote: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async initMakerSwap(
    pairId: string,
    amount: number,
    isBase: boolean = true
  ): Promise<SwapStatus> {
    try {
      const quote = await this.getQuote(pairId, amount, isBase);
      return await this.apiClient.post<SwapStatus>('/swaps/maker/init', {
        pairId,
        amount,
        isBase,
        quote
      });
    } catch (error) {
      throw new SwapError(
        `Failed to initialize maker swap: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async executeMakerSwap(swapId: string): Promise<SwapStatus> {
    try {
      return await this.apiClient.post<SwapStatus>(`/swaps/maker/${swapId}/execute`, {});
    } catch (error) {
      throw new SwapError(
        `Failed to execute maker swap: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async whitelistTrade(swapstring: string): Promise<SwapStatus> {
    try {
      const pubkey = await this.getNodePubkey();
      return await this.nodeClient.post<SwapStatus>('/swaps/taker/init', {
        swapstring,
        pubkey
      });
    } catch (error) {
      throw new SwapError(
        `Failed to whitelist trade: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async confirmSwap(swapId: string): Promise<SwapStatus> {
    try {
      const pubkey = await this.getNodePubkey();
      return await this.nodeClient.post<SwapStatus>(`/swaps/taker/${swapId}/execute`, {
        pubkey
      });
    } catch (error) {
      throw new SwapError(
        `Failed to confirm swap: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  
  async getSwapStatus(swapId: string): Promise<SwapStatus> {
    try {
      return await this.nodeClient.get<SwapStatus>(`/swaps/${swapId}`);
    } catch (error) {
      throw new SwapError(
        `Failed to get swap status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
} 