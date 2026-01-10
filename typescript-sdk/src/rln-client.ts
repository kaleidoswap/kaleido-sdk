/**
 * RLN Client - RGB Lightning Node Operations
 * 
 * Type-safe client matching the exact OpenAPI specification.
 * All Node API endpoints use POST method.
 */

import { HttpClient } from './http-client.js';
import { mapHttpError } from './errors.js';
import type {
    InitWalletRequest,
    UnlockWalletRequest,
    ChangePasswordRequest,
    BackupRequest,
    RestoreRequest,
    NodeInfoResponse,
    NetworkInfoResponse,
    AddressResponse,
    BtcBalanceResponse,
    SendBtcRequest,
    ListTransactionsResponse,
    ListUnspentsResponse,
    CreateUtxosRequest,
    EstimateFeeRequest,
    EstimateFeeResponse,
    ListAssetsResponse,
    AssetBalanceRequest,
    AssetBalanceResponse,
    AssetMetadataRequest,
    AssetMetadataResponse,
    AssetMediaRequest,
    AssetMediaResponse,
    IssueAssetNIARequest,
    IssueAssetNIAResponse,
    IssueAssetCFARequest,
    IssueAssetCFAResponse,
    IssueAssetUDARequest,
    IssueAssetUDAResponse,
    SendAssetRequest,
    SendAssetResponse,
    ListTransfersResponse,
    RefreshTransfersRequest,
    FailTransfersRequest,
    ListChannelsResponse,
    OpenChannelRequest,
    OpenChannelResponse,
    CloseChannelRequest,
    GetChannelIdRequest,
    GetChannelIdResponse,
    ListPeersResponse,
    ConnectPeerRequest,
    DisconnectPeerRequest,
    CreateLNInvoiceRequest,
    CreateLNInvoiceResponse,
    CreateRgbInvoiceRequest,
    CreateRgbInvoiceResponse,
    DecodeLNInvoiceRequest,
    DecodeLNInvoiceResponse,
    DecodeRgbInvoiceRequest,
    DecodeRgbInvoiceResponse,
    GetInvoiceStatusRequest,
    GetInvoiceStatusResponse,
    SendPaymentRequest,
    SendPaymentResponse,
    KeysendRequest,
    KeysendResponse,
    ListPaymentsResponse,
    GetPaymentRequest,
    GetPaymentResponse,
    WhitelistTradeRequest,
    MakerInitRequest,
    MakerInitResponse,
    MakerExecuteRequest,
    MakerExecuteResponse,
    ListSwapsResponse,
    GetSwapRequest,
    GetSwapResponse,
    SignMessageRequest,
    SignMessageResponse,
    SendOnionMessageRequest,
    CheckIndexerUrlRequest,
    CheckProxyEndpointRequest,
    RevokeTokenRequest,
} from './node-types-ext.js';

function handleError(error: any): never {
    throw mapHttpError({
        status: error?.status || 500,
        statusText: 'API Error',
        data: error
    });
}

export class RlnClient {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    // ============================================================================
    // Wallet Management
    // ============================================================================

    async getNodeInfo(): Promise<NodeInfoResponse> {
        const { data, error } = await this.http.node.GET('/nodeinfo');
        if (error) handleError(error);
        return data!;
    }

    async getNetworkInfo(): Promise<NetworkInfoResponse> {
        const { data, error } = await this.http.node.GET('/networkinfo');
        if (error) handleError(error);
        return data!;
    }

    async initWallet(body: InitWalletRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/init', { body });
        if (error) handleError(error);
    }

    async unlockWallet(body: UnlockWalletRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/unlock', { body });
        if (error) handleError(error);
    }

    async lockWallet(): Promise<void> {
        const { data, error } = await this.http.node.POST('/lock');
        if (error) handleError(error);
    }

    async changePassword(body: ChangePasswordRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/changepassword', { body });
        if (error) handleError(error);
    }

    async backup(body: BackupRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/backup', { body });
        if (error) handleError(error);
    }

    async restore(body: RestoreRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/restore', { body });
        if (error) handleError(error);
    }

    async shutdown(): Promise<void> {
        const { data, error } = await this.http.node.POST('/shutdown');
        if (error) handleError(error);
    }

    // ============================================================================
    // BTC Operations
    // ============================================================================

    async getAddress(): Promise<AddressResponse> {
        const { data, error } = await this.http.node.POST('/address');
        if (error) handleError(error);
        return data!;
    }

    async getBtcBalance(): Promise<BtcBalanceResponse> {
        const { data, error } = await this.http.node.POST('/btcbalance', { body: {} });
        if (error) handleError(error);
        return data!;
    }

    async sendBtc(body: SendBtcRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/sendbtc', { body });
        if (error) handleError(error);
    }

    async listTransactions(): Promise<ListTransactionsResponse> {
        const { data, error } = await this.http.node.POST('/listtransactions', { body: {} });
        if (error) handleError(error);
        return data!;
    }

    async listUnspents(): Promise<ListUnspentsResponse> {
        const { data, error } = await this.http.node.POST('/listunspents', { body: {} });
        if (error) handleError(error);
        return data!;
    }

    async createUtxos(body: CreateUtxosRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/createutxos', { body });
        if (error) handleError(error);
    }

