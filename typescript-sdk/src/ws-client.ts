/**
 * WebSocket Client
 */

import { createLogger, LogState } from './logging.js';
import type { ComponentLogger } from './logging.js';
import type {
    WebSocketMessage,
    WebSocketResponse,
    QuoteRequest,
    QuoteResponse,
} from './types/ws.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => void;

/** Minimal cross-platform event emitter – no Node.js 'events' module required. */
class MiniEmitter {
    private _events: Map<string, Listener[]> = new Map();

    on(event: string, listener: Listener): this {
        const list = this._events.get(event);
        if (list) {
            list.push(listener);
        } else {
            this._events.set(event, [listener]);
        }
        return this;
    }

    off(event: string, listener: Listener): this {
        const list = this._events.get(event);
        if (list) {
            const idx = list.indexOf(listener);
            if (idx !== -1) list.splice(idx, 1);
        }
        return this;
    }

    emit(event: string, ...args: unknown[]): boolean {
        const list = this._events.get(event);
        if (!list || list.length === 0) return false;
        for (const fn of list.slice()) fn(...args);
        return true;
    }

    listenerCount(event: string): number {
        return this._events.get(event)?.length ?? 0;
    }

    removeAllListeners(event?: string): this {
        if (event !== undefined) {
            this._events.delete(event);
        } else {
            this._events.clear();
        }
        return this;
    }
}

export interface WSClientConfig {
    url: string;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    pingInterval?: number;
}

export class WSClient extends MiniEmitter {
    private ws?: WebSocket;
    private reconnectAttempts = 0;
    private maxReconnectAttempts: number;
    private reconnectDelay: number;
    private pingInterval: number;
    private pingTimer?: ReturnType<typeof setInterval>;
    private url: string;
    private _clientId: string;
    private isConnecting = false;
    private isClosed = false;
    private readonly _log: ComponentLogger;

    constructor(config: WSClientConfig, logState: LogState = new LogState()) {
        super();
        const resolvedTarget = WSClient.resolveConnectionTarget(config.url);
        this._clientId = resolvedTarget.clientId;
        this.url = resolvedTarget.url;
        this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
        this.reconnectDelay = config.reconnectDelay ?? 1000;
        this.pingInterval = config.pingInterval ?? 30000; // 30 seconds
        this._log = createLogger('ws', logState);
    }

    get clientId(): string {
        return this._clientId;
    }

    /**
     * Resolve a WebSocket URL and clientId.
     *
     * Accepts either:
     * - a base endpoint ending in `/ws`, in which case a clientId is appended
     * - a fully qualified endpoint ending in `/ws/{clientId}`, in which case the
     *   trailing segment is treated as the clientId
     */
    private static resolveConnectionTarget(url: string): { url: string; clientId: string } {
        const parsed = new URL(url);
        const segments = parsed.pathname.split('/').filter(Boolean);
        const lastSegment = segments.at(-1);
        const hasEmbeddedClientId = lastSegment !== undefined && lastSegment !== 'ws';

        if (hasEmbeddedClientId) {
            return {
                url: parsed.toString(),
                clientId: lastSegment,
            };
        }

        const generatedClientId = globalThis.crypto.randomUUID();
        segments.push(generatedClientId);
        parsed.pathname = '/' + segments.join('/');
        return { url: parsed.toString(), clientId: generatedClientId };
    }

