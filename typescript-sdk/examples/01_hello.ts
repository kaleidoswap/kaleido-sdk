/**
 * Example 01: Hello Kaleidoswap
 *
 * Basic client setup and fetching market data.
 */

import { KaleidoClient, getSdkName, getVersion } from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🎨 Kaleidoswap SDK - Hello World\n');
    console.log(`${getSdkName()} v${getVersion()}`);
    console.log('-'.repeat(40));

    // Create client
    const client = KaleidoClient.create({
        baseUrl: API_URL,
    });

    // Fetch assets
    console.log('📦 Fetching available assets...');
    const response = await client.maker.listAssets();
    console.log(`Found ${response.assets.length} assets:\n`);

    for (const asset of response.assets) {
        console.log(`  • ${asset.ticker} - ${asset.name}`);
        console.log(`    Precision: ${asset.precision}`);
    }

    // Fetch trading pairs
    console.log('\n📋 Fetching trading pairs...');
    const pairsResponse = await client.maker.listPairs();
    console.log(`Found ${pairsResponse.pairs.length} trading pairs:\n`);

    for (const pair of pairsResponse.pairs.slice(0, 5)) {
        console.log(`  • ${pair.base.ticker}/${pair.quote.ticker}`);
    }

    if (pairsResponse.pairs.length > 5) {
        console.log(`  ... and ${pairsResponse.pairs.length - 5} more`);
    }

    console.log('\n✅ Done!');
}

main().catch(console.error);
