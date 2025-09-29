import { 
  KaleidoSDKError,
  ErrorCode, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorMetadata,
  RetryStrategy
} from './errors';
import {
  NetworkError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  SwapError,
  TimeoutError,
  WebSocketError,
  AssetError,
  PairError,
  QuoteError,
  NodeError,
  HttpError,
  ConfigurationError
} from './exceptions';

/**
 * Factory for creating appropriate error instances from different contexts
 */
export class ErrorFactory {
  /**
   * Create an error from an HTTP response
   */
  static fromHttpResponse(
    response: Response,
    responseText?: string,
    requestData?: any,
    requestId?: string
  ): KaleidoSDKError {
    const statusCode = response.status;
    const metadata: ErrorMetadata = {
      statusCode,
      response: responseText,
      requestData,
      requestId,
      timestamp: new Date()
    };

    let message = `HTTP ${statusCode}: ${response.statusText}`;
    if (responseText) {
      try {
        const parsed = JSON.parse(responseText);
        message = parsed.message || parsed.error || message;
      } catch {
        // Keep original message if JSON parsing fails
      }
    }

    // Map specific HTTP status codes to appropriate error types
    switch (statusCode) {
      case 401:
        return new AuthenticationError(
          message,
          ErrorCode.AUTH_INVALID_API_KEY,
          metadata
        );
      case 403:
        return new AuthenticationError(
          message,
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          metadata
        );
      case 429:
        return new RateLimitError(
          message,
          ErrorCode.RATE_LIMIT_EXCEEDED,
          metadata
        );
      case 400:
      case 422:
        return new ValidationError(
          message,
          ErrorCode.VALIDATION_INVALID_FORMAT,
          metadata
        );
      default:
        return new HttpError(message, statusCode, undefined, metadata);
    }
  }

  /**
   * Create an error from a fetch/network error
   */
  static fromNetworkError(
    error: Error,
    requestData?: any,
    requestId?: string
  ): NetworkError {
    const metadata: ErrorMetadata = {
      requestData,
      requestId,
      timestamp: new Date(),
      retryable: true,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF
    };

    let code = ErrorCode.NETWORK_UNREACHABLE;
    let message = error.message;

    // Map specific network errors to error codes
    if (error.message.includes('timeout')) {
      code = ErrorCode.CONNECTION_TIMEOUT;
      message = 'Request timed out. Please try again.';
    } else if (error.message.includes('ECONNREFUSED')) {
      code = ErrorCode.CONNECTION_REFUSED;
      message = 'Connection refused by server.';
    } else if (error.message.includes('ENOTFOUND')) {
      code = ErrorCode.DNS_RESOLUTION_FAILED;
      message = 'Could not resolve server address.';
    } else if (error.name === 'AbortError') {
      code = ErrorCode.OPERATION_CANCELLED;
      message = 'Request was cancelled.';
    }

    return new NetworkError(message, code, metadata, error);
  }

  /**
   * Create an error from a WebSocket error
   */
  static fromWebSocketError(
    error: Error | Event,
    context?: string
  ): WebSocketError {
    const metadata: ErrorMetadata = {
      context: { websocketContext: context },
      timestamp: new Date(),
      retryable: true,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      retryDelay: 1000,
      maxRetries: 5
    };

    let code = ErrorCode.WEBSOCKET_CONNECTION_FAILED;
    let message = 'WebSocket connection failed';

    if (error instanceof Error) {
      message = error.message;
      if (error.message.includes('close')) {
        code = ErrorCode.WEBSOCKET_DISCONNECTED;
        message = 'WebSocket connection closed unexpectedly';
      }
    } else if (error instanceof Event) {
      if (error.type === 'close') {
        code = ErrorCode.WEBSOCKET_DISCONNECTED;
        message = 'WebSocket connection closed';
      }
    }

    return new WebSocketError(
      message,
      code,
      metadata,
      error instanceof Error ? error : undefined
    );
  }

