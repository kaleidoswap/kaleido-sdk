/**
 * Kaleidoswap SDK Exceptions
 * 
 * Structured exception hierarchy for better error handling in TypeScript.
 */

/**
 * Base exception for Kaleidoswap SDK errors
 */
export class KaleidoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KaleidoError';
        Object.setPrototypeOf(this, KaleidoError.prototype);
    }
}

/**
 * API request failed
 */
export class APIError extends KaleidoError {
    statusCode: number;
    response?: any;

    constructor(statusCode: number, message: string, response?: any) {
        super(`API Error ${statusCode}: ${message}`);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
        Object.setPrototypeOf(this, APIError.prototype);
    }
}

/**
 * Network connectivity issues
 */
export class NetworkError extends KaleidoError {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

/**
 * Invalid input parameters
 */
export class ValidationError extends KaleidoError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Quote has expired
 */
export class QuoteExpiredError extends KaleidoError {
    constructor() {
        super('Quote has expired');
        this.name = 'QuoteExpiredError';
        Object.setPrototypeOf(this, QuoteExpiredError.prototype);
    }
}

/**
 * Insufficient balance for operation
 */
export class InsufficientBalanceError extends KaleidoError {
    requiredAmount: number;
    availableAmount: number;
    asset?: string;

    constructor(requiredAmount: number, availableAmount: number, asset?: string) {
        const msg = `Insufficient balance: need ${requiredAmount}, have ${availableAmount}${asset ? ` for ${asset}` : ''}`;
        super(msg);
        this.name = 'InsufficientBalanceError';
        this.requiredAmount = requiredAmount;
        this.availableAmount = availableAmount;
        this.asset = asset;
        Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
    }
}

/**
 * RGB Node not configured
 */
export class NodeNotConfiguredError extends KaleidoError {
    constructor() {
        super('RGB Node not configured');
        this.name = 'NodeNotConfiguredError';
        Object.setPrototypeOf(this, NodeNotConfiguredError.prototype);
    }
}

/**
 * Authentication failed
 */
export class AuthenticationError extends KaleidoError {
    constructor(message: string = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Rate limit exceeded
 */
export class RateLimitError extends APIError {
    retryAfter?: number;

    constructor(retryAfter?: number) {
        const msg = retryAfter
            ? `Rate limit exceeded. Retry after ${retryAfter} seconds`
            : 'Rate limit exceeded';
        super(429, msg);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Channel not found
 */
export class ChannelNotFoundError extends KaleidoError {
    channelId: string;

    constructor(channelId: string) {
        super(`Channel not found: ${channelId}`);
        this.name = 'ChannelNotFoundError';
        this.channelId = channelId;
        Object.setPrototypeOf(this, ChannelNotFoundError.prototype);
    }
}

/**
 * Order not found
 */
export class OrderNotFoundError extends KaleidoError {
    orderId: string;

    constructor(orderId: string) {
        super(`Order not found: ${orderId}`);
        this.name = 'OrderNotFoundError';
        this.orderId = orderId;
        Object.setPrototypeOf(this, OrderNotFoundError.prototype);
    }
}
