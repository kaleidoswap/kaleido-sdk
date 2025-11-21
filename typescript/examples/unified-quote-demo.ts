/**
 * Unified Quote Method Demo
 *
 * This example demonstrates the new unified getQuoteByAssets method that supports
 * multiple input formats and automatically detects whether inputs are tickers or asset IDs.
 *
 * Supported formats:
 * 1. Pair string: 'BTC/USDT' or 'BTC-USDT'
 * 2. Separate assets: 'BTC', 'USDT'
 * 3. Asset IDs: 'rgb:...'
 * 4. Pair objects: { baseAsset, quoteAsset }
 */

import { KaleidoClient } from '../src/client';

async function unifiedQuoteDemo() {
  console.log('=== Unified Quote Method Demo ===\n');

  const client = new KaleidoClient({
    baseUrl: process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1'
  });

  try {
    // ============================================================================
    // 1. Using Pair String Format
    // ============================================================================
    
    console.log('📊 Method 1: Pair String Format');
    console.log('===============================');

    // Format: 'BTC/USDT' with amount
    const quote1 = await client.getQuoteByAssets('BTC/USDT', 0.001);
    console.log(`✓ BTC/USDT: ${quote1.fromDisplayAmount} ${quote1.fromAsset.ticker} → ${quote1.toDisplayAmount} ${quote1.toAsset.ticker}`);

    // Format: 'BTC-USDT' (alternative separator)
    const quote2 = await client.getQuoteByAssets('BTC-USDT', 0.001);
    console.log(`✓ BTC-USDT: ${quote2.fromDisplayAmount} ${quote2.fromAsset.ticker} → ${quote2.toDisplayAmount} ${quote2.toAsset.ticker}\n`);

    // ============================================================================
    // 2. Using Separate Asset Format
    // ============================================================================
    
    console.log('🔗 Method 2: Separate Assets Format');
    console.log('===================================');

    // Format: separate ticker arguments
    const quote3 = await client.getQuoteByAssets('BTC', 'USDT', 0.001);
    console.log(`✓ Separate tickers: ${quote3.fromDisplayAmount} ${quote3.fromAsset.ticker} → ${quote3.toDisplayAmount} ${quote3.toAsset.ticker}`);

    // ============================================================================
    // 3. Using Asset IDs (if available)
    // ============================================================================
    
    console.log('🆔 Method 3: Asset ID Format');
    console.log('=============================');

    // Get asset IDs first
    const btcAsset = await client.getAssetByTicker('BTC');
    const usdtAsset = await client.getAssetByTicker('USDT');

    if (btcAsset && usdtAsset) {
      // Format: using actual asset IDs
      const quote4 = await client.getQuoteByAssets(btcAsset.asset_id, usdtAsset.asset_id, 0.001);
      console.log(`✓ Asset IDs: ${quote4.fromDisplayAmount} ${quote4.fromAsset.ticker} → ${quote4.toDisplayAmount} ${quote4.toAsset.ticker}`);
      console.log(`  From Asset ID: ${btcAsset.asset_id.substring(0, 20)}...`);
      console.log(`  To Asset ID: ${usdtAsset.asset_id.substring(0, 20)}...\n`);
    }

    // ============================================================================
    // 4. Using Pair Objects
    // ============================================================================
    
    console.log('📦 Method 4: Pair Object Format');
    console.log('================================');

    // Get pair object first
    const pair = await client.getPairByTicker('BTC', 'USDT');
    if (pair) {
      const quote5 = await client.getQuoteByAssets(pair, 0.001);
      console.log(`✓ Pair object: ${quote5.fromDisplayAmount} ${quote5.fromAsset.ticker} → ${quote5.toDisplayAmount} ${quote5.toAsset.ticker}`);
      console.log(`  Can trade: ${pair.canTrade}\n`);
    }

    // ============================================================================
    // 5. Error Handling Examples
    // ============================================================================
    
    console.log('🛡️  Error Handling Examples');
    console.log('============================');

    try {
      await client.getQuoteByAssets('INVALID/ASSET', 0.001);
    } catch (error) {
      console.log(`✓ Invalid asset error: ${error instanceof Error ? error.message : error}`);
    }

    try {
      await client.getQuoteByAssets('INVALID_FORMAT_NO_SEPARATOR', 0.001);
    } catch (error) {
      console.log(`✓ Invalid format error: ${error instanceof Error ? error.message : error}`);
    }

    try {
      await client.getQuoteByAssets('BTC/USDT', 0.000000001); // Too small
    } catch (error) {
      console.log(`✓ Order size error: ${error instanceof Error ? error.message : error}`);
    }

    // ============================================================================
    // 6. Comparison with Old Methods
    // ============================================================================
    
    console.log('\n📈 Comparison: New vs Old Methods');
    console.log('==================================');

    // Old way (still works for backward compatibility)
    if (btcAsset && usdtAsset) {
      const oldQuote = await client.getQuote(btcAsset.asset_id, usdtAsset.asset_id, 100000000); // 0.001 BTC in satoshis
      console.log('Old method result:');
      console.log(`  Raw amounts: ${oldQuote.from_amount} → ${oldQuote.to_amount}`);
      console.log(`  Price: ${oldQuote.price}`);
    }

    // New way
    const newQuote = await client.getQuoteByAssets('BTC/USDT', 0.001);
    console.log('New method result:');
    console.log(`  Display amounts: ${newQuote.fromDisplayAmount} → ${newQuote.toDisplayAmount}`);
    console.log(`  Raw amounts: ${newQuote.from_amount} → ${newQuote.to_amount}`);
    console.log(`  Price: ${newQuote.price}`);
    console.log(`  Asset metadata included: ✓`);

    console.log('\n🎯 Summary of New Features');
    console.log('===========================');
    console.log('✓ Multiple input formats supported');
    console.log('✓ Automatic ticker/asset_id detection');
    console.log('✓ Enhanced error messages');
    console.log('✓ Display amounts included');
    console.log('✓ Asset metadata included');
    console.log('✓ Backward compatibility maintained');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  unifiedQuoteDemo()
    .then(() => {
      console.log('\n✅ Demo completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { unifiedQuoteDemo };
