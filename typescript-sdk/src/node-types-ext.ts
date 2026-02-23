/**
 * Extended Node Types
 *
 * Re-exports types from generated Node types for easier consumption.
 * This file extracts operation types (request/response) from the generated
 * OpenAPI types and exports them with simpler names.
 */

import type { operations, components } from './generated/node-types.js';

// Helper types (internal)
type RequestBody<T extends keyof operations> = operations[T] extends {
    requestBody?: { content: { 'application/json': infer R } };
}
    ? R
    : never;

type ResponseSuccess<T extends keyof operations> = operations[T] extends {
    responses: { 200: { content: { 'application/json': infer R } } };
}
    ? R
    : operations[T] extends { responses: { 201: { content: { 'application/json': infer R } } } }
      ? R
      : never;

// Authentication & Wallet
export type InitWalletRequest = RequestBody<'post_init'>;
export type InitResponse = ResponseSuccess<'post_init'>;
export type UnlockRequest = RequestBody<'post_unlock'>;
export type UnlockResponse = ResponseSuccess<'post_unlock'>;
export type ChangePasswordRequest = RequestBody<'post_changepassword'>;
export type ChangePasswordResponse = ResponseSuccess<'post_changepassword'>;
export type RestoreRequest = RequestBody<'post_restore'>;
export type RestoreResponse = ResponseSuccess<'post_restore'>;
export type BackupRequest = RequestBody<'post_backup'>;
export type BackupResponse = ResponseSuccess<'post_backup'>;
export type ShutdownResponse = ResponseSuccess<'post_shutdown'>;

// Node Information
export type NodeInfoResponse = ResponseSuccess<'get_nodeinfo'>;
export type NetworkInfoResponse = ResponseSuccess<'get_networkinfo'>;

// Assets - Management
export type ListAssetsRequest = RequestBody<'post_listassets'>;
export type ListAssetsResponse = ResponseSuccess<'post_listassets'>;
export type AssetBalanceRequest = RequestBody<'post_assetbalance'>;
export type AssetBalanceResponse = ResponseSuccess<'post_assetbalance'>;
export type BtcBalanceResponse = ResponseSuccess<'post_btcbalance'>;
export type AssetMetadataRequest = RequestBody<'post_assetmetadata'>;
export type AssetMetadataResponse = ResponseSuccess<'post_assetmetadata'>;
export type SendRgbRequest = RequestBody<'post_sendrgb'>;
export type SendRgbResponse = ResponseSuccess<'post_sendrgb'>;
export type SendBtcRequest = RequestBody<'post_sendbtc'>;
export type SendBtcResponse = ResponseSuccess<'post_sendbtc'>;
export type CreateUtxosRequest = RequestBody<'post_createutxos'>;
export type CreateUtxosResponse = ResponseSuccess<'post_createutxos'>;
export type ListUnspentsRequest = RequestBody<'post_listunspents'>;
export type ListUnspentsResponse = ResponseSuccess<'post_listunspents'>;
export type ListTransactionsRequest = RequestBody<'post_listtransactions'>;
export type ListTransactionsResponse = ResponseSuccess<'post_listtransactions'>;

// Assets - Issuance & Media
export type GetAssetMediaRequest = RequestBody<'post_getassetmedia'>;
export type GetAssetMediaResponse = ResponseSuccess<'post_getassetmedia'>;
export type IssueAssetNIARequest = RequestBody<'post_issueassetnia'>;
export type IssueAssetNIAResponse = ResponseSuccess<'post_issueassetnia'>;
export type IssueAssetCFARequest = RequestBody<'post_issueassetcfa'>;
export type IssueAssetCFAResponse = ResponseSuccess<'post_issueassetcfa'>;
export type IssueAssetUDARequest = RequestBody<'post_issueassetuda'>;
export type IssueAssetUDAResponse = ResponseSuccess<'post_issueassetuda'>;

