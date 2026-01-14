/**
 * Error Handling Best Practices
 * 
 * This example demonstrates:
 * 1. Proper exception handling
 * 2. Input validation
 * 3. Retry strategies
 * 4. Graceful degradation
 */

import { KaleidoClient, KaleidoError } from '../src';

const API_URL = process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com';

async function exampleBasicErrorHandling() {
    console.log('\n🔐 Example 1: Basic Error Handling');

    const client = new KaleidoClient({ baseUrl: API_URL });

    try {
        const assets = await client.listAssets();
        const assetsList = typeof assets === 'string' ? JSON.parse(assets) : assets;
        console.log(`  ✅ Found ${assetsList.length} assets`);
    } catch (e) {
        if (e instanceof KaleidoError) {
            console.log(`  ⚠️  Kaleido API error: ${e.message}`);
        } else {
            console.log(`  ❌ Unexpected error: ${e}`);
        }
    }
}

async function exampleInputValidation() {
    console.log('\n✅ Example 2: Input Validation');

    const client = new KaleidoClient({ baseUrl: API_URL });

    // Validate negative amount
    console.log('  Testing negative amount...');
    const validation1 = await client.validateAmount(-100, 'BTC');
    if (!validation1.valid) {
        console.log(`    ❌ Invalid: ${validation1.errors.join(', ')}`);
    } else {
        console.log('    ✅ Valid (unexpected)');
    }

    // Validate zero amount
    console.log('  Testing zero amount...');
    const validation2 = await client.validateAmount(0, 'BTC');
    if (!validation2.valid) {
        console.log(`    ❌ Invalid: ${validation2.errors.join(', ')}`);
    } else {
        console.log('    ✅ Valid (unexpected)');
    }

    // Validate valid amount
    console.log('  Testing valid amount (0.01 BTC)...');
    try {
        const validation3 = await client.validateAmount(0.01, 'BTC');
        if (validation3.valid) {
            console.log(`    ✅ Valid: ${validation3.rawAmount} atomic units`);
        } else {
            console.log(`    ❌ Invalid: ${validation3.errors.join(', ')}`);
        }
    } catch (e) {
        console.log(`    Could not validate: ${e}`);
    }
}

async function exampleRetryStrategy() {
    console.log('\n🔄 Example 3: Retry Strategy');

    const client = new KaleidoClient({ baseUrl: API_URL });
    const maxRetries = 3;
    let retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`  Attempt ${attempt}/${maxRetries}...`);
            const assets = await client.listAssets();
            const assetsList = typeof assets === 'string' ? JSON.parse(assets) : assets;
            console.log(`  ✅ Success! Found ${assetsList.length} assets`);
            break;
        } catch (e) {
            if (attempt < maxRetries) {
                console.log(`  ⚠️  Error, retrying in ${retryDelay}ms: ${e}`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2; // Exponential backoff
            } else {
                console.log(`  ❌ Failed after ${maxRetries} attempts: ${e}`);
            }
        }
    }
}

async function exampleInvalidPairTicker() {
    console.log('\n📊 Example 4: Invalid Pair Ticker Handling');

    const client = new KaleidoClient({
        baseUrl: API_URL,
        nodeUrl: 'http://localhost:3001',
    });

    // Test canTrade with non-existent pair
    const canTrade = await client.canTrade('FAKE', 'COIN');
    console.log(`  Can trade FAKE/COIN: ${canTrade} (expected: false)`);
}

async function exampleGracefulDegradation() {
    console.log('\n🛡️  Example 5: Graceful Degradation');

    // Client without node
    const clientNoNode = new KaleidoClient({ baseUrl: API_URL });

    if (clientNoNode.hasNode()) {
        console.log('  ✅ Node is configured');
    } else {
        console.log('  ℹ️  No node configured - operating in API-only mode');
        console.log('    Some features like whitelistTrade won\'t be available');
    }

    // Client with node
    const clientWithNode = new KaleidoClient({
        baseUrl: API_URL,
        nodeUrl: 'http://localhost:3001',
    });

    if (clientWithNode.hasNode()) {
        console.log('  ✅ Node is configured (with nodeUrl)');
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('Error Handling Best Practices Examples');
    console.log('='.repeat(60));

    try {
        await exampleBasicErrorHandling();
        await exampleInputValidation();
        await exampleRetryStrategy();
        await exampleInvalidPairTicker();
        await exampleGracefulDegradation();

        console.log('\n' + '='.repeat(60));
        console.log('✅ All error handling examples completed!');
        console.log('='.repeat(60));
    } catch (e) {
        console.error('❌ Unexpected error in main:', e);
    }
}

main();
