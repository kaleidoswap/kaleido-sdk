/**
 * Error Handling Tests
 * Tests for error scenarios and error message quality
 * 
 * Note: Network error tests use a short timeout config to avoid long waits.
 */

import { KaleidoClient, KaleidoConfig } from '../pkg/kaleidoswap_sdk';

// Skip these tests if no test server - they require specific setup
const SKIP_ERROR_TESTS = process.env.SKIP_ERROR_TESTS === 'true';
const describeErrors = SKIP_ERROR_TESTS ? describe.skip : describe;

describeErrors('Error Handling', () => {
  describe('Memory Safety', () => {
    it('should throw on double free', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const testClient = new KaleidoClient(config);

      testClient.free();

      // Second free should throw null pointer error
      expect(() => {
        testClient.free();
      }).toThrow();
    });

    it('should handle errors after disposal', () => {
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      const testClient = new KaleidoClient(config);

      testClient.free();

      // Operations after free should fail immediately (synchronously)
      expect(() => testClient.listAssets()).toThrow();
    });
  });

  describe('Configuration Validation', () => {
    it('should create client with valid config', () => {
      const config = KaleidoConfig.withDefaults('https://api.kaleidoswap.com');
      expect(config).toBeDefined();

      const client = new KaleidoClient(config);
      expect(client).toBeDefined();
      client.free();
    });

    it('should allow setting optional parameters', () => {
      const config = new KaleidoConfig(
        'https://api.kaleidoswap.com',
        'https://node.kaleidoswap.com',
        'test-api-key',
        30,
        3,
        60
      );
      expect(config).toBeDefined();
      expect(config.getBaseUrl()).toBe('https://api.kaleidoswap.com');
    });
  });
});

// Network error tests are skipped by default as they require network access
// and may timeout in CI environments. Run manually with SKIP_ERROR_TESTS=false
describe.skip('Network Error Handling (Manual)', () => {
  let client: KaleidoClient;

  beforeAll(() => {
    // Use very short timeout to fail fast on network errors
    const config = new KaleidoConfig(
      'https://api.invalid-domain-that-does-not-exist.com',
      null,
      null,
      2, // 2 second timeout
      0, // no retries
      60
    );
    client = new KaleidoClient(config);
  });

  afterAll(() => {
    if (client) {
      client.free();
    }
  });

  it('should handle connection errors gracefully', async () => {
    try {
      await client.listAssets();
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toBeDefined();
    }
  }, 15000); // 15s timeout for this test
});
