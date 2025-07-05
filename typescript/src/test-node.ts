import { KaleidoClient } from './client';

async function testNodeInfo() {
  const client = new KaleidoClient({
    nodeUrl: 'http://localhost:8000',
    baseUrl: 'http://localhost:3001'
  });

  try {
    const info = await client.getNodeInfo();
    console.log('Node Info:', info);
    
    const pubkey = await client.getNodePubkey();
    console.log('Node Pubkey:', pubkey);
  } catch (error) {
    console.error('Error:', error);
  }
}

testNodeInfo();
