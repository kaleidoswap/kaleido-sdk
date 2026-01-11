/**
 * Example 01: Hello Kaleidoswap
 *
 * Basic client setup and fetching market data.
 */

import { KaleidoClient } from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🎨 Kaleidoswap SDK - Hello World\n');

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

    console.log('\n✅ Done!');
}

main().catch(console.error);
