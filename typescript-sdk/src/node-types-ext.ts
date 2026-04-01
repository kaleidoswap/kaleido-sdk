/**
 * Extended Node Types
 *
 * Re-exports types from generated Node types for easier consumption.
 * This file extracts operation types (request/response) from the generated
 * OpenAPI types and exports them with names matching the Python SDK.
 *
 * Note: The RGB Lightning Node spec doesn't use operationIds, so we extract
 * types directly from paths instead of operations.
 */

import type { paths, components } from './generated/node-types.js';

// Re-export enums as values (type + runtime) — mirrors Python StrEnum exports
export {
    AssetSchema,
    BitcoinNetwork,
    ChannelStatus,
    HTLCStatus,
    IndexerProtocol,
    InvoiceStatus,
    RecipientType,
    SwapStatus,
    TransactionType,
    TransferKind,
    TransferStatus,
} from './generated/node-types.js';

// Helper types (internal) - extract from paths
type RequestBody<
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath],
> = paths[TPath][TMethod] extends { requestBody?: { content: { 'application/json': infer R } } }
    ? R
    : never;

type ResponseSuccess<
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath],
> = paths[TPath][TMethod] extends {
    responses: { 200: { content: { 'application/json': infer R } } };
}
    ? R
    : paths[TPath][TMethod] extends {
            responses: { 201: { content: { 'application/json': infer R } } };
        }
      ? R
      : never;

// ============================================================================
// Authentication & Wallet
// ============================================================================

export type InitRequest = RequestBody<'/init', 'post'>;
export type InitResponse = ResponseSuccess<'/init', 'post'>;
export type UnlockRequest = RequestBody<'/unlock', 'post'>;
export type UnlockResponse = ResponseSuccess<'/unlock', 'post'>;
export type ChangePasswordRequest = RequestBody<'/changepassword', 'post'>;
export type ChangePasswordResponse = ResponseSuccess<'/changepassword', 'post'>;
export type RestoreRequest = RequestBody<'/restore', 'post'>;
export type RestoreResponse = ResponseSuccess<'/restore', 'post'>;
export type BackupRequest = RequestBody<'/backup', 'post'>;
export type BackupResponse = ResponseSuccess<'/backup', 'post'>;
export type ShutdownResponse = ResponseSuccess<'/shutdown', 'post'>;

// ============================================================================
// Node Information
// ============================================================================

export type NodeInfoResponse = ResponseSuccess<'/nodeinfo', 'get'>;
export type NetworkInfoResponse = ResponseSuccess<'/networkinfo', 'get'>;

// ============================================================================
// Assets - Management
// ============================================================================

export type ListAssetsRequest = RequestBody<'/listassets', 'post'>;
export type ListAssetsResponse = ResponseSuccess<'/listassets', 'post'>;
export type AssetBalanceRequest = RequestBody<'/assetbalance', 'post'>;
export type AssetBalanceResponse = ResponseSuccess<'/assetbalance', 'post'>;
export type BtcBalanceResponse = ResponseSuccess<'/btcbalance', 'post'>;
export type AssetMetadataRequest = RequestBody<'/assetmetadata', 'post'>;
export type AssetMetadataResponse = ResponseSuccess<'/assetmetadata', 'post'>;
export type SendRgbRequest = RequestBody<'/sendrgb', 'post'>;
export type SendRgbResponse = ResponseSuccess<'/sendrgb', 'post'>;
export type SendBtcRequest = RequestBody<'/sendbtc', 'post'>;
export type SendBtcResponse = ResponseSuccess<'/sendbtc', 'post'>;
export type CreateUtxosRequest = RequestBody<'/createutxos', 'post'>;
export type CreateUtxosResponse = ResponseSuccess<'/createutxos', 'post'>;
export type ListUnspentsRequest = RequestBody<'/listunspents', 'post'>;
export type ListUnspentsResponse = ResponseSuccess<'/listunspents', 'post'>;
export type ListTransactionsRequest = RequestBody<'/listtransactions', 'post'>;
export type ListTransactionsResponse = ResponseSuccess<'/listtransactions', 'post'>;

