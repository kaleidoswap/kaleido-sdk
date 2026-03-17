/**
 * Example 07: Swap Demo
 *
 * Complete swap demonstration using the Kaleidoswap SDK.
 * This example shows the full flow from fetching pairs to creating a swap order.
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
    ReceiverAddressFormat,
} from 'kaleidoswap-sdk';

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
    // Step 6: Create swap order
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Step 6: Creating swap order...\n');

    // Determine receiver address format based on layer
    let receiverFormat: ReceiverAddressFormat;
    switch (route.to_layer) {
        case Layer.BTC_LN:
            receiverFormat = ReceiverAddressFormat.BOLT11;
            break;
        case Layer.BTC_L1:
            receiverFormat = ReceiverAddressFormat.BTC_ADDRESS;
            break;
        case Layer.RGB_LN:
        case Layer.RGB_L1:
            receiverFormat = ReceiverAddressFormat.RGB_INVOICE;
            break;
        default:
            receiverFormat = ReceiverAddressFormat.BOLT11;
    }

    try {
        const order = await client.maker.createSwapOrder({
            rfq_id: quote.rfq_id,
            from_asset: {
                asset_id: quote.from_asset.asset_id,
                name: fromAsset.name,
                ticker: quote.from_asset.ticker,
                layer: quote.from_asset.layer,
                amount: quote.from_asset.amount,
                precision: fromAsset.precision,
            },
            to_asset: {
                asset_id: quote.to_asset.asset_id,
                name: toAsset.name,
                ticker: quote.to_asset.ticker,
                layer: quote.to_asset.layer,
                amount: quote.to_asset.amount,
                precision: toAsset.precision,
            },
            receiver_address: {
                // Demo placeholder - use real address in production
                address: 'demo-receiver-address',
                format: receiverFormat,
            },
            min_onchain_conf: 1,
        });

        console.log('✅ Swap order created successfully!\n');
        console.log(`  Order ID: ${order.id}`);
        console.log(`  RFQ ID:   ${order.rfq_id}`);
        console.log(`  Status:   ${order.status}`);

        if (order.deposit_address) {
            console.log(`\n📬 Deposit Address:`);
            console.log(`  Address: ${order.deposit_address.address}`);
            console.log(`  Format:  ${order.deposit_address.format}`);
        }

        // ====================================================================
        // Step 7: Monitor order status (brief demo)
        // ====================================================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⏳ Step 7: Monitoring order status (10 seconds)...\n');

        const startTime = Date.now();
        const timeout = 10000;

        while (Date.now() - startTime < timeout) {
            try {
                const statusResponse = await client.maker.getSwapOrderStatus({
                    order_id: order.id,
                    access_token: order.access_token,
                });
                const currentOrder = statusResponse.order;

                if (currentOrder) {
                    console.log(`  [${Math.round((Date.now() - startTime) / 1000)}s] Status: ${currentOrder.status}`);

                    if (['FILLED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(currentOrder.status)) {
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
            console.log(`⚠️  Order creation result: ${error.message}`);
            console.log('\nThis may be expected if:');
            console.log('  • The demo receiver address is not valid');
            console.log('  • The maker node requires specific address formats');
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
    console.log('  ✓ Creating a swap order');
    console.log('  ✓ Monitoring order status\n');

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 Demo Complete!                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
}

swapDemo().catch((error) => {
    console.error('\n❌ Demo failed with error:\n');
    console.error(error);
    process.exit(1);
});
