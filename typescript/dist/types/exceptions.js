"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeError = exports.QuoteError = exports.PairError = exports.AssetError = exports.WebSocketError = exports.TimeoutError = exports.SwapError = exports.ValidationError = exports.RateLimitError = exports.AuthenticationError = exports.NetworkError = exports.KaleidoError = void 0;
class KaleidoError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
        this.name = 'KaleidoError';
    }
}
exports.KaleidoError = KaleidoError;
class NetworkError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class AuthenticationError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class RateLimitError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class ValidationError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class SwapError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'SwapError';
    }
}
exports.SwapError = SwapError;
class TimeoutError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class WebSocketError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'WebSocketError';
    }
}
exports.WebSocketError = WebSocketError;
class AssetError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'AssetError';
    }
}
exports.AssetError = AssetError;
class PairError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'PairError';
    }
}
exports.PairError = PairError;
class QuoteError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'QuoteError';
    }
}
exports.QuoteError = QuoteError;
class NodeError extends KaleidoError {
    constructor(message, statusCode, response) {
        super(message, statusCode, response);
        this.name = 'NodeError';
    }
}
exports.NodeError = NodeError;
