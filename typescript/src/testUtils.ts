import { KaleidoClient } from './client';
import type { 
} from './client';

import {
  SwapRequest,
  SwapResponse,
} from './index'

interface TestConfig {
  nodeUrl: string;
  baseUrl: string;
  apiKey: string;
}

interface AssetPairIds {
  baseAssetId: string;
  quoteAssetId: string;
}

export const testConfig: TestConfig & { wsUrl?: string } = {
  nodeUrl: process.env.TEST_NODE_URL || 'http://localhost:3001',
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1/',
  apiKey: process.env.TEST_API_KEY || '',
  get wsUrl(): string {
    if (process.env.TEST_WS_URL) {
      return process.env.TEST_WS_URL;
    }
    const url = new URL(this.baseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/api/v1/market/ws/testclient';
    return url.toString();
  }
};

// Add onchain test config
export const testOnchainConfig = {
  ...testConfig,
  // Override baseUrl for onchain API if needed
  baseUrl: process.env.TEST_ONCHAIN_BASE_URL || 'http://localhost:8000/',
};

export const createTestClient = (isOnchain: boolean = false): KaleidoClient => {
  const config = isOnchain ? testOnchainConfig : testConfig;
  const client = new KaleidoClient({
    nodeUrl: config.nodeUrl,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    wsUrl: config.wsUrl
  });
  
  if (process.env.DEBUG_WS) {
    console.log('Created test client with WebSocket URL:', config.wsUrl);
  }
  
  return client;
};


// Helper function to create a test order
export const createTestOrder = async (client: KaleidoClient): Promise<any> => { // TODO: type
  const order = {
    from_asset_type: 'btc' as const,
    from_amount: 0.001,
    to_asset_type: 'rgb' as const
  };
  return await client.createOrderOnchain(order);
};

export const getPairAssetIds = async (client: KaleidoClient): Promise<AssetPairIds> => {
  const response = await client.listPairs();
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
    const assetsResponse = await client.listAssets();
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
      const quote = await client.getQuoteWS(
        assetsResponse.fromAsset, 
        assetsResponse.toAsset, 
        assetsResponse.fromAmount
      );

      console.log('Got quote, initializing swap...');
      
      // Initialize the swap
      const initResult = await client.initMakerSwap(
        quote.rfq_id,
        quote.from_asset,
        quote.to_asset,
        quote.from_amount,
        quote.to_amount
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