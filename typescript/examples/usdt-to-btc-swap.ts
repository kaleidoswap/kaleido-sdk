/**
 * USDT to BTC Swap Example
 * 
 * This example demonstrates how to swap USDT for BTC (or any other asset pair).
 * Essential steps:
 * 1. Get available trading pairs
 * 2. Find your assets and validate amounts
 * 3. Request a quote
 * 4. Create the swap order
 * 5. Display payment address and monitor order status
 */

import { KaleidoClient } from '../src/client';
import { createAssetPairMapper, createPrecisionHandler } from '../src/utils';

async function usdtToBtcSwap() {
  // Initialize the client
  const client = new KaleidoClient({
    baseUrl: 'https://api.regtest.kaleidoswap.com/api/v1'
  });

  try {
    // Step 1: Get trading pairs and setup helpers
    const pairs = await client.pairList();
    const assetMapper = createAssetPairMapper(pairs);
    const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());

    // Step 2: Find your assets
    const usdt = assetMapper.findByTicker('USDT');
    const btc = assetMapper.findByTicker('BTC');

    if (!usdt || !btc) {
      throw new Error('Assets not found');
    }

    // Step 3: Prepare the amount you want to swap
    const amountToSwap = 100; // 100 USDT
    const validation = precisionHandler.validateOrderSize(amountToSwap, usdt);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Step 4: Get a quote
    const quote = await client.quoteRequest(
      btc.asset_id,
      usdt.asset_id,
      validation.asset_amount
    );

    console.log('Quote received:');
    console.log(`  From: ${precisionHandler.toAssetDecimalAmount(quote.from_amount, btc.asset_id)} BTC`);
    console.log(`  To: ${precisionHandler.toAssetDecimalAmount(quote.to_amount, usdt.asset_id)} USDT`);
    console.log(`  Price: ${quote.price}`);

    // Step 5: Create the swap order
    const order = await client.createOrder({
      rfq_id: quote.rfq_id,
      from_type: 'ONCHAIN',
      to_type: 'ONCHAIN',
      min_onchain_conf: 1,
      dest_rgb_invoice: 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ',
      refund_address: 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ',
    });

    // Step 6: Display payment information
    console.log('\nOrder created successfully!');
    console.log(`Order ID: ${order.id}`);
    console.log(`\nPayment Details:`);
    console.log(`  Address: ${order.onchain_address}`);
    console.log(`  Status: ${order.status}`);
    console.log(`\nPlease send ${precisionHandler.toAssetDecimalAmount(quote.from_amount, btc.asset_id)} BTC to the address above.`);

    // Step 7: Monitor order status
    console.log('\nMonitoring order status...');
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const status = await client.swapOrderStatus(order.id);

        console.log(`[${attempts + 1}] Status: ${status.status}`);
        
        if (status.status === 'COMPLETED') {
          console.log('\n🎉 Swap completed successfully!');
          console.log(`Received ${precisionHandler.toAssetDecimalAmount(quote.to_amount, usdt.asset_id)} USDT`);
          break;
        } else if (status.status === 'FAILED') {
          console.log('\n❌ Swap failed');
          break;
        }
      } catch (error) {
        console.log(`[${attempts + 1}] Status check failed:`, error instanceof Error ? error.message : error);
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log('\n⏱️  Monitoring timeout reached. Order may still be processing.');
      console.log(`You can check the status manually using order ID: ${order.id}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  usdtToBtcSwap();
}

export { usdtToBtcSwap };
