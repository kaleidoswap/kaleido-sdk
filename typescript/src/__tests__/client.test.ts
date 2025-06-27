import { KaleidoClient } from '../client';
import { components } from '../types';
//import {
//  AssetError,
//  NodeError,
//  PairError,
//  QuoteError,
//  SwapError
//} from '../types/exceptions';
//import { HttpClient } from '../http/client'

const NODE_URL = process.env.TEST_NODE_URL || 'http://localhost:3001';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.TEST_API_KEY || '';

  //describe('trading pair operations', () => {
    //const mockPairs = [
      //{
        //id: 'BTC/USDT',
        //baseAsset: 'BTC',
        //quoteAsset: 'USDT',
        //minAmount: 0.001,
        //maxAmount: 10,
        //fee: 0.001
      //}
    //];

    //beforeEach(() => {
      //jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockPairs);
    //});

    //it('should handle pair errors', async () => {
      //jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Pair error'));
      //await expect(client.listPairs()).rejects.toThrow(PairError);
    //});
  //});

  //describe('quote operations', () => {
    //const mockQuote = {
      //pairId: 'BTC/USDT',
      //baseAmount: 1,
      //quoteAmount: 50000,
      //fee: 0.001,
      //expiry: Date.now() + 3600000
    //};

    //beforeEach(() => {
      //jest.spyOn(client['apiClient'], 'get').mockResolvedValue(mockQuote);
    //});

    //it('should get quote', async () => {
      //const result = await client.getQuote('BTC/USDT', 1, true);
      //expect(result).toEqual(mockQuote);
      //expect(client['apiClient'].get).toHaveBeenCalledWith(
        //'/quotes/BTC/USDT?amount=1&isBase=true'
      //);
    //});

    //it('should handle quote errors', async () => {
      //jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Quote error'));
      //await expect(client.getQuote('BTC/USDT', 1)).rejects.toThrow(QuoteError);
    //});
  //});

  //describe('swap operations', () => {
    //const mockSwap = {
      //id: 'swap-123',
      //status: 'pending',
      //baseAmount: 1,
      //quoteAmount: 50000,
      //fee: 0.001,
      //createdAt: Date.now(),
      //updatedAt: Date.now()
    //};

    //beforeEach(() => {
      //jest.spyOn(client['apiClient'], 'post').mockResolvedValue(mockSwap);
      //jest.spyOn(client['nodeClient'], 'post').mockResolvedValue(mockSwap);
    ////  jest.spyOn(client, 'getNodePubkey').mockResolvedValue('test-pubkey');
    //});

    //it('should initialize maker swap', async () => {
      //const result = await client.initMakerSwap('BTC/USDT', 1, true);
      //expect(result).toEqual(mockSwap);
      //expect(client['apiClient'].post).toHaveBeenCalledWith(
        //'/swaps/maker/init',
        //expect.any(Object)
      //);
    //});

    //it('should execute maker swap', async () => {
      //const result = await client.executeMakerSwap('swap-123');
      //expect(result).toEqual(mockSwap);
      //expect(client['apiClient'].post).toHaveBeenCalledWith(
        //'/swaps/maker/swap-123/execute',
        //{}
      //);
    //});

    //it('should confirm swap', async () => {
      //const result = await client.confirmSwap('swap-123');
      //expect(result).toEqual(mockSwap);
      //expect(client['nodeClient'].post).toHaveBeenCalledWith(
        //'/swaps/taker/swap-123/execute',
        //expect.objectContaining({
          //pubkey: 'test-pubkey'
        //})
      //);
    //});

    //it('should get swap status', async () => {
      //const result = await client.getSwapStatus('swap-123');
      //expect(result).toEqual(mockSwap);
      //expect(client['nodeClient'].get).toHaveBeenCalledWith('/swaps/swap-123');
    //});

    //it('should handle swap errors', async () => {
      //jest.spyOn(client['apiClient'], 'post').mockRejectedValue(new Error('Swap error'));
      //await expect(client.initMakerSwap('BTC/USDT', 1)).rejects.toThrow(SwapError);
    //});
  //});
//});

