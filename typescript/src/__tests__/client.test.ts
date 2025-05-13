import { KaleidoClient } from '../client';
import {
  AssetError,
  NodeError,
  PairError,
  QuoteError,
  SwapError
} from '../types/exceptions';

describe('KaleidoClient', () => {
  let client: KaleidoClient;
  const mockConfig = {
    baseUrl: 'https://api.test.com',
    nodeUrl: 'https://node.test.com',
    apiKey: 'test-api-key'
  };

  beforeEach(() => {
    client = new KaleidoClient(mockConfig);
  });

  describe('node operations', () => {
    const mockNodeInfo = { pubkey: 'test-pubkey' };

    beforeEach(() => {
      jest.spyOn(client['nodeClient'], 'get').mockResolvedValue(mockNodeInfo);
    });

    it('should get node info', async () => {
      const result = await client.getNodeInfo();
      expect(result).toEqual(mockNodeInfo);
      expect(client['nodeClient'].get).toHaveBeenCalledWith('/node/info');
    });

    it('should get node pubkey', async () => {
      const result = await client.getNodePubkey();
      expect(result).toBe(mockNodeInfo.pubkey);
    });

    it('should handle node errors', async () => {
      jest.spyOn(client['nodeClient'], 'get').mockRejectedValue(new Error('Node error'));
      await expect(client.getNodeInfo()).rejects.toThrow(NodeError);
    });
  });

  describe('asset operations', () => {
    const mockAssets = [
      { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', decimals: 8, type: 'crypto' },
      { id: 'ETH', name: 'Ethereum', symbol: 'ETH', decimals: 18, type: 'crypto' }
    ];

    beforeEach(() => {
      jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockAssets);
    });

    it('should list assets', async () => {
      const result = await client.listAssets();
      expect(result).toEqual(mockAssets);
      expect(client['apiClient'].get).toHaveBeenCalledWith('/assets');
    });

    it('should get asset metadata', async () => {
      const mockAsset = mockAssets[0];
      jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockAsset);

      const result = await client.getAssetMetadata('BTC');
      expect(result).toEqual(mockAsset);
      expect(client['apiClient'].get).toHaveBeenCalledWith('/assets/BTC');
    });

    it('should handle asset errors', async () => {
      jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Asset error'));
      await expect(client.listAssets()).rejects.toThrow(AssetError);
    });
  });

  describe('trading pair operations', () => {
    const mockPairs = [
      {
        id: 'BTC/USDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        minAmount: 0.001,
        maxAmount: 10,
        fee: 0.001
      }
    ];

    beforeEach(() => {
      jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockPairs);
    });

    it('should list pairs', async () => {
      const result = await client.listPairs();
      expect(result).toEqual(mockPairs);
      expect(client['apiClient'].get).toHaveBeenCalledWith('/pairs');
    });

    it('should get pair by assets', async () => {
      const mockPair = mockPairs[0];
      jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockPair);

      const result = await client.getPairByAssets('BTC', 'USDT');
      expect(result).toEqual(mockPair);
      expect(client['apiClient'].get).toHaveBeenCalledWith('/pairs/BTC/USDT');
    });

    it('should handle pair errors', async () => {
      jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Pair error'));
      await expect(client.listPairs()).rejects.toThrow(PairError);
    });
  });

  describe('quote operations', () => {
    const mockQuote = {
      pairId: 'BTC/USDT',
      baseAmount: 1,
      quoteAmount: 50000,
      fee: 0.001,
      expiry: Date.now() + 3600000
    };

    beforeEach(() => {
      jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockQuote);
    });

    it('should get quote', async () => {
      const result = await client.getQuote('BTC/USDT', 1, true);
      expect(result).toEqual(mockQuote);
      expect(client['apiClient'].get).toHaveBeenCalledWith(
        '/quotes/BTC/USDT?amount=1&isBase=true'
      );
    });

    it('should handle quote errors', async () => {
      jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Quote error'));
      await expect(client.getQuote('BTC/USDT', 1)).rejects.toThrow(QuoteError);
    });
  });

  describe('swap operations', () => {
    const mockSwap = {
      id: 'swap-123',
      status: 'pending',
      baseAmount: 1,
      quoteAmount: 50000,
      fee: 0.001,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    beforeEach(() => {
      jest.spyOn(client['apiClient'], 'post').mockResolvedValue(mockSwap);
      jest.spyOn(client['nodeClient'], 'post').mockResolvedValue(mockSwap);
      jest.spyOn(client, 'getNodePubkey').mockResolvedValue('test-pubkey');
    });

    it('should initialize maker swap', async () => {
      const result = await client.initMakerSwap('BTC/USDT', 1, true);
      expect(result).toEqual(mockSwap);
      expect(client['apiClient'].post).toHaveBeenCalledWith(
        '/swaps/maker/init',
        expect.any(Object)
      );
    });

    it('should execute maker swap', async () => {
      const result = await client.executeMakerSwap('swap-123');
      expect(result).toEqual(mockSwap);
      expect(client['apiClient'].post).toHaveBeenCalledWith(
        '/swaps/maker/swap-123/execute',
        {}
      );
    });

    it('should whitelist trade', async () => {
      const result = await client.whitelistTrade('swapstring');
      expect(result).toEqual(mockSwap);
      expect(client['nodeClient'].post).toHaveBeenCalledWith(
        '/swaps/taker/init',
        expect.objectContaining({
          swapstring: 'swapstring',
          pubkey: 'test-pubkey'
        })
      );
    });

    it('should confirm swap', async () => {
      const result = await client.confirmSwap('swap-123');
      expect(result).toEqual(mockSwap);
      expect(client['nodeClient'].post).toHaveBeenCalledWith(
        '/swaps/taker/swap-123/execute',
        expect.objectContaining({
          pubkey: 'test-pubkey'
        })
      );
    });

    it('should get swap status', async () => {
      const result = await client.getSwapStatus('swap-123');
      expect(result).toEqual(mockSwap);
      expect(client['nodeClient'].get).toHaveBeenCalledWith('/swaps/swap-123');
    });

    it('should handle swap errors', async () => {
      jest.spyOn(client['apiClient'], 'post').mockRejectedValue(new Error('Swap error'));
      await expect(client.initMakerSwap('BTC/USDT', 1)).rejects.toThrow(SwapError);
    });
  });
}); 