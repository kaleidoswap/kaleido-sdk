import { KaleidoClient } from '../src/client';
import { createAssetPairMapper } from '../src/utils';

async function testQuote() {
  const client = new KaleidoClient({
    baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
  });

  // Get available pairs
  const pairs = await client.pairList();
  const assetMapper = createAssetPairMapper(pairs);

  // Find BTC/USDT pair
  const btc = assetMapper.findByTicker('BTC');
  const usdt = assetMapper.findByTicker('USDT');

  console.log(`Found assets: BTC (${btc?.asset_id}), USDT (${usdt?.asset_id})`);

  // Request quote for 100,000 satoshis (0.001 BTC)
  if (!btc || !usdt) {
    throw new Error('BTC or USDT asset not found.');
  }

  const quote = await client.quoteRequest(
    btc.asset_id,
    usdt.asset_id,
    100000000
  );

  console.log('Quote:', quote);
}

// Run the test
testQuote().catch(console.error);