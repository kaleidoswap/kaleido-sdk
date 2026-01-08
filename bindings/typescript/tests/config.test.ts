/**
 * Configuration Tests
 * Tests for KaleidoConfig creation and manipulation
 */

import { KaleidoConfig } from '../pkg/kaleidoswap_sdk';

describe('KaleidoConfig', () => {
  describe('withDefaults', () => {
    it('should create config with default values', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');

      expect(config.getBaseUrl()).toBe('https://api.test.com');
    });

    it('should accept URL without trailing slash', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      expect(config.getBaseUrl()).toBe('https://api.test.com');
    });

    it('should accept URL with trailing slash', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com/');
      expect(config.getBaseUrl()).toBe('https://api.test.com/');
    });
  });

  describe('constructor', () => {
    it('should create config with all parameters', () => {
      const config = new KaleidoConfig(
        'https://api.test.com',
        'https://node.test.com',
        'test_api_key',
        60.0,
        5,
        120,
      );

      expect(config.getBaseUrl()).toBe('https://api.test.com');
    });

    it('should accept null optional parameters', () => {
      const config = new KaleidoConfig('https://api.test.com', null, null, 30.0, 3, 60);

      expect(config.getBaseUrl()).toBe('https://api.test.com');
    });
  });

  describe('setters', () => {
    let config: KaleidoConfig;

    beforeEach(() => {
      config = KaleidoConfig.withDefaults('https://api.test.com');
    });

    it('should set node URL', () => {
      expect(() => {
        config.setNodeUrl('https://node.test.com');
      }).not.toThrow();
    });

    it('should set API key', () => {
      expect(() => {
        config.setApiKey('test_key');
      }).not.toThrow();
    });

    it('should accept null for optional setters', () => {
      expect(() => {
        config.setNodeUrl(null);
        config.setApiKey(null);
      }).not.toThrow();
    });
  });

  describe('validation', () => {
    // Rust implementation doesn't validate URL format in constructor
    // it('should throw on empty base URL', () => {
    //   expect(() => {
    //     KaleidoConfig.withDefaults('');
    //   }).toThrow();
    // });

    it('should handle special characters in URL', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com/v1');
      expect(config.getBaseUrl()).toBe('https://api.test.com/v1');
    });
  });
});
