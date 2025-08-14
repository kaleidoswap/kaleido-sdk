import { KaleidoClient } from '../src/client';
import { WebSocketClient } from '../src/websocket/client';

async function main() {
    console.log('--- Starting WebSocket Feed Example ---');

    // The WebSocket client can be instantiated separately, but it's also
    // part of the KaleidoClient for convenience (e.g., for getQuoteWS).
    // Here we show how to use it directly.

    const wsUrl = (process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1').replace(/^http/, 'ws');

    const wsClient = new WebSocketClient({
        baseUrl: wsUrl,
        apiKey: process.env.TEST_API_KEY || '',
    });

    try {
        console.log('Connecting to WebSocket...');
        await wsClient.connect();
        console.log('WebSocket connected.');

        // We need a pair to subscribe to. Let's get one via the HTTP client.
        const httpClient = new KaleidoClient({
            baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1',
            nodeUrl: process.env.TEST_NODE_URL || 'http://localhost:3001',
        });
        const pairsResponse = await httpClient.listPairs();
        if (pairsResponse.pairs.length === 0) {
            console.log('No trading pairs found. Cannot subscribe.');
            return;
        }
        const pairToSubscribe = pairsResponse.pairs[0];
        const pairId = `${pairToSubscribe.base_asset}/${pairToSubscribe.quote_asset}`;

        // Set up a handler for quote updates
        wsClient.on('quote_update', (data) => {
            console.log('Received new quote update:', data);
        });
        
        wsClient.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Subscribe to the pair
        console.log(`Subscribing to updates for pair: ${pairId}`);
        await wsClient.subscribe(pairId);
        console.log('Successfully subscribed. Waiting for updates for 30 seconds...');

        // Keep the script running for a bit to receive messages
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Unsubscribe from the pair
        console.log(`Unsubscribing from pair: ${pairId}`);
        await wsClient.unsubscribe(pairId);
        console.log('Successfully unsubscribed.');

    } catch (error) {
        console.error('An error occurred with the WebSocket client:', error);
    } finally {
        // Disconnect the client
        if (wsClient.isConnected()) {
            console.log('Disconnecting WebSocket...');
            await wsClient.disconnect();
            console.log('WebSocket disconnected.');
        }
    }

    console.log('--- WebSocket Feed Example Finished ---');
}

main().catch(console.error);
