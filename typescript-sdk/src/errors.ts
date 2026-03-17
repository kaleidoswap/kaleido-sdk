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

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    isRetryable(): boolean {
        return (
            this.code === 'NETWORK_ERROR' ||
            this.code === 'TIMEOUT_ERROR' ||
            (this.statusCode !== undefined && (this.statusCode >= 500 || this.statusCode === 429))
        );
    }
}

export class APIError extends KaleidoError {
    constructor(message: string, statusCode: number, details?: string) {
        super('API_ERROR', `API Error (${statusCode}): ${message}`, statusCode, details);
        this.name = 'APIError';
    }
}

export class NetworkError extends KaleidoError {
    constructor(message: string) {
        super('NETWORK_ERROR', message);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends KaleidoError {
    constructor(message: string, statusCode: number = 400) {
        super('VALIDATION_ERROR', message, statusCode);
        this.name = 'ValidationError';
    }
}

export class TimeoutError extends KaleidoError {
    constructor(message: string) {
        super('TIMEOUT_ERROR', message);
        this.name = 'TimeoutError';
    }
}

export class WebSocketError extends KaleidoError {
    constructor(message: string) {
        super('WEBSOCKET_ERROR', message);
        this.name = 'WebSocketError';
    }
}

export class NotFoundError extends KaleidoError {
    constructor(message: string) {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}

export class ConfigError extends KaleidoError {
    constructor(message: string) {
        super('CONFIG_ERROR', message);
        this.name = 'ConfigError';
    }
}

export class SwapError extends KaleidoError {
    readonly swapId?: string;

    constructor(message: string, swapId?: string) {
        super('SWAP_ERROR', message, undefined, swapId);
        this.name = 'SwapError';
        this.swapId = swapId;
    }
}

export class NodeNotConfiguredError extends KaleidoError {
    constructor() {
        super(
            'NODE_NOT_CONFIGURED',
            'RGB Node not configured. This operation requires a connected RGB Lightning Node.',
        );
        this.name = 'NodeNotConfiguredError';
    }
}

export class QuoteExpiredError extends KaleidoError {
    constructor() {
        super('QUOTE_EXPIRED', 'Quote has expired');
        this.name = 'QuoteExpiredError';
    }
}

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

type ValidationErrorItem = {
    loc: Array<string | number>;
    msg: string;
};

type HttpErrorData =
    | string
    | {
          message?: string;
          code?: string;
          error?: string;
          detail?: string | ValidationErrorItem[];
          details?: unknown;
      };

export function mapHttpError(error: {
    status: number;
    statusText: string;
    data?: HttpErrorData;
}): KaleidoError {
    let message = error.statusText;

    if (error.data) {
        if (typeof error.data === 'string') {
            message = error.data;
        } else {
            const detailMessage =
                typeof error.data.detail === 'string' ? error.data.detail : undefined;
            message =
                detailMessage ||
                error.data.message ||
                error.data.error ||
                (error.data.details ? JSON.stringify(error.data.details) : undefined) ||
                error.statusText;

            if (Array.isArray(error.data.detail)) {
                message = error.data.detail
                    .map((err) => `${err.loc.join('.')}: ${err.msg}`)
                    .join('; ');
            }
        }
    }

    switch (error.status) {
        case 400:
        case 422:
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
