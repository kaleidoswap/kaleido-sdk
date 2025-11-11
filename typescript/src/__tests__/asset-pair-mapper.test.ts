import { AssetPairMapper, createAssetPairMapper } from '../utils/assetPairMapper';
import { PairResponse } from '../types';

describe('AssetPairMapper', () => {
  const mockPairResponse: PairResponse = {
    pairs: [
      {
        id: 'BTC-USDT',
        base_asset: 'BTC',
        base_asset_id: 'btc-asset-id',
        quote_asset: 'USDT',
        quote_asset_id: 'usdt-asset-id',
        base_precision: 8,
        quote_precision: 2,
        min_base_order_size: 1000,
        max_base_order_size: 100000000,
        min_quote_order_size: 100,
        max_quote_order_size: 1000000,
        is_active: true,
      },
      {
        id: 'ETH-USDT',
        base_asset: 'ETH',
        base_asset_id: 'eth-asset-id',
        quote_asset: 'USDT',
        quote_asset_id: 'usdt-asset-id',
        base_precision: 18,
        quote_precision: 2,
        min_base_order_size: 1000,
        max_base_order_size: 100000000,
        min_quote_order_size: 100,
        max_quote_order_size: 1000000,
        is_active: true,
      },
    ],
  };

  let mapper: AssetPairMapper;

  beforeEach(() => {
    mapper = new AssetPairMapper(mockPairResponse);
  });

  describe('constructor', () => {
    it('should create a mapper with pair response', () => {
      expect(mapper).toBeInstanceOf(AssetPairMapper);
    });

    it('should build asset map from pairs', () => {
      const assets = mapper.getAllAssets();
      expect(assets.length).toBeGreaterThan(0);
    });
  });

  describe('findByTicker', () => {
    it('should find asset by ticker', () => {
      const btc = mapper.findByTicker('BTC');
      expect(btc).toBeDefined();
      expect(btc?.ticker).toBe('BTC');
      expect(btc?.precision).toBe(8);
    });

    it('should return undefined for unknown ticker', () => {
      const unknown = mapper.findByTicker('UNKNOWN');
      expect(unknown).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find asset by ID', () => {
      const btc = mapper.findById('btc-asset-id');
      expect(btc).toBeDefined();
      expect(btc?.asset_id).toBe('btc-asset-id');
    });

    it('should return undefined for unknown ID', () => {
      const unknown = mapper.findById('unknown-id');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getAllAssets', () => {
    it('should return all mapped assets', () => {
      const assets = mapper.getAllAssets();
      expect(assets.length).toBe(3); // BTC, ETH, and USDT (appears in both pairs)
    });

    it('should include trading pairs for each asset', () => {
      const usdt = mapper.findByTicker('USDT');
      expect(usdt?.trading_pairs).toContain('btc-asset-id');
      expect(usdt?.trading_pairs).toContain('eth-asset-id');
    });
  });

  describe('canTrade', () => {
    it('should return true for valid trading pair', () => {
      const canTrade = mapper.canTrade('btc-asset-id', 'usdt-asset-id');
      expect(canTrade).toBe(true);
    });

    it('should return false for invalid trading pair', () => {
      const canTrade = mapper.canTrade('btc-asset-id', 'unknown-id');
      expect(canTrade).toBe(false);
    });

    it('should return false for unknown asset', () => {
      const canTrade = mapper.canTrade('unknown-id', 'usdt-asset-id');
      expect(canTrade).toBe(false);
    });
  });

  describe('getTradingPartners', () => {
    it('should return trading partners for an asset', () => {
      const partners = mapper.getTradingPartners('usdt-asset-id');
      expect(partners.length).toBe(2);
      const tickers = partners.map(p => p.ticker);
      expect(tickers).toContain('BTC');
      expect(tickers).toContain('ETH');
    });

    it('should return empty array for unknown asset', () => {
      const partners = mapper.getTradingPartners('unknown-id');
      expect(partners).toEqual([]);
    });
  });

  describe('getActivePairs', () => {
    it('should return only active pairs', () => {
      const activePairs = mapper.getActivePairs();
      expect(activePairs.length).toBe(2);
      expect(activePairs.every(p => p.is_active)).toBe(true);
    });
  });

  describe('createAssetPairMapper', () => {
    it('should create an AssetPairMapper instance', () => {
      const createdMapper = createAssetPairMapper(mockPairResponse);
      expect(createdMapper).toBeInstanceOf(AssetPairMapper);
    });
  });
});
