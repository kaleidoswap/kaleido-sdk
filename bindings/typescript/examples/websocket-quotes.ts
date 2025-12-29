/**
 * WebSocket Quotes Example
 * 
 * This example demonstrates how to use WebSocket for real-time quote requests.
 */

import { createClient } from '../src';

async function main() {
    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - WebSocket Quotes Example');
    console.log('='.repeat(60));

    // Initialize client
    const client = createClient({
        baseUrl: 'https://api.regtest.kaleidoswap.com',
        timeout: 30.0,
    });

    console.log('\n📡 Connecting to WebSocket...');
    await client.connectWebsocket();
    console.log('✅ WebSocket connected!');

    // Request quotes
    const pairs: [string, number][] = [
        ['BTC/USDT', 100000000],  // 1 BTC
        ['BTC/USDT', 50000000],   // 0.5 BTC
        ['BTC/USDT', 200000000],  // 2 BTC
    ];

    console.log('\n📊 Requesting quotes via WebSocket...');
    console.log('-'.repeat(40));

    for (const [pair, amount] of pairs) {
        console.log(`\nRequesting quote for ${pair} (${amount} sats)...`);

        try {
            const quoteJson = await client.getQuoteWebsocket(
                pair,
                amount,
                null,
                'BTC_LN'
            );
            const quote = JSON.parse(quoteJson);

            const fromBtc = quote.from_asset.amount / 100_000_000;
            console.log('  ✅ Quote received:');
            console.log(`     From: ${fromBtc.toFixed(8)} BTC`);
            console.log(`     To: ${quote.to_asset.amount} USDT`);
            if (quote.price) {
                console.log(`     Price: $${quote.price.toFixed(2)}/BTC`);
            }
        } catch (e) {
            console.log(`  ❌ Error: ${e}`);
        }
    }

    // Disconnect
    console.log('\n🔌 Disconnecting WebSocket...');
    await client.disconnectWebsocket();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Done!');
}

main().catch(console.error);
