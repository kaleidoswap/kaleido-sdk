import { ErrorFactory } from '../types/errorFactory';
import WebSocket, { MessageEvent as WSMessageEvent } from 'ws';

// Debug logging helper
const debug = (...args: unknown[]): void => {
  if (process.env.DEBUG_WS) {
    // eslint-disable-next-line no-console
    console.log('[WebSocket]', ...(args as string[]));
  }
};

/**
 * Configuration for the WebSocket client
 */
export interface WebSocketConfig {
  /** Base URL for WebSocket connection */
  baseUrl: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Interval between ping messages in milliseconds */
  pingInterval?: number;
  /** Timeout for ping responses in milliseconds */
  pingTimeout?: number;
  /** Interval between reconnection attempts in milliseconds */
  reconnectInterval?: number;
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  /** Message action/type */
  action: string;
  /** Optional message data */
  data?: any;
}

/**
 * Function type for handling WebSocket messages
 */
export type MessageHandler = (data: any) => void;

/**
 * WebSocket client for real-time updates from the KaleidoSwap API
 */
export class WebSocketClient {
  private readonly baseUrl: string;
  //private readonly apiKey?: string;
  private readonly pingInterval: number;
  private readonly pingTimeout: number;
  private readonly reconnectInterval: number;
  private readonly maxReconnectAttempts: number;

  private ws: WebSocket | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private isConnecting = false;
  private readonly headers: Record<string, string>;

  /**
   * Checks if the WebSocket is connected
   * @returns boolean indicating if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Creates a new WebSocket client instance
   * @param config - Configuration for the client
   */
  constructor(config: WebSocketConfig) {
    this.baseUrl = config.baseUrl.replace(/^http/, 'ws');
    this.pingInterval = config.pingInterval || 30000; // 30 seconds
    this.pingTimeout = config.pingTimeout || 10000; // 10 seconds
    this.reconnectInterval = config.reconnectInterval || 5000; // 5 seconds
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;

    // Set up headers
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.headers = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
    };

    // Add API key if provided
    if (config.apiKey) {
      this.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    if (process.env.DEBUG_WS) {
      debug(`Initializing WebSocket client for ${this.baseUrl}`);
      if (config.apiKey) {
        debug('Using API key authentication');
      }
    }
  }

  /**
   * Gets the headers for WebSocket connection
   * @returns Object containing connection headers
   */
  //private getHeaders(): Record<string, string> {
  //  const headers: Record<string, string> = {};
  //  if (this.apiKey) {
  //    headers['Authorization'] = `Bearer ${this.apiKey}`;
  //  }
  //  return headers;
  //}

  private logConnectionState(event: string) {
    if (process.env.DEBUG_WS) {
      const state = this.ws?.readyState;
      let stateStr = 'UNKNOWN';
      switch (state) {
        case WebSocket.CONNECTING:
          stateStr = 'CONNECTING';
          break;
        case WebSocket.OPEN:
          stateStr = 'OPEN';
          break;
        case WebSocket.CLOSING:
          stateStr = 'CLOSING';
          break;
        case WebSocket.CLOSED:
          stateStr = 'CLOSED';
          break;
      }
      debug(`${event} - State: ${stateStr}`);
    }
  }

