/**
 * Create Swap Order Example
 *
 * This example demonstrates how to:
 * 1. Get a quote for a swap
 * 2. Create a swap order from the quote
 * 3. Monitor order status
 *
 * Note: All amount values use BigInt for precision.
 */

import { KaleidoClient, type Quote, type CreateSwapOrderRequest } from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'https://api.regtest.kaleidoswap.com';

async function main() {
  console.log('='.repeat(60));
  console.log('Kaleidoswap SDK - Create Swap Order Example');
  console.log('='.repeat(60));

  // Initialize client
  const client = await KaleidoClient.create({
    baseUrl: API_URL,
    timeout: 30,
  });

  client.maker.getQuote();

  console.log('\n✓ Client initialized');

  // Step 1: Get available trading pairs
  console.log('\n📋 Step 1: Fetching trading pairs...');
  const pairs = await client.maker.listPairs();

  if (pairs.length === 0) {
    console.log('  ❌ No trading pairs available');
    return;
  }

  const pair = pairs[0];
  const ticker = `${pair.base_asset}/${pair.quote_asset}`;
  console.log(`  Using pair: ${ticker}`);

  // Step 2: Get a quote
  console.log('\n💱 Step 2: Getting quote...');

  // Use a reasonable amount within the pair's limits
  const fromAmount = 1000000; // 1000 sats

  let quote: Quote;
  try {
    quote = await client.maker.getQuote(ticker, fromAmount, null, 'BTC_LN', 'RGB_LN');

    console.log('  ✓ Quote received:');
    console.log(`    RFQ ID: ${quote.rfq_id}`);
    console.log(`    From: ${quote.from_amount} ${quote.from_asset}`);
    console.log(`    To: ${quote.to_amount} ${quote.to_asset}`);
    console.log(`    Price: ${quote.price}`);
    console.log(`    Expires: ${new Date(Number(quote.expires_at) * 1000).toISOString()}`);
  } catch (e) {
    console.log(`  ❌ Could not get quote: ${e}`);
    return;
  }

  // Step 3: Create order (demonstration only)
  console.log('\n📝 Step 3: Creating order...');
  console.log('  (Skipping actual order creation in demo mode)');

  // The order request would look like:
  const orderRequest: CreateSwapOrderRequest = {
    rfq_id: quote.rfq_id,
    from_type: 'LIGHTNING',
    to_type: 'LIGHTNING',
    min_onchain_conf: 1,
    // Destination would be one of these depending on the target asset/layer:
    dest_bolt11: 'lnbc...',
    // dest_onchain_address: 'bc1...',
    // dest_rgb_invoice: 'rgb20...',
  };

  console.log('\n  Order request structure:');
  console.log(`    rfq_id: ${orderRequest.rfq_id}`);
  console.log(`    from_type: ${orderRequest.from_type}`);
  console.log(`    to_type: ${orderRequest.to_type}`);
  console.log(`    dest: ${orderRequest.dest_bolt11}`);

  // To actually create the order:
  // const order = await client.createSwapOrder(orderRequest);
  // console.log(`Order ID: ${order.order_id}`);
  // console.log(`Payment Address: ${order.payment_address}`);

  // Step 4: Monitor order status (demonstration only)
  console.log('\n⏳ Step 4: Order monitoring...');
  console.log('  After creating an order, you can monitor its status:');
  console.log('');
  console.log('  // Poll for status updates');
  console.log('  const status = await client.getSwapOrderStatus(order.order_id);');
  console.log('  console.log(`Status: ${status.status}`);');
  console.log('');

  // Order status values:
  console.log('  Possible order statuses:');
  console.log('    • PENDING_PAYMENT - Waiting for payment');
  console.log('    • PAID - Payment received');
  console.log('    • EXECUTING - Swap in progress');
  console.log('    • FILLED - Swap completed');
  console.log('    • FAILED - Swap failed');
  console.log('    • EXPIRED - Quote expired');

  console.log('\n' + '='.repeat(60));
  console.log('Done!');
}

main().catch(console.error);
