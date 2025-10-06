/**
 * USDT to BTC Swap Example (Buying BTC with USDT)
 * 
 * The process is the same for any other assets available on Kaleido.
 * 
 * This example demonstrates the complete onchain swap flow:
 * 1. List trading pairs
 * 2. Create asset pair mapper from pairs data
 * 3. Create precision handler for amount conversions
 * 4. Find USDT and BTC assets  
 * 5. Get a quote (RFQ) with proper precision
 * 6. Create onchain-to-onchain swap order using the RFQ ID
 * 7. Monitor order status using getOrderStatus
 */

import { KaleidoClient } from '../src/client';
import { createAssetPairMapper, createPrecisionHandler } from '../src/utils';

async function usdtToBtcSwap() {
  console.log('Starting USDT to BTC swap...\n');

  // Initialize client
  const client = new KaleidoClient({
    baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
  });

  try {
    // Step 1: Get trading pairs data
    console.log('Fetching trading pairs...');
    const pairs = await client.pairList();

    // Step 2: Create asset pair mapper
    console.log('Creating asset pair mapper...');
    const assetMapper = createAssetPairMapper(pairs);
    
    // Step 3: Create precision handler
    const allAssets = assetMapper.getAllAssets();
    const precisionHandler = createPrecisionHandler(allAssets);

    // Debug: Show available assets
    console.log('\nAvailable assets:');
    allAssets.forEach(asset => {
      console.log(`- ${asset.ticker} (${asset.asset_id})`);
      console.log(`  Precision: ${asset.precision}`);
      const limits = precisionHandler.getOrderSizeLimits(asset);
      console.log(`  Order limits: ${limits.minDecimal} - ${limits.maxDecimal} ${asset.ticker}`);
    });

    // Step 4: Find USDT and BTC assets
    console.log('\nFinding USDT and BTC assets...');
    const usdt = assetMapper.findByTicker('USDT');
    const btc = assetMapper.findByTicker('BTC');

    if (!usdt || !btc) {
      throw new Error('USDT or BTC not found');
    }

    console.log(`Found: ${usdt.ticker} (${usdt.asset_id}) and ${btc.ticker} (${btc.asset_id})`);

    // Step 5: Check if trading pair exists
    if (!assetMapper.canTrade(usdt.asset_id, btc.asset_id)) {
      throw new Error('No trading pair between USDT and BTC');
    }

    // Step 6: Validate and prepare amount
    const decimalAmount = 100; // 100 USDT
    console.log(`\nPreparing to swap ${decimalAmount} ${usdt.ticker}...`);

    // Validate order size
    const validation = precisionHandler.validateOrderSize(decimalAmount, usdt);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    console.log(`Amount validation passed:`);
    console.log(`- Decimal amount: ${decimalAmount} ${usdt.ticker}`);
    console.log(`- Atomic amount: ${validation.atomicAmount} units`);

    // Step 7: Get quote with atomic amount
    console.log('\nGetting quote...');
    const quote = await client.quoteRequest(
      usdt.asset_id, 
      btc.asset_id, 
      validation.atomicAmount, // Use atomic amount for API
    );

    // Convert quote amounts back to decimal for display
    const fromAmountDecimal = precisionHandler.toDecimalAmount(quote.from_amount, usdt.asset_id);
    const toAmountDecimal = precisionHandler.toDecimalAmount(quote.to_amount, btc.asset_id);
    const feeDecimal = quote.fee && typeof quote.fee === 'object' && 'final_fee' in quote.fee
      ? precisionHandler.toDecimalAmount((quote.fee as any).final_fee, btc.asset_id)
      : 0;

    console.log(`Quote received:`);
    console.log(`- From: ${fromAmountDecimal} ${usdt.ticker}`);
    console.log(`- To: ${toAmountDecimal} ${btc.ticker}`);
    console.log(`- Fee: ${feeDecimal} ${btc.ticker}`);
    console.log(`- Price: ${quote.price}`);
    console.log(`- RFQ ID: ${quote.rfq_id}`);

    // Step 8: Create order using createOrder (correct for RFQ-based swaps)
    const orderRequest = {
      rfq_id: quote.rfq_id,
      from_type: 'ONCHAIN',
      to_type: 'ONCHAIN',
      min_onchain_conf: 1,
      dest_onchain_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // BTC destination address
      refund_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // BTC refund address
    };

    console.log('\nCreating swap order...');
    const order = await client.createOrder(orderRequest);

    console.log(`Order created:`);
    console.log(`- Order ID: ${order.order_id || order.rfq_id}`);
    console.log(`- Status: ${order.order_state || order.status}`);

    // Step 9: Monitor order status
    console.log('\nMonitoring order status...');
    let attempts = 0;
    const maxAttempts = 1;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        const orderId = order.order_id || order.rfq_id;
        const status = await client.swapOrderStatus(orderId);
        console.log(`[${attempts + 1}/${maxAttempts}] Order Status: ${status.order_state || 'Unknown'}`);
        
        if (status.order_state === 'COMPLETED') {
          console.log('\n✅ Swap completed successfully!');
          console.log(`Final result: Swapped ${fromAmountDecimal} ${usdt.ticker} for ${toAmountDecimal} ${btc.ticker}`);
          break;
        } else if (status.order_state === 'FAILED') {
          console.log(`\n❌ Swap failed`);
          break;
        }
      } catch (error) {
        console.log(`[${attempts + 1}/${maxAttempts}] Status check failed: ${error}`);
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log('\n⏳ Order monitoring timed out. Check status manually with:');
      console.log(`client.getOrderStatus("${order.order_id || order.rfq_id}")`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  usdtToBtcSwap();
}

export { usdtToBtcSwap };