import { createAssetPairMapper } from '../assetPairMapper';
import { PairResponse } from '../../types';

describe('AssetPairMapper', () => {
  const mockPairsResponse: PairResponse = {
    pairs: [
      {
        id: 'pair1',
        base_asset: 'BTC',
        base_asset_id: 'BTC',
        base_precision: 11,
        quote_asset: 'USDT',
        quote_asset_id: 'rgb:usdt123',
        quote_precision: 6,
        is_active: true,
        min_base_order_size: 1000,
        max_base_order_size: 100000000,
        min_quote_order_size: 1000000,
        max_quote_order_size: 1000000000
      },
      {
        id: 'pair2',
        base_asset: 'BTC',
        base_asset_id: 'BTC',
        base_precision: 11,
        quote_asset: 'XAUT',
        quote_asset_id: 'rgb:xaut456',
        quote_precision: 9,
        is_active: true,
        min_base_order_size: 1000,
        max_base_order_size: 100000000,
        min_quote_order_size: 1000000,
        max_quote_order_size: 1000000000
      }
    ]
  };

  describe('findByTicker', () => {
    it('should find asset by ticker (BTC)', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const btc = mapper.findByTicker('BTC');

      expect(btc).toBeDefined();
      expect(btc?.ticker).toBe('BTC');
      expect(btc?.asset_id).toBe('BTC');
      expect(btc?.precision).toBe(11);
    });

    it('should find asset by ticker (USDT)', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const usdt = mapper.findByTicker('USDT');

      expect(usdt).toBeDefined();
      expect(usdt?.ticker).toBe('USDT');
      expect(usdt?.asset_id).toBe('rgb:usdt123');
      expect(usdt?.precision).toBe(6);
    });

    it('should return undefined for non-existent ticker', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const result = mapper.findByTicker('NONEXISTENT');

      expect(result).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const result = mapper.findByTicker('btc');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find asset by ID', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const usdt = mapper.findById('rgb:usdt123');

      expect(usdt).toBeDefined();
      expect(usdt?.ticker).toBe('USDT');
      expect(usdt?.asset_id).toBe('rgb:usdt123');
    });

    it('should return undefined for non-existent ID', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const result = mapper.findById('rgb:nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('canTrade', () => {
    it('should return true for tradeable pair (BTC-USDT)', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const canTrade = mapper.canTrade('BTC', 'rgb:usdt123');

      expect(canTrade).toBe(true);
    });

    it('should return true for tradeable pair (USDT-BTC)', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const canTrade = mapper.canTrade('rgb:usdt123', 'BTC');

      expect(canTrade).toBe(true);
    });

    it('should return false for non-tradeable pair', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const canTrade = mapper.canTrade('rgb:usdt123', 'rgb:xaut456');

      expect(canTrade).toBe(false);
    });

    it('should return false for non-existent assets', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const canTrade = mapper.canTrade('NONEXISTENT1', 'NONEXISTENT2');

      expect(canTrade).toBe(false);
    });
  });

  describe('getAllAssets', () => {
    it('should return all unique assets', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const assets = mapper.getAllAssets();

      expect(assets).toHaveLength(3); // BTC, USDT, XAUT
      expect(assets.map(a => a.ticker)).toContain('BTC');
      expect(assets.map(a => a.ticker)).toContain('USDT');
      expect(assets.map(a => a.ticker)).toContain('XAUT');
    });

    it('should include trading relationships', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const assets = mapper.getAllAssets();

      const btc = assets.find(a => a.ticker === 'BTC');
      expect(btc?.trading_pairs).toContain('rgb:usdt123');
      expect(btc?.trading_pairs).toContain('rgb:xaut456');

      const usdt = assets.find(a => a.ticker === 'USDT');
      expect(usdt?.trading_pairs).toContain('BTC');
    });

    it('should include min/max order sizes', () => {
      const mapper = createAssetPairMapper(mockPairsResponse);
      const assets = mapper.getAllAssets();

      const btc = assets.find(a => a.ticker === 'BTC');
      expect(btc?.min_order_size).toBe(1000);
      expect(btc?.max_order_size).toBe(100000000);
    });
  });

  describe('edge cases', () => {
    it('should handle empty pairs array', () => {
      const emptyResponse: PairResponse = { pairs: [] };
      const mapper = createAssetPairMapper(emptyResponse);
      const assets = mapper.getAllAssets();

      expect(assets).toHaveLength(0);
    });

    it('should handle pairs with same base and quote assets in different order', () => {
      const response: PairResponse = {
        pairs: [
          {
            id: 'pair1',
            base_asset: 'BTC',
            base_asset_id: 'BTC',
            base_precision: 11,
            quote_asset: 'USDT',
            quote_asset_id: 'rgb:usdt123',
            quote_precision: 6,
            is_active: true,
            min_base_order_size: 1000,
            max_base_order_size: 100000000,
            min_quote_order_size: 1000000,
            max_quote_order_size: 1000000000
          },
          {
            id: 'pair2',
            base_asset: 'USDT',
            base_asset_id: 'rgb:usdt123',
            base_precision: 6,
            quote_asset: 'BTC',
            quote_asset_id: 'BTC',
            quote_precision: 11,
            is_active: true,
            min_base_order_size: 1000000,
            max_base_order_size: 1000000000,
            min_quote_order_size: 1000,
            max_quote_order_size: 100000000
          }
        ]
      };

      const mapper = createAssetPairMapper(response);
      const assets = mapper.getAllAssets();

      // Should still only have 2 unique assets
      expect(assets).toHaveLength(2);
    });
  });
});
