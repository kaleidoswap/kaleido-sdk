/**
 * Sell BTC for RGB20 (Onchain to Onchain)
 *
 * This example demonstrates selling BTC to receive RGB20 assets (like USDT)
 * with both assets settled onchain. This is the simplest swap type and does
 * NOT require an RLN (RGB Lightning Node).
 *
 * Scenario: You have BTC onchain and want to receive USDT onchain
 * Settlement: Onchain → Onchain
 * RLN Node Required: ❌ No
 *
 * Flow:
 * 1. Get available trading pairs and assets
 * 2. Find BTC and USDT (or other RGB20) assets
 * 3. Validate the swap amount
 * 4. Get a quote for the swap
 * 5. Create the swap order
 * 6. Display payment address
 * 7. Monitor order status
 */

import { KaleidoClient } from '../../src/client';
import { createAssetPairMapper, createPrecisionHandler } from '../../src/utils';

async function sellBtcOnchain() {
  console.log('=== Sell BTC for USDT (Onchain to Onchain) ===\n');

  // Initialize the client (no nodeUrl required for onchain-only swaps)
  const client = new KaleidoClient({
    baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'
  });

  // These are example addresses - replace with your actual RGB addresses
  const destRgbInvoice = 'your_usdt_destination_rgb_invoice_here';
  const refundAddress = 'your_refund_btc_address_here';
  

  try {
    // Step 1: Get trading pairs and setup utility helpers
    console.log('📊 Fetching available trading pairs...');
    const pairs = await client.pairList();
    const assetMapper = createAssetPairMapper(pairs);
    const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());
    console.log(`Found ${pairs.pairs.length} trading pairs\n`);

    // Step 2: Find the assets we want to trade
    console.log('🔍 Finding assets...');
    const btc = assetMapper.findByTicker('BTC');
    const usdt = assetMapper.findByTicker('USDT');

    if (!btc || !usdt) {
      throw new Error('Required assets not found. Make sure BTC and USDT pairs are available.');
    }

    console.log(`  ✓ Found BTC: ${btc.asset_id}`);
    console.log(`  ✓ Found USDT: ${usdt.asset_id}\n`);

    // Step 3: Define and validate the amount to swap
    const btcAmountToSell = 0.0001; // Sell 0.0001 BTC (10,000 satoshis)
    console.log(`💰 Amount to swap: ${btcAmountToSell} BTC`);

    const validation = precisionHandler.validateOrderSize(btcAmountToSell, btc);

    if (!validation.valid) {
      throw new Error(`Amount validation failed: ${validation.error}`);
    }

    console.log(`  ✓ Validation passed`);
    console.log(`  ✓ Atomic amount: ${validation.asset_amount} satoshis\n`);

    // Step 4: Get a quote for the swap
    // We're selling BTC, so: from BTC → to USDT, with the BTC amount we want to sell
    console.log('💱 Requesting quote...');
    const quote = await client.quoteRequest(
      btc.asset_id,      // from_asset (what we're selling)
      usdt.asset_id,     // to_asset (what we're receiving)
      validation.asset_amount  // from_amount (how much BTC we're selling)
    );

    const btcToSell = precisionHandler.toAssetDecimalAmount(quote.from_amount, btc.asset_id);
    const usdtToReceive = precisionHandler.toAssetDecimalAmount(quote.to_amount, usdt.asset_id);

    console.log('  Quote received:');
    console.log(`    You sell: ${btcToSell} BTC`);
    console.log(`    You receive: ${usdtToReceive} USDT`);
    console.log(`    Price: ${quote.price}`);
    console.log(`    RFQ ID: ${quote.rfq_id}`);
    console.log(`    Expires at: ${new Date(quote.expires_at * 1000).toLocaleString()}\n`);

    // Step 5: Create the swap order
    // Note: You need to provide valid RGB invoices/addresses for your destination and refund
    console.log('📝 Creating swap order...');

    const order = await client.createOrder({
      rfq_id: quote.rfq_id,
      from_type: 'ONCHAIN',  // Paying with BTC onchain
      to_type: 'ONCHAIN',    // Receiving USDT onchain
      min_onchain_conf: 1,   // Minimum confirmations required
      dest_rgb_invoice: destRgbInvoice,
      refund_address: refundAddress,
    });

    // Step 6: Display payment information
    console.log('  ✓ Order created successfully!\n');
    console.log('📋 Order Details:');
    console.log(`  Order ID: ${order.id}`);
    console.log(`  Status: ${order.status}\n`);
    console.log('💳 Payment Instructions:');
    console.log(`  Send ${btcToSell} BTC to:`);
    console.log(`  ${order.onchain_address}\n`);
    console.log('⚠️  Important: Send exactly the amount specified above');
    console.log('    Sending more or less may result in a failed swap\n');

    // Step 7: Monitor order status
    console.log('⏳ Monitoring order status...');
    console.log('  (Waiting for payment confirmation...)\n');

    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      try {
        const status = await client.swapOrderStatus(order.id);
        console.log(`  [${attempts + 1}/${maxAttempts}] Status: ${status.status}`);

        if (status.status === 'COMPLETED') {
          console.log('\n🎉 Swap completed successfully!');
          console.log(`   You sold: ${btcToSell} BTC`);
          console.log(`   You received: ${usdtToReceive} USDT`);
          console.log(`   Destination: ${destRgbInvoice}`);
          break;
        } else if (status.status === 'FAILED') {
          console.log('\n❌ Swap failed');
          if (status.error_message) {
            console.log(`   Error: ${status.error_message}`);
          }
          break;
        } else if (status.status === 'EXPIRED') {
          console.log('\n⏰ Swap expired');
          console.log('   The quote expired before payment was received');
          break;
        }
      } catch (error) {
        console.log(`  [${attempts + 1}] Status check failed:`, error instanceof Error ? error.message : error);
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log('\n⏱️  Monitoring timeout reached. Order may still be processing.');
      console.log(`   Check status manually: client.swapOrderStatus('${order.id}')`);
    }
  

    console.log('\n⚠️  This is a demo. Uncomment the order creation code and provide valid RGB addresses to execute.');
    console.log('💡 Make sure you have:');
    console.log('   1. A valid RGB USDT destination invoice/address');
    console.log('   2. A valid BTC refund address (in case swap fails)');
    console.log('   3. Sufficient BTC balance to complete the swap\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);

    if (error instanceof Error) {
      if (error.message.includes('insufficient liquidity')) {
        console.log('\n💡 Tip: Try a smaller amount or different asset pair');
      } else if (error.message.includes('Asset') && error.message.includes('not found')) {
        console.log('\n💡 Tip: Use client.assetList() to see available assets');
      } else if (error.message.includes('order size')) {
        console.log('\n💡 Tip: Check min/max order sizes with precisionHandler.getOrderSizeLimits()');
      }
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  sellBtcOnchain()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { sellBtcOnchain };
