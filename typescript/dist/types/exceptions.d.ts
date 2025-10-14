export declare class KaleidoError extends Error {
    statusCode?: number;
    response?: any;
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class NetworkError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class AuthenticationError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class RateLimitError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class ValidationError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class SwapError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class TimeoutError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class WebSocketError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class AssetError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class PairError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class QuoteError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
export declare class NodeError extends KaleidoError {
    constructor(message: string, statusCode?: number, response?: any);
}
