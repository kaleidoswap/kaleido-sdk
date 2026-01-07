/**
 * Market Data Example
 *
 * This example demonstrates how to:
 * 1. Connect to the Kaleidoswap API using the unified WASM SDK
 * 2. List available assets
 * 3. List trading pairs
 * 4. Get a quote for a swap
 */

import { KaleidoClient, toDisplayUnits } from '../src/index.js';

async function main() {
    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - Market Data Example');
    console.log('='.repeat(60));

    // Initialize client using async factory
    const client = await KaleidoClient.create({
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30,
        maxRetries: 3,
        cacheTtl: 300,
    });

    console.log('\n✓ Client initialized successfully');

    // List available assets
    console.log('\n📋 Available Assets:');
    console.log('-'.repeat(40));

    try {
        const assets = await client.maker.listAssets();
        console.log(`  Found ${assets.length} assets\n`);

        assets.slice(0, 5).forEach((asset) => {
            console.log(`  • ${asset.name} (${asset.ticker})`);
            console.log(`    Precision: ${asset.precision}`);
        });

        if (assets.length > 5) {
            console.log(`  ... and ${assets.length - 5} more assets`);
        }
    } catch (e) {
        console.log(`  ❌ Error listing assets: ${e}`);
    }

    // List trading pairs
    console.log('\n💱 Trading Pairs:');
    console.log('-'.repeat(40));

    try {
        const pairs = await client.maker.listPairs();
        console.log(`  Found ${pairs.length} trading pairs\n`);

        pairs.slice(0, 5).forEach((pair) => {
            console.log(`  • ${pair.base_asset}/${pair.quote_asset}`);
            // Pair object only contains tickers and IDs, not names
        });

        if (pairs.length > 5) {
            console.log(`  ... and ${pairs.length - 5} more pairs`);
        }

        // Get a quote if pairs are available
        if (pairs.length > 0) {
            const firstPair = pairs[0];
            const ticker = `${firstPair.base_asset}/${firstPair.quote_asset}`;

            console.log(`\n📊 Quote for ${ticker}:`);
            console.log('-'.repeat(40));

            try {
                // Get quote for 100,000 satoshis (1 mBTC)
                const quote = await client.maker.getQuote(
                    ticker,
                    100000,  // fromAmount in smallest units
                    null,            // toAmount (null = calculate based on fromAmount)
                    'BTC_LN',        // fromLayer
                    'RGB_LN'         // toLayer
                );

                console.log(`  RFQ ID: ${quote.rfq_id}`);
                console.log(`  From: ${quote.from_asset} (${quote.from_amount})`);
                console.log(`  To: ${quote.to_asset} (${quote.to_amount})`);
                console.log(`  Price: ${quote.price}`);
                console.log(`  Fee: ${quote.fee.final_fee} (${quote.fee.fee_rate * 100}%)`);
                console.log(`  Expires: ${new Date(Number(quote.expires_at) * 1000).toISOString()}`);
            } catch (e) {
                console.log(`  Could not get quote: ${e}`);
            }
        }
    } catch (e) {
        console.log(`  ❌ Error listing pairs: ${e}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Done!');
}

main().catch(console.error);
