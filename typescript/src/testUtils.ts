import { KaleidoClient } from './client';

import {
  SwapRequest,
  SwapResponse,
} from './types/index'

interface TestConfig {
  nodeUrl: string;
  baseUrl: string;
  apiKey: string;
}

interface AssetPairIds {
  baseAssetId: string;
  quoteAssetId: string;
}

export const testConfig: TestConfig = {
  nodeUrl: process.env.TEST_NODE_URL || 'http://localhost:3001',
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1',
  apiKey: process.env.TEST_API_KEY || ''
};

export const createTestClient = (): KaleidoClient => {
  return new KaleidoClient({
    nodeUrl: testConfig.nodeUrl,
    baseUrl: testConfig.baseUrl,
    apiKey: testConfig.apiKey
  });
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
  try{
  const assetsResponse = await client.listAssets();
  const assets = assetsResponse.assets;
  if (assets && assets.length > 0 && assets[0].asset_id) {
    const fromAsset = assets[0].asset_id;
    const toAsset = assets[1]?.asset_id || fromAsset;
    if (!toAsset) {
      throw new Error('No valid toAsset found');
    }
    const fromAmount = 100000000; // 1 BTC in satoshis
    return { fromAsset, toAsset, fromAmount };
  }
  throw new Error("something")
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
      ) as SwapRequest & SwapResponse;

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
