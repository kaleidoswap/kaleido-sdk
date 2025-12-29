import { KaleidoClient } from '../src/client';

async function testQuote() {
  const client = new KaleidoClient({
    baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
  });

  const btc = await client.getAssetByTicker('BTC');
  const usdt = await client.getAssetByTicker('USDT');

  if (!btc || !usdt) {
    throw new Error('BTC or USDT asset not found.');
  }

  console.log(`Found assets: BTC (${btc.asset_id}), USDT (${usdt.asset_id})`);

  const btcAmount = 0.001;
  const quote = await client.getQuoteByAssets('BTC/USDT', btcAmount);

  console.log('Enhanced Quote:');
  console.log(`  From: ${quote.fromDisplayAmount} ${quote.fromAsset.ticker}`);
  console.log(`  To: ${quote.toDisplayAmount} ${quote.toAsset.ticker}`);
  console.log(`  Price: ${quote.price}`);
  console.log(`  RFQ ID: ${quote.rfq_id}`);

  console.log('\nOld method (still works):');
  const oldQuote = await client.getQuote(
    btc.asset_id,
    usdt.asset_id,
    100000000
  );
  console.log('Old Quote:', oldQuote);
}

// Run the test
testQuote().catch(console.error);