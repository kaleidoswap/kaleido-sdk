/**
 * Kaleidoswap SDK Error Classes
 *
 * Structured exception hierarchy for proper error handling.
 * Errors from HTTP responses are automatically mapped to these classes.
 */

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
    constructor(message: string, statusCode: number = 400) {
        super('VALIDATION_ERROR', message, statusCode);
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
            'RGB Node not configured. This operation requires a connected RGB Lightning Node.',
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
    readonly requiredAmount: number;
    readonly availableAmount: number;
    readonly asset?: string;

    constructor(requiredAmount: number, availableAmount: number, asset?: string) {
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
 * Assert that an openapi-fetch response is successful and return its data.
 * Throws a typed SDK error if the response contains an error.
 *
 * This is the single shared error-handling utility used by all API clients.
 * It replaces both the inline `unwrapResponse` in MakerClient and the
 * `checkError` helper in RlnClient with one consistent implementation.
 *
 * For void methods, call without capturing the return value:
 *   assertResponse(await this.http.node.POST('/unlock', { body }));
 *
 * For data methods, capture and return:
 *   return assertResponse(await this.http.maker.GET('/api/v1/market/assets'));
 *
 * @example
 * const assets = assertResponse(await this.http.maker.GET('/api/v1/market/assets'));
 * assertResponse(await this.http.node.POST('/unlock', { body }));
 */

export function assertResponse<T>(result: { data?: T; error?: unknown; response?: Response }): T {
    if (result.error != null) {
        throw mapHttpError({
            status: result.response?.status ?? 500,
            statusText: result.response?.statusText ?? 'API Error',
            data: result.error as Record<string, unknown>,
        });
    }
    return result.data as T;
}

/**
 * Map HTTP errors to typed SDK errors
 * @param error - HTTP error data from fetch
 */
export function mapHttpError(error: {
    status: number;
    statusText: string;
    data?: {
        message?: string;
        code?: string;
        error?: string;
        detail?: string | any;
        details?: any;
    };
}): KaleidoError {
    let message = error.statusText;

    if (error.data) {
        if (typeof error.data === 'string') {
            message = error.data;
        } else {
            // Check formatted error fields in order of preference
            message =
                error.data.detail ||
                error.data.message ||
                error.data.error ||
                (error.data.details ? JSON.stringify(error.data.details) : undefined) ||
                error.statusText;

            // Handle FastAPI validation errors which return detail as array
            if (Array.isArray(error.data.detail)) {
                message = error.data.detail
                    .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
                    .join('; ');
            }
        }
    }

    // Map HTTP status codes to specific error types
    switch (error.status) {
        case 400:
        case 422: // Unprocessable Entity - FastAPI validation errors
            return new ValidationError(message, error.status);
        case 404:
            return new NotFoundError(message);
        case 408:
        case 504:
            return new TimeoutError(message);
        case 429:
            return new RateLimitError();
        case 500:
        case 502:
        case 503:
            return new APIError(message, error.status);
        default:
            if (error.status >= 400 && error.status < 500) {
                return new APIError(message, error.status);
            }
            return new NetworkError(message);
    }
}
