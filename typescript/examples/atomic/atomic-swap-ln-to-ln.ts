/**
 * Lightning to Lightning Atomic Swap
 *
 * This example demonstrates the fastest swap method using Lightning Network
 * on both sides with atomic swap protocol. This requires an RLN (RGB Lightning Node)
 * on both maker and taker sides.
 *
 * Scenario: Pay with Lightning, receive via Lightning invoice (atomic execution)
 * Settlement: Lightning → Lightning (Atomic Swap)
 * RLN Node Required: ✅ Yes (both sides)
 *
 * Flow:
 * 1. Get quote via WebSocket
 * 2. Initialize maker swap (get swapstring and payment_hash)
 * 3. Whitelist the trade on taker node
 * 4. Execute the maker swap with taker's pubkey
 * 5. Wait for swap completion
 *
 * Benefits:
 * - Fastest execution (seconds instead of minutes)
 * - Atomic settlement (either completes fully or reverts)
 * - Lower fees compared to onchain
 * - Instant liquidity
 */

import { KaleidoClient } from '../../src/client';
import { SwapStatus } from '../../src/generated/kaleido';
import { createAssetPairMapper, createPrecisionHandler, retry } from '../../src/utils';

async function atomicSwapLnToLn() {
  console.log('=== Lightning to Lightning Atomic Swap ===\n');

  // Initialize the client with node URL
  const nodeUrl = process.env.KALEIDO_NODE_URL || 'http://localhost:3001';

  console.log('⚙️  Configuration:');
  console.log(`  API URL: ${process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'}`);
  console.log(`  Node URL: ${nodeUrl}\n`);

  const client = new KaleidoClient({
    baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1',
    nodeUrl: nodeUrl
  });

  try {
    // Step 1: Get trading pairs and setup utility helpers
    console.log('📊 Fetching available trading pairs...');
    const pairs = await client.listPairs();
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

    // Check if we can trade these assets
    if (!assetMapper.canTrade(btc.asset_id, usdt.asset_id)) {
      throw new Error('BTC and USDT cannot be traded directly');
    }

    // Step 3: Define the swap amount
    const btcAmount = 0.0001; // 0.0001 BTC (10,000 satoshis)
    console.log(`💰 Swap amount: ${btcAmount} BTC\n`);

    const validation = precisionHandler.validateOrderSize(btcAmount, btc);
    if (!validation.valid) {
      throw new Error(`Amount validation failed: ${validation.error}`);
    }

    // Step 4: Get quote via WebSocket (faster for atomic swaps)
    console.log('💱 Requesting quote via WebSocket...');
    const quote = await retry(
      async () => client.getQuoteWebSocket(
        btc.asset_id,
        usdt.asset_id,
        validation.rawAmount
      ),
      { maxRetries: 3, initialDelay: 1000 }
    );

    const btcToSwap = precisionHandler.toDisplayAmount(quote.from_amount, btc.asset_id);
    const usdtToReceive = precisionHandler.toDisplayAmount(quote.to_amount, usdt.asset_id);

    console.log('  Quote received:');
    console.log(`    From: ${btcToSwap} BTC`);
    console.log(`    To: ${usdtToReceive} USDT`);
    console.log(`    Price: ${quote.price}`);
    console.log(`    RFQ ID: ${quote.rfq_id}`);
    console.log(`    Expires at: ${new Date(quote.expires_at * 1000).toLocaleString()}\n`);

    // Step 5: Initialize maker swap
    console.log('🔧 Initializing maker swap...');
    const initResult = await retry(
      async () => client.initMakerSwap({
        rfq_id: quote.rfq_id,
        from_asset: quote.from_asset,
        to_asset: quote.to_asset,
        from_amount: quote.from_amount,
        to_amount: quote.to_amount
      }),
      { maxRetries: 3, initialDelay: 1000 }
    );

    if (!initResult.swapstring || !initResult.payment_hash) {
      throw new Error('Missing swapstring or payment_hash in init response');
    }

    console.log('  ✓ Maker swap initialized');
    console.log(`    Payment hash: ${initResult.payment_hash}`);
    console.log(`    Swapstring: ${initResult.swapstring.substring(0, 50)}...\n`);

    // Step 6: Whitelist the trade on taker node
    console.log('✅ Whitelisting trade on taker node...');
    await retry(
      async () => client.whitelistTrade(initResult.swapstring),
      { maxRetries: 3, initialDelay: 1000 }
    );
    console.log('  ✓ Trade whitelisted successfully\n');

    // Step 7: Get taker's pubkey
    console.log('🔑 Getting taker node pubkey...');
    const takerPubkey = await client.getNodePubkey();
    console.log(`  ✓ Taker pubkey: ${takerPubkey}\n`);

    // Step 8: Execute the maker swap
    console.log('⚡ Executing atomic swap...');
    await retry(
      async () => client.executeMakerSwap({
        swapstring: initResult.swapstring,
        payment_hash: initResult.payment_hash,
        taker_pubkey: takerPubkey
      }),
      { maxRetries: 3, initialDelay: 2000 }
    );

    console.log('  ✓ Swap execution initiated\n');

    // Step 9: Wait for swap completion
    console.log('⏳ Monitoring swap completion...');
    console.log('  (This should be very fast with Lightning...)\n');

    try {
      const swapStatus = await client.waitForSwapCompletion(
        initResult.payment_hash,
        {
          timeout: 300000,  // timeout: 5 minutes
          pollInterval: 5000,  // poll interval: 5 seconds
        }
      );

      if (swapStatus.status === SwapStatus.SUCCEEDED) {
        console.log('🎉 Atomic swap completed successfully!\n');
        console.log('📊 Swap Summary:');
        console.log(`  Swapped: ${btcToSwap} BTC`);
        console.log(`  Received: ${usdtToReceive} USDT`);
        console.log(`  Status: ${swapStatus.status}`);
        console.log(`  Payment hash: ${initResult.payment_hash}`);

        if (swapStatus.requested_at && swapStatus.completed_at) {
          const duration = swapStatus.completed_at - swapStatus.requested_at;
          console.log(`  Duration: ${duration} seconds`);
        }
      } else if (swapStatus.status === SwapStatus.FAILED) {
        console.log('❌ Atomic swap failed\n');
        console.log(`  Status: ${swapStatus.status}`);
      } else if (swapStatus.status === SwapStatus.EXPIRED) {
        console.log('⏰ Atomic swap expired\n');
        console.log('  The swap expired before completion');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('did not complete')) {
        console.log('⏱️  Swap monitoring timed out');
        console.log('  The swap may still complete. Check status manually:\n');
        console.log(`  await client.getSwapStatus('${initResult.payment_hash}')`);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);

    if (error instanceof Error) {
      if (error.message.includes('Node URL is required')) {
        console.log('\n💡 This operation requires an RLN node. Please configure:');
        console.log('   - Set KALEIDO_NODE_URL environment variable, or');
        console.log('   - Pass nodeUrl in KaleidoClient configuration');
      } else if (error.message.includes('insufficient liquidity')) {
        console.log('\n💡 Tip: Try a smaller amount');
      } else if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Tip: Make sure your RLN node is running and accessible');
        console.log('   Check that the node URL is correct:', nodeUrl);
      } else if (error.message.includes('whitelist')) {
        console.log('\n💡 Tip: The trade whitelisting failed. This usually means:');
        console.log('   - The RLN node is not properly configured');
        console.log('   - The swapstring is invalid or expired');
        console.log('   - There are insufficient funds in the Lightning channels');
      }
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  atomicSwapLnToLn()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { atomicSwapLnToLn };
