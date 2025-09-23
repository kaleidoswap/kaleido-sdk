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
} from './types/index';

// Exceptions
export {
  KaleidoError,
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
  NodeError
} from './types/exceptions';

// WebSocket
export { WebSocketClient } from './websocket/client';
export type {
  WebSocketConfig,
  WebSocketMessage,
  MessageHandler
} from './websocket/client';

// HTTP
export { HttpClient } from './http/client';
export type { HttpClientConfig } from './http/client';

// Utils
export { retry, withRetry } from './utils/retry';
export type { RetryConfig } from './utils/retry';
export { AssetPairMapper, createAssetPairMapper } from './utils/assetPairMapper';
export type { MappedAsset } from './utils/assetPairMapper';
export { PrecisionHandler, createPrecisionHandler } from './utils/precisionHandler'; 

// Orders
export enum OrderSettlement {
  LIGHTNING = "LIGHTNING",
  ONCHAIN = "ONCHAIN"
}