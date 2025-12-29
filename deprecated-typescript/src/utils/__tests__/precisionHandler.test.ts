import { createPrecisionHandler } from '../precisionHandler';
import { MappedAsset } from '../assetPairMapper';

describe('PrecisionHandler', () => {
  const mockAssets: MappedAsset[] = [
    {
      asset_id: 'BTC',
      ticker: 'BTC',
      name: 'Bitcoin',
      precision: 11, // BTC uses 11 decimal places in this system
      is_active: true,
      min_order_size: 1000, // 0.00001 BTC in atomic units
      max_order_size: 100000000, // 1 BTr in atomic units
      trading_pairs: ['rgb:usdt123'],
    },
    {
      asset_id: 'rgb:usdt123',
      ticker: 'USDT',
      name: 'Tether USD',
      precision: 6, // USDT uses 6 decimal places
      is_active: true,
      min_order_size: 1000000, // 1 USDT in atomic units
      max_order_size: 1000000000, // 1000 USDT in atomic units
      trading_pairs: ['BTC'],
    },
  ];

  describe('toRawAmount', () => {
    it('should convert decimal to atomic units for BTC', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toRawAmount(1, 'BTC'); // 1 BTC

      // 1 BTC with precision 11 = 100,000,000,000 atomic units
      expect(result).toBe(100000000000);
    });

    it('should convert decimal to atomic units for USDT', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toRawAmount(100, 'rgb:usdt123'); // 100 USDT

      // 100 USDT with precision 6 = 100,000,000 atomic units
      expect(result).toBe(100000000);
    });

    it('should handle fractional amounts', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toRawAmount(0.001, 'BTC'); // 0.001 BTC

      // 0.001 BTC = 100,000,000 atomic units
      expect(result).toBe(100000000);
    });

    it('should handle very small amounts', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toRawAmount(0.00001, 'BTC'); // minimum BTC

      expect(result).toBe(1000000);
    });

    it('should throw error for unknown asset', () => {
      const handler = createPrecisionHandler(mockAssets);

      expect(() => {
        handler.toRawAmount(1, 'UNKNOWN');
      }).toThrow('Asset UNKNOWN not found');
    });
  });

  describe('toDisplayAmount', () => {
    it('should convert atomic units to decimal for BTC', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toDisplayAmount(100000000000, 'BTC');

      expect(result).toBe(1); // 1 BTC
    });

    it('should convert atomic units to decimal for USDT', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toDisplayAmount(100000000, 'rgb:usdt123');

      expect(result).toBe(100); // 100 USDT
    });

    it('should handle fractional results', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toDisplayAmount(100000000, 'BTC');

      expect(result).toBe(0.001); // 0.001 BTC
    });

    it('should throw error for unknown asset', () => {
      const handler = createPrecisionHandler(mockAssets);

      expect(() => {
        handler.toDisplayAmount(1000, 'UNKNOWN');
      }).toThrow('Asset UNKNOWN not found');
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain precision through round-trip conversion (BTC)', () => {
      const handler = createPrecisionHandler(mockAssets);
      const original = 0.12345678901;

      const raw = handler.toRawAmount(original, 'BTC');
      const backToDisplay = handler.toDisplayAmount(raw, 'BTC');

      expect(backToDisplay).toBeCloseTo(original, 11);
    });

    it('should maintain precision through round-trip conversion (USDT)', () => {
      const handler = createPrecisionHandler(mockAssets);
      const original = 123.456789;

      const raw = handler.toRawAmount(original, 'rgb:usdt123');
      const backToDisplay = handler.toDisplayAmount(raw, 'rgb:usdt123');

      expect(backToDisplay).toBeCloseTo(original, 6);
    });
  });

  describe('edge cases', () => {
    it('should handle zero amount', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toRawAmount(0, 'BTC');

      expect(result).toBe(0);
    });

    it('should handle negative amounts', () => {
      const handler = createPrecisionHandler(mockAssets);

      // Should not throw, but validation will fail
      const raw = handler.toRawAmount(-1, 'BTC');
      expect(raw).toBeLessThan(0);
    });

    it('should handle very large numbers', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toRawAmount(1000000, 'rgb:usdt123');

      expect(result).toBe(1000000000000);
    });

    it('should throw error when initialized with empty assets', () => {
      expect(() => {
        createPrecisionHandler([]);
      }).toThrow();
    });
  });
});