describe('KaleidoClient', () => {
  let client: KaleidoClient;

  beforeAll(() => {
    client = new KaleidoClient({
      baseUrl: BASE_URL,
      nodeUrl: NODE_URL,
      apiKey: API_KEY,
    });
  });

  describe('node operations', () => {
    it('should get node info', async () => {
      const info = await client.getNodeInfo();
      expect(info).toHaveProperty('pubkey');
      expect(typeof info.pubkey).toBe('string');
      //console.log('Node info:', info);
    });

    it('should get node pubkey', async () => {
      const pubkey = await client.getNodePubkey();
      expect(typeof pubkey).toBe('string');
      expect(pubkey.length).toBeGreaterThan(0);
      //console.log('Node pubkey:', pubkey);
    });

    // TODO: test for error handling -- not working
    //it('should handle node errors', async () => {
    //  jest.spyOn(client['nodeClient'], 'get').mockRejectedValue(new Error('Node error'));
    //  await expect(client.getNodeInfo()).rejects.toThrow(NodeError);
    //});
  })

  describe('asset operations', () => {
    it('should get list assets', async () => {
      const result = await client.listAssets();
      expect(result).toHaveProperty('assets')
      expect(result).toHaveProperty('network')
      expect(result).toHaveProperty('timestamp')
    })
  
    // TODO: test for getAssetMetadata(assetId)
    //it('should get asset metadata', asynct () => {
    //  getting the name of the asset
    //  testing to see if that name can be found in the asset's list
    //})

    // TODO: test for error handling -- not working
    //it('should handle asset errors', async () => {
      //jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Asset error'));
      //await expect(client.listAssets()).rejects.toThrow(AssetError);
    //});
  })

  describe('trading pair operations', () => {
    it('should list pairs', async () => {
      const result = await client.listPairs()
      expect(result).toHaveProperty('pairs');
    })

    it('should get pair by assets', async () => {
      const response = await client.listPairs();
      const pairs = response.pairs;
      if (pairs && pairs.length > 0) {
        const pair = pairs[0];
        const foundPair = await client.getPairByAssets(pair.base_asset_id, pair.quote_asset_id);
        expect(foundPair).not.toBeNull();
        expect(foundPair?.id).toBe(pair.id);
      }
    })

    // TODO: test for error handling -- not working
    //it('should handle pair errors', async () => {
      //jest.spyOn(client['apiClient'], 'get').mockRejectedValue(new Error('Pair error'));
      //await expect(client.listPairs()).rejects.toThrow(PairError);
    //});
  })
  
  describe('quote operations', () => {
    it('should get quote', async () => {
      const assetsResponse = await client.listAssets();
      const assets = assetsResponse.assets;
      if (assets && assets.length > 0 && assets[0].asset_id) {
        const fromAsset = assets[0].asset_id;
        const toAsset = assets[1]?.asset_id || fromAsset;
        if (!toAsset) {
          throw new Error('No valid toAsset found');
        }
        const fromAmount = 100000000; // 1 BTC in satoshis
        const result = await client.getQuote(fromAsset, toAsset, fromAmount);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('rfq_id');
        expect(result).toHaveProperty('to_amount');
      }
    })

    // TODO: test for error handling -- not working
  })

  describe('swap operations', () => {
    it('should initialize maker swap', async () => {
      const assetsResponse = await client.listAssets();
      const assets = assetsResponse.assets;
      
      if (assets && assets.length > 0 && assets[0].asset_id) {
        const fromAsset = assets[0].asset_id;
        const toAsset = assets[1]?.asset_id || fromAsset;
        
        if (!toAsset) {
          throw new Error('No valid toAsset found');
        }
  
        const quote = await client.getQuote(fromAsset, toAsset, 100000000);
  
        const init_result = await client.initMakerSwap(
          quote.rfq_id,
          quote.from_asset,
          quote.to_asset,
          quote.from_amount,
          quote.to_amount
        );

        expect(init_result).toBeDefined();
        expect(init_result).toHaveProperty('payment_hash');
        expect(init_result).toHaveProperty('swapstring');
      }

    //it('should execute maker swap')
    });

    it('should whitelist a trade (does it actually work?', async () => {
      // First, initialize a maker swap to get a valid swapstring
      const assetsResponse = await client.listAssets();
      const assets = assetsResponse.assets;
      
      if (assets && assets.length > 1 && assets[0].asset_id) {
        const fromAsset = assets[0].asset_id;
        const toAsset = assets[1].asset_id;
        
        if (!toAsset) {
          throw new Error('No valid toAsset found');
        }
  
        const quote = await client.getQuote(fromAsset, toAsset, 100000000);
  
        const initResult = await client.initMakerSwap(
          quote.rfq_id,
          quote.from_asset,
          quote.to_asset,
          quote.from_amount,
          quote.to_amount
        ) as components['schemas']['SwapRequest'] & { payment_hash: string; swapstring: string };

        // Verify the init result has the expected properties
        expect(initResult).toBeDefined();
        expect(initResult).toHaveProperty('payment_hash');
        expect(initResult).toHaveProperty('swapstring');
        
        if (!initResult.payment_hash || !initResult.swapstring) {
          throw new Error('Missing required fields in initMakerSwap response');
        }

        // Now use the swapstring from the initialized swap
        const result = await client.whitelistTrade(initResult.swapstring);
        
        // Verify the response is an empty object
        expect(result).toBeDefined();
        expect(result).toEqual({});
      } else {
        throw new Error('Not enough assets available for testing');
      }
    });

    it('should confirm complete swap', async () => {
        })
  });
});