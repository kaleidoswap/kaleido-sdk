import { WebSocketError } from '../types/exceptions';
import WebSocket, { MessageEvent as WSMessageEvent } from 'ws';

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
  private pingTimer: number | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private isConnecting = false;

  /**
   * Creates a new WebSocket client instance
   * @param config - Configuration for the client
   */
  constructor(config: WebSocketConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '').replace(/^http/, 'ws');
    //this.apiKey = config.apiKey;
    this.pingInterval = config.pingInterval || 30000;
    this.pingTimeout = config.pingTimeout || 5000;
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
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

  /**
   * Establishes a WebSocket connection
   * @throws {WebSocketError} If connection fails
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.baseUrl);

      await new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          reject(new WebSocketError('WebSocket instance is null'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new WebSocketError('Connection timeout'));
        }, this.pingTimeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.startPing();
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(new WebSocketError(`Connection error: ${error}`));
        };

        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
      });
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Starts sending periodic ping messages
   */
  private startPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }

    this.pingTimer = window.setInterval(() => {
      this.send({ action: 'ping' });
    }, this.pingInterval);
  }

  /**
   * Handles incoming WebSocket messages
   * @param event - Message event
   */
  private handleMessage(event: WSMessageEvent): void {
    try {
      // Handle both string and Buffer data types
      const data = typeof event.data === 'string' ? event.data : event.data.toString('utf8');
      const message: WebSocketMessage = JSON.parse(data);
      const handlers = this.messageHandlers.get(message.action);
      
      if (handlers) {
        handlers.forEach(handler => handler(message.data));
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  /**
   * Handles WebSocket connection close
   */
  private handleClose(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  /**
   * Closes the WebSocket connection
   */
  async disconnect(): Promise<void> {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Sends a message over the WebSocket connection
   * @param message - Message to send
   * @throws {WebSocketError} If not connected
   */
  async send(message: WebSocketMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Registers a handler for a specific message action
   * @param action - Message action to handle
   * @param handler - Handler function
   */
  on(action: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(action)) {
      this.messageHandlers.set(action, new Set());
    }
    this.messageHandlers.get(action)?.add(handler);
  }

  /**
   * Removes a handler for a specific message action
   * @param action - Message action
   * @param handler - Handler function to remove
   */
  off(action: string, handler: MessageHandler): void {
    this.messageHandlers.get(action)?.delete(handler);
  }

  /**
   * Subscribes to updates for a trading pair
   * @param pairId - Trading pair identifier
   * @throws {WebSocketError} If not connected
   */
  async subscribe(pairId: string): Promise<void> {
    await this.send({
      action: 'subscribe',
      data: { pairId }
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
      data: { pairId }
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