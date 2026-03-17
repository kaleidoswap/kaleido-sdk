/**
 * Example 04: Create Swap Order
 *
 * Demonstrates how to create a swap order using the Kaleidoswap SDK.
 * This example shows the complete flow from getting a quote to creating an order.
 */

import {
    KaleidoClient,
    createAssetPairMapper,
    createPrecisionHandler,
    toDisplayAmount,
    Layer,
    ReceiverAddressFormat,
} from 'kaleidoswap-sdk';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🎨 Kaleidoswap SDK - Create Swap Order Example\n');

    const client = KaleidoClient.create({ baseUrl: API_URL });

    // Step 1: Get trading pairs and setup helpers
    console.log('📋 Fetching trading pairs...');
    const pairsResponse = await client.maker.listPairs();

    if (pairsResponse.pairs.length === 0) {
        console.log('No trading pairs available');
        return;
    }

    // Create helpers for asset lookup and precision handling
    const assetMapper = createAssetPairMapper(pairsResponse);
    const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());

    console.log(`Found ${pairsResponse.pairs.length} trading pairs`);
    console.log(`Mapped ${assetMapper.getAllAssets().length} unique assets\n`);

    // Step 2: Find assets to trade
    const btc = assetMapper.findByTicker('BTC');
    const usdt = assetMapper.findByTicker('USDT');

    if (!btc || !usdt) {
        console.log('❌ BTC or USDT not found in trading pairs');
        console.log('Available assets:', assetMapper.getAllAssets().map((a) => a.ticker).join(', '));
        return;
    }

    console.log(`Found assets:`);
    console.log(`  BTC: ${btc.asset_id}`);
    console.log(`  USDT: ${usdt.asset_id}\n`);

    // Check if they can be traded
    if (!assetMapper.canTrade(btc.asset_id, usdt.asset_id)) {
        console.log('❌ BTC and USDT cannot be traded directly');
        return;
    }

    // Step 3: Find the trading pair and route
    const pair = assetMapper.findPairByTickers('BTC', 'USDT');
    if (!pair || !pair.routes || pair.routes.length === 0) {
        console.log('❌ No routes available for BTC/USDT');
        return;
    }

    const route = pair.routes[0];
    console.log(`Using route: ${route.from_layer} → ${route.to_layer}\n`);

    // Step 4: Prepare amount and validate
    const amountToSwap = 0.0001; // 0.0001 BTC
    const rawAmount = precisionHandler.toRawAmount(amountToSwap, btc.asset_id);

    const validation = precisionHandler.validateOrderSize(amountToSwap, btc);
    if (!validation.valid) {
        console.log(`❌ Amount validation failed: ${validation.error}`);
        return;
    }

    console.log(`💰 Swap amount: ${amountToSwap} BTC (${rawAmount} satoshis)\n`);

    // Step 5: Get a quote
    console.log('💱 Requesting quote...');

    const quote = await client.maker.getQuote({
        from_asset: {
            asset_id: btc.asset_id,
            layer: route.from_layer as Layer,
            amount: rawAmount,
        },
        to_asset: {
            asset_id: usdt.asset_id,
            layer: route.to_layer as Layer,
        },
    });

    console.log('📊 Quote received:');
    console.log(`  RFQ ID: ${quote.rfq_id}`);
    console.log(`  From: ${quote.from_asset.amount} ${quote.from_asset.ticker}`);
    console.log(`  To: ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
    console.log(`  Price: ${quote.price}`);
    console.log(`  Expires: ${new Date(quote.expires_at).toLocaleString()}\n`);

    // Step 6: Create swap order
    // NOTE: In production, use real addresses from your wallet
    console.log('📝 Creating swap order...');

    // Determine receiver address format based on layer
    const receiverFormat: ReceiverAddressFormat =
        route.to_layer === Layer.BTC_LN
            ? ReceiverAddressFormat.BOLT11
            : ReceiverAddressFormat.RGB_INVOICE;

    try {
        const order = await client.maker.createSwapOrder({
            rfq_id: quote.rfq_id,
            from_asset: {
                asset_id: quote.from_asset.asset_id,
                name: btc.name,
                ticker: quote.from_asset.ticker,
                layer: quote.from_asset.layer,
                amount: quote.from_asset.amount,
                precision: btc.precision,
            },
            to_asset: {
                asset_id: quote.to_asset.asset_id,
                name: usdt.name,
                ticker: quote.to_asset.ticker,
                layer: quote.to_asset.layer,
                amount: quote.to_asset.amount,
                precision: usdt.precision,
            },
            receiver_address: {
                // Example placeholder - in production use real address
                address: 'rgb:placeholder-address-for-demo',
                format: receiverFormat,
            },
            min_onchain_conf: 1,
        });

        console.log('✅ Order created successfully!');
        console.log(`  Order ID: ${order.id}`);
        console.log(`  RFQ ID: ${order.rfq_id}`);
        console.log(`  Status: ${order.status}`);

        if (order.deposit_address) {
            console.log(`\n📬 Deposit Address:`);
            console.log(`  Address: ${order.deposit_address.address}`);
            console.log(`  Format: ${order.deposit_address.format}`);
        }

        console.log('\n⏳ Monitoring order status...');

        // Step 7: Monitor order status
        const finalOrder = await client.maker.waitForSwapCompletion(order.id, {
            accessToken: order.access_token,
            timeout: 60000, // 1 minute timeout for demo
            pollInterval: 2000,
            onStatusUpdate: (status) => {
                console.log(`  Status update: ${status}`);
            },
        });

        console.log(`\n🏁 Final status: ${finalOrder.status}`);
    } catch (error) {
        if (error instanceof Error) {
            console.log(`\n⚠️  Order creation failed: ${error.message}`);
            console.log('This is expected in demo mode - provide valid addresses to complete a real swap.');
        } else {
            throw error;
        }
    }

    console.log('\n✅ Demo complete!');
}

main().catch(console.error);
