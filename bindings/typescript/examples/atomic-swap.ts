/**
 * Complete Atomic Swap Flow
 * 
 * This example demonstrates how to:
 * 1. Get a quote for a swap
 * 2. Initialize a maker swap
 * 3. Whitelist the trade on the taker node
 * 4. Execute the swap
 * 5. Wait for swap completion
 */

import { createClient, Asset, TradingPair, Quote } from '../src';

async function main() {
    const apiUrl = process.env.KALEIDO_API_URL || 'http://localhost:8000';
    const nodeUrl = process.env.KALEIDO_NODE_URL || 'http://localhost:3001';

    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - Complete Atomic Swap Example');
    console.log('='.repeat(60));

    // Initialize client with node URL for full swap capabilities
    const client = createClient({
        baseUrl: apiUrl,
        nodeUrl: nodeUrl,
        timeout: 30.0,
    });

    console.log(`\n🔗 Connected to: ${apiUrl}`);
    console.log(`   Node URL: ${nodeUrl}`);
    console.log(`   Has Node: ${client.hasNode()}`);

    if (!client.hasNode()) {
        console.log('\n⚠️  Node not configured - cannot execute swaps');
        console.log('   Set KALEIDO_NODE_URL to execute swaps');
        return;
    }

    // Step 1: Get available assets
    console.log('\n📋 Step 1: Fetching available assets...');
    const assetsResult = await client.listAssets();
    const assets = (typeof assetsResult === 'string' ? JSON.parse(assetsResult) : assetsResult) as Asset[];

    if (assets.length < 2) {
        console.log('   ❌ Need at least 2 assets for a swap');
        return;
    }

    const fromAsset = assets[0];
    const toAsset = assets[1];
    const fromAmount = 1_000_000; // 1M sats

    console.log(`   From: ${fromAsset.ticker}`);
    console.log(`   To: ${toAsset.ticker}`);
    console.log(`   Amount: ${fromAmount} sats`);

    // Step 2: Get a quote
    console.log('\n💱 Step 2: Getting quote...');
    let quote: Quote;
    try {
        const pairTicker = `${fromAsset.ticker}/${toAsset.ticker}`;
        const quoteResult = await client.getQuoteByPair(pairTicker, fromAmount, null);
        quote = (typeof quoteResult === 'string' ? JSON.parse(quoteResult) : quoteResult) as Quote;

        console.log('   ✅ Quote received:');
        console.log(`     RFQ ID: ${quote.rfqId}`);
        console.log(`     From: ${quote.fromAmount}`);
        console.log(`     To: ${quote.toAmount}`);
        console.log(`     Price: ${quote.price}`);
    } catch (e) {
        console.log(`   ❌ Could not get quote: ${e}`);
        return;
    }

    // Step 3: Get node info for taker pubkey
    console.log('\n🔑 Step 3: Getting taker node info...');
    let takerPubkey: string;
    try {
        const nodeInfoResult = await client.getRgbNodeInfo();
        const nodeInfo = typeof nodeInfoResult === 'string' ? JSON.parse(nodeInfoResult) : nodeInfoResult;
        takerPubkey = nodeInfo.pubkey || '';
        console.log(`   Taker pubkey: ${takerPubkey.substring(0, 20)}...`);
    } catch (e) {
        console.log(`   ❌ Could not get node info: ${e}`);
        return;
    }

    // Step 4: Initialize the swap
    console.log('\n🔄 Step 4: Initializing swap...');
    let swapstring: string;
    let paymentHash: string;
    try {
        const initResult = await client.initSwap({
            rfq_id: quote.rfqId,
            from_asset: quote.fromAsset,
            from_amount: quote.fromAmount,
            to_asset: quote.toAsset,
            to_amount: quote.toAmount,
        });
        const initResponse = JSON.parse(initResult);
        swapstring = initResponse.swapstring;
        paymentHash = initResponse.payment_hash;

        console.log('   ✅ Swap initialized:');
        console.log(`     Swapstring: ${swapstring.substring(0, 50)}...`);
        console.log(`     Payment Hash: ${paymentHash}`);
    } catch (e) {
        console.log(`   ❌ Could not initialize swap: ${e}`);
        return;
    }

    // Step 5: Whitelist trade on taker node
    console.log('\n🔐 Step 5: Whitelisting trade on taker node...');
    try {
        await client.whitelistTrade(swapstring);
        console.log('   ✅ Trade whitelisted');
    } catch (e) {
        console.log(`   ❌ Could not whitelist trade: ${e}`);
        return;
    }

    // Step 6: Execute the swap
    console.log('\n⚡ Step 6: Executing swap...');
    try {
        await client.executeSwap({
            swapstring: swapstring,
            payment_hash: paymentHash,
            taker_pubkey: takerPubkey,
        });
        console.log('   ✅ Swap executed');
    } catch (e) {
        console.log(`   ❌ Could not execute swap: ${e}`);
        return;
    }

    // Step 7: Wait for swap completion
    console.log('\n⏳ Step 7: Waiting for swap completion...');
    try {
        const finalStatus = await client.waitForSwapCompletion(paymentHash, 180, 2);
        const status = JSON.parse(finalStatus);
        const swap = status.swap || status;

        console.log('   ✅ Swap completed:');
        console.log(`     Status: ${swap.status}`);
        console.log(`     From: ${swap.qty_from || 'N/A'}`);
        console.log(`     To: ${swap.qty_to || 'N/A'}`);

        console.log('\n🎉 Atomic swap completed successfully!');
    } catch (e) {
        if (e instanceof Error && e.message.includes('timeout')) {
            console.log('   ⏱️  Swap timed out');
        } else {
            console.log(`   ❌ Error waiting for completion: ${e}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Atomic swap flow complete!');
    console.log('='.repeat(60));
}

main().catch(console.error);
