/**
 * Buy BTC with USDT (Onchain to Onchain) - Simplified
 */

import { SwapSettlement } from '../../src/generated/kaleido/models/SwapSettlement';
import { KaleidoClient } from '../../src/client';

const client = new KaleidoClient({
  baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'
});

async function buyBtcOnchain() {
  try {
    console.log('=== Buy BTC with USDT (Simplified) ===');
    
    // Get quote for spending 100 USDT to buy BTC
    const quote = await client.getQuoteByAssets('USDT', 'BTC', 100);
    
    console.log(`>> Spend: 100 USDT → ${quote.to_amount} BTC (raw)`);
    console.log(`>> Price: ${quote.price}`);
    console.log(`>> RFQ ID: ${quote.rfq_id}`);
    
    const order = await client.createSwapOrder({
      rfq_id: quote.rfq_id,
      from_type: SwapSettlement.ONCHAIN,
      to_type: SwapSettlement.ONCHAIN,
      min_onchain_conf: 1,
      dest_rgb_invoice: 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ',
      refund_address: 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ',
    });
    
    console.log(`>> Order ID: ${order.id}`);
    console.log(`>> Send USDT to: ${order.onchain_address || order.rgb_invoice}`);
    
    console.log('>> Demo complete. Provide valid addresses to execute swap.');
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

// Run if called directly
if (require.main === module) {
  buyBtcOnchain()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { buyBtcOnchain };