  /**
   * Create a validation error with specific field information
   */
  static createValidationError(
    field: string,
    value: any,
    reason: string,
    requestData?: any
  ): ValidationError {
    const message = `Validation failed for field '${field}': ${reason}`;
    const metadata: ErrorMetadata = {
      context: {
        field,
        value,
        reason,
        requestData
      },
      timestamp: new Date(),
      retryable: false,
      recoveryActions: [
        `Check the '${field}' field value`,
        'Refer to API documentation for valid formats',
        'Contact support if the issue persists'
      ]
    };

    let code = ErrorCode.VALIDATION_INVALID_FORMAT;
    if (reason.includes('required') || reason.includes('missing')) {
      code = ErrorCode.VALIDATION_REQUIRED_FIELD_MISSING;
    } else if (reason.includes('range') || reason.includes('bounds')) {
      code = ErrorCode.VALIDATION_OUT_OF_RANGE;
    }

    return new ValidationError(message, code, metadata);
  }

  /**
   * Create an asset-related error
   */
  static createAssetError(
    assetId: string,
    operation: string,
    reason?: string
  ): AssetError {
    const message = `Asset error for '${assetId}' during ${operation}${reason ? ': ' + reason : ''}`;
    const metadata: ErrorMetadata = {
      context: {
        assetId,
        operation,
        reason
      },
      timestamp: new Date(),
      recoveryActions: [
        'Verify the asset ID is correct',
        'Check if the asset is supported',
        'Try refreshing asset data'
      ]
    };

    let code = ErrorCode.ASSET_NOT_FOUND;
    if (reason?.includes('not supported')) {
      code = ErrorCode.ASSET_NOT_SUPPORTED;
    }

    return new AssetError(message, code, metadata);
  }

  /**
   * Create a trading pair error
   */
  static createPairError(
    baseAsset: string,
    quoteAsset: string,
    operation: string,
    reason?: string
  ): PairError {
    const pairName = `${baseAsset}/${quoteAsset}`;
    const message = `Pair error for '${pairName}' during ${operation}${reason ? ': ' + reason : ''}`;
    const metadata: ErrorMetadata = {
      context: {
        baseAsset,
        quoteAsset,
        pairName,
        operation,
        reason
      },
      timestamp: new Date(),
      recoveryActions: [
        'Verify both asset IDs are correct',
        'Check if the trading pair is supported',
        'Try a different trading pair'
      ]
    };

    let code = ErrorCode.PAIR_NOT_FOUND;
    if (reason?.includes('not supported')) {
      code = ErrorCode.PAIR_NOT_SUPPORTED;
    }

    return new PairError(message, code, metadata);
  }

  /**
   * Create a quote-related error
   */
  static createQuoteError(
    quoteId: string | undefined,
    reason: string
  ): QuoteError {
    const message = quoteId 
      ? `Quote error for '${quoteId}': ${reason}`
      : `Quote error: ${reason}`;
    
    const metadata: ErrorMetadata = {
      context: {
        quoteId,
        reason
      },
      timestamp: new Date(),
      recoveryActions: [
        'Request a new quote',
        'Check if the quote parameters are valid',
        'Verify sufficient liquidity exists'
      ]
    };

    let code = ErrorCode.QUOTE_NOT_FOUND;
    if (reason.includes('expired')) {
      code = ErrorCode.QUOTE_EXPIRED;
    }

    return new QuoteError(message, code, metadata);
  }

  /**
   * Create a swap-related error
   */
  static createSwapError(
    operation: string,
    reason: string,
    swapId?: string,
    additionalContext?: Record<string, any>
  ): SwapError {
    const message = swapId
      ? `Swap ${operation} failed for '${swapId}': ${reason}`
      : `Swap ${operation} failed: ${reason}`;

    const metadata: ErrorMetadata = {
      context: {
        operation,
        reason,
        swapId,
        ...additionalContext
      },
      timestamp: new Date(),
      recoveryActions: [
        'Check swap parameters',
        'Verify sufficient balance',
        'Request a new quote if expired',
        'Contact support if issue persists'
      ]
    };

    let code = ErrorCode.SWAP_FAILED;
    if (reason.includes('timeout')) {
      code = ErrorCode.SWAP_TIMEOUT;
    } else if (reason.includes('balance') || reason.includes('insufficient')) {
      code = ErrorCode.SWAP_INSUFFICIENT_BALANCE;
    } else if (reason.includes('slippage')) {
      code = ErrorCode.SWAP_SLIPPAGE_EXCEEDED;
    } else if (reason.includes('rejected')) {
      code = ErrorCode.SWAP_REJECTED;
    }

    return new SwapError(message, code, metadata);
  }

