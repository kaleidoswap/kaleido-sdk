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
    ListTransactionsRequest,
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
    SendRgbRequest,
    SendRgbResponse,
    ListTransfersRequest,
    ListTransfersResponse,
    RefreshTransfersRequest,
    FailTransfersRequest,
    // Lightning Network - Channels
    ListChannelsResponse,
    OpenChannelRequest,
    OpenChannelResponse,
    CloseChannelRequest,
    GetChannelIdRequest,
    GetChannelIdResponse,
    // Lightning Network - Peers
    ListPeersResponse,
    ConnectPeerRequest,
    ConnectPeerResponse,
    DisconnectPeerRequest,
    // Lightning Network - Invoices & Payments
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
    // Maker/Taker Swaps
    WhitelistTradeRequest,
    MakerInitRequest,
    MakerInitResponse,
    MakerExecuteRequest,
    MakerExecuteResponse,
    ListSwapsResponse,
    GetSwapRequest,
    GetSwapResponse,
    // Utility Methods
    SignMessageRequest,
    SignMessageResponse,
    SendOnionMessageRequest,
    CheckIndexerUrlRequest,
    CheckProxyEndpointRequest,
    RevokeTokenRequest,
} from './node-types-ext.js';

/**
 * Check for error and throw if present (for void methods)
 */
