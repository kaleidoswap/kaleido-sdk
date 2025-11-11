// Client
export { KaleidoClient } from './client';
export type { KaleidoConfig } from './client';

// General Types
export type {
  // Request Types
  SwapRequest,
  ConfirmSwapRequest,

  // Response Types
  ConfirmSwapResponse,
  AssetResponse,
  PairResponse,
  PairQuoteResponse,
  PairQuoteRequest,
  // Order Types
  CreateOrderRequest,
  PaymentState,
  // Other Types
  Quote,
  ClientAsset,
  Pair,
  Swap,
  SwapResponse,
  SwapStatus,
  // LSP Types
  GetInfoResponseModel,
  NetworkInfoResponse,
} from './types/index';

export * from './types/rln';

// Enhanced error handling system
export {
  // Error types and enums
  ErrorCode,
  ErrorSeverity,
  ErrorCategory,
  RetryStrategy,

  // Base error class
  KaleidoSDKError,

  // Error metadata interface
  type ErrorMetadata,
} from './types/errors';

// Error factory
export { ErrorFactory } from './types/errorFactory';

// Legacy and specific error classes
export {
  // Legacy base error (for backward compatibility)
  KaleidoError,

  // Specific error types
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
  ConfigurationError,
} from './types/exceptions';

// WebSocket
export { WebSocketClient } from './websocket/client';
export type { WebSocketConfig, WebSocketMessage, MessageHandler } from './websocket/client';

// HTTP
export { HttpClient } from './http/client';
export type { HttpClientConfig } from './http/client';

// Utils
export { retry, withRetry, createRetryWrapper } from './utils/retry';
export type { RetryConfig } from './utils/retry';
export { AssetPairMapper, createAssetPairMapper } from './utils/assetPairMapper';
export type { MappedAsset } from './utils/assetPairMapper';
export { PrecisionHandler, createPrecisionHandler } from './utils/precisionHandler';

// Orders
export enum OrderSettlement {
  LIGHTNING = 'LIGHTNING',
  ONCHAIN = 'ONCHAIN',
}
