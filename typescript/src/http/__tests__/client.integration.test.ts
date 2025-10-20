import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';

import { HttpClient } from '../client';

interface RecordedRequest {
  url?: string;
  method?: string;
  headers?: IncomingMessage['headers'];
  body?: string;
}

describe('HttpClient integration', () => {
  let baseUrl: string;
  let client: HttpClient;
  let lastRequest: RecordedRequest = {};

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      lastRequest = {
        url: req.url || undefined,
        method: req.method || undefined,
        headers: req.headers,
        body: chunks.length ? Buffer.concat(chunks).toString('utf8') : undefined,
      };

      switch (req.url) {
        case '/success': {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          break;
        }

        case '/echo': {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ method: req.method, body: lastRequest.body ? JSON.parse(lastRequest.body) : null }));
          break;
        }

        case '/bad-request': {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ detail: 'invalid payload' }));
          break;
        }

        case '/invalid-json': {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('not-json');
          break;
        }

        case '/slow': {
          setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          }, 150);
          break;
        }

        default: {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ detail: 'not found' }));
        }
      }
    });
  });

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  beforeEach(() => {
    client = new HttpClient({ baseUrl, apiKey: 'test-key', timeoutMs: 100 });
    lastRequest = {};
  });

  it('performs GET requests with auth header', async () => {
    const response = await client.get('/success');

    expect(response).toEqual({ ok: true });
    expect(lastRequest.url).toBe('/success');
    expect(lastRequest.headers?.authorization).toBe('Bearer test-key');
  });

  it('performs POST requests and serialises body', async () => {
    const payload = { amount: 1_000, asset: 'BTC' };
    const response = await client.post('/echo', payload);

    expect(response).toEqual({ method: 'POST', body: payload });
    expect(lastRequest.headers?.['content-type']).toBe('application/json');
  });

  it('surface http errors with parsed message', async () => {
    await expect(client.get('/bad-request')).rejects.toThrow('HTTP 400: invalid payload');
  });

  it('fails when response is not json', async () => {
    await expect(client.get('/invalid-json')).rejects.toThrow('Invalid JSON response');
  });

  it('aborts requests when timeout elapses', async () => {
    await expect(client.get('/slow')).rejects.toThrow('Request timeout after 0.1 seconds');
  });
});

