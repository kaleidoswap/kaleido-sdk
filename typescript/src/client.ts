import { HttpClient, HttpClientConfig } from './http/client';
import {
  AssetError,
  NodeError,
  PairError,
  QuoteError,
  SwapError
} from './types/exceptions';

/**
 * Configuration for the KaleidoClient
 */
export interface KaleidoConfig extends HttpClientConfig {
  /** URL of the Kaleido node */
  nodeUrl: string;
}

/**
 * Represents an asset in the KaleidoSwap system
 */
export interface Asset {
  /** Unique identifier of the asset */
  id: string;
  /** Display name of the asset */
  name: string;
  /** Trading symbol of the asset */
  symbol: string;
  /** Number of decimal places for the asset */
  decimals: number;
  /** Type of the asset (e.g., 'crypto', 'fiat') */
  type: string;
}

/**
 * Represents a trading pair in the KaleidoSwap system
 */
export interface TradingPair {
  /** Unique identifier of the trading pair */
  id: string;
  /** Base asset identifier */
  baseAsset: string;
  /** Quote asset identifier */
  quoteAsset: string;
  /** Minimum trade amount */
  minAmount: number;
  /** Maximum trade amount */
  maxAmount: number;
  /** Trading fee as a decimal (e.g., 0.001 for 0.1%) */
  fee: number;
}

/**
 * Represents a quote for a potential swap
 */
export interface Quote {
  /** Trading pair identifier */
  pairId: string;
  /** Amount of base asset */
  baseAmount: number;
  /** Amount of quote asset */
  quoteAmount: number;
  /** Fee amount */
  fee: number;
  /** Quote expiry timestamp */
  expiry: number;
}

/**
 * Represents the status of a swap
 */
export interface SwapStatus {
  /** Unique identifier of the swap */
  id: string;
  /** Current status of the swap */
  status: 'pending' | 'completed' | 'failed';
  /** Amount of base asset */
  baseAmount: number;
  /** Amount of quote asset */
  quoteAmount: number;
  /** Fee amount */
  fee: number;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Main client for interacting with the KaleidoSwap API
 */
export class KaleidoClient {
  private readonly apiClient: HttpClient;
  private readonly nodeClient: HttpClient;

  /**
   * Creates a new KaleidoClient instance
   * @param config - Configuration for the client
   */
  constructor(config: KaleidoConfig) {
    const { nodeUrl, ...apiConfig } = config;
    this.apiClient = new HttpClient(apiConfig);
    this.nodeClient = new HttpClient({
      ...apiConfig,
      baseUrl: nodeUrl
    });
  }

  /**
   * Gets information about the connected node
   * @returns Promise resolving to node information
   * @throws {NodeError} If the request fails
   */
  async getNodeInfo(): Promise<{ pubkey: string }> {
    try {
      return await this.nodeClient.get<{ pubkey: string }>('/node/info');
    } catch (error) {
      throw new NodeError(
        `Failed to get node info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets the public key of the connected node
   * @returns Promise resolving to the node's public key
   * @throws {NodeError} If the request fails
   */
  async getNodePubkey(): Promise<string> {
    const info = await this.getNodeInfo();
    return info.pubkey;
  }

  /**
   * Lists all available assets
   * @returns Promise resolving to an array of assets
   * @throws {AssetError} If the request fails
   */
  async listAssets(): Promise<Asset[]> {
    try {
      return await this.apiClient.get<Asset[]>('/assets');
    } catch (error) {
      throw new AssetError(
        `Failed to list assets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets metadata for a specific asset
   * @param assetId - Identifier of the asset
   * @returns Promise resolving to asset metadata
   * @throws {AssetError} If the request fails
   */
  async getAssetMetadata(assetId: string): Promise<Asset> {
    try {
      return await this.apiClient.get<Asset>(`/assets/${assetId}`);
    } catch (error) {
      throw new AssetError(
        `Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Lists all available trading pairs
   * @returns Promise resolving to an array of trading pairs
   * @throws {PairError} If the request fails
   */
  async listPairs(): Promise<TradingPair[]> {
    try {
      return await this.apiClient.get<TradingPair[]>('/pairs');
    } catch (error) {
      throw new PairError(
        `Failed to list pairs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets a trading pair by its base and quote assets
   * @param baseAsset - Base asset identifier
   * @param quoteAsset - Quote asset identifier
   * @returns Promise resolving to the trading pair
   * @throws {PairError} If the request fails
   */
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

  /**
   * Gets a quote for a potential swap
   * @param pairId - Trading pair identifier
   * @param amount - Amount to swap
   * @param isBase - Whether the amount is in base asset (true) or quote asset (false)
   * @returns Promise resolving to the quote
   * @throws {QuoteError} If the request fails
   */
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

  /**
   * Initializes a maker swap
   * @param pairId - Trading pair identifier
   * @param amount - Amount to swap
   * @param isBase - Whether the amount is in base asset (true) or quote asset (false)
   * @returns Promise resolving to the swap status
   * @throws {SwapError} If the request fails
   */
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

  /**
   * Executes a maker swap
   * @param swapId - Swap identifier
   * @returns Promise resolving to the swap status
   * @throws {SwapError} If the request fails
   */
  async executeMakerSwap(swapId: string): Promise<SwapStatus> {
    try {
      return await this.apiClient.post<SwapStatus>(`/swaps/maker/${swapId}/execute`, {});
    } catch (error) {
      throw new SwapError(
        `Failed to execute maker swap: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Whitelists a trade for a taker
   * @param swapstring - Swap string to whitelist
   * @returns Promise resolving to the swap status
   * @throws {SwapError} If the request fails
   */
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

  /**
   * Confirms a swap as a taker
   * @param swapId - Swap identifier
   * @returns Promise resolving to the swap status
   * @throws {SwapError} If the request fails
   */
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

  /**
   * Gets the status of a swap
   * @param swapId - Swap identifier
   * @returns Promise resolving to the swap status
   * @throws {SwapError} If the request fails
   */
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