    async connect(): Promise<void> {
        if (this.isConnecting || this.ws?.readyState === 1 /* WebSocket.OPEN */) {
            return;
        }

        this.isConnecting = true;
        this.isClosed = false;

        this._log.debug('Connecting to %s (clientId=%s)', this.url, this._clientId);

        return new Promise((resolve, reject) => {
            let settled = false;
            let opened = false;

            const settle = (handler: () => void) => {
                if (settled) {
                    return;
                }

                settled = true;
                this.isConnecting = false;
                clearTimeout(connectionTimer);
                handler();
            };

            const connectionTimer = setTimeout(() => {
                if (!opened) {
                    this.ws?.close();
                    this._log.error('Connection timeout: %s', this.url);
                    settle(() => reject(new Error('Connection timeout')));
                }
            }, 10000);

            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    opened = true;
                    this.reconnectAttempts = 0;
                    this.startPing();
                    this._log.info('Connected to %s (clientId=%s)', this.url, this._clientId);
                    settle(() => {
                        this.emit('connected');
                        resolve();
                    });
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WebSocketResponse = JSON.parse(event.data);
                        this._log.debug(
                            'Message received: action=%s',
                            (message as { action?: string }).action ?? '<unknown>',
                        );
                        this.handleMessage(message);
                    } catch (error) {
                        this._log.warn('Message parse error (raw: %s)', event.data);
                        this.emitError(new Error('Failed to parse message'));
                    }
                };

                this.ws.onerror = (_error) => {
                    if (!opened) {
                        this._log.warn('Connection error before open: %s', this.url);
                    }
                };

                this.ws.onclose = (event) => {
                    this.stopPing();
                    this._log.info('Disconnected from %s (clientId=%s)', this.url, this._clientId);
                    this.emit('disconnected');

                    if (!opened) {
                        const reason =
                            typeof event.reason === 'string' && event.reason
                                ? `: ${event.reason}`
                                : '';
                        settle(() =>
                            reject(new Error(`Connection closed before opening${reason}`)),
                        );
                        return;
                    }

                    if (!this.isClosed) {
                        this.attemptReconnect();
                    }
                };
            } catch (error) {
                this._log.error('Connection failed: %s — %s', this.url, error);
                settle(() => reject(error));
            }
        });
    }

    private handleMessage(message: WebSocketResponse): void {
        switch (message.action) {
            case 'quote_response': {
                const payload = (message.data ?? message) as Partial<QuoteResponse>;
                const fee = payload.fee as
                    | (QuoteResponse['fee'] & { fee_asset_precision?: number })
                    | undefined;
                this.emit('quoteResponse', {
                    action: 'quote_response',
                    ...payload,
                    fee: fee
                        ? {
                              ...fee,
                              fee_precision: fee.fee_precision ?? fee.fee_asset_precision ?? 0,
                          }
                        : payload.fee,
                } as QuoteResponse);
                break;
            }
            case 'connection_established':
                this.emit('connectionEstablished', message.data);
                break;
            case 'pong':
                this._log.debug('Pong received (clientId=%s)', this._clientId);
                this.emit('pong', message);
                break;
            case 'error': {
                const errMsg = message.error || 'Unknown error';
                this._log.warn('Server error: %s', errMsg);
                this.emitError(new Error(errMsg));
                break;
            }
            default:
                this._log.debug('Unknown message action: %s', message.action);
                break;
        }
    }

    requestQuote(request: Omit<QuoteRequest, 'action'>): void {
        this._log.debug(
            'quote_request: from=%s to=%s from_amount=%s (clientId=%s)',
            request.from_asset,
            request.to_asset,
            request.from_amount,
            this._clientId,
        );
        this.send({
            action: 'quote_request',
            ...request,
            timestamp: Date.now(),
        } as WebSocketMessage);
    }

    ping(): void {
        this._log.debug('Ping sent (clientId=%s)', this._clientId);
        this.send({
            action: 'ping',
            timestamp: Date.now(),
        } as WebSocketMessage);
    }

    private send(message: WebSocketMessage): void {
        if (this.ws?.readyState === 1 /* WebSocket.OPEN */) {
            this.ws.send(JSON.stringify(message));
        } else {
            this._log.warn(
                'Send attempted while disconnected (action=%s, clientId=%s)',
                (message as { action?: string }).action,
                this._clientId,
            );
            this.emitError(new Error('WebSocket not connected'));
        }
    }

    /**
     * Avoid unhandled EventEmitter 'error' exceptions when callers did not
     * explicitly subscribe to WebSocket errors.
     */
    private emitError(error: Error): void {
        if (this.listenerCount('error') > 0) {
            this.emit('error', error);
            return;
        }

        this._log.warn('Unhandled WebSocket error without listener: %s', error.message);
    }

    private startPing(): void {
        this.stopPing();
        this.pingTimer = setInterval(() => {
            this.ping();
        }, this.pingInterval);
    }

    private stopPing(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = undefined;
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            this.reconnectAttempts++;
            this._log.info(
                'Reconnecting (attempt %d/%d) in %dms: %s',
                this.reconnectAttempts,
                this.maxReconnectAttempts,
                delay,
                this.url,
            );

            setTimeout(() => {
                this.emit('reconnecting', this.reconnectAttempts);
                this.connect().catch((err) => {
                    this._log.warn('Reconnect attempt %d failed: %s', this.reconnectAttempts, err);
                });
            }, delay);
        } else {
            this._log.warn(
                'Max reconnect attempts (%d) exceeded: %s',
                this.maxReconnectAttempts,
                this.url,
            );
            this.emit('maxReconnectExceeded');
        }
    }

    disconnect(): void {
        this._log.info('Disconnecting from %s (clientId=%s)', this.url, this._clientId);
        this.isClosed = true;
        this.stopPing();
        this.ws?.close();
        this.ws = undefined;
    }

    isConnected(): boolean {
        return this.ws?.readyState === 1 /* WebSocket.OPEN */;
    }
}
