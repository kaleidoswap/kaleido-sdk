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

  describe('toAssetAmount', () => {
    it('should convert decimal to atomic units for BTC', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetAmount(1, 'BTC'); // 1 BTC

      // 1 BTC with precision 11 = 100,000,000,000 atomic units
      expect(result).toBe(100000000000);
    });

    it('should convert decimal to atomic units for USDT', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetAmount(100, 'rgb:usdt123'); // 100 USDT

      // 100 USDT with precision 6 = 100,000,000 atomic units
      expect(result).toBe(100000000);
    });

    it('should handle fractional amounts', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetAmount(0.001, 'BTC'); // 0.001 BTC

      // 0.001 BTC = 100,000,000 atomic units
      expect(result).toBe(100000000);
    });

    it('should handle very small amounts', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetAmount(0.00001, 'BTC'); // minimum BTC

      expect(result).toBe(1000000);
    });

    it('should throw error for unknown asset', () => {
      const handler = createPrecisionHandler(mockAssets);

      expect(() => {
        handler.toAssetAmount(1, 'UNKNOWN');
      }).toThrow('Asset UNKNOWN not found');
    });
  });

  describe('toAssetDecimalAmount', () => {
    it('should convert atomic units to decimal for BTC', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetDecimalAmount(100000000000, 'BTC');

      expect(result).toBe(1); // 1 BTC
    });

    it('should convert atomic units to decimal for USDT', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetDecimalAmount(100000000, 'rgb:usdt123');

      expect(result).toBe(100); // 100 USDT
    });

    it('should handle fractional results', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetDecimalAmount(100000000, 'BTC');

      expect(result).toBe(0.001); // 0.001 BTC
    });

    it('should throw error for unknown asset', () => {
      const handler = createPrecisionHandler(mockAssets);

      expect(() => {
        handler.toAssetDecimalAmount(1000, 'UNKNOWN');
      }).toThrow('Asset UNKNOWN not found');
    });
  });

  describe('validateOrderSize', () => {
    it('should validate amount within limits (BTC)', () => {
      const handler = createPrecisionHandler(mockAssets);
      const btc = mockAssets[0];
      const result = handler.validateOrderSize(0.001, btc); // 0.001 BTC

      expect(result.valid).toBe(true);
      expect(result.assetAmount).toBe(100000000);
      expect(result.error).toBeUndefined();
    });

    it('should validate amount within limits (USDT)', () => {
      const handler = createPrecisionHandler(mockAssets);
      const usdt = mockAssets[1];
      const result = handler.validateOrderSize(100, usdt); // 100 USDT

      expect(result.valid).toBe(true);
      expect(result.assetAmount).toBe(100000000);
      expect(result.error).toBeUndefined();
    });

    it('should reject amount below minimum', () => {
      const handler = createPrecisionHandler(mockAssets);
      const btc = mockAssets[0];
      // min_order_size is 1000 atomic units = 0.00000001 BTC (1e-8) with precision 11
      // Testing with 0.000000001 BTC (1e-9) which should be below minimum
      const result = handler.validateOrderSize(0.000000001, btc); // Too small

      expect(result.valid).toBe(false);
      expect(result.error).toContain('below minimum');
    });

    it('should reject amount above maximum', () => {
      const handler = createPrecisionHandler(mockAssets);
      const btc = mockAssets[0];
      // max_order_size is 100000000 atomic units = 0.001 BTC with precision 11
      // Testing with 0.01 BTC which should be above maximum
      const result = handler.validateOrderSize(0.01, btc); // Too large

      expect(result.valid).toBe(false);
      expect(result.error).toContain('above maximum');
    });

    it('should allow amount at minimum boundary', () => {
      const handler = createPrecisionHandler(mockAssets);
      const btc = mockAssets[0];
      // min_order_size is 1000 atomic units = 0.00000001 BTC (1e-8) with precision 11
      const result = handler.validateOrderSize(0.00000001, btc);

      expect(result.valid).toBe(true);
    });

    it('should allow amount at maximum boundary', () => {
      const handler = createPrecisionHandler(mockAssets);
      const btc = mockAssets[0];
      // max_order_size is 100000000 atomic units = 0.001 BTC with precision 11
      const result = handler.validateOrderSize(0.001, btc);

      expect(result.valid).toBe(true);
    });
  });

  describe('getOrderSizeLimits', () => {
    it('should return order limits for BTC', () => {
      const handler = createPrecisionHandler(mockAssets);
      const btc = mockAssets[0];
      const limits = handler.getOrderSizeLimits(btc);

      expect(limits.assetMinAmount).toBe(1000);
      expect(limits.assetMaxAmount).toBe(100000000);
      // With precision 11: 1000 / 10^11 = 0.00000001 (1e-8)
      expect(limits.assetMinDecimalAmount).toBeCloseTo(0.00000001, 11);
      // With precision 11: 100000000 / 10^11 = 0.001
      expect(limits.assetMaxDecimalAmount).toBeCloseTo(0.001, 11);
    });

    it('should return order limits for USDT', () => {
      const handler = createPrecisionHandler(mockAssets);
      const usdt = mockAssets[1];
      const limits = handler.getOrderSizeLimits(usdt);

      expect(limits.assetMinAmount).toBe(1000000);
      expect(limits.assetMaxAmount).toBe(1000000000);
      expect(limits.assetMinDecimalAmount).toBe(1);
      expect(limits.assetMaxDecimalAmount).toBe(1000);
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain precision through round-trip conversion (BTC)', () => {
      const handler = createPrecisionHandler(mockAssets);
      const original = 0.12345678901;

      const atomic = handler.toAssetAmount(original, 'BTC');
      const backToDecimal = handler.toAssetDecimalAmount(atomic, 'BTC');

      expect(backToDecimal).toBeCloseTo(original, 11);
    });

    it('should maintain precision through round-trip conversion (USDT)', () => {
      const handler = createPrecisionHandler(mockAssets);
      const original = 123.456789;

      const atomic = handler.toAssetAmount(original, 'rgb:usdt123');
      const backToDecimal = handler.toAssetDecimalAmount(atomic, 'rgb:usdt123');

      expect(backToDecimal).toBeCloseTo(original, 6);
    });
  });

  describe('edge cases', () => {
    it('should handle zero amount', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetAmount(0, 'BTC');

      expect(result).toBe(0);
    });

    it('should handle negative amounts', () => {
      const handler = createPrecisionHandler(mockAssets);

      // Should not throw, but validation will fail
      const atomic = handler.toAssetAmount(-1, 'BTC');
      expect(atomic).toBeLessThan(0);
    });

    it('should handle very large numbers', () => {
      const handler = createPrecisionHandler(mockAssets);
      const result = handler.toAssetAmount(1000000, 'rgb:usdt123');

      expect(result).toBe(1000000000000);
    });

    it('should throw error when initialized with empty assets', () => {
      expect(() => {
        createPrecisionHandler([]);
      }).toThrow();
    });
  });
});
