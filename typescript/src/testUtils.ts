import { KaleidoClient } from './client';
import type { 
} from './client';

import {
  SwapRequest,
  SwapResponse,
  KaleidoConfig,
} from './index'

interface AssetPairIds {
  baseAssetId: string;
  quoteAssetId: string;
}

export const testConfig: KaleidoConfig = {
  apiKey: process.env.TEST_API_KEY || '',
  get wsUrl(): string {
    // Use the same default as client.ts
    const baseUrl = this.baseUrl || process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1';
    const url = new URL(baseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/api/v1/market/ws/testclient';
    return url.toString();
  }
};

export const createTestClient = (): KaleidoClient => {
  const config = testConfig;
  
  // Build the client config, only including baseUrl if it's defined
  const clientConfig: any = {
    apiKey: config.apiKey,
    wsUrl: config.wsUrl
  };
  
  // Only add baseUrl if it's explicitly set
  if (config.baseUrl) {
    clientConfig.baseUrl = config.baseUrl;
  }
  
  const client = new KaleidoClient(clientConfig);
  
  if (process.env.DEBUG_WS) {
    console.log('Created test client with WebSocket URL:', config.wsUrl);
  }
  
  return client;
};


export const getPairAssetIds = async (client: KaleidoClient): Promise<AssetPairIds> => {
  const response = await client.pairList();
  const pairs = response.pairs;
  if (pairs && pairs.length > 0) {
    const pair = pairs[0];
    return {
      baseAssetId: pair.base_asset_id,
      quoteAssetId: pair.quote_asset_id
    }
  }
  throw new Error("No pair was found.")
}

export const assetListResponse = async (client: KaleidoClient): Promise<{ fromAsset: string; toAsset: string; fromAmount: number; }> => {
  try {
    const assetsResponse = await client.assetList();
    const assetsList = assetsResponse.assets || [];

    // Find USDT asset_id
    const toAssetObj = assetsList.find(a => a.ticker === "USDT");
    const toAsset = toAssetObj?.asset_id;

    // Hardcode BTC as fromAsset (by ticker, not asset_id)
    const fromAsset = "BTC";
    const fromAmount = 10000000; // 0.1 BTC in satoshis

    if (!toAsset) {
      throw new Error('Required asset (USDT) for testing not found');
    }

    return { fromAsset, toAsset, fromAmount };
  } catch (error) {
    console.error('Error in assetListResponse:', error);
    throw error;
  }
}

export const testWhiteListTrade = async (
  client: KaleidoClient,
  maxRetries = 3,
  retryDelay = 1000
): Promise<SwapRequest & SwapResponse | null> => {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to initialize swap...`);
      
      // Get assets and quote
      const assetsResponse = await assetListResponse(client);
      const quote = await client.quoteRequestWS(
        assetsResponse.fromAsset, 
        assetsResponse.toAsset, 
        assetsResponse.fromAmount
      );

      console.log('Got quote, initializing swap...');
      
      // Initialize the swap
      const initResult = await client.initMakerSwap(
        {
          rfq_id: quote.rfq_id,
          from_asset: quote.from_asset,
          from_amount: quote.from_amount,
          to_asset: quote.to_asset,
          to_amount: quote.to_amount
        }
      ) as SwapRequest & SwapResponse; // the response type only has SwapResponse...

      if (!initResult.swapstring) {
        throw new Error('No swapstring returned from initMakerSwap');
      }

      console.log('Swap initialized, whitelisting trade...');
      
      // Whitelist the trade
      await client.whitelistTrade(initResult.swapstring);
      
      return initResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if we should retry
      const isRetryable = errorMessage.includes('Not enough liquidity') || 
                         errorMessage.includes('400') ||
                         errorMessage.includes('Bad Request');
      
      if (!isRetryable || attempt >= maxRetries) {
        console.error(`Failed to initialize swap (attempt ${attempt}/${maxRetries}):`, errorMessage);
        throw error;
      }
      
      console.warn(`Retryable error (${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return null;
}

export const withWebSocketTest = async (
  testFn: (client: KaleidoClient) => Promise<void>,
  timeout = 30000
) => {
  const client = createTestClient();
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('WebSocket test timed out'));
      }, timeout);

      testFn(client)
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch(reject);
    });
  } finally {
    // Clean up WebSocket connection
    if ((client as any).wsClient) {
      await (client as any).wsClient.disconnect();
    }
  }
};