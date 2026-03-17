/**
 * Example 08: Advanced Market Data Operations
 *
 * Demonstrates advanced SDK features:
 * 1. Using AssetPairMapper for easy asset/pair lookup
 * 2. Converting between display and atomic units
 * 3. Amount validation with PrecisionHandler
 * 4. Checking trade availability
 * 5. Working with trading pairs and routes
 */

import {
    KaleidoClient,
    createAssetPairMapper,
    createPrecisionHandler,
    toRawAmount,
    toDisplayAmount,
} from 'kaleidoswap-sdk';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🚀 Advanced Market Data Operations\n');

    // Initialize client
    const client = KaleidoClient.create({ baseUrl: API_URL });

    // ========================================================================
    // Step 1: Fetch data and create helpers
    // ========================================================================
    console.log('📦 Fetching market data...');
    const pairsResponse = await client.maker.listPairs();
    const assetsResponse = await client.maker.listAssets();

    const assetMapper = createAssetPairMapper(pairsResponse);
    const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());

    console.log(`  Found ${assetsResponse.assets.length} assets`);
    console.log(`  Found ${pairsResponse.pairs.length} trading pairs`);
    console.log(`  Mapped ${assetMapper.getAllAssets().length} unique tradable assets\n`);

    // ========================================================================
    // Example 1: Find assets by ticker
    // ========================================================================
    console.log('🔍 Example 1: Finding assets by ticker...');

    const btc = assetMapper.findByTicker('BTC');
    if (btc) {
        console.log('  Found BTC:');
        console.log(`    Asset ID: ${btc.asset_id}`);
        console.log(`    Ticker: ${btc.ticker}`);
        console.log(`    Precision: ${btc.precision} decimal places`);
        console.log(`    Min Order: ${precisionHandler.toDisplayAmount(btc.min_order_size, btc.asset_id)} ${btc.ticker}`);
        console.log(`    Max Order: ${precisionHandler.toDisplayAmount(btc.max_order_size, btc.asset_id)} ${btc.ticker}`);
    } else {
        console.log('  BTC not found');
    }

    const usdt = assetMapper.findByTicker('USDT');
    if (usdt) {
        console.log('\n  Found USDT:');
        console.log(`    Asset ID: ${usdt.asset_id}`);
        console.log(`    Precision: ${usdt.precision} decimal places`);
    }

    // ========================================================================
    // Example 2: Amount conversion
    // ========================================================================
    console.log('\n💱 Example 2: Converting between display and atomic units...');

    if (btc) {
        // Using standalone functions (when you know precision)
        const rawAmount = toRawAmount(1.5, btc.precision);
        console.log(`  1.5 BTC = ${rawAmount} atomic units (precision: ${btc.precision})`);

        const displayAmount = toDisplayAmount(rawAmount, btc.precision);
        console.log(`  ${rawAmount} atomic units = ${displayAmount} BTC`);

        // Using PrecisionHandler (when you have asset data)
        const rawViaHandler = precisionHandler.toRawAmount(2.5, btc.asset_id);
        console.log(`  2.5 BTC = ${rawViaHandler} atomic units (via PrecisionHandler)`);

        const displayViaHandler = precisionHandler.toDisplayAmount(rawViaHandler, btc.asset_id);
        console.log(`  ${rawViaHandler} atomic units = ${displayViaHandler} BTC (via PrecisionHandler)`);
    }

    // ========================================================================
    // Example 3: Amount validation
    // ========================================================================
    console.log('\n✅ Example 3: Validating amounts...');

    if (btc) {
        // Valid amount
        const validation1 = precisionHandler.validateOrderSize(0.001, btc);
        console.log(`  Amount: 0.001 BTC`);
        console.log(`    Valid: ${validation1.valid}`);
        console.log(`    Raw Amount: ${validation1.rawAmount}`);
        if (!validation1.valid) {
            console.log(`    Error: ${validation1.error}`);
        }

        // Try an amount that might be too small
        const tinyAmount = 0.0000000001;
        const validation2 = precisionHandler.validateOrderSize(tinyAmount, btc);
        console.log(`\n  Amount: ${tinyAmount} BTC`);
        console.log(`    Valid: ${validation2.valid}`);
        if (!validation2.valid) {
            console.log(`    Error: ${validation2.error}`);
        }

        // Get order size limits
        const limits = precisionHandler.getOrderSizeLimits(btc);
        console.log(`\n  Order size limits for ${btc.ticker}:`);
        console.log(`    Min: ${limits.minDisplayAmount} ${btc.ticker}`);
        console.log(`    Max: ${limits.maxDisplayAmount} ${btc.ticker}`);
    }

    // ========================================================================
    // Example 4: Check trade availability
    // ========================================================================
    console.log('\n🔄 Example 4: Checking trade availability...');

    // Check by ticker
    const canTradeBtcUsdt = assetMapper.canTradeByTicker('BTC', 'USDT');
    console.log(`  Can trade BTC/USDT: ${canTradeBtcUsdt}`);

    const canTradeFake = assetMapper.canTradeByTicker('FAKE', 'COIN');
    console.log(`  Can trade FAKE/COIN: ${canTradeFake}`);

    // Check by asset ID
    if (btc && usdt) {
        const canTrade = assetMapper.canTrade(btc.asset_id, usdt.asset_id);
        console.log(`  Can trade ${btc.asset_id} → ${usdt.asset_id}: ${canTrade}`);
    }

    // ========================================================================
    // Example 5: Get trading partners
    // ========================================================================
    console.log('\n🤝 Example 5: Finding trading partners...');

    if (btc) {
        const partners = assetMapper.getTradingPartners(btc.asset_id);
        console.log(`  Trading partners for ${btc.ticker}:`);
        for (const partner of partners) {
            console.log(`    • ${partner.ticker} (${partner.asset_id.substring(0, 30)}...)`);
        }
    }

    // ========================================================================
    // Example 6: Working with trading pairs
    // ========================================================================
    console.log('\n📊 Example 6: Working with trading pairs...');

    const activePairs = assetMapper.getActivePairs();
    console.log(`  Active trading pairs: ${activePairs.length}`);

    for (const pair of activePairs.slice(0, 3)) {
        console.log(`\n  ${pair.base.ticker}/${pair.quote.ticker}:`);
        console.log(`    Price: ${pair.price || 'N/A'}`);
        console.log(`    Routes: ${pair.routes?.length || 0}`);

        if (pair.routes && pair.routes.length > 0) {
            for (const route of pair.routes.slice(0, 3)) {
                console.log(`      • ${route.from_layer} → ${route.to_layer}`);
            }
            if (pair.routes.length > 3) {
                console.log(`      ... and ${pair.routes.length - 3} more routes`);
            }
        }
    }

    // ========================================================================
    // Example 7: Find specific pair
    // ========================================================================
    console.log('\n🎯 Example 7: Finding specific trading pair...');

    const btcUsdtPair = assetMapper.findPairByTickers('BTC', 'USDT');
    if (btcUsdtPair) {
        console.log(`  Found BTC/USDT pair:`);
        console.log(`    Base: ${btcUsdtPair.base.ticker} (precision: ${btcUsdtPair.base.precision})`);
        console.log(`    Quote: ${btcUsdtPair.quote.ticker} (precision: ${btcUsdtPair.quote.precision})`);
        console.log(`    Active: ${btcUsdtPair.is_active}`);
        console.log(`    Available routes: ${btcUsdtPair.routes?.length || 0}`);
    } else {
        console.log('  BTC/USDT pair not found');
    }

    console.log('\n✅ All advanced market data operations completed!');
}

main().catch(console.error);