    async estimateFee(body: EstimateFeeRequest): Promise<EstimateFeeResponse> {
        const { data, error } = await this.http.node.POST('/estimatefee', { body });
        if (error) handleError(error);
        return data!;
    }

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    async listAssets(): Promise<ListAssetsResponse> {
        const { data, error } = await this.http.node.POST('/listassets', { body: {} });
        if (error) handleError(error);
        return data!;
    }

    async getAssetBalance(body: AssetBalanceRequest): Promise<AssetBalanceResponse> {
        const { data, error } = await this.http.node.POST('/assetbalance', { body });
        if (error) handleError(error);
        return data!;
    }

    async getAssetMetadata(body: AssetMetadataRequest): Promise<AssetMetadataResponse> {
        const { data, error } = await this.http.node.POST('/assetmetadata', { body });
        if (error) handleError(error);
        return data!;
    }

    async getAssetMedia(body: AssetMediaRequest): Promise<AssetMediaResponse> {
        const { data, error } = await this.http.node.POST('/getassetmedia', { body });
        if (error) handleError(error);
        return data!;
    }

    async issueAssetNIA(body: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
        const { data, error } = await this.http.node.POST('/issueassetnia', { body });
        if (error) handleError(error);
        return data!;
    }

    async issueAssetCFA(body: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
        const { data, error } = await this.http.node.POST('/issueassetcfa', { body });
        if (error) handleError(error);
        return data!;
    }

    async issueAssetUDA(body: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
        const { data, error } = await this.http.node.POST('/issueassetuda', { body });
        if (error) handleError(error);
        return data!;
    }

    async sendAsset(body: SendAssetRequest): Promise<SendAssetResponse> {
        const { data, error } = await this.http.node.POST('/sendasset', { body });
        if (error) handleError(error);
        return data!;
    }

    async listTransfers(): Promise<ListTransfersResponse> {
        const { data, error } = await this.http.node.POST('/listtransfers', { body: {} });
        if (error) handleError(error);
        return data!;
    }

    async refreshTransfers(body?: RefreshTransfersRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/refreshtransfers', { body: body || {} });
        if (error) handleError(error);
    }

    async failTransfers(body: FailTransfersRequest): Promise<void> {
        const { data, error } = await this.http.node.POST('/failtransfers', { body });
        if (error) handleError(error);
    }

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    async listChannels(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listchannels');
        if (error) handleError(error);
        return data;
    }

    async openChannel(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/openchannel', { body });
        if (error) handleError(error);
        return data;
    }

    async closeChannel(body: { channel_id: string; peer_pubkey: string; force?: boolean }): Promise<any> {
        const { data, error } = await this.http.node.POST('/closechannel', { body });
        if (error) handleError(error);
        return data;
    }

    async getChannelId(body: { temporary_channel_id: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getchannelid', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    async listPeers(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listpeers');
        if (error) handleError(error);
        return data;
    }

    async connectPeer(body: { peer_pubkey_and_addr: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/connectpeer', { body });
        if (error) handleError(error);
        return data;
    }

    async disconnectPeer(body: { peer_pubkey: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/disconnectpeer', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    async createLNInvoice(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/lninvoice', { body });
        if (error) handleError(error);
        return data;
    }

    async createRgbInvoice(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/rgbinvoice', { body });
        if (error) handleError(error);
        return data;
    }

    async decodeLNInvoice(body: { invoice: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/decodelninvoice', { body });
        if (error) handleError(error);
        return data;
    }

    async decodeRgbInvoice(body: { invoice: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/decodergbinvoice', { body });
        if (error) handleError(error);
        return data;
    }

    async getInvoiceStatus(body: { invoice?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/invoicestatus', { body });
        if (error) handleError(error);
        return data;
    }

    async sendPayment(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/sendpayment', { body });
        if (error) handleError(error);
        return data;
    }

    async keysend(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/keysend', { body });
        if (error) handleError(error);
        return data;
    }

    async listPayments(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listpayments');
        if (error) handleError(error);
        return data;
    }

    async getPayment(body: { payment_hash: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getpayment', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

    async getTakerPubkey(): Promise<any> {
        const { data, error } = await this.http.node.GET('/nodeinfo');
        if (error) handleError(error);
        return data.pubkey;
    }

    async whitelistTrade(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/taker', { body });
        if (error) handleError(error);
        return data;
    }

    async makerInit(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/makerinit', { body });
        if (error) handleError(error);
        return data;
    }

    async makerExecute(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/makerexecute', { body });
        if (error) handleError(error);
        return data;
    }

    async listSwaps(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listswaps');
        if (error) handleError(error);
        return data;
    }

    async getSwap(body: { payment_hash?: string; taker?: boolean }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getswap', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    async signMessage(body: { message: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/signmessage', { body });
        if (error) handleError(error);
        return data;
    }

    async sendOnionMessage(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/sendonionmessage', { body });
        if (error) handleError(error);
        return data;
    }

    async checkIndexerUrl(body: { indexer_url?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/checkindexerurl', { body });
        if (error) handleError(error);
        return data;
    }

    async checkProxyEndpoint(body: { proxy_url?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/checkproxyendpoint', { body });
        if (error) handleError(error);
        return data;
    }

    async revokeToken(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/revoketoken', { body });
        if (error) handleError(error);
        return data;
    }
}
