/**
 * Kaleidoswap SDK Error Classes
 *
 * Structured exception hierarchy for proper error handling.
 * Errors from the WASM layer are automatically mapped to these classes.
 */

/**
 * Raw error structure from WASM bindings
 */
export interface WasmErrorData {
    code: string;
    message: string;
    status_code?: number;
    details?: string;
}

/**
 * Base error class for all Kaleidoswap SDK errors
 */
export class KaleidoError extends Error {
    /** Error code for programmatic handling */
    readonly code: string;
    /** HTTP status code (if applicable) */
    readonly statusCode?: number;
    /** Additional error details */
    readonly details?: string;

    constructor(code: string, message: string, statusCode?: number, details?: string) {
        super(message);
        this.name = 'KaleidoError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /** Check if this error is retryable */
    isRetryable(): boolean {
        return (
            this.code === 'NETWORK_ERROR' ||
            this.code === 'TIMEOUT_ERROR' ||
            (this.statusCode !== undefined && (this.statusCode >= 500 || this.statusCode === 429))
        );
    }
}

/**
 * API request failed with an error response
 */
export class APIError extends KaleidoError {
    constructor(message: string, statusCode: number, details?: string) {
        super('API_ERROR', `API Error (${statusCode}): ${message}`, statusCode, details);
        this.name = 'APIError';
    }
}

/**
 * Network connectivity error
 */
export class NetworkError extends KaleidoError {
    constructor(message: string) {
        super('NETWORK_ERROR', message);
        this.name = 'NetworkError';
    }
}

/**
 * Request or input validation failed
 */
export class ValidationError extends KaleidoError {
    constructor(message: string) {
        super('VALIDATION_ERROR', message);
        this.name = 'ValidationError';
    }
}

/**
 * Request timed out
 */
export class TimeoutError extends KaleidoError {
    constructor(message: string) {
        super('TIMEOUT_ERROR', message);
        this.name = 'TimeoutError';
    }
}

/**
 * WebSocket connection or communication error
 */
export class WebSocketError extends KaleidoError {
    constructor(message: string) {
        super('WEBSOCKET_ERROR', message);
        this.name = 'WebSocketError';
    }
}

/**
 * Resource not found (404)
 */
export class NotFoundError extends KaleidoError {
    constructor(message: string) {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Configuration error
 */
export class ConfigError extends KaleidoError {
    constructor(message: string) {
        super('CONFIG_ERROR', message);
        this.name = 'ConfigError';
    }
}

/**
 * Swap operation failed
 */
export class SwapError extends KaleidoError {
    readonly swapId?: string;

    constructor(message: string, swapId?: string) {
        super('SWAP_ERROR', message, undefined, swapId);
        this.name = 'SwapError';
        this.swapId = swapId;
    }
}

/**
 * RGB Node not configured but required for operation
 */
export class NodeNotConfiguredError extends KaleidoError {
    constructor() {
        super(
            'NODE_NOT_CONFIGURED',
            'RGB Node not configured. This operation requires a connected RGB Lightning Node.'
        );
        this.name = 'NodeNotConfiguredError';
    }
}

/**
 * Quote has expired
 */
export class QuoteExpiredError extends KaleidoError {
    constructor() {
        super('QUOTE_EXPIRED', 'Quote has expired');
        this.name = 'QuoteExpiredError';
    }
}

/**
 * Insufficient balance for operation
 */
export class InsufficientBalanceError extends KaleidoError {
    readonly requiredAmount: bigint;
    readonly availableAmount: bigint;
    readonly asset?: string;

    constructor(requiredAmount: bigint, availableAmount: bigint, asset?: string) {
        const msg = asset
            ? `Insufficient ${asset} balance: need ${requiredAmount}, have ${availableAmount}`
            : `Insufficient balance: need ${requiredAmount}, have ${availableAmount}`;
        super('INSUFFICIENT_BALANCE', msg);
        this.name = 'InsufficientBalanceError';
        this.requiredAmount = requiredAmount;
        this.availableAmount = availableAmount;
        this.asset = asset;
    }
}

/**
 * Rate limit exceeded
 */
export class RateLimitError extends APIError {
    readonly retryAfter?: number;

    constructor(retryAfter?: number) {
        const msg = retryAfter
            ? `Rate limit exceeded. Retry after ${retryAfter} seconds`
            : 'Rate limit exceeded';
        super(msg, 429);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

/**
 * Maps WASM error data to appropriate TypeScript exception class
 *
 * @param wasmError - Raw error data from WASM bindings
 * @returns Typed KaleidoError instance
 */
export function mapWasmError(wasmError: unknown): KaleidoError {
    // Handle string errors (legacy)
    if (typeof wasmError === 'string') {
        return new KaleidoError('UNKNOWN', wasmError);
    }

    // Handle null/undefined or non-object
    if (!wasmError || typeof wasmError !== 'object') {
        return new KaleidoError('UNKNOWN', 'Unknown error');
    }

    // Handle structured errors
    const err = wasmError as WasmErrorData;
    const code = err.code || 'UNKNOWN';
    const message = err.message || 'Unknown error';
    const statusCode = err.status_code;
    const details = err.details;

    switch (code) {
        case 'API_ERROR':
            if (statusCode === 429) {
                return new RateLimitError();
            }
            return new APIError(message, statusCode ?? 0, details);

        case 'NETWORK_ERROR':
            return new NetworkError(message);

        case 'VALIDATION_ERROR':
            return new ValidationError(message);

        case 'TIMEOUT_ERROR':
            return new TimeoutError(message);

        case 'WEBSOCKET_ERROR':
            return new WebSocketError(message);

        case 'NOT_FOUND':
            return new NotFoundError(message);

        case 'CONFIG_ERROR':
            return new ConfigError(message);

        case 'SWAP_ERROR':
            return new SwapError(message, details);

        case 'NODE_NOT_CONFIGURED':
            return new NodeNotConfiguredError();

        case 'QUOTE_EXPIRED':
            return new QuoteExpiredError();

        default:
            return new KaleidoError(code, message, statusCode, details);
    }
}
