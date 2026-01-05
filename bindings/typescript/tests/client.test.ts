/**
 * Client Tests
 * Tests for KaleidoClient initialization and basic methods
 */

import { KaleidoClient, KaleidoConfig } from '../pkg/kaleidoswap_sdk';

describe('KaleidoClient', () => {

  describe('initialization', () => {
    it('should create client with valid config', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const client = new KaleidoClient(config);

      expect(client).toBeDefined();
    });

    it('should accept config with node URL', () => {
      const config = new KaleidoConfig(
        'https://api.test.com',
        'https://node.test.com',
        null,
        30.0,
        3,
        60
      );

      const client = new KaleidoClient(config);
      expect(client).toBeDefined();
      expect(client.hasNode()).toBe(true);
    });

    it('should not have node by default', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const client = new KaleidoClient(config);

      expect(client.hasNode()).toBe(false);
    });
  });

  describe('hasNode', () => {
    it('should return false when no node URL provided', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const client = new KaleidoClient(config);

      expect(client.hasNode()).toBe(false);
    });

    it('should return true when node URL provided', () => {
      const config = new KaleidoConfig(
        'https://api.test.com',
        'https://node.test.com',
        null,
        30.0,
        3,
        60
      );
      const client = new KaleidoClient(config);

      expect(client.hasNode()).toBe(true);
    });
  });

  describe('disposal', () => {
    it('should dispose client without errors', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const client = new KaleidoClient(config);

      expect(() => {
        client.free();
      }).not.toThrow();
    });

    it('should support Symbol.dispose', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const client = new KaleidoClient(config);

      expect(() => {
        client[Symbol.dispose]();
      }).not.toThrow();
    });
  });
});

