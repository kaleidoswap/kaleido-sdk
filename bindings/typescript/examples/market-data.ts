/**
 * Market Data Example
 * 
 * This example demonstrates how to:
 * 1. Connect to the Kaleidoswap API
 * 2. List available assets
 * 3. List trading pairs
 * 4. Get a quote for a swap
 */

import { createClient, toDisplayUnits } from '../src';

async function main() {
    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - Market Data Example');
    console.log('='.repeat(60));

    // Initialize client
    const client = createClient({
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
        maxRetries: 3,
        cacheTtl: 300,
    });

    // List available assets (async)
    console.log('\n📋 Available Assets:');
    console.log('-'.repeat(40));

    const assetsJson = await client.listAssets();
    const assets = JSON.parse(assetsJson);

    assets.slice(0, 5).forEach((asset: any) => {
        const name = asset.name || 'Unknown';
        const ticker = asset.ticker || '???';
        const precision = asset.precision || 0;
        console.log(`  • ${name} (${ticker}) - Precision: ${precision}`);
    });

    if (assets.length > 5) {
        console.log(`  ... and ${assets.length - 5} more assets`);
    }

    // List trading pairs (async)
    console.log('\n💱 Trading Pairs:');
    console.log('-'.repeat(40));

    const pairsJson = await client.listPairs();
    const pairs = JSON.parse(pairsJson);

    pairs.slice(0, 5).forEach((pair: any) => {
        const baseAsset = pair.base_asset || '???';
        const quoteAsset = pair.quote_asset || '???';
        console.log(`  • ${baseAsset}/${quoteAsset}`);
    });

    if (pairs.length > 5) {
        console.log(`  ... and ${pairs.length - 5} more pairs`);
    }

    // Get a quote (if pairs available) - async
    if (pairs.length > 0) {
        const firstPair = pairs[0];
        const ticker = `${firstPair.base_asset}/${firstPair.quote_asset}`;

        console.log(`\n📊 Quote for ${ticker}:`);
        console.log('-'.repeat(40));

        try {
            const quoteJson = await client.getQuoteByPair(ticker, 100000, null);
            const quote = JSON.parse(quoteJson);

            console.log(`  From Amount: ${quote.from_amount}`);
            console.log(`  To Amount: ${quote.to_amount}`);
            console.log(`  Price: ${quote.price || 'N/A'}`);
        } catch (e) {
            console.log(`  Could not get quote: ${e}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Done!');
}

main().catch(console.error);
