/**
 * Kaleidoswap SDK - TypeScript/JavaScript
 *
 * Pure TypeScript SDK for interacting with the Kaleidoswap protocol.
 * Trade RGB assets on Lightning Network with ease.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleidoswap-sdk';
 *
 * const client = KaleidoClient.create({
 *   baseUrl: 'https://api.kaleidoswap.com'
 * });
 *
 * const assets = await client.maker.listAssets();
 * const quote = await client.maker.getQuote(...);
 * ```
 */

// Export client classes
export { KaleidoClient } from './client.js';
export { MakerClient, type SwapCompletionOptions } from './maker-client.js';
export { RlnClient } from './rln-client.js';

// Export HTTP client (for advanced usage)
export { HttpClient } from './http-client.js';

// Export utility functions
export { toSmallestUnits, toDisplayUnits, getVersion, getSdkName } from './client.js';
export { toRawAmount, toDisplayAmount, PrecisionHandler, createPrecisionHandler } from './utils/index.js';

// WebSocket client and types  
export { WSClient } from './ws-client.js';
export type { QuoteResponse, QuoteRequest, PongResponse, Fee, WebSocketResponse } from './ws-types.js';

// Export all type definitions
export type {
  // Core types
  Asset,
  TradingPair,
  Quote,
  CreateSwapOrderRequest,
  CreateSwapOrderResponse,
  SwapOrderStatusResponse,
  OrderHistoryResponse,
  OrderStatsResponse,
  LspInfo,
  NetworkInfo,
  ChannelFees,
  KaleidoConfig,
  Layer,
  // Node API types
  RgbNodeInfoResponse,
  ListChannelsResponse,
  OpenChannelRequest,
  OpenChannelResponse,
  CloseChannelRequest,
  ListPeersResponse,
  ConnectPeerRequest,
  ListAssetsResponse,
  AssetBalanceResponse,
  AddressResponse,
  BtcBalanceResponse,
  LNInvoiceResponse,
  DecodeLNInvoiceResponse,
  KeysendRequest,
  KeysendResponse,
  ListPaymentsResponse,
  InitResponse,
  UnlockRequest,
  SendPaymentRequest,
  SendPaymentResponse,
} from './types.js';

// Export error classes
export {
  KaleidoError,
  APIError,
  NetworkError,
  ValidationError,
  TimeoutError,
  WebSocketError,
  NotFoundError,
  ConfigError,
  SwapError,
  NodeNotConfiguredError,
  QuoteExpiredError,
  InsufficientBalanceError,
  RateLimitError,
  mapHttpError,
} from './errors.js';