// ============================================================================
// Assets - Issuance & Media
// ============================================================================

export type GetAssetMediaRequest = RequestBody<'/getassetmedia', 'post'>;
export type GetAssetMediaResponse = ResponseSuccess<'/getassetmedia', 'post'>;
export type PostAssetMediaRequest = components['schemas']['PostAssetMediaRequest'];
export type PostAssetMediaResponse = ResponseSuccess<'/postassetmedia', 'post'>;
export type InflateRequest = RequestBody<'/inflate', 'post'>;
export type InflateResponse = ResponseSuccess<'/inflate', 'post'>;
export type IssueAssetNIARequest = RequestBody<'/issueassetnia', 'post'>;
export type IssueAssetNIAResponse = ResponseSuccess<'/issueassetnia', 'post'>;
export type IssueAssetIFARequest = RequestBody<'/issueassetifa', 'post'>;
export type IssueAssetIFAResponse = ResponseSuccess<'/issueassetifa', 'post'>;
export type IssueAssetCFARequest = RequestBody<'/issueassetcfa', 'post'>;
export type IssueAssetCFAResponse = ResponseSuccess<'/issueassetcfa', 'post'>;
export type IssueAssetUDARequest = RequestBody<'/issueassetuda', 'post'>;
export type IssueAssetUDAResponse = ResponseSuccess<'/issueassetuda', 'post'>;

// ============================================================================
// Transfers
// ============================================================================

export type ListTransfersRequest = RequestBody<'/listtransfers', 'post'>;
export type ListTransfersResponse = ResponseSuccess<'/listtransfers', 'post'>;
export type FailTransfersRequest = RequestBody<'/failtransfers', 'post'>;
export type FailTransfersResponse = ResponseSuccess<'/failtransfers', 'post'>;

// ============================================================================
// Lightning Network - Channels
// ============================================================================

export type ListChannelsResponse = ResponseSuccess<'/listchannels', 'get'>;
export type OpenChannelRequest = RequestBody<'/openchannel', 'post'>;
export type OpenChannelResponse = ResponseSuccess<'/openchannel', 'post'>;
export type CloseChannelRequest = RequestBody<'/closechannel', 'post'>;
export type GetChannelIdRequest = RequestBody<'/getchannelid', 'post'>;
export type GetChannelIdResponse = ResponseSuccess<'/getchannelid', 'post'>;

// ============================================================================
// Lightning Network - Peers
// ============================================================================

export type ListPeersResponse = ResponseSuccess<'/listpeers', 'get'>;
export type ConnectPeerRequest = RequestBody<'/connectpeer', 'post'>;
export type ConnectPeerResponse = ResponseSuccess<'/connectpeer', 'post'>;
export type DisconnectPeerRequest = RequestBody<'/disconnectpeer', 'post'>;

// ============================================================================
// Lightning Network - Invoices & Payments  (Python-matching primary names)
// ============================================================================

export type LNInvoiceRequest = components['schemas']['LNInvoiceRequest'];
export type CreateLNInvoiceResponse = ResponseSuccess<'/lninvoice', 'post'>;
export type RgbInvoiceRequest = components['schemas']['RgbInvoiceRequest'];
export type RgbInvoiceResponse = components['schemas']['RgbInvoiceResponse'];
export type DecodeLNInvoiceRequest = RequestBody<'/decodelninvoice', 'post'>;
export type DecodeLNInvoiceResponse = ResponseSuccess<'/decodelninvoice', 'post'>;
export type DecodeRGBInvoiceRequest = components['schemas']['DecodeRGBInvoiceRequest'];
export type DecodeRGBInvoiceResponse = components['schemas']['DecodeRGBInvoiceResponse'];
export type InvoiceStatusRequest = components['schemas']['InvoiceStatusRequest'];
export type InvoiceStatusResponse = components['schemas']['InvoiceStatusResponse'];
export type SendPaymentRequest = RequestBody<'/sendpayment', 'post'>;
export type SendPaymentResponse = ResponseSuccess<'/sendpayment', 'post'>;
export type KeysendRequest = RequestBody<'/keysend', 'post'>;
export type KeysendResponse = ResponseSuccess<'/keysend', 'post'>;
export type ListPaymentsResponse = ResponseSuccess<'/listpayments', 'get'>;
export type GetPaymentRequest = RequestBody<'/getpayment', 'post'>;
export type GetPaymentResponse = ResponseSuccess<'/getpayment', 'post'>;

