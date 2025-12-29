/**
 * WebSocket Streaming Example
 * 
 * This example demonstrates:
 * 1. Connecting to WebSocket
 * 2. Subscribing to price updates
 * 3. Handling real-time events
 * 4. Event handlers and callbacks
 */

import { createClient, WsEvent } from '../src';

interface PriceData {
    pair?: string;
    price?: number;
    volume?: number;
}

interface QuoteData {
    rfq_id?: string;
    price?: number;
}

interface ErrorData {
    message?: string;
    code?: string;
}

class PriceTracker {
    updateCount = 0;
    latestPrices: Map<string, number> = new Map();

    handlePriceUpdate(data: PriceData): void {
        this.updateCount++;
        const pair = data.pair || 'Unknown';
        const price = data.price || 0;

        this.latestPrices.set(pair, price);

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 📊 Price Update #${this.updateCount}`);
        console.log(`  Pair: ${pair}`);
        console.log(`  Price: $${price.toFixed(2)}`);

        if (data.volume) {
            console.log(`  Volume: ${data.volume}`);
        }
        console.log();
    }

    handleQuoteResponse(data: QuoteData): void {
        const rfqId = data.rfq_id || 'Unknown';
        const price = data.price || 0;

        console.log('💱 Quote Response');
        console.log(`  RFQ ID: ${rfqId}`);
        console.log(`  Price: $${price.toFixed(2)}`);
        console.log();
    }

    handleError(data: ErrorData): void {
        const message = data.message || 'Unknown error';
        const code = data.code || '';

        console.log('❌ WebSocket Error');
        console.log(`  Message: ${message}`);
        if (code) {
            console.log(`  Code: ${code}`);
        }
        console.log();
    }

    handleDisconnected(data: { reason?: string }): void {
        const reason = data.reason || 'Unknown';
        console.log('\n⚠️  WebSocket Disconnected');
        console.log(`  Reason: ${reason}`);
    }

    printSummary(): void {
        console.log('\n' + '='.repeat(60));
        console.log('📈 Session Summary');
        console.log('='.repeat(60));
        console.log(`Total updates received: ${this.updateCount}`);
        console.log('\nLatest prices:');
        
        this.latestPrices.forEach((price, pair) => {
            console.log(`  ${pair}: $${price.toFixed(2)}`);
        });
        
        console.log('='.repeat(60));
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - WebSocket Streaming Example');
    console.log('='.repeat(60));

    // Create price tracker
    const tracker = new PriceTracker();

    // Initialize client
    const client = createClient({
        baseUrl: 'http://localhost:8000',
        timeout: 30.0,
    });

    try {
        // Connect to WebSocket
        console.log('\n📡 Connecting to WebSocket...');
        await client.connectWebsocket();
        console.log('✅ WebSocket connected!');

        // Register event handlers
        console.log('\n📝 Registering event handlers...');
        
        await client.onWebsocketEvent(
            WsEvent.PriceUpdate,
            (data: any) => tracker.handlePriceUpdate(data)
        );
        
        await client.onWebsocketEvent(
            WsEvent.QuoteResponse,
            (data: any) => tracker.handleQuoteResponse(data)
        );
        
        await client.onWebsocketEvent(
            WsEvent.Error,
            (data: any) => tracker.handleError(data)
        );
        
        await client.onWebsocketEvent(
            WsEvent.Disconnected,
            (data: any) => tracker.handleDisconnected(data)
        );
        
        console.log('✅ Event handlers registered!');

        // Subscribe to pairs
        console.log('\n📥 Subscribing to trading pairs...');
        await client.subscribeToPair('BTC/USDT');
        await client.subscribeToPair('ETH/USDT');
        console.log('✅ Subscribed to BTC/USDT and ETH/USDT');

        // Stream for 30 seconds
        console.log('\n👂 Listening for updates... (30 seconds)');
        console.log('   Press Ctrl+C to stop early\n');

        await new Promise(resolve => setTimeout(resolve, 30000));

        // Unsubscribe
        console.log('\n📤 Unsubscribing from pairs...');
        await client.unsubscribeFromPair('BTC/USDT');
        await client.unsubscribeFromPair('ETH/USDT');
        console.log('✅ Unsubscribed');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Disconnect
        console.log('\n🔌 Disconnecting WebSocket...');
        await client.disconnectWebsocket();
        console.log('✅ Disconnected');

        // Print summary
        tracker.printSummary();
    }
}

main().catch(console.error);

