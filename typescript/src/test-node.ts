import { KaleidoClient } from './client';

async function testNodeInfo() {
  // Create a client instance
  const client = new KaleidoClient({
    nodeUrl: 'https://api.regtest.kaleidoswap.com/', // Replace with your node URL
    baseUrl: 'https://api.regtest.kaleidoswap.com/api/v1/lsps1/get_info'  // Replace with your API URL
  });

  try {
    // Call getNodeInfo()
    const info = await client.getNodeInfo();
    console.log('Node Info:', info);
    
    // You can also get just the pubkey
    const pubkey = await client.getNodePubkey();
    console.log('Node Pubkey:', pubkey);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testNodeInfo();