// ============================================================================
// Maker/Taker Swaps  (Python-matching primary names)
// ============================================================================

export type TakerRequest = components['schemas']['TakerRequest'];
export type MakerInitRequest = RequestBody<'/makerinit', 'post'>;
export type MakerInitResponse = ResponseSuccess<'/makerinit', 'post'>;
export type MakerExecuteRequest = RequestBody<'/makerexecute', 'post'>;
export type MakerExecuteResponse = ResponseSuccess<'/makerexecute', 'post'>;
export type ListSwapsResponse = ResponseSuccess<'/listswaps', 'get'>;
export type GetSwapRequest = RequestBody<'/getswap', 'post'>;
export type GetSwapResponse = ResponseSuccess<'/getswap', 'post'>;

// ============================================================================
// Utility Methods
// ============================================================================

export type AddressResponse = ResponseSuccess<'/address', 'post'>;
export type SignMessageRequest = RequestBody<'/signmessage', 'post'>;
export type SignMessageResponse = ResponseSuccess<'/signmessage', 'post'>;
export type SendOnionMessageRequest = RequestBody<'/sendonionmessage', 'post'>;
export type CheckIndexerUrlRequest = RequestBody<'/checkindexerurl', 'post'>;
export type CheckIndexerUrlResponse = ResponseSuccess<'/checkindexerurl', 'post'>;
export type CheckProxyEndpointRequest = RequestBody<'/checkproxyendpoint', 'post'>;
export type RevokeTokenRequest = RequestBody<'/revoketoken', 'post'>;
export type EstimateFeeRequest = RequestBody<'/estimatefee', 'post'>;
export type EstimateFeeResponse = ResponseSuccess<'/estimatefee', 'post'>;
export type RefreshRequest = components['schemas']['RefreshRequest'];

// ============================================================================
// Schema types — commonly used models (matching Python SDK exports)
// ============================================================================

export type NodeComponents = components;

// Asset schemas
export type AssetNIA = components['schemas']['AssetNIA'];
export type AssetCFA = components['schemas']['AssetCFA'];
export type AssetUDA = components['schemas']['AssetUDA'];
// Assignment schemas
export type AssignmentAny = components['schemas']['AssignmentAny'];
export type AssignmentFungible = components['schemas']['AssignmentFungible'];
export type AssignmentInflationRight = components['schemas']['AssignmentInflationRight'];
export type AssignmentNonFungible = components['schemas']['AssignmentNonFungible'];

// Core entity schemas
export type BtcBalance = components['schemas']['BtcBalance'];
export type BtcBalanceRequest = components['schemas']['BtcBalanceRequest'];
export type Channel = components['schemas']['Channel'];
export type EmptyResponse = components['schemas']['EmptyResponse'];
export type Payment = components['schemas']['Payment'];
export type Peer = components['schemas']['Peer'];
export type Swap = components['schemas']['Swap'];
export type Transaction = components['schemas']['Transaction'];
export type Transfer = components['schemas']['Transfer'];
export type Unspent = components['schemas']['Unspent'];

// Additional schema types
export type BlockTime = components['schemas']['BlockTime'];
export type EmbeddedMedia = components['schemas']['EmbeddedMedia'];
export type Media = components['schemas']['Media'];
export type ProofOfReserves = components['schemas']['ProofOfReserves'];
export type RgbAllocation = components['schemas']['RgbAllocation'];
export type Token = components['schemas']['Token'];
export type TokenLight = components['schemas']['TokenLight'];
export type TransferTransportEndpoint = components['schemas']['TransferTransportEndpoint'];
export type Recipient = components['schemas']['Recipient'];
export type Utxo = components['schemas']['Utxo'];
export type WitnessData = components['schemas']['WitnessData'];
