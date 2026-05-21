#!/usr/bin/env tsx

/**
 * Example script to demonstrate quote logging with the new simplified API
 * Run this against a live maker to see detailed quote information
 */

import { KaleidoClient } from 'kaleido-sdk';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
const API_KEY = process.env.KALEIDO_API_KEY;
const WS_URL = process.env.KALEIDO_WS_URL || 'ws://localhost:8000/api/v1/market/ws';

async function main() {
    console.log('🚀 Starting Quote Logging Demo\n');

    const client = await KaleidoClient.create({ baseUrl: API_URL, apiKey: API_KEY });

    try {
        // First, discover available routes
        console.log('🔍 Discovering available routes for BTC/USDT...\n');
        const routes = await client.maker.getAvailableRoutes('BTC', 'USDT');

        if (routes.length === 0) {
            console.log('❌ No routes found for BTC/USDT');
            return;
        }

        console.log(`✅ Found ${routes.length} available routes:`);
        routes.forEach((route, index) => {
            console.log(`   ${index + 1}. ${route.from_layer} → ${route.to_layer}`);
        });
        console.log('');

        // Enable WebSocket
        console.log(`📡 Connecting to WebSocket: ${WS_URL}\n`);
        client.maker.enableWebSocket(WS_URL);

        // Stream quotes using the new simplified API
        console.log('📊 Streaming quotes for BTC → USDT (using first available route)\n');

        const unsubscribe = await client.maker.streamQuotesByTicker(
            'BTC',
            'USDT',
            10000000, // 0.1 BTC
            (quote) => {
                console.log('\n' + '='.repeat(60));
                console.log('📊 QUOTE RECEIVED');
                console.log('='.repeat(60));
                console.log(`From Asset:    ${quote.from_asset.ticker}`);
                console.log(
                    `From Amount:   ${quote.from_asset.amount} (${(quote.from_asset.amount / 100000000).toFixed(8)} BTC)`,
                );
                console.log(`To Asset:      ${quote.to_asset.ticker}`);
                console.log(`To Amount:     ${quote.to_asset.amount}`);
                console.log(`Price:         ${quote.price}`);
                console.log(`Fee Asset:     ${quote.fee.fee_asset}`);
                console.log(`Fee Amount:    ${quote.fee.final_fee}`);
                console.log(`Fee Rate:      ${quote.fee.fee_rate}%`);
                console.log(`RFQ ID:        ${quote.rfq_id}`);
                console.log(`Timestamp:     ${new Date(quote.timestamp * 1000).toISOString()}`);
                console.log(`Expires At:    ${new Date(quote.expires_at * 1000).toISOString()}`);
                console.log(`Valid For:     ${quote.expires_at - quote.timestamp}s`);
                console.log('='.repeat(60) + '\n');
            },
        );

        // Wait for 10 seconds to receive quotes
        console.log('⏳ Listening for quotes (10 seconds)...\n');
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // Unsubscribe
        console.log('\n✅ Unsubscribing from quotes\n');
        unsubscribe();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main().catch(console.error);
