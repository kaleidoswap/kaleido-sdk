/**
 * Kaleidoswap SDK
 *
 * TypeScript SDK for the Kaleidoswap protocol - trade RGB assets on Lightning Network.
 *
 * @packageDocumentation
 */

// Main client
export { KaleidoClient, MakerClient, RlnClient } from './client.js';

// Utility functions
export { toSmallestUnits, toDisplayUnits, getVersion, getSdkName } from './client.js';

// Types - re-export from types.ts (which sources from generated OpenAPI types)
export type {
  // Configuration
  KaleidoConfig,

  // Layers (SDK-specific)
  Layer,
  ReceiverAddressFormat,

  // Assets
  Asset,

  // Trading pairs
  TradingPair,

  // Quotes
  Quote,
  Fee,

  // Orders
  CreateSwapOrderRequest,
  CreateSwapOrderResponse,
  SwapOrder,
  SwapOrderStatus,
  SwapOrderStatusResponse,
  OrderHistoryResponse,
  OrderStatsResponse,

  // LSP
  LspInfo,
  NetworkInfo,
  ChannelFees,
  ChannelDetails,

  // Swaps
  SwapRequest,
  SwapResponse,
  ConfirmSwapRequest,
  ConfirmSwapResponse,

  // Payments
  PaymentDetails,
  PaymentBolt11,
  PaymentOnchain,

  // Enums
  PaymentState,
  PaymentStatus,
  OrderState,
  AssetDeliveryStatus,
  BitcoinNetwork,

  // Advanced: raw generated types
  components,
  paths,
  operations,

  // ==========================================================================
  // RGB Lightning Node API Types
  // ==========================================================================

  // Node API generated types
  nodeComponents,
  nodePaths,
  nodeOperations,

  // Address & Balance
  AddressResponse,
  AssetBalanceRequest,
  AssetBalanceResponse,
  BtcBalanceRequest,
  BtcBalanceResponse,

  // Backup & Restore
  BackupRequest,
  RestoreRequest,

  // Channels
  CloseChannelRequest,
  OpenChannelRequest,
  OpenChannelResponse,
  ListChannelsResponse,
  Channel,

  // Peers
  ConnectPeerRequest,
  DisconnectPeerRequest,
  ListPeersResponse,

  // UTXOs & Transactions
  CreateUtxosRequest,
  ListUnspentsResponse,
  ListTransactionsResponse,
  EstimateFeeRequest,
  EstimateFeeResponse,

  // Invoices
  DecodeLNInvoiceRequest,
  DecodeLNInvoiceResponse,
  DecodeRGBInvoiceRequest,
  DecodeRGBInvoiceResponse,
  LNInvoiceRequest,
  LNInvoiceResponse,
  RgbInvoiceRequest,
  RgbInvoiceResponse,
  InvoiceStatusRequest,
  InvoiceStatusResponse,

  // Assets
  IssueAssetNIARequest,
  IssueAssetNIAResponse,
  ListAssetsResponse,
  AssetNIA,

  // Transfers
  ListTransfersResponse,
  RefreshRequest,

  // Send Operations
  SendAssetRequest,
  SendAssetResponse,
  SendBtcRequest,
  SendBtcResponse,

  // Payments
  SendPaymentRequest,
  SendPaymentResponse,
  KeysendRequest,
  KeysendResponse,
  ListPaymentsResponse,

  // Node Info & Auth
  RgbNodeInfoResponse,
  InitRequest,
  InitResponse,
  UnlockRequest,
  SignMessageRequest,
  SignMessageResponse,

  // Misc
  Assignment,
  AssignmentFungible,
} from './types.js';

// Errors
export {
  // Base error
  KaleidoError,
  // Specific errors
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
  // Error mapping utility
  mapWasmError,
} from './errors.js';

export type { WasmErrorData } from './errors.js';
