/**
 * Extended Node Types
 *
 * Re-exports types from generated Node types for easier consumption.
 * This file extracts operation types (request/response) from the generated
 * OpenAPI types and exports them with simpler names.
 *
 * Note: The RGB Lightning Node spec doesn't use operationIds, so we extract
 * types directly from paths instead of operations.
 */

import type { paths, components } from './generated/node-types.js';

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

// Authentication & Wallet
export type InitWalletRequest = RequestBody<'/init', 'post'>;
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

// Node Information
export type NodeInfoResponse = ResponseSuccess<'/nodeinfo', 'get'>;
export type NetworkInfoResponse = ResponseSuccess<'/networkinfo', 'get'>;

// Assets - Management
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

// Assets - Issuance & Media
export type GetAssetMediaRequest = RequestBody<'/getassetmedia', 'post'>;
export type GetAssetMediaResponse = ResponseSuccess<'/getassetmedia', 'post'>;
export type IssueAssetNIARequest = RequestBody<'/issueassetnia', 'post'>;
export type IssueAssetNIAResponse = ResponseSuccess<'/issueassetnia', 'post'>;
export type IssueAssetCFARequest = RequestBody<'/issueassetcfa', 'post'>;
export type IssueAssetCFAResponse = ResponseSuccess<'/issueassetcfa', 'post'>;
export type IssueAssetUDARequest = RequestBody<'/issueassetuda', 'post'>;
export type IssueAssetUDAResponse = ResponseSuccess<'/issueassetuda', 'post'>;

// Transfers
export type ListTransfersRequest = RequestBody<'/listtransfers', 'post'>;
export type ListTransfersResponse = ResponseSuccess<'/listtransfers', 'post'>;
export type RefreshTransfersRequest = RequestBody<'/refreshtransfers', 'post'>;
export type FailTransfersRequest = RequestBody<'/failtransfers', 'post'>;

// Lightning Network - Channels
export type ListChannelsResponse = ResponseSuccess<'/listchannels', 'get'>;
export type OpenChannelRequest = RequestBody<'/openchannel', 'post'>;
export type OpenChannelResponse = ResponseSuccess<'/openchannel', 'post'>;
export type CloseChannelRequest = RequestBody<'/closechannel', 'post'>;
export type GetChannelIdRequest = RequestBody<'/getchannelid', 'post'>;
export type GetChannelIdResponse = ResponseSuccess<'/getchannelid', 'post'>;

// Lightning Network - Peers
export type ListPeersResponse = ResponseSuccess<'/listpeers', 'get'>;
export type ConnectPeerRequest = RequestBody<'/connectpeer', 'post'>;
export type ConnectPeerResponse = ResponseSuccess<'/connectpeer', 'post'>;
export type DisconnectPeerRequest = RequestBody<'/disconnectpeer', 'post'>;

// Lightning Network - Invoices & Payments
export type CreateLNInvoiceRequest = RequestBody<'/lninvoice', 'post'>;
export type CreateLNInvoiceResponse = ResponseSuccess<'/lninvoice', 'post'>;
export type CreateRgbInvoiceRequest = RequestBody<'/rgbinvoice', 'post'>;
export type CreateRgbInvoiceResponse = ResponseSuccess<'/rgbinvoice', 'post'>;
export type DecodeLNInvoiceRequest = RequestBody<'/decodelninvoice', 'post'>;
export type DecodeLNInvoiceResponse = ResponseSuccess<'/decodelninvoice', 'post'>;
export type DecodeRgbInvoiceRequest = RequestBody<'/decodergbinvoice', 'post'>;
export type DecodeRgbInvoiceResponse = ResponseSuccess<'/decodergbinvoice', 'post'>;
export type GetInvoiceStatusRequest = RequestBody<'/invoicestatus', 'post'>;
export type GetInvoiceStatusResponse = ResponseSuccess<'/invoicestatus', 'post'>;
export type SendPaymentRequest = RequestBody<'/sendpayment', 'post'>;
export type SendPaymentResponse = ResponseSuccess<'/sendpayment', 'post'>;
export type KeysendRequest = RequestBody<'/keysend', 'post'>;
export type KeysendResponse = ResponseSuccess<'/keysend', 'post'>;
export type ListPaymentsResponse = ResponseSuccess<'/listpayments', 'get'>;
export type GetPaymentRequest = RequestBody<'/getpayment', 'post'>;
export type GetPaymentResponse = ResponseSuccess<'/getpayment', 'post'>;

// Maker/Taker Swaps
export type WhitelistTradeRequest = RequestBody<'/taker', 'post'>;
export type MakerInitRequest = RequestBody<'/makerinit', 'post'>;
export type MakerInitResponse = ResponseSuccess<'/makerinit', 'post'>;
export type MakerExecuteRequest = RequestBody<'/makerexecute', 'post'>;
export type MakerExecuteResponse = ResponseSuccess<'/makerexecute', 'post'>;
export type ListSwapsResponse = ResponseSuccess<'/listswaps', 'get'>;
export type GetSwapRequest = RequestBody<'/getswap', 'post'>;
export type GetSwapResponse = ResponseSuccess<'/getswap', 'post'>;

// Utility Methods
export type AddressResponse = ResponseSuccess<'/address', 'post'>;
export type SignMessageRequest = RequestBody<'/signmessage', 'post'>;
export type SignMessageResponse = ResponseSuccess<'/signmessage', 'post'>;
export type SendOnionMessageRequest = RequestBody<'/sendonionmessage', 'post'>;
export type CheckIndexerUrlRequest = RequestBody<'/checkindexerurl', 'post'>;
export type CheckProxyEndpointRequest = RequestBody<'/checkproxyendpoint', 'post'>;
export type RevokeTokenRequest = RequestBody<'/revoketoken', 'post'>;
export type EstimateFeeRequest = RequestBody<'/estimatefee', 'post'>;
export type EstimateFeeResponse = ResponseSuccess<'/estimatefee', 'post'>;

// Re-export components for advanced usage
export type NodeComponents = components;

// Aliases for backward compatibility
export type InitRequest = InitWalletRequest;
export type UnlockWalletRequest = UnlockRequest;
export type LNInvoiceResponse = CreateLNInvoiceResponse;
export type AssetMediaRequest = GetAssetMediaRequest;
export type AssetMediaResponse = GetAssetMediaResponse;

// Schema types for direct use
export type Channel = components['schemas']['Channel'];
export type NodeAsset = components['schemas']['AssetNIA'];
// Alias for backward compatibility (NiaAsset is more common in desktop-app)
export type NiaAsset = NodeAsset;
export type Recipient = components['schemas']['Recipient'];
export type RecipientType = components['schemas']['RecipientType'];

// Additional schema types
export type BlockTime = components['schemas']['BlockTime'];
export type EmbeddedMedia = components['schemas']['EmbeddedMedia'];
export type Media = components['schemas']['Media'];
export type PostAssetMediaRequest = components['schemas']['PostAssetMediaRequest'];
export type PostAssetMediaResponse = components['schemas']['PostAssetMediaResponse'];
export type ProofOfReserves = components['schemas']['ProofOfReserves'];
export type RgbAllocation = components['schemas']['RgbAllocation'];
export type Token = components['schemas']['Token'];
export type TokenLight = components['schemas']['TokenLight'];
export type TransactionType = components['schemas']['TransactionType'];
export type TransferTransportEndpoint = components['schemas']['TransferTransportEndpoint'];
export type Utxo = components['schemas']['Utxo'];
export type WitnessData = components['schemas']['WitnessData'];
