/**
 * Features demonstrated:
 * - getQuoteByAssets() with automatic asset discovery
 * - Built-in validation and error handling
 * - Smart input format detection (tickers vs asset IDs)
 * - Enhanced return types with display amounts
 */

import { KaleidoClient } from '../../src/client';

async function simpleSwapDemo() {
  console.log('=== Simple Swap Demo - New Unified SDK ===\n');

  const client = new KaleidoClient({
    baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'
  });

  try {
    console.log('💱 Getting quote for BTC/USDT swap...');
    
    // using pair string in "asset_ticker_1/asset_ticker_2" format
    const quote = await client.getQuoteByPair('BTC/USDT', 0.0001);

    console.log('  Quote received:');
    console.log(`    You sell: 0.0001 BTC`);
    console.log(`    You receive: ${quote.to_amount} USDT (raw)`);
    console.log(`    Price: ${quote.price}`);
    console.log(`    RFQ ID: ${quote.rfq_id}\n`);

    console.log('📊 Alternative input formats:');
    
    // using assets as two separate attributes like: ("asset_ticker_1", "asset_ticker_2", amount)
    const quote2 = await client.getQuoteByAssets('USDT', 'BTC', 100);
    console.log(`  1. USDT → BTC: 100 USDT → ${quote2.to_amount} BTC (raw)`);
    
    // using the asset_id to get quote
    const btcAsset = await client.getAssetByTicker('BTC');
    const usdtAsset = await client.getAssetByTicker('USDT');
    
    if (btcAsset && usdtAsset) {
      const quote3 = await client.getQuoteByAssets(btcAsset.asset_id, usdtAsset.asset_id, 0.0001);
      console.log(`  2. Asset IDs: 0.0001 BTC → ${quote3.to_amount} USDT (raw)`);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid order size')) {
        console.log('💡 Tip: Amount too small/large. Try a different amount.');
      } else if (error.message.includes('not found')) {
        console.log('💡 Tip: Asset not available. Check available pairs.');
      }
    }
  }
}

async function oneCallSwapDemo() {
  console.log('=== One-Call Swap Execution Demo ===\n');

  try {
    console.log('⚡ This demo shows how to execute a complete swap...');
    console.log('⚠️  Note: One-call swap execution requires additional setup:');
    console.log('   1. Node URL must be configured (KALEIDO_NODE_URL)');
    console.log('   2. Use executeSwap or executeSwapByPair methods');
    console.log('   3. See atomic-swap-ln-to-ln.ts for a complete example\n');
    
    const client = new KaleidoClient({
      baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1',
      nodeUrl: process.env.KALEIDO_NODE_URL // Required for swap execution
    });
    
    console.log('📚 Available swap methods:');
    console.log('   - executeSwap(rfqId, fromAsset, toAsset, fromAmount, toAmount, takerPubkey)');
    console.log('   - executeSwapByPair(pair, amount, side, takerPubkey)');
    console.log('   - createSwapOrder(request) for onchain swaps\n');

    // Example: Get a quote first
    const quote = await client.getQuoteByPair('BTC/USDT', 0.0001);
    console.log('💱 Sample quote:');
    console.log(`   ${quote.fromDisplayAmount} ${quote.fromAsset.ticker} → ${quote.toDisplayAmount} ${quote.toAsset.ticker}`);
    console.log(`   Price: ${quote.price}`);
    console.log(`   RFQ ID: ${quote.rfq_id}\n`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Run both demos
async function runAllDemos() {
  await simpleSwapDemo();
  console.log('\n' + '='.repeat(50) + '\n');
  await oneCallSwapDemo();
}

// Run if called directly
if (require.main === module) {
  runAllDemos()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { simpleSwapDemo, oneCallSwapDemo };

