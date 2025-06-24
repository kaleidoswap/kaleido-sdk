/// <reference types="@types/jest" />

import { KaleidoClient } from '../client';

describe('Node Info Tests', () => {
  let client: KaleidoClient;

  beforeAll(() => {
    client = new KaleidoClient({
      baseUrl: 'http://localhost:8000/api/v1/lsps1/get_info',
      nodeUrl: 'http://localhost:3002'
    });
  });

  it('should successfully fetch node info', async () => {
    const info = await client.getNodeInfo();
    expect(info).toBeDefined();
    expect(info.pubkey).toBeDefined();
    expect(typeof info.pubkey).toBe('string');
  });

  it('should successfully fetch node pubkey', async () => {
    const pubkey = await client.getNodePubkey();
    expect(pubkey).toBeDefined();
    expect(typeof pubkey).toBe('string');
  });
});
