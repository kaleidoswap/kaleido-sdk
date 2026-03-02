/**
 * Node API Types
 *
 * Type definitions for the RGB Lightning Node (RLN) API.
 * Import these types when working with wallet, asset, channel,
 * payment, and transfer operations on your connected RGB Lightning Node.
 *
 * @example
 * import type { NodeInfoResponse, ListChannelsResponse } from 'kaleidoswap-sdk/types/node';
 * import type { Channel, Utxo, SendPaymentRequest } from 'kaleidoswap-sdk/types/node';
 */

export type {
    // -------------------------------------------------------------------------
    // Schema types - common models used across node operations
    // -------------------------------------------------------------------------

    /** A Lightning Network channel */
    Channel,

    /** An RGB NIA (Non-Inflatable Asset) held by the node */
    NodeAsset,

    /** @deprecated Use NodeAsset */
    NiaAsset,

    /** A transfer recipient */
    Recipient,

    /** The type of a transfer recipient */
    RecipientType,

    /** A Bitcoin UTXO */
    Utxo,

    /** Block height and timestamp info */
    BlockTime,

    /** Embedded media attached to an asset */
    EmbeddedMedia,

    /** Media metadata */
    Media,

    /** Request to upload asset media */
    PostAssetMediaRequest,

    /** Response after uploading asset media */
    PostAssetMediaResponse,

    /** Proof of reserves for an asset */
    ProofOfReserves,

    /** An RGB allocation on a UTXO */
    RgbAllocation,

    /** A UDA (Unique Digital Asset) token */
    Token,

    /** Lightweight token representation */
    TokenLight,

    /** Type of a Bitcoin transaction */
    TransactionType,

    /** Transport endpoint for an RGB transfer */
    TransferTransportEndpoint,

    /** Witness data for a transaction */
    WitnessData,

    /** Raw access to all Node schema components for advanced usage */
    NodeComponents,

    // -------------------------------------------------------------------------
    // Authentication & Wallet
    // -------------------------------------------------------------------------

    /** Request body for initialising a new wallet */
    InitWalletRequest,

    /** Response after wallet initialisation */
    InitResponse,

    /** Request body for unlocking the wallet */
    UnlockRequest,

    /** Response after unlocking the wallet */
    UnlockResponse,

    /** Request body for changing the wallet password */
    ChangePasswordRequest,

    /** Response after changing the password */
    ChangePasswordResponse,

    /** Request body for restoring a wallet from backup */
    RestoreRequest,

    /** Response after restoring a wallet */
    RestoreResponse,

    /** Request body for creating a wallet backup */
    BackupRequest,

    /** Response after creating a backup */
    BackupResponse,

    /** Response after requesting node shutdown */
    ShutdownResponse,

    // -------------------------------------------------------------------------
    // Node Information
    // -------------------------------------------------------------------------

    /** Response containing general node information (pubkey, alias, etc.) */
    NodeInfoResponse,

    /** Response containing network-level information */
    NetworkInfoResponse,

    // -------------------------------------------------------------------------
    // Bitcoin Operations
    // -------------------------------------------------------------------------

    /** Response containing a new on-chain address */
    AddressResponse,

    /** Response containing the BTC balance */
    BtcBalanceResponse,

    /** Request body for sending BTC on-chain */
    SendBtcRequest,

    /** Response after sending BTC on-chain */
    SendBtcResponse,

    /** Request body for listing on-chain transactions */
    ListTransactionsRequest,

    /** Response containing the list of on-chain transactions */
    ListTransactionsResponse,

    /** Request body for listing UTXOs */
    ListUnspentsRequest,

    /** Response containing the list of UTXOs */
    ListUnspentsResponse,

    /** Request body for creating new UTXOs */
    CreateUtxosRequest,

    /** Response after creating UTXOs */
    CreateUtxosResponse,

    /** Request body for estimating an on-chain fee */
    EstimateFeeRequest,

    /** Response containing the estimated fee rate */
    EstimateFeeResponse,

    // -------------------------------------------------------------------------
    // RGB Asset Management
    // -------------------------------------------------------------------------

    /** Request body for listing RGB assets held by the node */
    ListAssetsRequest,

    /** Response containing the list of RGB assets */
    ListAssetsResponse,

    /** Request body for querying the balance of an RGB asset */
    AssetBalanceRequest,

    /** Response containing the balance for a specific RGB asset */
    AssetBalanceResponse,

    /** Request body for fetching asset metadata */
    AssetMetadataRequest,

    /** Response containing asset metadata */
    AssetMetadataResponse,

    /** Request body for fetching asset media */
    GetAssetMediaRequest,

    /** Response containing the asset media data */
    GetAssetMediaResponse,

    /** Request body for sending RGB assets on-chain */
    SendRgbRequest,

    /** Response after sending RGB assets on-chain */
    SendRgbResponse,

    // -------------------------------------------------------------------------
    // Asset Issuance
    // -------------------------------------------------------------------------

    /** Request body for issuing a new NIA (Non-Inflatable Asset) */
    IssueAssetNIARequest,

    /** Response after issuing a NIA */
    IssueAssetNIAResponse,

    /** Request body for issuing a new CFA (Collectible Fixed Asset) */
    IssueAssetCFARequest,

    /** Response after issuing a CFA */
    IssueAssetCFAResponse,

    /** Request body for issuing a new UDA (Unique Digital Asset) */
    IssueAssetUDARequest,

    /** Response after issuing a UDA */
    IssueAssetUDAResponse,

    // -------------------------------------------------------------------------
    // Transfers
    // -------------------------------------------------------------------------

    /** Request body for listing asset transfers */
    ListTransfersRequest,

    /** Response containing the list of transfers */
    ListTransfersResponse,

    /** Request body for refreshing pending transfers */
    RefreshTransfersRequest,

    /** Request body for failing stuck transfers */
    FailTransfersRequest,

    // -------------------------------------------------------------------------
    // Lightning Network - Channels
    // -------------------------------------------------------------------------

    /** Response containing the list of open channels */
    ListChannelsResponse,

    /** Request body for opening a new channel */
    OpenChannelRequest,

    /** Response after opening a channel */
    OpenChannelResponse,

    /** Request body for closing a channel */
    CloseChannelRequest,

    /** Request body for looking up a channel ID */
    GetChannelIdRequest,

    /** Response containing the channel ID */
    GetChannelIdResponse,

    // -------------------------------------------------------------------------
    // Lightning Network - Peers
    // -------------------------------------------------------------------------

    /** Response containing the list of connected peers */
    ListPeersResponse,

    /** Request body for connecting to a peer */
    ConnectPeerRequest,

    /** Response after connecting to a peer */
    ConnectPeerResponse,

    /** Request body for disconnecting from a peer */
    DisconnectPeerRequest,

    // -------------------------------------------------------------------------
    // Lightning Network - Invoices
    // -------------------------------------------------------------------------

    /** Request body for creating a Lightning (BOLT11) invoice */
    CreateLNInvoiceRequest,

    /** Response containing the created Lightning invoice */
    CreateLNInvoiceResponse,

    /** Request body for creating an RGB Lightning invoice */
    CreateRgbInvoiceRequest,

    /** Response containing the created RGB invoice */
    CreateRgbInvoiceResponse,

    /** Request body for decoding a BOLT11 invoice */
    DecodeLNInvoiceRequest,

    /** Response containing decoded BOLT11 invoice details */
    DecodeLNInvoiceResponse,

    /** Request body for decoding an RGB invoice */
    DecodeRgbInvoiceRequest,

    /** Response containing decoded RGB invoice details */
    DecodeRgbInvoiceResponse,

    /** Request body for checking the status of an invoice */
    GetInvoiceStatusRequest,

    /** Response containing the invoice status */
    GetInvoiceStatusResponse,

    // -------------------------------------------------------------------------
    // Lightning Network - Payments
    // -------------------------------------------------------------------------

    /** Request body for sending a Lightning payment */
    SendPaymentRequest,

    /** Response after sending a Lightning payment */
    SendPaymentResponse,

    /** Request body for a keysend payment (no invoice required) */
    KeysendRequest,

    /** Response after sending a keysend payment */
    KeysendResponse,

    /** Response containing the list of payments */
    ListPaymentsResponse,

    /** Request body for fetching details of a specific payment */
    GetPaymentRequest,

    /** Response containing the payment details */
    GetPaymentResponse,

    // -------------------------------------------------------------------------
    // Maker / Taker Swaps (on-node)
    // -------------------------------------------------------------------------

    /** Request body for whitelisting a swap string as taker */
    WhitelistTradeRequest,

    /** Request body for initialising a maker swap */
    MakerInitRequest,

    /** Response after initiating a maker swap */
    MakerInitResponse,

    /** Request body for executing a maker swap */
    MakerExecuteRequest,

    /** Response after executing a maker swap */
    MakerExecuteResponse,

    /** Response containing the list of on-node swaps */
    ListSwapsResponse,

    /** Request body for fetching a specific on-node swap */
    GetSwapRequest,

    /** Response containing a specific on-node swap */
    GetSwapResponse,

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    /** Request body for signing a message */
    SignMessageRequest,

    /** Response containing the signed message */
    SignMessageResponse,

    /** Request body for sending an onion message */
    SendOnionMessageRequest,

    /** Request body for checking an indexer URL */
    CheckIndexerUrlRequest,

    /** Request body for checking a proxy endpoint */
    CheckProxyEndpointRequest,

    /** Request body for revoking an auth token */
    RevokeTokenRequest,

    // -------------------------------------------------------------------------
    // Backward compatibility aliases
    // -------------------------------------------------------------------------

    /** @deprecated Use InitWalletRequest */
    InitRequest,

    /** @deprecated Use UnlockRequest */
    UnlockWalletRequest,

    /** @deprecated Use CreateLNInvoiceResponse */
    LNInvoiceResponse,

    /** @deprecated Use GetAssetMediaRequest */
    AssetMediaRequest,

    /** @deprecated Use GetAssetMediaResponse */
    AssetMediaResponse,
} from '../node-types-ext.js';