  /**
   * Establishes a WebSocket connection
   * @throws {WebSocketError} If connection fails
   */
  async connect(): Promise<void> {
    if (this.isConnected() || this.isConnecting) {
      debug('Connection already in progress or established');
      return;
    }

    this.isConnecting = true;

    // For ws library, we need to handle headers differently
    const wsOptions: WebSocket.ClientOptions = {};

    // Add headers if needed (some WebSocket servers support this)
    if (Object.keys(this.headers).length > 0) {
      wsOptions.headers = this.headers;
    }

    // If using an API key, add it to the URL as a query parameter
    // This is a common pattern when headers aren't supported
    let wsUrl = this.baseUrl;
    if (this.headers['Authorization']) {
      const url = new URL(wsUrl);
      url.searchParams.append('token', this.headers['Authorization'].replace('Bearer ', ''));
      wsUrl = url.toString();
    }

    debug(`Connecting to WebSocket: ${wsUrl}`);
    if (process.env.DEBUG_WS) {
      debug('Using options:', JSON.stringify(wsOptions, null, 2));
    }

    try {
      this.ws = new WebSocket(wsUrl, wsOptions);
      this.logConnectionState('After WebSocket creation');

      await new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          const error = ErrorFactory.fromWebSocketError(
            new Error('WebSocket instance is null'),
            'connection initialization'
          );
          debug(error.message);
          reject(error);
          return;
        }

        const timeout = setTimeout(() => {
          const error = ErrorFactory.createTimeoutError('WebSocket connection', this.pingTimeout, {
            wsUrl,
          });
          debug(error.message);
          reject(error);
        }, this.pingTimeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.logConnectionState('onopen');
          this.startPing();
          resolve();
        };

        this.ws.onerror = event => {
          clearTimeout(timeout);
          const errorMessage = event.message || 'Unknown WebSocket error';
          const error = ErrorFactory.fromWebSocketError(
            new Error(errorMessage),
            'connection error'
          );
          debug('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
      });
    } catch (error) {
      this.isConnecting = false;
      debug('Connection failed:', error);
      throw error;
    } finally {
      if (!this.isConnected()) {
        this.isConnecting = false;
      }
    }
  }

  /**
   * Starts sending periodic ping messages
   */
  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, this.pingInterval) as unknown as NodeJS.Timeout;
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Handles incoming WebSocket messages
   * @param event - Message event
   */
  private handleMessage(event: WSMessageEvent): void {
    try {
      let data: string;
      if (typeof event.data === 'string') {
        data = event.data;
      } else if (event.data instanceof ArrayBuffer) {
        data = new TextDecoder().decode(event.data);
      } else if (event.data instanceof Blob) {
        // For Blob, we'd need async handling, but for WebSocket messages it should be string
        data = String(event.data);
      } else {
        data = String(event.data);
      }
      if (process.env.DEBUG_WS) {
        debug('Received message:', data);
      }

      const message = JSON.parse(data) as { action: string; data: unknown };
      this.emit(message.action, message.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debug('Error handling message:', errorMessage);
      this.emit('error', { action: 'message_parse_error', error: errorMessage });
    }
  }

  /**
   * Handles WebSocket connection close
   */
  private handleClose(event: { code: number; reason: string }): void {
    this.logConnectionState('onclose');
    debug(`Connection closed: ${event.code} ${event.reason || 'No reason provided'}`);

    this.stopPing();

    // Only attempt reconnect if this was an unexpected closure
    if (event.code !== 1000) {
      // 1000 is normal closure
      this.attemptReconnect();
    } else {
      debug('Normal WebSocket closure, not reconnecting');
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = ErrorFactory.fromWebSocketError(
        new Error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`),
        'reconnection failure'
      );
      debug(error.message);
      this.emit('error', { action: 'max_reconnect_attempts', error: error.message });
      return;
    }

    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds between retries
    );

    debug(
      `Attempting to reconnect (${this.reconnectAttempts + 1}/${
        this.maxReconnectAttempts
      }) in ${delay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        debug('Reconnection attempt failed:', error);
      });
    }, delay);
  }

  /**
   * Closes the WebSocket connection
   */
  public async disconnect(code = 1000, reason?: string): Promise<void> {
    debug(`Disconnecting${reason ? ` (${reason})` : ''}`);

    this.stopPing();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      return new Promise(resolve => {
        if (this.ws) {
          this.ws.once('close', () => {
            debug('Disconnected successfully');
            this.ws = null;
            resolve();
          });

          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.close(code, reason);
          } else {
            this.ws.terminate();
            this.ws = null;
            resolve();
          }
        } else {
          resolve();
        }
      });
    }

    return Promise.resolve();
  }

  /**
   * Sends a message over the WebSocket connection
   * @param message - Message to send
   * @throws {WebSocketError} If not connected
   */
  public async send(message: WebSocketMessage): Promise<void> {
    if (!this.isConnected()) {
      debug('Not connected, attempting to connect...');
      await this.connect();
    }

    if (!this.ws) {
      const error = ErrorFactory.fromWebSocketError(
        new Error('WebSocket is not connected'),
        'send message'
      );
      debug('Send failed:', error);
      throw error;
    }

    try {
      const messageStr = JSON.stringify(message);
      if (process.env.DEBUG_WS) {
        debug('Sending message:', messageStr);
      }
      this.ws.send(messageStr);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debug('Error sending message:', errorMessage);
      throw ErrorFactory.fromWebSocketError(
        error instanceof Error ? error : new Error(errorMessage),
        'send message'
      );
    }
  }

  /**
   * Registers a handler for a specific message action
   * @param action - Message action to handle
   * @param handler - Handler function
   */
  public on(event: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    const handlers = this.messageHandlers.get(event)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(event);
      }
    };
  }

  /**
   * Removes a handler for a specific message action
   * @param action - Message action
   * @param handler - Handler function to remove
   */
  public off(event: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(event);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Subscribes to updates for a trading pair
   * @param pairId - Trading pair identifier
   * @throws {WebSocketError} If not connected
   */
  async subscribe(pairId: string): Promise<void> {
    await this.send({
      action: 'subscribe',
      data: { pairId },
    });
  }

  /**
   * Unsubscribes from updates for a trading pair
   * @param pairId - Trading pair identifier
   * @throws {WebSocketError} If not connected
   */
  async unsubscribe(pairId: string): Promise<void> {
    await this.send({
      action: 'unsubscribe',
      data: { pairId },
    });
  }

  /**
   * Gets the current WebSocket connection state
   * @returns The current WebSocket ready state or undefined if not connected
   */
  public getConnectionState(): number | undefined {
    return this.ws?.readyState;
  }
}
