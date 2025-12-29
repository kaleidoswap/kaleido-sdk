/**
 * Advanced Market Data Operations
 * 
 * This example demonstrates advanced SDK features:
 * 1. Using helper methods for easier asset/pair lookup
 * 2. Converting between display and atomic units
 * 3. Amount validation
 * 4. Caching strategies
 * 5. Getting quotes by ticker symbols
 */

import { KaleidoClient, Asset } from '../src';

const API_URL = process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com';

async function main() {
    console.log('🚀 Advanced Market Data Operations\n');

    // Initialize client
    const client = new KaleidoClient({ baseUrl: API_URL });

    // Example 1: Find assets by ticker
    console.log('🔍 Example 1: Finding assets by ticker...');
    try {
        const btcAsset = await client.getAssetByTicker('BTC');
        if (typeof btcAsset !== 'string') {
            console.log('  Found BTC:');
            console.log(`    Ticker: ${btcAsset.ticker}`);
            console.log(`    Precision: ${btcAsset.precision}`);
            console.log(`    Name: ${btcAsset.name}`);
        }
    } catch (e) {
        console.log(`  Could not find BTC: ${e}`);
    }

    // Example 2: Find trading pairs
    console.log('\n📊 Example 2: Finding trading pairs...');
    try {
        const pairs = await client.listPairs();
        const pairsList = typeof pairs === 'string' ? JSON.parse(pairs) : pairs;

        if (pairsList.length > 0) {
            const firstPair = pairsList[0];
            const pairTicker = `${firstPair.baseAsset}/${firstPair.quoteAsset}`;
            console.log(`  Found pair: ${pairTicker}`);
            console.log(`    Base: ${firstPair.baseAsset}`);
            console.log(`    Quote: ${firstPair.quoteAsset}`);
        }
    } catch (e) {
        console.log(`  Could not get pairs: ${e}`);
    }

    // Example 3: Amount conversion
    console.log('\n💱 Example 3: Converting between display and atomic units...');
    try {
        // Create a mock BTC asset for demo
        const mockBtc: Asset = {
            assetId: 'bitcoin',
            ticker: 'BTC',
            name: 'Bitcoin',
            precision: 8,
            issuedSupply: 0,
            timestamp: 0,
            addedAt: 0,
            balance: { settled: 0, future: 0, spendable: 0, offchainOutbound: 0, offchainInbound: 0 },
        };

        // Convert 1.5 BTC to satoshis using object
        const raw = await client.toRaw(1.5, mockBtc);
        console.log(`  1.5 BTC = ${raw} satoshis`);

        // Convert back
        const display = await client.toDisplay(raw, mockBtc);
        console.log(`  ${raw} satoshis = ${display} BTC`);

        // Using convertAmount helper
        const raw2 = await client.convertAmount(2.5, mockBtc, 'raw');
        console.log(`  2.5 BTC = ${raw2} satoshis (via convertAmount)`);
    } catch (e) {
        console.log(`  Conversion error: ${e}`);
    }

    // Example 4: Amount validation
    console.log('\n✅ Example 4: Validating amounts...');
    try {
        const validation = await client.validateAmount(0.01, 'BTC');
        console.log(`  Amount: 0.01 BTC`);
        console.log(`  Valid: ${validation.valid}`);
        console.log(`  Raw Amount: ${validation.rawAmount}`);
        console.log(`  Errors: ${validation.errors.length > 0 ? validation.errors.join(', ') : 'None'}`);
    } catch (e) {
        console.log(`  Could not validate: ${e}`);
    }

    // Example 5: Check if pair is tradeable
    console.log('\n🔄 Example 5: Checking trade availability...');
    const canTradeBtcUsdt = await client.canTrade('BTC', 'USDT');
    console.log(`  Can trade BTC/USDT: ${canTradeBtcUsdt}`);

    const canTradeFake = await client.canTrade('FAKE', 'COIN');
    console.log(`  Can trade FAKE/COIN: ${canTradeFake}`);

    // Example 6: Cache management
    console.log('\n🔄 Example 6: Cache management...');
    console.log('  Getting assets...');
    const assets1 = await client.listAssets();
    const assetsList = typeof assets1 === 'string' ? JSON.parse(assets1) : assets1;
    console.log(`    Found ${assetsList.length} assets`);

    console.log('  Refreshing cache...');
    client.refreshCache();
    console.log('    Cache cleared');

    const assets2 = await client.listAssets();
    const assetsList2 = typeof assets2 === 'string' ? JSON.parse(assets2) : assets2;
    console.log(`    Found ${assetsList2.length} assets after refresh`);

    console.log('\n✅ All advanced market data operations completed!');
}

main().catch(console.error);
