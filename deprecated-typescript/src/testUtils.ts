import { KaleidoClient, KaleidoConfig } from './client';

/**
 * Creates a test client instance with optional configuration overrides
 */
export function createTestClient(config?: Partial<KaleidoConfig>): KaleidoClient {
  const defaultConfig: KaleidoConfig = {
    baseUrl: process.env.KALEIDO_API_URL || 'https://api.regtest.kaleidoswap.com',
    nodeUrl: process.env.KALEIDO_TEST_NODE_URL || process.env.KALEIDO_NODE_URL,
    apiKey: process.env.KALEIDO_API_KEY,
  };

  return new KaleidoClient({ ...defaultConfig, ...config });
}

/**
 * Helper function to get asset list response and extract trading pair information
 * Returns the first available trading pair for quote testing
 */
export async function getAssetListResponse(
  client: KaleidoClient
): Promise<{ fromAsset: string; toAsset: string; fromAmount: number }> {
  const assets = await client.listAssets();
  const pairs = await client.listPairs();

  if (!assets.assets || assets.assets.length === 0) {
    throw new Error('No assets available for testing');
  }

  if (!pairs.pairs || pairs.pairs.length === 0) {
    throw new Error('No trading pairs available for testing');
  }

  // Get the first active pair
  const firstPair = pairs.pairs.find(pair => pair.is_active);
  if (!firstPair) {
    throw new Error('No active trading pairs available for testing');
  }

  return {
    fromAsset: firstPair.base_asset_id,
    toAsset: firstPair.quote_asset_id,
    fromAmount: firstPair.min_base_order_size || 1000,
  };
}
