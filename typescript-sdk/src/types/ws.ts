/**
 * WebSocket message types.
 *
 * NOTE: `QuoteResponse.from_asset` / `to_asset` are full `SwapLegData` objects,
 * not plain ticker strings.
 */

export type WSAction =
    | 'ping'
    | 'pong'
    | 'quote_request'
    | 'quote_response'
    | 'connection_established'
    | 'error';

export interface Fee {
    /** Ticker / asset-ID of the asset the fee is denominated in */
    fee_asset: string;
    /** Decimal precision of the fee asset */
    fee_precision: number;
    /** Fixed base fee */
    base_fee: number;
    /** Variable fee based on trade size */
    variable_fee: number;
    /** Fee rate as a fraction (e.g. 0.001 = 0.1%) */
    fee_rate: number;
    /** Total fee = base_fee + variable_fee */
    final_fee: number;
}

export interface SwapLegData {
    /** Unique asset identifier (e.g. 'BTC', RGB contract ID) */
    asset_id: string;
    /** Full asset name (e.g. 'Bitcoin') */
    name: string;
    /** Display ticker (e.g. 'BTC', 'USDT') */
    ticker: string;
    /** Settlement layer (e.g. 'BTC_LN', 'RGB_LN') */
    layer: string;
    /** Amount in smallest unit */
    amount: number;
    /** Decimal places for the asset (e.g. 8 for BTC, 6 for USDT) */
    precision: number;
}

export interface QuoteResponse {
    action: 'quote_response';
    /** Complete specification for the source leg of the swap */
    from_asset: SwapLegData;
    /** Complete specification for the destination leg of the swap */
    to_asset: SwapLegData;
    /**
     * Price of 1 whole unit of from_asset expressed in the smallest unit of to_asset.
     */
    price: number;
    /** Quote / RFQ identifier — pass to createSwapOrder */
    rfq_id: string;
    /** Server-side Unix timestamp (seconds) when the quote was created */
    timestamp: number;
    /** Unix timestamp (seconds) after which the quote is no longer valid */
    expires_at: number;
    /** Fee breakdown for this quote */
    fee: Fee;
}

/** Exactly one of `from_amount` / `to_amount` should be set (the other null). */
export interface QuoteRequest {
    action: 'quote_request';
    /** Source asset ticker (e.g. 'BTC') */
    from_asset: string;
    /** Destination asset ticker (e.g. 'USDT') */
    to_asset: string;
    /** Amount of from_asset in smallest unit, or null if specifying to_amount */
    from_amount?: number | null;
    /** Amount of to_asset in smallest unit, or null if specifying from_amount */
    to_amount?: number | null;
    /** Source settlement layer filter (e.g. 'BTC_LN') */
    from_layer?: string | null;
    /** Destination settlement layer filter (e.g. 'RGB_LN') */
    to_layer?: string | null;
    /** Client-side Unix timestamp (milliseconds) */
    timestamp?: number;
}

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

export interface WebSocketResponse {
    action?: string;
    error?: string;
    timestamp?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    success?: boolean;
}

export interface ConnectionEstablishedData {
    client_id: string;
    server_time: number;
    timestamp: number;
    message: string;
}

export interface ConnectionEstablished {
    action: 'connection_established';
    data: ConnectionEstablishedData;
}

export interface PongResponse {
    action: 'pong';
    timestamp: number;
    data?: {
        server_time: number;
        client_id: string;
        connection_quality?: 'excellent' | 'good' | 'degraded';
    };
}
