/**
 * Example 02: Get Quote
 *
 * Fetching a swap quote from the Kaleidoswap API.
 */

import { KaleidoClient, toDisplayAmount } from '../src/index.js';
import type { Layer } from '../src/types.js';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🎨 Kaleidoswap SDK - Get Quote Example\n');

    const client = KaleidoClient.create({ baseUrl: API_URL });

    // List pairs first
    console.log('📋 Fetching trading pairs...');
    const pairsResponse = await client.maker.listPairs();
    console.log(`Found ${pairsResponse.pairs.length} trading pairs\n`);

    if (pairsResponse.pairs.length === 0) {
        console.log('No trading pairs available');
        return;
    }

    // Pick first pair - TradingPair has base and quote (TradableAsset) properties
    const pair = pairsResponse.pairs[0];
    console.log(`Using pair: ${pair.base.ticker}/${pair.quote.ticker}`);

    // Get first route from the pair
    const route = pair.routes?.[0];
    if (!route) {
        console.log('No routes available for this pair');
        return;
    }
    console.log(`  Route: ${route.from_layer} → ${route.to_layer}\n`);

    // Get protocol ID for the asset (e.g., 'BTC' for Bitcoin, RGB contract ID for tokens)
    const baseAssetId = pair.base.protocol_ids?.['BTC'] || pair.base.ticker;
    const quoteAssetId = pair.quote.protocol_ids?.['RGB'] || pair.quote.ticker;

    // Get a quote for 0.001 BTC (100,000 sats)
    const fromAmount = 100000;
    console.log(`💱 Getting quote for ${toDisplayAmount(fromAmount, pair.base.precision)} ${pair.base.ticker}...`);

    const quote = await client.maker.getQuote({
        from_asset: {
            asset_id: baseAssetId,
            layer: route.from_layer as Layer,
            amount: fromAmount,
        },
        to_asset: {
            asset_id: quoteAssetId,
            layer: route.to_layer as Layer,
        },
    });

    console.log('\n📊 Quote received:');
    console.log(`  RFQ ID: ${quote.rfq_id}`);
    console.log(`  From: ${quote.from_asset.amount} ${quote.from_asset.ticker}`);
    console.log(`  To: ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
    console.log(`  Price: ${quote.price}`);
    console.log(`  Expires: ${new Date(quote.expires_at).toLocaleString()}`);

    console.log('\n✅ Done!');
}

main().catch(console.error);
