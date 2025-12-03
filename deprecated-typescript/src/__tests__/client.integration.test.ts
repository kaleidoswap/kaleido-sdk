import { KaleidoClient } from '../client';
import { getAssetListResponse, createTestClient } from '../testUtils';
import type { PairQuoteResponse } from '../generated/kaleido';

const itIf = (condition: boolean) => (condition ? it : it.skip);
const hasNodeConfig = Boolean(process.env.KALEIDO_TEST_NODE_URL || process.env.KALEIDO_NODE_URL);
const hasApiKey = Boolean(process.env.KALEIDO_API_KEY);

describe('KaleidoClient integration', () => {
  jest.setTimeout(120000);

  let client: KaleidoClient;

  beforeAll(() => {
    client = createTestClient();
  });

  describe('public HTTP endpoints', () => {
    it('lists assets, pairs, and LSP network info', async () => {
      const assets = await client.listAssets();
      expect(Array.isArray(assets.assets)).toBe(true);
      expect(assets.assets.length).toBeGreaterThan(0);

      const pairs = await client.listPairs();
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
      const { fromAsset, toAsset, fromAmount } = await getAssetListResponse(client);

      const httpQuote = await client.getQuote(fromAsset, toAsset, fromAmount);
      expect(httpQuote.rfq_id).toBeTruthy();
      expect(httpQuote.to_amount).toBeGreaterThan(0);

      const wsQuote = await client.getQuoteWebSocket(fromAsset, toAsset, fromAmount);
      expect(wsQuote.rfq_id).toBeTruthy();
      expect(wsQuote.to_amount).toBeGreaterThan(0);
    });
  });

  describe('WebSocket quote system', () => {
    let wsClient: KaleidoClient;

    beforeAll(() => {
      wsClient = createTestClient();
    });

    afterEach(async () => {
      // Clean up websocket connection after each test
      try {
        await wsClient['wsClient'].disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
    });

    itIf(hasApiKey)('connects and gets a quote via WebSocket', async () => {
      const { fromAsset, toAsset, fromAmount } = await getAssetListResponse(wsClient);

      const quote = await wsClient.getQuoteWebSocket(fromAsset, toAsset, fromAmount);

      console.log(quote);
      expect(quote).toBeDefined();
      expect(quote.rfq_id).toBeTruthy();
      expect(quote.from_asset).toBe(fromAsset);
      expect(quote.to_asset).toBe(toAsset);
      expect(quote.from_amount).toBe(fromAmount);
      expect(quote.to_amount).toBeGreaterThan(0);
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.fee).toBeDefined();
      expect(quote.expires_at).toBeDefined();
    });

    itIf(hasApiKey)('gets multiple quotes via WebSocket sequentially', async () => {
      const { fromAsset, toAsset, fromAmount } = await getAssetListResponse(wsClient);

      const quotes: PairQuoteResponse[] = [];
      for (let i = 0; i < 3; i++) {
        const quote = await wsClient.getQuoteWebSocket(
          fromAsset,
          toAsset,
          fromAmount * (i + 1)
        );
        quotes.push(quote);
        expect(quote.rfq_id).toBeTruthy();
        expect(quote.from_amount).toBe(fromAmount * (i + 1));
      }

      expect(quotes.length).toBe(3);
      // Each quote should have a unique RFQ ID
      const rfqIds = quotes.map(q => q.rfq_id);
      expect(new Set(rfqIds).size).toBe(3);
    });

    itIf(hasApiKey)('gets quote with to_amount instead of from_amount', async () => {
      const { fromAsset, toAsset } = await getAssetListResponse(wsClient);
      const toAmount = 1000000; // Target amount

      const quote = await wsClient.getQuoteWebSocket(fromAsset, toAsset, undefined, toAmount);

      expect(quote).toBeDefined();
      expect(quote.rfq_id).toBeTruthy();
      expect(quote.from_asset).toBe(fromAsset);
      expect(quote.to_asset).toBe(toAsset);
      expect(quote.to_amount).toBe(toAmount);
      expect(quote.from_amount).toBeGreaterThan(0);
    });

    itIf(hasApiKey)('reuses WebSocket connection for multiple requests', async () => {
      const { fromAsset, toAsset, fromAmount } = await getAssetListResponse(wsClient);

      // First request - should establish connection
      const quote1 = await wsClient.getQuoteWebSocket(fromAsset, toAsset, fromAmount);
      expect(quote1.rfq_id).toBeTruthy();

      // Check that connection is still open
      const wsState = wsClient['wsClient'].getConnectionState();
      expect(wsState).toBeDefined();

      // Second request - should reuse connection
      const quote2 = await wsClient.getQuoteWebSocket(fromAsset, toAsset, fromAmount * 2);
      expect(quote2.rfq_id).toBeTruthy();
      expect(quote2.rfq_id).not.toBe(quote1.rfq_id);
    });

    itIf(hasApiKey)('returns quote data consistently over HTTP and WebSocket', async () => {
      const { fromAsset, toAsset, fromAmount } = await getAssetListResponse(wsClient);

      const httpQuote = await wsClient.getQuote(fromAsset, toAsset, fromAmount);
      expect(httpQuote.rfq_id).toBeTruthy();
      expect(httpQuote.to_amount).toBeGreaterThan(0);

      const wsQuote = await wsClient.getQuoteWebSocket(fromAsset, toAsset, fromAmount);
      expect(wsQuote.rfq_id).toBeTruthy();
      expect(wsQuote.to_amount).toBeGreaterThan(0);

      // Both quotes should have the same structure
      expect(wsQuote.from_asset).toBe(httpQuote.from_asset);
      expect(wsQuote.to_asset).toBe(httpQuote.to_asset);
      expect(wsQuote.from_amount).toBe(httpQuote.from_amount);
      // Note: to_amount and price may differ slightly due to market conditions
      // but should be in the same ballpark
      const priceDiff = Math.abs(wsQuote.price - httpQuote.price) / httpQuote.price;
      expect(priceDiff).toBeLessThan(0.1); // Within 10% difference
    });

    itIf(!hasApiKey)('skips WebSocket tests when API key is not provided', () => {
      // This test is skipped when API key is not available
      expect(true).toBe(true);
    });
  });

  describe('swap helpers', () => {
    it('requires node configuration before polling swap status', async () => {
      const noNodeClient = createTestClient({ nodeUrl: undefined });
      await expect(
        noNodeClient.waitForSwapCompletion('non-existent', { timeout: 1, pollInterval: 1 })
      ).rejects.toThrow('Node URL is required');
    });
  });

  describe('node-reliant calls', () => {
    itIf(hasNodeConfig)('fetches node info when nodeUrl configured', async () => {
      const nodeClient = createTestClient({
        nodeUrl: process.env.KALEIDO_TEST_NODE_URL || process.env.KALEIDO_NODE_URL,
      });

      const info = await nodeClient.getNodeInfo();
      expect(info.pubkey).toBeTruthy();
    });

    itIf(!hasNodeConfig)('throws helpful error when nodeUrl missing', async () => {
      const nodeClient = createTestClient({ nodeUrl: undefined });
      await expect(nodeClient.getNodeInfo()).rejects.toThrow('Node URL is required');
    });
  });
});
