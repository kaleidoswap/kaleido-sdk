/**
 * WebSocket Message Types
 *
 * Type definitions for WebSocket communication.
 * Based on kaleidoswap-maker WebSocket protocol — kept in sync with
 * the Python SDK's `_ws_client.py` TypedDict definitions.
 *
 * Key design notes:
 * - `Fee.base_fee`, `Fee.variable_fee`, `Fee.final_fee` are int64 values and
 *   are typed as `bigint` to match the OpenAPI spec (format: int64).
 * - `QuoteResponse.from_asset` / `to_asset` are full SwapLeg-compatible objects,
 *   NOT plain ticker strings. The server sends the complete leg payload.
 * - `price` in `QuoteResponse` is an int64 value (bigint in TS).
 * - `from_amount` / `to_amount` in request/message types are int64 (bigint | null).
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/**
 * WebSocket message actions — mirrors Python WSAction enum.
 */
export type WSAction =
    | 'ping'
    | 'pong'
    | 'quote_request'
    | 'quote_response'
    | 'connection_established'
    | 'error';

// ---------------------------------------------------------------------------
// Fee (WebSocket context)
//
// Used inside QuoteResponse messages arriving over the WebSocket channel.
// The field names follow the actual wire format sent by the maker backend.
//
// fee_precision refers to the decimal precision of the fee asset
// (distinct from fee_asset_precision used in the REST Fee schema).
// base_fee / variable_fee / final_fee are int64 → bigint.
// ---------------------------------------------------------------------------

/**
 * Fee structure in a WebSocket quote response.
 *
 * Mirrors Python `Fee` TypedDict in `_ws_client.py`.
 */
export interface Fee {
    /** Ticker / asset-ID of the asset the fee is denominated in */
    fee_asset: string;
    /** Decimal precision of the fee asset */
    fee_precision: number;
    /** Fixed base fee (int64 → bigint) */
    base_fee: bigint;
    /** Variable fee based on trade size (int64 → bigint) */
    variable_fee: bigint;
    /** Fee rate as a fraction (e.g. 0.001 = 0.1%) */
    fee_rate: number;
    /** Total fee = base_fee + variable_fee (int64 → bigint) */
    final_fee: bigint;
}

// ---------------------------------------------------------------------------
// SwapLeg data as received in WebSocket quote responses
// ---------------------------------------------------------------------------

/**
 * Full swap-leg payload embedded in a WebSocket `quote_response` message.
 *
 * Mirrors Python `SwapLegData` TypedDict in `_ws_client.py`.
 * Field names / types deliberately match the generated REST `SwapLeg` schema
 * so callers can treat them interchangeably.
 */
export interface SwapLegData {
    /** Unique asset identifier (e.g. 'BTC', RGB contract ID) */
    asset_id: string;
    /** Full asset name (e.g. 'Bitcoin') */
    name: string;
    /** Display ticker (e.g. 'BTC', 'USDT') */
    ticker: string;
    /** Settlement layer (e.g. 'BTC_LN', 'RGB_LN') */
    layer: string;
    /** Amount in smallest unit (int64 → bigint) */
    amount: bigint;
    /** Decimal places for the asset (e.g. 8 for BTC, 6 for USDT) */
    precision: number;
}

// ---------------------------------------------------------------------------
// Quote response (server → client, WebSocket)
// ---------------------------------------------------------------------------

/**
 * Quote response data received from the server over the WebSocket channel.
 *
 * Mirrors Python `QuoteResponse` TypedDict in `_ws_client.py`.
 * NOTE: `from_asset` and `to_asset` are full `SwapLegData` objects, not
 * plain ticker strings.  `price` is an int64 value (bigint).
 */
export interface QuoteResponse {
    action: 'quote_response';
    /** Complete specification for the source leg of the swap */
    from_asset: SwapLegData;
    /** Complete specification for the destination leg of the swap */
    to_asset: SwapLegData;
    /**
     * Price of 1 whole unit of from_asset expressed in the smallest unit of
     * to_asset.  This is an int64 value on the wire (bigint in TypeScript).
     */
    price: bigint;
    /** Quote / RFQ identifier — pass to createSwapOrder */
    rfq_id: string;
    /** Server-side Unix timestamp (seconds) when the quote was created */
    timestamp: number;
    /** Unix timestamp (seconds) after which the quote is no longer valid */
    expires_at: number;
    /** Fee breakdown for this quote */
    fee: Fee;
}

// ---------------------------------------------------------------------------
// Quote request (client → server, WebSocket)
// ---------------------------------------------------------------------------

/**
 * Quote request parameters sent by the client over the WebSocket channel.
 *
 * Mirrors Python `QuoteRequest` TypedDict in `_ws_client.py`.
 * Exactly one of `from_amount` / `to_amount` should be set (the other null).
 */
export interface QuoteRequest {
    action: 'quote_request';
    /** Source asset ticker (e.g. 'BTC') */
    from_asset: string;
    /** Destination asset ticker (e.g. 'USDT') */
    to_asset: string;
    /** Amount of from_asset in smallest unit, or null if specifying to_amount (int64 → bigint) */
    from_amount?: bigint | null;
    /** Amount of to_asset in smallest unit, or null if specifying from_amount (int64 → bigint) */
    to_amount?: bigint | null;
    /** Source settlement layer filter (e.g. 'BTC_LN') */
    from_layer?: string | null;
    /** Destination settlement layer filter (e.g. 'RGB_LN') */
    to_layer?: string | null;
    /** Client-side Unix timestamp (milliseconds) */
    timestamp?: number;
}

// ---------------------------------------------------------------------------
// Generic WebSocket messages
// ---------------------------------------------------------------------------

/**
 * Generic outbound WebSocket message (client → server).
 *
 * Mirrors Python `WebSocketMessage` TypedDict in `_ws_client.py`.
 */
export interface WebSocketMessage {
    action: WSAction;
    timestamp?: number;
    from_asset?: string;
    to_asset?: string;
    /** int64 amount in smallest unit (bigint | null) */
    from_amount?: bigint | null;
    /** int64 amount in smallest unit (bigint | null) */
    to_amount?: bigint | null;
    from_layer?: string | null;
    to_layer?: string | null;
}

/**
 * Generic inbound WebSocket response (server → client).
 *
 * Mirrors Python `WebSocketResponse` TypedDict in `_ws_client.py`.
 */
export interface WebSocketResponse {
    action?: string;
    error?: string;
    timestamp?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    success?: boolean;
}

// ---------------------------------------------------------------------------
// Connection established
// ---------------------------------------------------------------------------

/**
 * Data payload of the `connection_established` WebSocket message.
 *
 * Mirrors Python `ConnectionEstablishedData` TypedDict in `_ws_client.py`.
 */
export interface ConnectionEstablishedData {
    client_id: string;
    server_time: number;
    timestamp: number;
    message: string;
}

/**
 * Full `connection_established` message wrapper.
 */
export interface ConnectionEstablished {
    action: 'connection_established';
    data: ConnectionEstablishedData;
}

// ---------------------------------------------------------------------------
// Pong
// ---------------------------------------------------------------------------

/**
 * Pong response from the server.
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
