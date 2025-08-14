import { KaleidoClient } from '../src/client';

async function main() {
    console.log('--- Starting Market Data Example ---');

    const client = new KaleidoClient({
        baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1',
        nodeUrl: process.env.TEST_NODE_URL || 'http://localhost:3001',
        apiKey: process.env.TEST_API_KEY || '',
    });

    try {
        // 1. List all available assets
        console.log('1. Listing all assets...');
        const assetsResponse = await client.listAssets();
        console.log(`Found ${assetsResponse.assets.length} assets on ${assetsResponse.network}.`);
        // Log the first 5 for brevity
        console.log(assetsResponse.assets.slice(0, 5));

        // 2. List all trading pairs
        console.log('2. Listing all trading pairs...');
        const pairsResponse = await client.listPairs();
        console.log(`Found ${pairsResponse.pairs.length} trading pairs.`);
        // Log the first 5 for brevity
        console.log(pairsResponse.pairs.slice(0, 5));

        // 3. Get a specific pair and a quote
        if (pairsResponse.pairs.length > 0) {
            const firstPair = pairsResponse.pairs[0];
            console.log(`3. Getting a quote for pair ${firstPair.base_asset}/${firstPair.quote_asset}`);

            const amountToSwap = 10000000; // An amount of the base asset
            const quote = await client.getQuote(firstPair.base_asset_id, firstPair.quote_asset_id, amountToSwap);
            console.log('Received quote:', quote);
        } else {
            console.log('No trading pairs found, skipping quote example.');
        }

    } catch (error) {
        console.error('An error occurred while fetching market data:', error);
    }

    console.log('--- Market Data Example Finished ---');
}

main().catch(console.error);