  /**
   * Create a Lightning Network error
   */
  static createNodeError(
    operation: string,
    reason: string,
    nodeId?: string
  ): NodeError {
    const message = nodeId
      ? `Lightning node error for '${nodeId}' during ${operation}: ${reason}`
      : `Lightning node error during ${operation}: ${reason}`;

    const metadata: ErrorMetadata = {
      context: {
        operation,
        reason,
        nodeId
      },
      timestamp: new Date(),
      recoveryActions: [
        'Check Lightning node connectivity',
        'Verify node configuration',
        'Check channel capacity',
        'Contact support if issue persists'
      ]
    };

    let code = ErrorCode.LN_NODE_UNREACHABLE;
    if (reason.includes('not configured')) {
      code = ErrorCode.LN_NODE_NOT_CONFIGURED;
    } else if (reason.includes('channel')) {
      code = ErrorCode.LN_CHANNEL_NOT_FOUND;
    } else if (reason.includes('capacity')) {
      code = ErrorCode.LN_INSUFFICIENT_INBOUND_CAPACITY;
    } else if (reason.includes('payment')) {
      code = ErrorCode.LN_PAYMENT_FAILED;
    }

    return new NodeError(message, code, metadata);
  }

  /**
   * Create a timeout error
   */
  static createTimeoutError(
    operation: string,
    timeoutMs: number,
    context?: Record<string, any>
  ): TimeoutError {
    const message = `Operation '${operation}' timed out after ${timeoutMs}ms`;
    const metadata: ErrorMetadata = {
      context: {
        operation,
        timeoutMs,
        ...context
      },
      timestamp: new Date(),
      retryable: true,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      recoveryActions: [
        'Try again with a longer timeout',
        'Check network connectivity',
        'Verify server status'
      ]
    };

    return new TimeoutError(message, ErrorCode.OPERATION_TIMEOUT, metadata);
  }

  /**
   * Create a configuration error
   */
  static createConfigError(
    field: string,
    reason: string,
    providedValue?: any
  ): ConfigurationError {
    const message = `Configuration error for '${field}': ${reason}`;
    const metadata: ErrorMetadata = {
      context: {
        field,
        reason,
        providedValue
      },
      timestamp: new Date(),
      retryable: false,
      recoveryActions: [
        `Check the '${field}' configuration`,
        'Refer to documentation for valid values',
        'Contact support if issue persists'
      ]
    };

    let code = ErrorCode.CONFIG_MISSING_REQUIRED_FIELD;
    if (reason.includes('invalid')) {
      code = ErrorCode.CONFIG_INVALID_BASE_URL;
    }

    return new ConfigurationError(message, code, metadata);
  }

  /**
   * Wrap an unknown error into the SDK error system
   */
  static fromUnknownError(
    error: unknown,
    context?: string,
    operation?: string
  ): KaleidoSDKError {
    const metadata: ErrorMetadata = {
      context: { operation, errorContext: context },
      timestamp: new Date(),
      recoveryActions: [
        'Try the operation again',
        'Check input parameters',
        'Contact support if issue persists'
      ]
    };

    if (error instanceof KaleidoSDKError) {
      return error;
    }

    if (error instanceof Error) {
      const message = context 
        ? `${context}: ${error.message}`
        : error.message;
      
      return new KaleidoSDKError(
        message,
        ErrorCode.UNKNOWN_ERROR,
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM,
        metadata,
        error
      );
    }

    const message = context
      ? `${context}: ${String(error)}`
      : `Unknown error: ${String(error)}`;

    return new KaleidoSDKError(
      message,
      ErrorCode.UNKNOWN_ERROR,
      ErrorCategory.SYSTEM,
      ErrorSeverity.MEDIUM,
      metadata
    );
  }
}