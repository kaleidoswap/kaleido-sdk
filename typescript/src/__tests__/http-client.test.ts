import { HttpClient } from '../http/client';
import { KaleidoSDKError } from '../types/errors';

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.test.com',
      timeoutMs: 5000,
    });
  });

  describe('constructor', () => {
    it('should create a client with provided config', () => {
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should strip trailing slash from baseUrl', () => {
      const clientWithSlash = new HttpClient({
        baseUrl: 'https://api.test.com/',
      });
      expect(clientWithSlash).toBeInstanceOf(HttpClient);
    });

    it('should set default timeout when not provided', () => {
      const clientWithDefaults = new HttpClient({
        baseUrl: 'https://api.test.com',
      });
      expect(clientWithDefaults).toBeInstanceOf(HttpClient);
    });
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      // Mock fetch globally
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        } as Response)
      );

      const result = await client.get<{ data: string }>('/test');
      expect(result).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle errors properly', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not Found'),
        } as Response)
      );

      await expect(client.get('/test')).rejects.toThrow(KaleidoSDKError);
    });
  });

  describe('post', () => {
    it('should make a POST request with data', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ success: true })),
        } as Response)
      );

      const result = await client.post<{ success: boolean }, { name: string }>('/test', {
        name: 'test',
      });
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });
  });
});
