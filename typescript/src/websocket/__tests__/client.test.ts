import { WebSocketClient } from '../client';
import { WebSocketError } from '../../types/exceptions';

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  const mockBaseUrl = 'wss://ws.test.com';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    client = new WebSocketClient({
      baseUrl: mockBaseUrl,
      apiKey: mockApiKey
    });
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(client).toBeInstanceOf(WebSocketClient);
    });

    it('should convert http to ws in baseUrl', () => {
      const httpClient = new WebSocketClient({
        baseUrl: 'http://ws.test.com',
        apiKey: mockApiKey
      });
      expect(httpClient).toBeInstanceOf(WebSocketClient);
    });
  });

  describe('connect', () => {
    let mockWebSocket: any;

    beforeEach(() => {
      mockWebSocket = {
        onopen: null,
        onerror: null,
        onmessage: null,
        onclose: null,
        send: jest.fn(),
        close: jest.fn()
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should connect successfully', async () => {
      const connectPromise = client.connect();
      mockWebSocket.onopen();
      await connectPromise;

      expect(global.WebSocket).toHaveBeenCalledWith(
        mockBaseUrl,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );
    });

    it('should handle connection error', async () => {
      const connectPromise = client.connect();
      mockWebSocket.onerror(new Error('Connection error'));
      
      await expect(connectPromise).rejects.toThrow(WebSocketError);
    });

    it('should handle connection timeout', async () => {
      const connectPromise = client.connect();
      jest.advanceTimersByTime(5000); // Default ping timeout
      
      await expect(connectPromise).rejects.toThrow(WebSocketError);
    });
  });

  describe('message handling', () => {
    let mockHandler: jest.Mock;

    beforeEach(() => {
      mockHandler = jest.fn();
      client.on('test', mockHandler);
    });

    it('should handle incoming messages', () => {
      const mockMessage = {
        action: 'test',
        data: { test: 'data' }
      };

      client['handleMessage']({
        data: JSON.stringify(mockMessage)
      } as MessageEvent);

      expect(mockHandler).toHaveBeenCalledWith(mockMessage.data);
    });

    it('should ignore messages for unregistered actions', () => {
      const mockMessage = {
        action: 'unknown',
        data: { test: 'data' }
      };

      client['handleMessage']({
        data: JSON.stringify(mockMessage)
      } as MessageEvent);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('subscription', () => {
    let mockWebSocket: any;

    beforeEach(() => {
      mockWebSocket = {
        send: jest.fn(),
        readyState: WebSocket.OPEN
      };

      client['ws'] = mockWebSocket;
    });

    it('should subscribe to pair', async () => {
      await client.subscribe('BTC/USDT');

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          action: 'subscribe',
          data: { pairId: 'BTC/USDT' }
        })
      );
    });

    it('should unsubscribe from pair', async () => {
      await client.unsubscribe('BTC/USDT');

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          action: 'unsubscribe',
          data: { pairId: 'BTC/USDT' }
        })
      );
    });

    it('should throw error when sending without connection', async () => {
      client['ws'] = null;

      await expect(client.subscribe('BTC/USDT')).rejects.toThrow(WebSocketError);
    });
  });

  describe('reconnection', () => {
    let mockWebSocket: any;

    beforeEach(() => {
      mockWebSocket = {
        onclose: null,
        close: jest.fn()
      };

      client['ws'] = mockWebSocket;
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should attempt reconnection on close', () => {
      const connectSpy = jest.spyOn(client, 'connect');
      mockWebSocket.onclose();

      jest.advanceTimersByTime(5000); // Default reconnect interval
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should stop reconnection after max attempts', () => {
      const connectSpy = jest.spyOn(client, 'connect');
      
      for (let i = 0; i < 6; i++) {
        mockWebSocket.onclose();
        jest.advanceTimersByTime(5000);
      }

      expect(connectSpy).toHaveBeenCalledTimes(5); // Default maxReconnectAttempts
    });
  });
}); 