#!/usr/bin/env tsx

/**
 * Example script to demonstrate streaming quotes for all available routes
 * Run this against a live maker to see quotes from multiple routes simultaneously
 */

import { KaleidoClient } from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
const WS_URL = process.env.KALEIDO_WS_URL || 'ws://localhost:8000/api/v1/market/ws/multi-route-demo';

async function main() {
    console.log('🚀 Starting Multi-Route Quote Streaming Demo\n');

    const client = KaleidoClient.create({ baseUrl: API_URL });

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

        // Stream quotes for ALL routes simultaneously
        console.log('📊 Streaming quotes for ALL routes simultaneously...\n');

        const quoteCounters = new Map<string, number>();

        const unsubscribers = await client.maker.streamQuotesForAllRoutes(
            'BTC',
            'USDT',
            10000000, // 0.1 BTC
            (route, quote) => {
                // Track quote count per route
                const count = (quoteCounters.get(route) || 0) + 1;
                quoteCounters.set(route, count);

                console.log(`\n📊 Quote #${count} for route: ${route}`);
                console.log(`   From: ${(quote.from_amount / 100000000).toFixed(8)} ${quote.from_asset.toUpperCase()}`);
                console.log(`   To:   ${quote.to_amount} ${quote.to_asset.toUpperCase()}`);
                console.log(`   Price: ${quote.price}`);
                console.log(`   Fee:   ${quote.fee.final_fee} ${quote.fee.fee_asset}`);
                console.log(`   Valid for: ${quote.expires_at - quote.timestamp}s`);
            }
        );

        console.log(`✅ Subscribed to ${unsubscribers.size} routes\n`);

        // Wait for 15 seconds to receive quotes from all routes
        console.log('⏳ Listening for quotes from all routes (15 seconds)...\n');
        await new Promise(resolve => setTimeout(resolve, 15000));

        // Show summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 QUOTE SUMMARY');
        console.log('='.repeat(60));
        quoteCounters.forEach((count, route) => {
            console.log(`${route}: ${count} quotes received`);
        });
        console.log('='.repeat(60) + '\n');

        // Unsubscribe from all routes
        console.log('✅ Unsubscribing from all routes...\n');
        unsubscribers.forEach((unsubscribe) => unsubscribe());

        console.log('✨ Demo complete!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main().catch(console.error);
