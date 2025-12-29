/**
 * Sell BTC for USDT (Onchain to Onchain)
 */

import { SwapSettlement } from '../../src/generated/kaleido/models/SwapSettlement';
import { KaleidoClient } from '../../src/client';

const client = new KaleidoClient({
  baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'
});

async function sellBtcOnchain() {
  try {
    console.log('=== Sell BTC for USDT (Simplified) ===');
    
    const btcAmountToSell = 0.0001; // Sell 0.0001 BTC (10,000 satoshis)
    console.log(`💰 Amount to swap: ${btcAmountToSell} BTC`);

    const quote = await client.getQuoteByPair('BTC/USDT', btcAmountToSell);
    
    console.log(`>> Sell: ${btcAmountToSell} BTC → ${quote.to_amount} USDT (raw)`);
    console.log(`>> Price: ${quote.price}`);
    console.log(`>> RFQ ID: ${quote.rfq_id}`);
    
    //TODO: Replace with a valid RGB invoice
    const dest_rgb_invoice = 'rgb:2whK8s5O-b1LG4rR-OhXpDq1-SjyHvKx-OhTEFjQ-aba0V_o/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/cR/bc:utxob:x8H6O_~H-7RyndJZ-CAUUAcF-RJfWg7H-9hew6Zo-pacK97w-gaGhQ';
    const refund_address = await client.getAddress();

    const order = await client.createSwapOrder({
      rfq_id: quote.rfq_id,
      from_type: SwapSettlement.ONCHAIN,
      to_type: SwapSettlement.ONCHAIN,
      min_onchain_conf: 3,
      dest_rgb_invoice: dest_rgb_invoice,
      refund_address: refund_address.address,
    });
    
    console.log(`>> Order ID: ${order.id}`);
    console.log(`>> Send BTC to: ${order.onchain_address}`);
    
  // Step 6: Display payment information
    console.log('  ✓ Order created successfully!\n');
    console.log('📋 Order Details:');
    console.log(`  Order ID: ${order.id}`);
    console.log(`  Status: ${order.status}\n`);
    console.log('💳 Payment Instructions:');
    console.log(`  Send ${btcAmountToSell} BTC to:`);
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

        if (status.status === 'FILLED') {
          console.log('\n🎉 Swap completed successfully!');
          console.log(`   You sold: ${btcAmountToSell} BTC`);
          console.log(`   You received: ${quote.to_amount} USDT`);
          console.log(`   Destination: ${dest_rgb_invoice}`);
          break;
        } else if (status.status === 'FAILED') {
          console.log('\n❌ Swap failed');
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
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

if (require.main === module) {
  sellBtcOnchain()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { sellBtcOnchain };
