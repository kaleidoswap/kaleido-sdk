/**
 * Error codes for different types of errors that can occur in the SDK
 */
export enum ErrorCode {
  // Network and connectivity errors (1000-1099)
  NETWORK_UNREACHABLE = 'NETWORK_UNREACHABLE',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  DNS_RESOLUTION_FAILED = 'DNS_RESOLUTION_FAILED',
  WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
  WEBSOCKET_DISCONNECTED = 'WEBSOCKET_DISCONNECTED',
  
  // HTTP and API errors (1100-1199)
  HTTP_BAD_REQUEST = 'HTTP_BAD_REQUEST',
  HTTP_UNAUTHORIZED = 'HTTP_UNAUTHORIZED',
  HTTP_FORBIDDEN = 'HTTP_FORBIDDEN',
  HTTP_NOT_FOUND = 'HTTP_NOT_FOUND',
  HTTP_METHOD_NOT_ALLOWED = 'HTTP_METHOD_NOT_ALLOWED',
  HTTP_CONFLICT = 'HTTP_CONFLICT',
  HTTP_UNPROCESSABLE_ENTITY = 'HTTP_UNPROCESSABLE_ENTITY',
  HTTP_TOO_MANY_REQUESTS = 'HTTP_TOO_MANY_REQUESTS',
  HTTP_INTERNAL_SERVER_ERROR = 'HTTP_INTERNAL_SERVER_ERROR',
  HTTP_BAD_GATEWAY = 'HTTP_BAD_GATEWAY',
  HTTP_SERVICE_UNAVAILABLE = 'HTTP_SERVICE_UNAVAILABLE',
  HTTP_GATEWAY_TIMEOUT = 'HTTP_GATEWAY_TIMEOUT',
  
  // Authentication and authorization errors (1200-1299)
  AUTH_INVALID_API_KEY = 'AUTH_INVALID_API_KEY',
  AUTH_EXPIRED_API_KEY = 'AUTH_EXPIRED_API_KEY',
  AUTH_MISSING_API_KEY = 'AUTH_MISSING_API_KEY',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (1300-1399)
  VALIDATION_REQUIRED_FIELD_MISSING = 'VALIDATION_REQUIRED_FIELD_MISSING',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE = 'VALIDATION_OUT_OF_RANGE',
  VALIDATION_INVALID_ASSET_ID = 'VALIDATION_INVALID_ASSET_ID',
  VALIDATION_INVALID_PAIR = 'VALIDATION_INVALID_PAIR',
  VALIDATION_INVALID_AMOUNT = 'VALIDATION_INVALID_AMOUNT',
  
  // Business logic errors (1400-1499)
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  ASSET_NOT_SUPPORTED = 'ASSET_NOT_SUPPORTED',
  PAIR_NOT_FOUND = 'PAIR_NOT_FOUND',
  PAIR_NOT_SUPPORTED = 'PAIR_NOT_SUPPORTED',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  QUOTE_EXPIRED = 'QUOTE_EXPIRED',
  QUOTE_NOT_FOUND = 'QUOTE_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_EXPIRED = 'ORDER_EXPIRED',
  ORDER_ALREADY_EXECUTED = 'ORDER_ALREADY_EXECUTED',
  
  // Swap and trading errors (1500-1599)
  SWAP_FAILED = 'SWAP_FAILED',
  SWAP_TIMEOUT = 'SWAP_TIMEOUT',
  SWAP_REJECTED = 'SWAP_REJECTED',
  SWAP_INSUFFICIENT_BALANCE = 'SWAP_INSUFFICIENT_BALANCE',
  SWAP_PRICE_IMPACT_TOO_HIGH = 'SWAP_PRICE_IMPACT_TOO_HIGH',
  SWAP_SLIPPAGE_EXCEEDED = 'SWAP_SLIPPAGE_EXCEEDED',
  
  // Lightning Network errors (1600-1699)
  LN_NODE_UNREACHABLE = 'LN_NODE_UNREACHABLE',
  LN_NODE_NOT_CONFIGURED = 'LN_NODE_NOT_CONFIGURED',
  LN_CHANNEL_NOT_FOUND = 'LN_CHANNEL_NOT_FOUND',
  LN_INSUFFICIENT_INBOUND_CAPACITY = 'LN_INSUFFICIENT_INBOUND_CAPACITY',
  LN_INSUFFICIENT_OUTBOUND_CAPACITY = 'LN_INSUFFICIENT_OUTBOUND_CAPACITY',
  LN_PAYMENT_FAILED = 'LN_PAYMENT_FAILED',
  LN_INVOICE_EXPIRED = 'LN_INVOICE_EXPIRED',
  
