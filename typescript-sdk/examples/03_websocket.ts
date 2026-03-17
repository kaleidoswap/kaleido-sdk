/**
 * Example 03: WebSocket Streaming
 *
 * Stream real-time quotes using WebSocket connection.
 */

import { KaleidoClient } from '../src/index.js';
import { randomUUID } from 'crypto';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🎨 Kaleidoswap SDK - WebSocket Streaming Example\n');

    const client = KaleidoClient.create({ baseUrl: API_URL });

    const clientId = randomUUID();
    const wsUrl = API_URL.replace('http', 'ws') + `/api/v1/market/ws/${clientId}`;

    console.log(`🔌 Connecting to WebSocket: ${wsUrl}\n`);

    const ws = client.maker.enableWebSocket(wsUrl);

    ws.on('connected', () => {
        console.log('✅ WebSocket connected!');
    });

    ws.on('quoteResponse', (quote) => {
        console.log('\n📊 Quote update:');
        console.log(`  From: ${quote.from_amount}`);
        console.log(`  To: ${quote.to_amount}`);
        console.log(`  Price: ${quote.price}`);
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
    });

    ws.on('disconnected', () => {
        console.log('🔌 WebSocket disconnected');
    });

    try {
        await ws.connect();

        console.log('\n⏳ Streaming quotes for 30 seconds...\n');

        ws.requestQuote({
            from_asset: 'btc',
            to_asset: 'usdt',
            from_amount: 100000, // 0.001 BTC
            from_layer: 'BTC_LN',
            to_layer: 'RGB_LN',
        });

        await new Promise((resolve) => setTimeout(resolve, 30000));

        ws.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('Failed to connect:', error);
    }
}

main().catch(console.error);
