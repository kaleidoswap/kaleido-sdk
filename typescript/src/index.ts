// Client
export { KaleidoClient } from './client';
export type { KaleidoConfig } from './client';

// Re-export commonly used types from generated code
export type {
  // Kaleidoswap API types
  AssetsResponse as AssetResponse,
  PairResponse,
  Pair,
  PairQuoteRequest,
  PairQuoteResponse,
  SwapRequest,
  SwapResponse,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  Swap,
  SwapStatus,
  SwapSettlement,
  GetInfoResponseModel,
  NetworkInfoResponse,
  NodeInfoResponse,
  CreateOrderRequest,
  OrderResponse,
  OrderState,
  PaymentState,
  CreateSwapOrderRequest,
  CreateSwapOrderResponse,
  SwapOrderStatus,
  SwapOrderStatusRequest,
  SwapOrderStatusResponse,
  ClientAsset,
  Fee,
  ChannelFees,
} from './generated/kaleido';

export type {
  // RGB Node types
  ListChannelsResponse,
  OpenChannelRequest,
  OpenChannelResponse,
  CloseChannelRequest,
  GetChannelIdRequest,
  GetChannelIdResponse,
  ListPeersResponse,
  ConnectPeerRequest,
  DisconnectPeerRequest,
  ListPaymentsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  SendPaymentRequest,
  SendPaymentResponse,
  KeysendRequest,
  KeysendResponse,
  LNInvoiceRequest,
  LNInvoiceResponse,
  DecodeLNInvoiceRequest,
  DecodeLNInvoiceResponse,
  InvoiceStatusRequest,
  InvoiceStatusResponse,
  AddressResponse,
  BtcBalanceRequest,
  BtcBalanceResponse,
  SendBtcRequest,
  SendBtcResponse,
  ListTransactionsRequest,
  ListTransactionsResponse,
  ListUnspentsRequest,
  ListUnspentsResponse,
  EstimateFeeRequest,
  EstimateFeeResponse,
  AssetBalanceRequest,
  AssetBalanceResponse,
  AssetMetadataRequest,
  AssetMetadataResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  CreateUtxosRequest,
  ListTransfersRequest,
  ListTransfersResponse,
  FailTransfersRequest,
  FailTransfersResponse,
  RefreshRequest,
  RgbInvoiceRequest,
  RgbInvoiceResponse,
  DecodeRGBInvoiceRequest,
  DecodeRGBInvoiceResponse,
  SendAssetRequest,
  SendAssetResponse,
  IssueAssetNIARequest,
  IssueAssetNIAResponse,
  IssueAssetUDARequest,
  IssueAssetUDAResponse,
  IssueAssetCFARequest,
  IssueAssetCFAResponse,
  PostAssetMediaRequest,
  PostAssetMediaResponse,
  GetAssetMediaRequest,
  GetAssetMediaResponse,
  ListSwapsResponse,
  GetSwapRequest,
  GetSwapResponse,
  MakerInitRequest,
  MakerInitResponse,
  MakerExecuteRequest,
  TakerRequest,
  InitRequest,
  InitResponse,
  UnlockRequest,
  BackupRequest,
  RestoreRequest,
  ChangePasswordRequest,
  CheckIndexerUrlRequest,
  CheckIndexerUrlResponse,
  CheckProxyEndpointRequest,
  SignMessageRequest,
  SignMessageResponse,
  SendOnionMessageRequest,
  RevokeTokenRequest,
  EmptyResponse,
} from './generated/rgb-node';

// Custom/enhanced types (not in generated code)
export type { Quote } from './types/index';

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

// Orders (enum for backward compatibility)
export enum OrderSettlement {
  LIGHTNING = 'LIGHTNING',
  ONCHAIN = 'ONCHAIN',
}