function checkError(result: { error?: unknown }): void {
    if (result.error) {
        const err = result.error as { status?: number };
        throw mapHttpError({
            status: err?.status || 500,
            statusText: 'API Error',
            data: result.error,
        });
    }
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
        checkError({ error });
        return data!;
    }

    async getNetworkInfo(): Promise<NetworkInfoResponse> {
        const { data, error } = await this.http.node.GET('/networkinfo');
        checkError({ error });
        return data!;
    }

    async initWallet(body: InitWalletRequest): Promise<void> {
        const { error } = await this.http.node.POST('/init', { body });
        checkError({ error });
    }

    async unlockWallet(body: UnlockWalletRequest): Promise<void> {
        const { error } = await this.http.node.POST('/unlock', { body });
        checkError({ error });
    }

    async lockWallet(): Promise<void> {
        const { error } = await this.http.node.POST('/lock');
        checkError({ error });
    }

    async changePassword(body: ChangePasswordRequest): Promise<void> {
        const { error } = await this.http.node.POST('/changepassword', { body });
        checkError({ error });
    }

    async backup(body: BackupRequest): Promise<void> {
        const { error } = await this.http.node.POST('/backup', { body });
        checkError({ error });
    }

    async restore(body: RestoreRequest): Promise<void> {
        const { error } = await this.http.node.POST('/restore', { body });
        checkError({ error });
    }

    async shutdown(): Promise<void> {
        const { error } = await this.http.node.POST('/shutdown');
        checkError({ error });
    }

    // ============================================================================
    // BTC Operations
    // ============================================================================

    async getAddress(): Promise<AddressResponse> {
        const { data, error } = await this.http.node.POST('/address');
        checkError({ error });
        return data!;
    }

    async getBtcBalance(skipSync: boolean = false): Promise<BtcBalanceResponse> {
        const { data, error } = await this.http.node.POST('/btcbalance', {
            body: { skip_sync: skipSync },
        });
        checkError({ error });
        return data!;
    }

    async sendBtc(body: SendBtcRequest): Promise<void> {
        const { error } = await this.http.node.POST('/sendbtc', { body });
        checkError({ error });
    }

    async listTransactions(request?: ListTransactionsRequest): Promise<ListTransactionsResponse> {
        const { data, error } = await this.http.node.POST('/listtransactions', {
            body: { skip_sync: false, ...request },
        });
        checkError({ error });
        return data!;
    }

    async listUnspents(): Promise<ListUnspentsResponse> {
        const { data, error } = await this.http.node.POST('/listunspents', {
            body: { skip_sync: false },
        });
        checkError({ error });
        return data!;
    }

    async createUtxos(body: CreateUtxosRequest): Promise<void> {
        const { error } = await this.http.node.POST('/createutxos', { body });
        checkError({ error });
    }

    async estimateFee(body: EstimateFeeRequest): Promise<EstimateFeeResponse> {
        const { data, error } = await this.http.node.POST('/estimatefee', { body });
        checkError({ error });
        return data!;
    }

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    async listAssets(
        filterAssetSchemas: ('Nia' | 'Uda' | 'Cfa')[] = [],
    ): Promise<ListAssetsResponse> {
        const { data, error } = await this.http.node.POST('/listassets', {
            body: { filter_asset_schemas: filterAssetSchemas },
        });
        checkError({ error });
        return data!;
    }

    async getAssetBalance(body: AssetBalanceRequest): Promise<AssetBalanceResponse> {
        const { data, error } = await this.http.node.POST('/assetbalance', { body });
        checkError({ error });
        return data!;
    }

    async getAssetMetadata(body: AssetMetadataRequest): Promise<AssetMetadataResponse> {
        const { data, error } = await this.http.node.POST('/assetmetadata', { body });
        checkError({ error });
        return data!;
    }

    async getAssetMedia(body: AssetMediaRequest): Promise<AssetMediaResponse> {
        const { data, error } = await this.http.node.POST('/getassetmedia', { body });
        checkError({ error });
        return data!;
    }

    async issueAssetNIA(body: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
        const { data, error } = await this.http.node.POST('/issueassetnia', { body });
        checkError({ error });
        return data!;
    }

    async issueAssetCFA(body: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
        const { data, error } = await this.http.node.POST('/issueassetcfa', { body });
        checkError({ error });
        return data!;
    }

    async issueAssetUDA(body: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
        const { data, error } = await this.http.node.POST('/issueassetuda', { body });
        checkError({ error });
        return data!;
    }

    async sendRgb(body: SendRgbRequest): Promise<SendRgbResponse> {
        const { data, error } = await this.http.node.POST('/sendrgb', { body });
        checkError({ error });
        return data!;
    }

    async listTransfers(body: ListTransfersRequest): Promise<ListTransfersResponse> {
        const { data, error } = await this.http.node.POST('/listtransfers', { body });
        checkError({ error });
        return data!;
    }

    async refreshTransfers(body?: RefreshTransfersRequest): Promise<void> {
        const { error } = await this.http.node.POST('/refreshtransfers', { body: body || {} });
        checkError({ error });
    }

    async failTransfers(body: FailTransfersRequest): Promise<void> {
        const { error } = await this.http.node.POST('/failtransfers', { body });
        checkError({ error });
    }

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    async listChannels(): Promise<ListChannelsResponse> {
        const { data, error } = await this.http.node.GET('/listchannels');
        checkError({ error });
        return data!;
    }

    async openChannel(body: OpenChannelRequest): Promise<OpenChannelResponse> {
        const { data, error } = await this.http.node.POST('/openchannel', { body });
        checkError({ error });
        return data!;
    }

    async closeChannel(body: CloseChannelRequest): Promise<void> {
        const { error } = await this.http.node.POST('/closechannel', { body });
        checkError({ error });
    }

    async getChannelId(body: GetChannelIdRequest): Promise<GetChannelIdResponse> {
        const { data, error } = await this.http.node.POST('/getchannelid', { body });
        checkError({ error });
        return data!;
    }

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    async listPeers(): Promise<ListPeersResponse> {
        const { data, error } = await this.http.node.GET('/listpeers');
        checkError({ error });
        return data!;
    }

    async connectPeer(body: ConnectPeerRequest): Promise<ConnectPeerResponse> {
        const { data, error } = await this.http.node.POST('/connectpeer', { body });
        checkError({ error });
        return data!;
    }

    async disconnectPeer(body: DisconnectPeerRequest): Promise<void> {
        const { error } = await this.http.node.POST('/disconnectpeer', { body });
        checkError({ error });
    }

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    async createLNInvoice(body: CreateLNInvoiceRequest): Promise<CreateLNInvoiceResponse> {
        const { data, error } = await this.http.node.POST('/lninvoice', { body });
        checkError({ error });
        return data!;
    }

    async createRgbInvoice(body: CreateRgbInvoiceRequest): Promise<CreateRgbInvoiceResponse> {
        const { data, error } = await this.http.node.POST('/rgbinvoice', { body });
        checkError({ error });
        return data!;
    }

    async decodeLNInvoice(body: DecodeLNInvoiceRequest | string): Promise<DecodeLNInvoiceResponse> {
        const requestBody = typeof body === 'string' ? { invoice: body } : body;
        const { data, error } = await this.http.node.POST('/decodelninvoice', {
            body: requestBody,
        });
        checkError({ error });
        return data!;
    }

    async decodeRgbInvoice(body: DecodeRgbInvoiceRequest): Promise<DecodeRgbInvoiceResponse> {
        const { data, error } = await this.http.node.POST('/decodergbinvoice', { body });
        checkError({ error });
        return data!;
    }

    async getInvoiceStatus(body: GetInvoiceStatusRequest): Promise<GetInvoiceStatusResponse> {
        const { data, error } = await this.http.node.POST('/invoicestatus', { body });
        checkError({ error });
        return data!;
    }

    async sendPayment(body: SendPaymentRequest): Promise<SendPaymentResponse> {
        const { data, error } = await this.http.node.POST('/sendpayment', { body });
        checkError({ error });
        return data!;
    }

    async keysend(body: KeysendRequest): Promise<KeysendResponse> {
        const { data, error } = await this.http.node.POST('/keysend', { body });
        checkError({ error });
        return data!;
    }

    async listPayments(): Promise<ListPaymentsResponse> {
        const { data, error } = await this.http.node.GET('/listpayments');
        checkError({ error });
        return data!;
    }

    async getPayment(body: GetPaymentRequest): Promise<GetPaymentResponse> {
        const { data, error } = await this.http.node.POST('/getpayment', { body });
        checkError({ error });
        return data!;
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

    async getTakerPubkey(): Promise<string> {
        const { data, error } = await this.http.node.GET('/nodeinfo');
        checkError({ error });
        return data!.pubkey!;
    }

    async whitelistSwap(body: WhitelistTradeRequest | string): Promise<void> {
        const requestBody = typeof body === 'string' ? { swapstring: body } : body;
        const { error } = await this.http.node.POST('/taker', { body: requestBody });
        checkError({ error });
    }

    async close(): Promise<void> {
        await this.shutdown();
    }

    async makerInit(body: MakerInitRequest): Promise<MakerInitResponse> {
        const { data, error } = await this.http.node.POST('/makerinit', { body });
        checkError({ error });
        return data!;
    }

    async makerExecute(body: MakerExecuteRequest): Promise<MakerExecuteResponse> {
        const { data, error } = await this.http.node.POST('/makerexecute', { body });
        checkError({ error });
        return data!;
    }

    async listSwaps(): Promise<ListSwapsResponse> {
        const { data, error } = await this.http.node.GET('/listswaps');
        checkError({ error });
        return data!;
    }

    async getSwap(body: GetSwapRequest): Promise<GetSwapResponse> {
        const { data, error } = await this.http.node.POST('/getswap', { body });
        checkError({ error });
        return data!;
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    async signMessage(body: SignMessageRequest): Promise<SignMessageResponse> {
        const { data, error } = await this.http.node.POST('/signmessage', { body });
        checkError({ error });
        return data!;
    }

    async sendOnionMessage(body: SendOnionMessageRequest): Promise<void> {
        const { error } = await this.http.node.POST('/sendonionmessage', { body });
        checkError({ error });
    }

    async checkIndexerUrl(body: CheckIndexerUrlRequest): Promise<void> {
        const { error } = await this.http.node.POST('/checkindexerurl', { body });
        checkError({ error });
    }

    async checkProxyEndpoint(body: CheckProxyEndpointRequest): Promise<void> {
        const { error } = await this.http.node.POST('/checkproxyendpoint', { body });
        checkError({ error });
    }

    async revokeToken(body: RevokeTokenRequest): Promise<void> {
        const { error } = await this.http.node.POST('/revoketoken', { body });
        checkError({ error });
    }
}