  // Rate limiting and throttling (1700-1799)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  THROTTLED = 'THROTTLED',
  
  // Configuration and setup errors (1800-1899)
  CONFIG_INVALID_BASE_URL = 'CONFIG_INVALID_BASE_URL',
  CONFIG_MISSING_REQUIRED_FIELD = 'CONFIG_MISSING_REQUIRED_FIELD',
  CONFIG_INVALID_RETRY_CONFIG = 'CONFIG_INVALID_RETRY_CONFIG',
  
  // Parsing and serialization errors (1900-1999)
  PARSE_INVALID_JSON = 'PARSE_INVALID_JSON',
  PARSE_INVALID_RESPONSE_FORMAT = 'PARSE_INVALID_RESPONSE_FORMAT',
  SERIALIZE_FAILED = 'SERIALIZE_FAILED',
  
  // Generic errors (2000-2099)
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for grouping related errors
 */
export enum ErrorCategory {
  NETWORK = 'network',
  HTTP = 'http',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  TRADING = 'trading',
  LIGHTNING_NETWORK = 'lightning_network',
  RATE_LIMITING = 'rate_limiting',
  CONFIGURATION = 'configuration',
  PARSING = 'parsing',
  SYSTEM = 'system'
}

/**
 * Retry strategy for different types of errors
 */
export enum RetryStrategy {
  NO_RETRY = 'no_retry',
  IMMEDIATE_RETRY = 'immediate_retry',
  LINEAR_BACKOFF = 'linear_backoff',
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  CUSTOM = 'custom'
}

/**
 * Error metadata interface for additional context
 */
export interface ErrorMetadata {
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Raw response from the server */
  response?: any;
  /** Request data that caused the error */
  requestData?: any;
  /** Error timestamp */
  timestamp?: Date;
  /** Request ID for tracing */
  requestId?: string;
  /** Additional context specific to the error */
  context?: Record<string, any>;
  /** Suggested recovery actions */
  recoveryActions?: string[];
  /** Whether the operation can be retried */
  retryable?: boolean;
  /** Recommended retry strategy */
  retryStrategy?: RetryStrategy;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
}

/**
 * Base error class for all SDK errors with enhanced metadata
 */
export class KaleidoSDKError extends Error {
  public readonly code: ErrorCode;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly metadata: ErrorMetadata;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message);
    this.name = 'KaleidoSDKError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.metadata = {
      timestamp: new Date(),
      ...metadata
    };
    this.cause = cause;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, KaleidoSDKError.prototype);
  }

  /**
   * Convert error to JSON for logging or debugging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      metadata: this.metadata,
      stack: this.stack,
      cause: this.cause?.message
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please check your API key and try again.';
      case ErrorCategory.RATE_LIMITING:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorCategory.VALIDATION:
        return 'Invalid request data. Please check your input and try again.';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'Operation failed due to business rules. Please check the requirements.';
      case ErrorCategory.TRADING:
        return 'Trading operation failed. Please try again or contact support.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Check if the error is retryable
   */
  isRetryable(): boolean {
    return this.metadata.retryable ?? this.getDefaultRetryable();
  }

  /**
   * Get the recommended retry strategy
   */
  getRetryStrategy(): RetryStrategy {
    return this.metadata.retryStrategy ?? this.getDefaultRetryStrategy();
  }

  /**
   * Get default retryable status based on error category
   */
  private getDefaultRetryable(): boolean {
    switch (this.category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.RATE_LIMITING:
        return true;
      case ErrorCategory.HTTP:
        return this.metadata.statusCode ? [500, 502, 503, 504].includes(this.metadata.statusCode) : false;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.VALIDATION:
      case ErrorCategory.BUSINESS_LOGIC:
        return false;
      default:
        return false;
    }
  }

  /**
   * Get default retry strategy based on error category
   */
  private getDefaultRetryStrategy(): RetryStrategy {
    switch (this.category) {
      case ErrorCategory.NETWORK:
        return RetryStrategy.EXPONENTIAL_BACKOFF;
      case ErrorCategory.RATE_LIMITING:
        return RetryStrategy.LINEAR_BACKOFF;
      case ErrorCategory.HTTP:
        return this.isRetryable() ? RetryStrategy.EXPONENTIAL_BACKOFF : RetryStrategy.NO_RETRY;
      default:
        return RetryStrategy.NO_RETRY;
    }
  }
}