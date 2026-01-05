/**
 * Utility Functions Tests
 * Tests for helper functions like unit conversions
 */

import { toSmallestUnits, toDisplayUnits, getVersion, getSdkName } from '../pkg/kaleidoswap_sdk';

describe('Utility Functions', () => {

  describe('toSmallestUnits', () => {
    it('should convert BTC to satoshis (8 decimals)', () => {
      const result = toSmallestUnits(1.0, 8);
      expect(result).toBe(BigInt(100_000_000));
    });

    it('should convert USDT to smallest units (6 decimals)', () => {
      const result = toSmallestUnits(1.0, 6);
      expect(result).toBe(BigInt(1_000_000));
    });

    it('should handle fractional amounts', () => {
      const result = toSmallestUnits(0.5, 8);
      expect(result).toBe(BigInt(50_000_000));
    });

    it('should handle very small amounts', () => {
      const result = toSmallestUnits(0.00000001, 8);
      expect(result).toBe(BigInt(1));
    });

    it('should handle zero', () => {
      const result = toSmallestUnits(0, 8);
      expect(result).toBe(BigInt(0));
    });

    it('should handle large amounts', () => {
      const result = toSmallestUnits(21_000_000, 8);
      expect(result).toBe(BigInt(2_100_000_000_000_000));
    });

    it('should handle different precision values', () => {
      expect(toSmallestUnits(1, 0)).toBe(BigInt(1));
      expect(toSmallestUnits(1, 2)).toBe(BigInt(100));
      expect(toSmallestUnits(1, 18)).toBe(BigInt(1_000_000_000_000_000_000));
    });
  });

  describe('toDisplayUnits', () => {
    it('should convert satoshis to BTC (8 decimals)', () => {
      const result = toDisplayUnits(BigInt(100_000_000), 8);
      expect(result).toBe(1.0);
    });

    it('should convert smallest units to USDT (6 decimals)', () => {
      const result = toDisplayUnits(BigInt(1_000_000), 6);
      expect(result).toBe(1.0);
    });

    it('should handle fractional results', () => {
      const result = toDisplayUnits(BigInt(50_000_000), 8);
      expect(result).toBe(0.5);
    });

    it('should handle very small amounts', () => {
      const result = toDisplayUnits(BigInt(1), 8);
      expect(result).toBe(0.00000001);
    });

    it('should handle zero', () => {
      const result = toDisplayUnits(BigInt(0), 8);
      expect(result).toBe(0);
    });

    it('should handle large amounts', () => {
      const result = toDisplayUnits(BigInt(2_100_000_000_000_000), 8);
      expect(result).toBe(21_000_000);
    });

    it('should be inverse of toSmallestUnits', () => {
      const original = 1.5;
      const precision = 8;

      const smallest = toSmallestUnits(original, precision);
      const back = toDisplayUnits(smallest, precision);

      expect(back).toBeCloseTo(original, precision);
    });
  });

  describe('getVersion', () => {
    it('should return version string', () => {
      const version = getVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });

    it('should return semantic version format', () => {
      const version = getVersion();

      // Should match X.Y.Z format
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should start with 0. (pre-1.0)', () => {
      const version = getVersion();
      expect(version).toMatch(/^0\./);
    });
  });

  describe('getSdkName', () => {
    it('should return SDK name', () => {
      const name = getSdkName();

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
    });

    it('should return "kaleidoswap-sdk"', () => {
      const name = getSdkName();
      expect(name).toBe('kaleidoswap-sdk');
    });
  });
});
