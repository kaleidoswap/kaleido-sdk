/**
 * RLN Client - RGB Lightning Node Operations
 *
 * Type-safe client matching the exact OpenAPI specification.
 * All Node API endpoints use POST method.
 */

import { HttpClient } from './http-client.js';
import { assertResponse } from './errors.js';
import type {
    InitWalletRequest,
    InitResponse,
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

export class RlnClient {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    // ============================================================================
    // Wallet Management
    // ============================================================================

    async getNodeInfo(): Promise<NodeInfoResponse> {
        return assertResponse(await this.http.node.GET('/nodeinfo'));
    }

    async getNetworkInfo(): Promise<NetworkInfoResponse> {
        return assertResponse(await this.http.node.GET('/networkinfo'));
    }

    async initWallet(body: InitWalletRequest): Promise<InitResponse> {
        return assertResponse(await this.http.node.POST('/init', { body }));
    }

    async unlockWallet(body: UnlockWalletRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/unlock', { body }));
    }

    async lockWallet(): Promise<void> {
        assertResponse(await this.http.node.POST('/lock'));
    }

    async changePassword(body: ChangePasswordRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/changepassword', { body }));
    }

    async backup(body: BackupRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/backup', { body }));
    }

    async restore(body: RestoreRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/restore', { body }));
    }

    async shutdown(): Promise<void> {
        assertResponse(await this.http.node.POST('/shutdown'));
    }

    // ============================================================================
    // BTC Operations
    // ============================================================================

    async getAddress(): Promise<AddressResponse> {
        return assertResponse(await this.http.node.POST('/address'));
    }

    async getBtcBalance(skipSync: boolean = false): Promise<BtcBalanceResponse> {
        return assertResponse(
            await this.http.node.POST('/btcbalance', { body: { skip_sync: skipSync } }),
        );
    }

    async sendBtc(body: SendBtcRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/sendbtc', { body }));
    }

    async listTransactions(request?: ListTransactionsRequest): Promise<ListTransactionsResponse> {
        return assertResponse(
            await this.http.node.POST('/listtransactions', {
                body: { skip_sync: false, ...request },
            }),
        );
    }

    async listUnspents(): Promise<ListUnspentsResponse> {
        return assertResponse(
            await this.http.node.POST('/listunspents', { body: { skip_sync: false } }),
        );
    }

    async createUtxos(body: CreateUtxosRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/createutxos', { body }));
    }

    async estimateFee(body: EstimateFeeRequest): Promise<EstimateFeeResponse> {
        return assertResponse(await this.http.node.POST('/estimatefee', { body }));
    }

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    async listAssets(
        filterAssetSchemas: ('Nia' | 'Uda' | 'Cfa')[] = [],
    ): Promise<ListAssetsResponse> {
        return assertResponse(
            await this.http.node.POST('/listassets', {
                body: { filter_asset_schemas: filterAssetSchemas },
            }),
        );
    }

    async getAssetBalance(body: AssetBalanceRequest): Promise<AssetBalanceResponse> {
        return assertResponse(await this.http.node.POST('/assetbalance', { body }));
    }

    async getAssetMetadata(body: AssetMetadataRequest): Promise<AssetMetadataResponse> {
        return assertResponse(await this.http.node.POST('/assetmetadata', { body }));
    }

    async getAssetMedia(body: AssetMediaRequest): Promise<AssetMediaResponse> {
        return assertResponse(await this.http.node.POST('/getassetmedia', { body }));
    }

    async issueAssetNIA(body: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
        return assertResponse(await this.http.node.POST('/issueassetnia', { body }));
    }

    async issueAssetCFA(body: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
        return assertResponse(await this.http.node.POST('/issueassetcfa', { body }));
    }

    async issueAssetUDA(body: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
        return assertResponse(await this.http.node.POST('/issueassetuda', { body }));
    }

    async sendRgb(body: SendRgbRequest): Promise<SendRgbResponse> {
        return assertResponse(await this.http.node.POST('/sendrgb', { body }));
    }

    async listTransfers(body: ListTransfersRequest): Promise<ListTransfersResponse> {
        return assertResponse(await this.http.node.POST('/listtransfers', { body }));
    }

    async refreshTransfers(body?: RefreshTransfersRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/refreshtransfers', { body: body || {} }));
    }

    async syncRgbWallet(): Promise<void> {
        assertResponse(await this.http.node.POST('/sync'));
    }

    async failTransfers(body: FailTransfersRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/failtransfers', { body }));
    }

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    async listChannels(): Promise<ListChannelsResponse> {
        return assertResponse(await this.http.node.GET('/listchannels'));
    }

    async openChannel(body: OpenChannelRequest): Promise<OpenChannelResponse> {
        return assertResponse(await this.http.node.POST('/openchannel', { body }));
    }

    async closeChannel(body: CloseChannelRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/closechannel', { body }));
    }

    async getChannelId(body: GetChannelIdRequest): Promise<GetChannelIdResponse> {
        return assertResponse(await this.http.node.POST('/getchannelid', { body }));
    }

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    async listPeers(): Promise<ListPeersResponse> {
        return assertResponse(await this.http.node.GET('/listpeers'));
    }

    async connectPeer(body: ConnectPeerRequest): Promise<ConnectPeerResponse> {
        return assertResponse(await this.http.node.POST('/connectpeer', { body }));
    }

    async disconnectPeer(body: DisconnectPeerRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/disconnectpeer', { body }));
    }

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    async createLNInvoice(body: CreateLNInvoiceRequest): Promise<CreateLNInvoiceResponse> {
        return assertResponse(await this.http.node.POST('/lninvoice', { body }));
    }

    async createRgbInvoice(body: CreateRgbInvoiceRequest): Promise<CreateRgbInvoiceResponse> {
        return assertResponse(await this.http.node.POST('/rgbinvoice', { body }));
    }

    async decodeLNInvoice(body: DecodeLNInvoiceRequest | string): Promise<DecodeLNInvoiceResponse> {
        const requestBody = typeof body === 'string' ? { invoice: body } : body;
        return assertResponse(await this.http.node.POST('/decodelninvoice', { body: requestBody }));
    }

    async decodeRgbInvoice(body: DecodeRgbInvoiceRequest): Promise<DecodeRgbInvoiceResponse> {
        return assertResponse(await this.http.node.POST('/decodergbinvoice', { body }));
    }

    async getInvoiceStatus(body: GetInvoiceStatusRequest): Promise<GetInvoiceStatusResponse> {
        return assertResponse(await this.http.node.POST('/invoicestatus', { body }));
    }

    async sendPayment(body: SendPaymentRequest): Promise<SendPaymentResponse> {
        return assertResponse(await this.http.node.POST('/sendpayment', { body }));
    }

    async keysend(body: KeysendRequest): Promise<KeysendResponse> {
        return assertResponse(await this.http.node.POST('/keysend', { body }));
    }

    async listPayments(): Promise<ListPaymentsResponse> {
        return assertResponse(await this.http.node.GET('/listpayments'));
    }

    async getPayment(body: GetPaymentRequest): Promise<GetPaymentResponse> {
        return assertResponse(await this.http.node.POST('/getpayment', { body }));
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

    async getTakerPubkey(): Promise<string> {
        const data = assertResponse(await this.http.node.GET('/nodeinfo'));
        return data.pubkey!;
    }

    async whitelistSwap(body: WhitelistTradeRequest | string): Promise<void> {
        const requestBody = typeof body === 'string' ? { swapstring: body } : body;
        assertResponse(await this.http.node.POST('/taker', { body: requestBody }));
    }

    async close(): Promise<void> {
        await this.shutdown();
    }

    async makerInit(body: MakerInitRequest): Promise<MakerInitResponse> {
        return assertResponse(await this.http.node.POST('/makerinit', { body }));
    }

    async makerExecute(body: MakerExecuteRequest): Promise<MakerExecuteResponse> {
        return assertResponse(await this.http.node.POST('/makerexecute', { body }));
    }

    async listSwaps(): Promise<ListSwapsResponse> {
        return assertResponse(await this.http.node.GET('/listswaps'));
    }

    async getSwap(body: GetSwapRequest): Promise<GetSwapResponse> {
        return assertResponse(await this.http.node.POST('/getswap', { body }));
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    async signMessage(body: SignMessageRequest): Promise<SignMessageResponse> {
        return assertResponse(await this.http.node.POST('/signmessage', { body }));
    }

    async sendOnionMessage(body: SendOnionMessageRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/sendonionmessage', { body }));
    }

    async checkIndexerUrl(body: CheckIndexerUrlRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/checkindexerurl', { body }));
    }

    async checkProxyEndpoint(body: CheckProxyEndpointRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/checkproxyendpoint', { body }));
    }

    async revokeToken(body: RevokeTokenRequest): Promise<void> {
        assertResponse(await this.http.node.POST('/revoketoken', { body }));
    }
}
