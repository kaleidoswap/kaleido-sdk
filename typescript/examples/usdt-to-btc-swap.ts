/**
 * USDT to BTC Swap Example
 * 
 * This example demonstrates how to swap USDT for BTC (or any other asset pair).
 * Essential steps:
 * 1. Get available trading pairs
 * 2. Find your assets and validate amounts
 * 3. Request a quote
 * 4. Create the swap order
 */

import { KaleidoClient } from '../src/client';
import { createAssetPairMapper, createPrecisionHandler } from '../src/utils';

async function usdtToBtcSwap() {
  // Initialize the client
  const client = new KaleidoClient({
    baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
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

    console.log('Quote:', {
      from: `${precisionHandler.toAssetDecimalAmount(quote.from_amount, btc.asset_id)} BTC`,
      to: `${precisionHandler.toAssetDecimalAmount(quote.to_amount, usdt.asset_id)} USDT`,
      price: quote.price
    });

    // Step 5: Create the swap order
    const order = await client.createOrder({
      rfq_id: quote.rfq_id,
      from_type: 'ONCHAIN',
      to_type: 'ONCHAIN',
      min_onchain_conf: 1,
      dest_rgb_invoice: 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ', // Your BTC address
      refund_address: 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ', // Refund address
    });

    console.log('Order created:', order.order_id || order.rfq_id);

    // Optional: Check order status (if needed)
    // const status = await client.swapOrderStatus(order.order_id || order.rfq_id);
    // console.log('Order status:', status.order_state);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  usdtToBtcSwap();
}

export { usdtToBtcSwap };
