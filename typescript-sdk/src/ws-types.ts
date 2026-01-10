/**
 * WebSocket Message Types
 * 
 * Type definitions for WebSocket communication
 * Based on kaleidoswap-maker WebSocket protocol
 */

/**
 * WebSocket message actions
 */
export type WSAction =
    | 'ping'
    | 'pong'
    | 'quote_request'
    | 'quote_response'
    | 'connection_established'
    | 'error';

/**
 * Incoming WebSocket message from client
 */
export interface WebSocketMessage {
    action: WSAction;
    timestamp?: number;
    from_asset?: string;
    to_asset?: string;
    from_amount?: number | null;
    to_amount?: number | null;
    from_layer?: string | null;
    to_layer?: string | null;
}

/**
 * Outgoing WebSocket response from server
 */
export interface WebSocketResponse {
    action?: string;
    error?: string;
    timestamp?: number;
    data?: any;
    success?: boolean;
}

/**
 * Fee structure in quote response
 */
export interface Fee {
    fee_asset: string;
    fee_precision: number;
    base_fee: number;
    variable_fee: number;
    fee_rate: number;
    final_fee: number;
}

/**
 * Quote response data
 */
export interface QuoteResponse {
    action: 'quote_response';
    from_asset: string;
    to_asset: string;
    from_amount: number;
    to_amount: number;
    price: number;
    rfq_id: string;
    price_precision: number;
    timestamp: number;
    expires_at: number;
    fee: Fee;
}

/**
 * Quote request parameters
 */
export interface QuoteRequest {
    action: 'quote_request';
    from_asset: string;
    to_asset: string;
    from_amount?: number | null;
    to_amount?: number | null;
    from_layer?: string | null;
    to_layer?: string | null;
    timestamp?: number;
}

/**
 * Connection established message
 */
export interface ConnectionEstablished {
    action: 'connection_established';
    data: {
        client_id: string;
        server_time: number;
        timestamp: number;
        message: string;
    };
}

/**
 * Pong response
 */
export interface PongResponse {
    action: 'pong';
    timestamp: number;
    data?: {
        server_time: number;
        client_id: string;
        connection_quality?: 'excellent' | 'good' | 'degraded';
    };
}
