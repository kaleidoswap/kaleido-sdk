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
export declare class WebSocketClient {
    private readonly baseUrl;
    private readonly pingInterval;
    private readonly pingTimeout;
    private readonly reconnectInterval;
    private readonly maxReconnectAttempts;
    private ws;
    private pingTimer;
    private reconnectTimer;
    private messageHandlers;
    private reconnectAttempts;
    private isConnecting;
    private readonly headers;
    /**
     * Checks if the WebSocket is connected
     * @returns boolean indicating if the WebSocket is connected
     */
    isConnected(): boolean;
    /**
     * Creates a new WebSocket client instance
     * @param config - Configuration for the client
     */
    constructor(config: WebSocketConfig);
    /**
     * Gets the headers for WebSocket connection
     * @returns Object containing connection headers
     */
    private logConnectionState;
    /**
     * Establishes a WebSocket connection
     * @throws {WebSocketError} If connection fails
     */
    connect(): Promise<void>;
    /**
     * Starts sending periodic ping messages
     */
    private startPing;
    private stopPing;
    /**
     * Handles incoming WebSocket messages
     * @param event - Message event
     */
    private handleMessage;
    /**
     * Handles WebSocket connection close
     */
    private handleClose;
    private attemptReconnect;
    /**
     * Closes the WebSocket connection
     */
    disconnect(code?: number, reason?: string): Promise<void>;
    /**
     * Sends a message over the WebSocket connection
     * @param message - Message to send
     * @throws {WebSocketError} If not connected
     */
    send(message: WebSocketMessage): Promise<void>;
    /**
     * Registers a handler for a specific message action
     * @param action - Message action to handle
     * @param handler - Handler function
     */
    on(event: string, handler: MessageHandler): () => void;
    /**
     * Removes a handler for a specific message action
     * @param action - Message action
     * @param handler - Handler function to remove
     */
    off(event: string, handler: MessageHandler): void;
    private emit;
    /**
     * Subscribes to updates for a trading pair
     * @param pairId - Trading pair identifier
     * @throws {WebSocketError} If not connected
     */
    subscribe(pairId: string): Promise<void>;
    /**
     * Unsubscribes from updates for a trading pair
     * @param pairId - Trading pair identifier
     * @throws {WebSocketError} If not connected
     */
    unsubscribe(pairId: string): Promise<void>;
    /**
     * Gets the current WebSocket connection state
     * @returns The current WebSocket ready state or undefined if not connected
     */
    getConnectionState(): number | undefined;
}
