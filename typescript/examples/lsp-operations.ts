import { KaleidoClient } from '../src/client';

async function main() {
    console.log('--- Starting LSP Operations Example ---');

    const client = new KaleidoClient({
        baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1',
        nodeUrl: process.env.TEST_NODE_URL || 'http://localhost:3001',
        apiKey: process.env.TEST_API_KEY || '',
    });

    try {
        // 1. Get LSP Info
        console.log('1. Getting LSP information...');
        const lspInfo = await client.getLspInfo();
        console.log('LSP Info:', lspInfo);

        // 2. Get LSP Connection URL
        console.log('2. Getting LSP connection URL...');
        const connectionUrl = await client.getLspConnectionUrl();
        console.log('LSP Connection URL:', connectionUrl);

        // 3. Create a channel order
        // Note: This requires a valid pubkey and onchain address from your node.
        console.log('3. Creating a channel order...');
        try {
            const pubkey = await client.getNodePubkey();
            const onchainAddress = await client.getOnchainAddress();

            const orderDetails = {
                client_pubkey: pubkey,
                lsp_balance_sat: 100000, // LSP provides 100k sats
                client_balance_sat: 50000, // We provide 50k sats
                required_channel_confirmations: 1,
                funding_confirms_within_blocks: 6,
                channel_expiry_blocks: 2016,
                token: "BTC", // For a Bitcoin channel
                refund_onchain_address: onchainAddress.address,
                announce_channel: true,
            };

            const orderResult = await client.createOrder(orderDetails);
            console.log('Order created successfully:', orderResult);

            // 4. Get the order status
            console.log('4. Fetching created order status...');
            const orderId = orderResult.order_id;
            const retrievedOrder = await client.getOrder(orderId);
            console.log('Retrieved order details:', retrievedOrder);

        } catch (error) {
            console.warn('Could not create order. This might be expected if the node is not configured for it.', error);
        }

    } catch (error) {
        console.error('An error occurred during LSP operations:', error);
    }

    console.log('--- LSP Operations Example Finished ---');
}

main().catch(console.error);
