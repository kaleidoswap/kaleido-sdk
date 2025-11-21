import { KaleidoClient } from '../../src/client';

const client = new KaleidoClient({
  baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'
});

async function shortExample() {
  try {
    const quote = await client.getQuoteByPair('BTC/USDT', 0.0001);
    
    console.log(`>> 0.0001 BTC → ${quote.to_amount} USDT (raw)`);
    console.log(`>> price: ${quote.price}`);
    
    await client.getQuoteByPair('BTC/USDT', 0.0001);
    await client.getQuoteByAssets('BTC', 'USDT', 0.0001);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

shortExample().catch(console.error);

export { shortExample };
