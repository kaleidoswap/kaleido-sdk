/**
 * Simple example demonstrating the Kaleidoswap SDK with NAPI-RS bindings.
 * 
 * This shows how easy it is to get quotes using the new convenience API.
 */

import { KaleidoClient } from '@kaleidoswap/sdk-poc';

async function main() {
    // Create client (use default staging API)
    console.log('Creating Kaleidoswap client...');
    const client = new KaleidoClient(null, null);

    // List available assets
    console.log('\n1. Listing assets...');
    const assets = await client.listAssets();
    console.log(`   Found ${assets.length} assets`);
    assets.slice(0, 5).forEach(asset => {
        console.log(`   - ${asset.ticker}: ${asset.name}`);
    });

    // List trading pairs
    console.log('\n2. Listing trading pairs...');
    const pairs = await client.listPairs();
    console.log(`   Found ${pairs.length} pairs`);
    pairs.slice(0, 5).forEach(pair => {
        console.log(`   - ${pair.ticker}`);
    });

    // Get quote using convenience method (NO BOILERPLATE!)
    console.log('\n3. Getting quote for BTC/USDT...');
    try {
        const quote = await client.getQuoteByPair(
            'BTC/USDT',
            10000.0,  // $10,000 worth of BTC
            null
        );
        console.log(`   Quote ID: ${quote.rfqId}`);
        console.log(`   From amount: ${quote.fromAmount}`);
        console.log(`   To amount: ${quote.toAmount}`);
        console.log(`   Rate: ${quote.rate}`);
        console.log(`   Expires at: ${quote.expiresAt}`);
    } catch (e) {
        console.log(`   Error: ${e}`);
    }

    // Find specific asset
    console.log('\n4. Finding BTC asset...');
    try {
        const btc = await client.getAssetByTicker('BTC');
        console.log(`   ${btc.ticker}: ${btc.name}`);
        console.log(`   Precision: ${btc.precision}`);
    } catch (e) {
        console.log(`   Error: ${e}`);
    }

    console.log('\n✅ All examples completed!');
}

main().catch(console.error);
