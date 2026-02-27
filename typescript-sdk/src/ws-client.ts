/**
 * WebSocket Client for Real-time Updates
 *
 * Provides WebSocket connectivity with automatic reconnection
 * and event-based message handling.
 *
 * Protocol matches kaleidoswap-maker WebSocket implementation
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import type {
    WebSocketMessage,
    WebSocketResponse,
    QuoteRequest,
    QuoteResponse,
} from './ws-types.js';

export interface WSClientConfig {
    url: string;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    pingInterval?: number;
    /**
     * Optional client/user UUID for the WebSocket path (.../ws/<userId>).
     * If not provided, a UUID is generated automatically.
     */
    userId?: string;
}

export class WSClient extends EventEmitter {
    private ws?: WebSocket;
    private reconnectAttempts = 0;
    private maxReconnectAttempts: number;
    private reconnectDelay: number;
    private pingInterval: number;
    private pingTimer?: NodeJS.Timeout;
    private url: string;
    private _clientId: string;
    private isConnecting = false;
    private isClosed = false;

    constructor(config: WSClientConfig) {
        super();
        this._clientId = config.userId ?? randomUUID();
        this.url = WSClient.buildUrlWithClientId(config.url, this._clientId);
        this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
        this.reconnectDelay = config.reconnectDelay ?? 1000;
        this.pingInterval = config.pingInterval ?? 30000; // 30 seconds
    }

    /**
     * Client UUID used for the WebSocket path (user-provided or auto-generated).
     */
    get clientId(): string {
        return this._clientId;
    }

    /**
     * Append clientId as path segment: .../ws/{clientId}
     */
    private static buildUrlWithClientId(url: string, clientId: string): string {
        // Remove trailing slash, then append clientId
        return url.replace(/\/$/, '') + '/' + clientId;
    }

    /**
     * Connect to WebSocket server
     */
    async connect(): Promise<void> {
        if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.isConnecting = true;
        this.isClosed = false;

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.startPing();
                    this.emit('connected');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WebSocketResponse = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        this.emit('error', new Error('Failed to parse message'));
                    }
                };

                this.ws.onerror = (_error) => {
                    this.isConnecting = false;
                    // Don't emit error here - let it be handled by onclose
                };

                this.ws.onclose = () => {
                    this.isConnecting = false;
                    this.stopPing();
                    this.emit('disconnected');

                    if (!this.isClosed) {
                        this.attemptReconnect();
                    }
                };

                // Timeout for connection
                setTimeout(() => {
                    if (this.isConnecting) {
                        this.isConnecting = false;
                        this.ws?.close();
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);
            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(message: WebSocketResponse): void {
        switch (message.action) {
            case 'quote_response':
                this.emit('quoteResponse', message.data as QuoteResponse);
                break;
            case 'connection_established':
                this.emit('connectionEstablished', message.data);
                break;
            case 'pong':
                this.emit('pong', message);
                break;
            case 'error':
                this.emit('error', new Error(message.error || 'Unknown error'));
                break;
            default:
                // Unknown message type
                break;
        }
    }

    /**
     * Request a quote
     */
    requestQuote(request: Omit<QuoteRequest, 'action'>): void {
        this.send({
            action: 'quote_request',
            ...request,
            timestamp: Date.now(),
        } as WebSocketMessage);
    }

    /**
     * Send ping to keep connection alive
     */
    ping(): void {
        this.send({
            action: 'ping',
            timestamp: Date.now(),
        } as WebSocketMessage);
    }

    /**
     * Send message to WebSocket server
     */
    private send(message: WebSocketMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            this.emit('error', new Error('WebSocket not connected'));
        }
    }

    /**
     * Start ping/pong to keep connection alive
     */
    private startPing(): void {
        this.stopPing();
        this.pingTimer = setInterval(() => {
            this.ping();
        }, this.pingInterval);
    }

    /**
     * Stop ping timer
     */
    private stopPing(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = undefined;
        }
    }

    /**
     * Attempt to reconnect after disconnect
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            this.reconnectAttempts++;

            setTimeout(() => {
                this.emit('reconnecting', this.reconnectAttempts);
                this.connect().catch(() => {
                    // Will retry in next attempt
                });
            }, delay);
        } else {
            this.emit('maxReconnectExceeded');
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        this.isClosed = true;
        this.stopPing();
        this.ws?.close();
        this.ws = undefined;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}
