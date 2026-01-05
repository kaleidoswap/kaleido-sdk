/**
 * Jest test setup for WASM bindings
 * This file is loaded before each test suite
 */

// Polyfill for TextEncoder/TextDecoder in Node.js environment
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock fetch for Node.js environment (for tests that don't need real HTTP)
// Mock fetch removed to allow real network requests
// global.fetch is available in Node.js 18+

// Set default test URL to localhost if not provided
if (!process.env.TEST_API_URL) {
  process.env.TEST_API_URL = 'http://localhost:8000';
}
if (!process.env.TEST_NODE_URL) {
  process.env.TEST_NODE_URL = 'http://localhost:3001';
}

// Set test timeout (WASM initialization can take time)
jest.setTimeout(10000);

// Clear all mocks after each test
// Polyfill for BigInt serialization in Jest
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};