// Transfers
export type ListTransfersRequest = RequestBody<'post_listtransfers'>;
export type ListTransfersResponse = ResponseSuccess<'post_listtransfers'>;
export type RefreshTransfersRequest = RequestBody<'post_refreshtransfers'>;
export type FailTransfersRequest = RequestBody<'post_failtransfers'>;

// Lightning Network - Channels
export type ListChannelsResponse = ResponseSuccess<'get_listchannels'>;
export type OpenChannelRequest = RequestBody<'post_openchannel'>;
export type OpenChannelResponse = ResponseSuccess<'post_openchannel'>;
export type CloseChannelRequest = RequestBody<'post_closechannel'>;
export type GetChannelIdRequest = RequestBody<'post_getchannelid'>;
export type GetChannelIdResponse = ResponseSuccess<'post_getchannelid'>;

// Lightning Network - Peers
export type ListPeersResponse = ResponseSuccess<'get_listpeers'>;
export type ConnectPeerRequest = RequestBody<'post_connectpeer'>;
export type ConnectPeerResponse = ResponseSuccess<'post_connectpeer'>;
export type DisconnectPeerRequest = RequestBody<'post_disconnectpeer'>;

// Lightning Network - Invoices & Payments
export type CreateLNInvoiceRequest = RequestBody<'post_lninvoice'>;
export type CreateLNInvoiceResponse = ResponseSuccess<'post_lninvoice'>;
export type CreateRgbInvoiceRequest = RequestBody<'post_rgbinvoice'>;
export type CreateRgbInvoiceResponse = ResponseSuccess<'post_rgbinvoice'>;
export type DecodeLNInvoiceRequest = RequestBody<'post_decodelninvoice'>;
export type DecodeLNInvoiceResponse = ResponseSuccess<'post_decodelninvoice'>;
export type DecodeRgbInvoiceRequest = RequestBody<'post_decodergbinvoice'>;
export type DecodeRgbInvoiceResponse = ResponseSuccess<'post_decodergbinvoice'>;
export type GetInvoiceStatusRequest = RequestBody<'post_invoicestatus'>;
export type GetInvoiceStatusResponse = ResponseSuccess<'post_invoicestatus'>;
export type SendPaymentRequest = RequestBody<'post_sendpayment'>;
export type SendPaymentResponse = ResponseSuccess<'post_sendpayment'>;
export type KeysendRequest = RequestBody<'post_keysend'>;
export type KeysendResponse = ResponseSuccess<'post_keysend'>;
export type ListPaymentsResponse = ResponseSuccess<'get_listpayments'>;
export type GetPaymentRequest = RequestBody<'post_getpayment'>;
export type GetPaymentResponse = ResponseSuccess<'post_getpayment'>;

// Maker/Taker Swaps
export type WhitelistTradeRequest = RequestBody<'post_taker'>;
export type MakerInitRequest = RequestBody<'post_makerinit'>;
export type MakerInitResponse = ResponseSuccess<'post_makerinit'>;
export type MakerExecuteRequest = RequestBody<'post_makerexecute'>;
export type MakerExecuteResponse = ResponseSuccess<'post_makerexecute'>;
export type ListSwapsResponse = ResponseSuccess<'get_listswaps'>;
export type GetSwapRequest = RequestBody<'post_getswap'>;
export type GetSwapResponse = ResponseSuccess<'post_getswap'>;

// Utility Methods
export type AddressResponse = ResponseSuccess<'post_address'>;
export type SignMessageRequest = RequestBody<'post_signmessage'>;
export type SignMessageResponse = ResponseSuccess<'post_signmessage'>;
export type SendOnionMessageRequest = RequestBody<'post_sendonionmessage'>;
export type CheckIndexerUrlRequest = RequestBody<'post_checkindexerurl'>;
export type CheckProxyEndpointRequest = RequestBody<'post_checkproxyendpoint'>;
export type RevokeTokenRequest = RequestBody<'post_revoketoken'>;
export type EstimateFeeRequest = RequestBody<'post_estimatefee'>;
export type EstimateFeeResponse = ResponseSuccess<'post_estimatefee'>;

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
