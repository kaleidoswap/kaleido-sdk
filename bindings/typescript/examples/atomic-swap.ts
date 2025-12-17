/**
 * Atomic Swap Example
 * 
 * This example demonstrates the complete atomic swap flow:
 * 1. Get available assets and pairs
 * 2. Get a quote for a swap
 * 3. Initialize the swap
 * 4. Show order history
 * 5. Display LSP info
 */

import { createClient } from '../src';

async function main() {
    const apiUrl = process.env.KALEIDO_API_URL || 'https://api.regtest.kaleidoswap.com';
    const nodeUrl = process.env.KALEIDO_NODE_URL || 'http://localhost:3001';

    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - Atomic Swap Example');
    console.log('='.repeat(60));

    // Initialize client with node URL for full swap capabilities
    const client = createClient({
        baseUrl: apiUrl,
        nodeUrl: nodeUrl,
        timeout: 30.0,
        maxRetries: 3,
        cacheTtl: 300,
    });

    console.log(`\n🔗 Connected to: ${apiUrl}`);
    console.log(`   Node URL: ${nodeUrl}`);
    console.log(`   Has Node: ${client.hasNode()}`);

    // Step 1: Get trading pairs (async)
    console.log('\n📋 Step 1: Fetching trading pairs...');
    const pairsJson = await client.listPairs();
    const pairs = JSON.parse(pairsJson);

    if (pairs.length === 0) {
        console.log('   ❌ No trading pairs available');
        return;
    }

    const pair = pairs[0];
    const ticker = `${pair.base_asset}/${pair.quote_asset}`;
    console.log(`   ✓ Found ${pairs.length} pairs, using: ${ticker}`);

    // Step 2: Get a quote (async)
    console.log(`\n📊 Step 2: Getting quote for ${ticker}...`);
    try {
        const quoteJson = await client.getQuoteByPair(ticker, 100000, null);
        const quote = JSON.parse(quoteJson);

        console.log('   ✓ Quote received:');
        console.log(`     From Amount: ${quote.from_amount || 'N/A'}`);
        console.log(`     To Amount: ${quote.to_amount || 'N/A'}`);
        console.log(`     Price: ${quote.price || 'N/A'}`);
        console.log(`     Expires: ${quote.expires_at || 'N/A'}`);
    } catch (e) {
        console.log(`   ❌ Could not get quote: ${e}`);
        return;
    }

    // Step 3: Get node info (if node configured) (async)
    if (client.hasNode()) {
        console.log('\n🔑 Step 3: Getting node info...');
        try {
            const nodeInfoJson = await client.getNodeInfo();
            const nodeInfo = JSON.parse(nodeInfoJson);
            const pubkey = nodeInfo.pubkey || 'N/A';
            console.log(`   ✓ Node pubkey: ${pubkey.substring(0, 20)}...`);
        } catch (e) {
            console.log(`   ⚠️ Could not get node info: ${e}`);
        }
    } else {
        console.log('\n⚠️ Node not configured - skipping swap execution');
        console.log('   Set KALEIDO_NODE_URL to execute swaps');
    }

    // Step 4: Show order history (async)
    console.log('\n📜 Step 4: Fetching order history...');
    try {
        const historyJson = await client.getOrderHistory(null, 5, 0);
        const history = JSON.parse(historyJson);
        const orders = Array.isArray(history) ? history : (history.orders || []);
        console.log(`   ✓ Found ${orders.length} orders`);
    } catch (e) {
        console.log(`   ⚠️ Could not get order history: ${e}`);
    }

    // Step 5: Get LSP info (async)
    console.log('\n🏦 Step 5: Fetching LSP info...');
    try {
        const lspInfoJson = await client.getLspInfo();
        JSON.parse(lspInfoJson);
        console.log('   ✓ LSP available');
    } catch (e) {
        console.log(`   ⚠️ Could not get LSP info: ${e}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Atomic swap flow demonstration complete!');
    console.log('='.repeat(60));
}

main().catch(console.error);
