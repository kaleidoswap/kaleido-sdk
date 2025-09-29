import { 
  KaleidoSDKError, 
  ErrorCode, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorMetadata 
} from './errors';

// Legacy base error for backward compatibility
export class KaleidoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'KaleidoError';
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.NETWORK_UNREACHABLE,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.NETWORK, ErrorSeverity.HIGH, metadata, cause);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.AUTH_INVALID_API_KEY,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, metadata, cause);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.RATE_LIMIT_EXCEEDED,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.RATE_LIMITING, ErrorSeverity.MEDIUM, {
      retryable: true,
      retryStrategy: 'linear_backoff' as any,
      retryDelay: 1000,
      maxRetries: 3,
      ...metadata
    }, cause);
    this.name = 'RateLimitError';
  }
}

/**
 * Request validation errors
 */
export class ValidationError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.VALIDATION_INVALID_FORMAT,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM, {
      retryable: false,
      ...metadata
    }, cause);
    this.name = 'ValidationError';
  }
}

/**
 * Trading and swap-related errors
 */
export class SwapError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SWAP_FAILED,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.TRADING, ErrorSeverity.HIGH, metadata, cause);
    this.name = 'SwapError';
  }
}

/**
 * Timeout-related errors
 */
export class TimeoutError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.OPERATION_TIMEOUT,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, {
      retryable: true,
      retryStrategy: 'exponential_backoff' as any,
      ...metadata
    }, cause);
    this.name = 'TimeoutError';
  }
}

/**
 * WebSocket-related errors
 */
export class WebSocketError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.WEBSOCKET_CONNECTION_FAILED,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.NETWORK, ErrorSeverity.HIGH, {
      retryable: true,
      retryStrategy: 'exponential_backoff' as any,
      ...metadata
    }, cause);
    this.name = 'WebSocketError';
  }
}

/**
 * Asset-related errors
 */
export class AssetError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.ASSET_NOT_FOUND,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.BUSINESS_LOGIC, ErrorSeverity.MEDIUM, metadata, cause);
    this.name = 'AssetError';
  }
}

/**
 * Trading pair errors
 */
export class PairError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.PAIR_NOT_FOUND,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.BUSINESS_LOGIC, ErrorSeverity.MEDIUM, metadata, cause);
    this.name = 'PairError';
  }
}

/**
 * Quote-related errors
 */
export class QuoteError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.QUOTE_EXPIRED,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.BUSINESS_LOGIC, ErrorSeverity.MEDIUM, metadata, cause);
    this.name = 'QuoteError';
  }
}

/**
 * Lightning node errors
 */
export class NodeError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.LN_NODE_UNREACHABLE,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.LIGHTNING_NETWORK, ErrorSeverity.HIGH, metadata, cause);
    this.name = 'NodeError';
  }
}

/**
 * HTTP-related errors
 */
export class HttpError extends KaleidoSDKError {
  constructor(
    message: string,
    statusCode: number,
    code?: ErrorCode,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    const errorCode = code || HttpError.getErrorCodeFromStatusCode(statusCode);
    const severity = statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    
    super(message, errorCode, ErrorCategory.HTTP, severity, {
      statusCode,
      retryable: statusCode >= 500 || statusCode === 429,
      ...metadata
    }, cause);
    this.name = 'HttpError';
  }

  private static getErrorCodeFromStatusCode(statusCode: number): ErrorCode {
    switch (statusCode) {
      case 400: return ErrorCode.HTTP_BAD_REQUEST;
      case 401: return ErrorCode.HTTP_UNAUTHORIZED;
      case 403: return ErrorCode.HTTP_FORBIDDEN;
      case 404: return ErrorCode.HTTP_NOT_FOUND;
      case 405: return ErrorCode.HTTP_METHOD_NOT_ALLOWED;
      case 409: return ErrorCode.HTTP_CONFLICT;
      case 422: return ErrorCode.HTTP_UNPROCESSABLE_ENTITY;
      case 429: return ErrorCode.HTTP_TOO_MANY_REQUESTS;
      case 500: return ErrorCode.HTTP_INTERNAL_SERVER_ERROR;
      case 502: return ErrorCode.HTTP_BAD_GATEWAY;
      case 503: return ErrorCode.HTTP_SERVICE_UNAVAILABLE;
      case 504: return ErrorCode.HTTP_GATEWAY_TIMEOUT;
      default: return ErrorCode.UNKNOWN_ERROR;
    }
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends KaleidoSDKError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.CONFIG_MISSING_REQUIRED_FIELD,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message, code, ErrorCategory.CONFIGURATION, ErrorSeverity.HIGH, {
      retryable: false,
      ...metadata
    }, cause);
    this.name = 'ConfigurationError';
  }
} 