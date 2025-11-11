import { KaleidoClient } from '../client';
import { assetListResponse, createTestClient } from '../testUtils';

const itIf = (condition: boolean) => (condition ? it : it.skip);
const hasNodeConfig = Boolean(
  process.env.KALEIDO_TEST_NODE_URL || process.env.KALEIDO_NODE_URL
);

describe('KaleidoClient integration', () => {
  jest.setTimeout(120000);

  let client: KaleidoClient;

  beforeAll(() => {
    client = createTestClient();
  });

  describe('public HTTP endpoints', () => {
    it('lists assets, pairs, and LSP network info', async () => {
      const assets = await client.assetList();
      expect(Array.isArray(assets.assets)).toBe(true);
      expect(assets.assets.length).toBeGreaterThan(0);

      const pairs = await client.pairList();
      expect(Array.isArray(pairs.pairs)).toBe(true);
      expect(pairs.pairs.length).toBeGreaterThan(0);

      const lspInfo = await client.getLspInfo();
      expect(lspInfo.lsp_connection_url).toBeDefined();

      const lspNetwork = await client.getLspNetworkInfo();
      expect(lspNetwork.network).toBeDefined();

      const lspUrl = await client.getLspConnectionUrl();
      expect(typeof lspUrl).toBe('string');
      expect(lspUrl.length).toBeGreaterThan(0);
    });

    it.skip('returns quote data consistently over HTTP and WebSocket', async () => {
      // Skipped: WebSocket requires authentication/credentials
      // Enable this test by providing proper API credentials
      const { fromAsset, toAsset, fromAmount } = await assetListResponse(client);

      const httpQuote = await client.quoteRequest(fromAsset, toAsset, fromAmount);
      expect(httpQuote.rfq_id).toBeTruthy();
      expect(httpQuote.to_amount).toBeGreaterThan(0);

      const wsQuote = await client.quoteRequestWS(fromAsset, toAsset, fromAmount);
      expect(wsQuote.rfq_id).toBeTruthy();
      expect(wsQuote.to_amount).toBeGreaterThan(0);
    });
  });

  describe('swap helpers', () => {
    it('requires node configuration before polling swap status', async () => {
      const noNodeClient = createTestClient({ nodeUrl: undefined });
      await expect(
        noNodeClient.waitForSwapCompletion('non-existent', 1, 1)
      ).rejects.toThrow('Node URL is required');
    });
  });

  describe('node-reliant calls', () => {
    itIf(hasNodeConfig)('fetches node info when nodeUrl configured', async () => {
      const nodeClient = createTestClient({
        nodeUrl:
          process.env.KALEIDO_TEST_NODE_URL || process.env.KALEIDO_NODE_URL,
      });

      const info = await nodeClient.getNodeInfo();
      expect(info.pubkey).toBeTruthy();
    });

    itIf(!hasNodeConfig)('throws helpful error when nodeUrl missing', async () => {
      const nodeClient = createTestClient({ nodeUrl: undefined });
      await expect(nodeClient.getNodeInfo()).rejects.toThrow(
        'Node URL is required'
      );
    });
  });
});

