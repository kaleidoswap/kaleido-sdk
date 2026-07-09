/**
 * Example 07: Swap Demo
 *
 * Complete swap demonstration using the Kaleidoswap SDK.
 * This example shows the full flow from fetching pairs to initiating an atomic swap.
 *
 * Usage:
 *   npx tsx examples/07_swap_demo.ts
 *
 * Environment variables:
 *   KALEIDO_API_URL - API base URL (default: http://localhost:8000)
 */

import {
    KaleidoClient,
    createAssetPairMapper,
    createPrecisionHandler,
    Layer,
} from 'kaleido-sdk';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function swapDemo() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           🎨 Kaleidoswap SDK - Swap Demo                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`📡 Connecting to: ${API_URL}\n`);

    const client = KaleidoClient.create({ baseUrl: API_URL });

    // ========================================================================
    // Step 1: Fetch and display available assets
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Step 1: Fetching available assets...\n');

    const assetsResponse = await client.maker.listAssets();
    console.log(`Found ${assetsResponse.assets.length} assets:`);
    for (const asset of assetsResponse.assets) {
        console.log(`  • ${asset.ticker.padEnd(6)} - ${asset.name} (precision: ${asset.precision})`);
    }
    console.log();

    // ========================================================================
    // Step 2: Fetch trading pairs and create helpers
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Step 2: Fetching trading pairs...\n');

    const pairsResponse = await client.maker.listPairs();

    if (pairsResponse.pairs.length === 0) {
        console.log('❌ No trading pairs available. Is the maker node running?\n');
        return;
    }

    const assetMapper = createAssetPairMapper(pairsResponse);
    const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());

    console.log(`Found ${pairsResponse.pairs.length} trading pairs:`);
    for (const pair of pairsResponse.pairs) {
        const routes = pair.routes?.map((r) => `${r.from_layer}→${r.to_layer}`).join(', ') || 'none';
        console.log(`  • ${pair.base.ticker}/${pair.quote.ticker} [routes: ${routes}]`);
    }
    console.log();

    // ========================================================================
    // Step 3: Select trading pair
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Step 3: Selecting trading pair...\n');

    // Try to find BTC/USDT, otherwise use first available pair
    let fromAsset = assetMapper.findByTicker('BTC');
    let toAsset = assetMapper.findByTicker('USDT');

    if (!fromAsset || !toAsset || !assetMapper.canTrade(fromAsset.asset_id, toAsset.asset_id)) {
        // Fall back to first available pair
        const firstPair = pairsResponse.pairs[0];
        fromAsset = assetMapper.findByTicker(firstPair.base.ticker);
        toAsset = assetMapper.findByTicker(firstPair.quote.ticker);

        if (!fromAsset || !toAsset) {
            console.log('❌ Could not find suitable trading pair\n');
            return;
        }
    }

    console.log(`Selected pair: ${fromAsset.ticker}/${toAsset.ticker}`);
    console.log(`  From: ${fromAsset.ticker} (${fromAsset.asset_id})`);
    console.log(`  To:   ${toAsset.ticker} (${toAsset.asset_id})\n`);

    // Find route for this pair
    const pair = assetMapper.findPairByTickers(fromAsset.ticker, toAsset.ticker);
    if (!pair?.routes || pair.routes.length === 0) {
        console.log('❌ No routes available for this pair\n');
        return;
    }

    const route = pair.routes[0];
    console.log(`Route: ${route.from_layer} → ${route.to_layer}\n`);

    // ========================================================================
    // Step 4: Calculate swap amount
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 Step 4: Calculating swap amount...\n');

    // Use minimum order size if available, otherwise use a small amount
    const minDisplayAmount = precisionHandler.toDisplayAmount(fromAsset.min_order_size, fromAsset.asset_id);
    const swapAmount = Math.max(minDisplayAmount, 0.0001);
    const rawAmount = precisionHandler.toRawAmount(swapAmount, fromAsset.asset_id);

    console.log(`Swap amount: ${swapAmount} ${fromAsset.ticker}`);
    console.log(`Raw amount:  ${rawAmount} (atomic units)\n`);

    // Validate the amount
    const validation = precisionHandler.validateOrderSize(swapAmount, fromAsset);
    if (!validation.valid) {
        console.log(`❌ Amount validation failed: ${validation.error}\n`);
        return;
    }
    console.log('✓ Amount validated successfully\n');

    // ========================================================================
    // Step 5: Get quote
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💱 Step 5: Requesting quote...\n');

    const quote = await client.maker.getQuote({
        from_asset: {
            asset_id: fromAsset.asset_id,
            layer: route.from_layer as Layer,
            amount: rawAmount,
        },
        to_asset: {
            asset_id: toAsset.asset_id,
            layer: route.to_layer as Layer,
        },
    });

    console.log('Quote received:');
    console.log(`  RFQ ID:  ${quote.rfq_id}`);
    console.log(`  From:    ${quote.from_asset.amount} ${quote.from_asset.ticker}`);
    console.log(`  To:      ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
    console.log(`  Price:   ${quote.price}`);
    console.log(`  Expires: ${new Date(quote.expires_at).toLocaleString()}\n`);

    // ========================================================================
    // Step 6: Initiate atomic swap
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Step 6: Initiating atomic swap...\n');

    try {
        const swap = await client.maker.initSwap({
            rfq_id: quote.rfq_id,
            from_asset: quote.from_asset.asset_id,
            from_amount: quote.from_asset.amount ?? 0,
            to_asset: quote.to_asset.asset_id,
            to_amount: quote.to_asset.amount ?? 0,
        });

        console.log('✅ Atomic swap initiated successfully!\n');
        console.log(`  Payment hash: ${swap.payment_hash}`);
        console.log(`  Swapstring:   ${swap.swapstring.slice(0, 40)}...`);
        console.log(
            '\n  Next step (not shown here): a taker calls executeSwap() with the' +
                '\n  swapstring, their node pubkey, and the payment hash to settle the swap.',
        );

        // ====================================================================
        // Step 7: Monitor atomic swap status (brief demo)
        // ====================================================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⏳ Step 7: Monitoring swap status (10 seconds)...\n');

        const startTime = Date.now();
        const timeout = 10000;

        while (Date.now() - startTime < timeout) {
            try {
                const statusResponse = await client.maker.getAtomicSwapStatus({
                    payment_hash: swap.payment_hash,
                });
                const currentSwap = statusResponse.swap;

                if (currentSwap) {
                    console.log(
                        `  [${Math.round((Date.now() - startTime) / 1000)}s] Status: ${currentSwap.status}`,
                    );

                    if (['Succeeded', 'Failed', 'Expired'].includes(currentSwap.status)) {
                        break;
                    }
                }
            } catch (error) {
                // Status check failed, continue
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(`⚠️  Swap initiation result: ${error.message}`);
            console.log('\nThis may be expected if:');
            console.log('  • The quote has expired');
            console.log('  • The maker has insufficient liquidity for this route');
            console.log('  • Additional validation is required\n');
        } else {
            throw error;
        }
    }

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Summary\n');
    console.log('This demo demonstrated:');
    console.log('  ✓ Fetching available assets');
    console.log('  ✓ Fetching and parsing trading pairs');
    console.log('  ✓ Using AssetPairMapper for asset lookup');
    console.log('  ✓ Using PrecisionHandler for amount conversion');
    console.log('  ✓ Requesting a quote');
    console.log('  ✓ Initiating an atomic swap');
    console.log('  ✓ Monitoring swap status\n');

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 Demo Complete!                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
}

swapDemo().catch((error) => {
    console.error('\n❌ Demo failed with error:\n');
    console.error(error);
    process.exit(1);
});
