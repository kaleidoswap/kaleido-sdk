/**
 * RLN Client - RGB Lightning Node Operations
 *
 * Type-safe client matching the exact OpenAPI specification.
 * All Node API endpoints use POST method.
 */

import { HttpClient } from './http-client.js';
import { assertResponse } from './errors.js';
import { createLogger, LogState } from './logging.js';
import type { ComponentLogger } from './logging.js';
// ComponentLogger and LogState are imported above for use in the class body.
import { AssetSchema } from './node-types-ext.js';
import type {
    InitRequest,
    InitResponse,
    UnlockRequest,
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
    GetAssetMediaRequest,
    GetAssetMediaResponse,
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
    RefreshRequest,
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
    LNInvoiceRequest,
    CreateLNInvoiceResponse,
    RgbInvoiceRequest,
    RgbInvoiceResponse,
    DecodeLNInvoiceRequest,
    DecodeLNInvoiceResponse,
    DecodeRGBInvoiceRequest,
    DecodeRGBInvoiceResponse,
    InvoiceStatusRequest,
    InvoiceStatusResponse,
    SendPaymentRequest,
    SendPaymentResponse,
    KeysendRequest,
    KeysendResponse,
    ListPaymentsResponse,
    GetPaymentRequest,
    GetPaymentResponse,
    // Maker/Taker Swaps
    TakerRequest,
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
    private readonly _log: ComponentLogger;

    constructor(http: HttpClient, logState: LogState = new LogState()) {
        this.http = http;
        this._log = createLogger('rln', logState);
    }

    // ============================================================================
    // Wallet Management
    // ============================================================================

    async getNodeInfo(): Promise<NodeInfoResponse> {
        this._log.debug('getNodeInfo()');
        const result = assertResponse(await this.http.node.GET('/nodeinfo'));
        this._log.debug('getNodeInfo() -> pubkey=%s', result.pubkey);
        return result;
    }

    async getNetworkInfo(): Promise<NetworkInfoResponse> {
        this._log.debug('getNetworkInfo()');
        return assertResponse(await this.http.node.GET('/networkinfo'));
    }

    async initWallet(body: InitRequest): Promise<InitResponse> {
        this._log.info('initWallet()');
        const result = assertResponse(await this.http.node.POST('/init', { body }));
        this._log.info('initWallet() -> ok');
        return result;
    }

    async unlockWallet(body: UnlockRequest): Promise<void> {
        this._log.info('unlockWallet()');
        assertResponse(await this.http.node.POST('/unlock', { body }));
        this._log.info('unlockWallet() -> ok');
    }

    async lockWallet(): Promise<void> {
        this._log.info('lockWallet()');
        assertResponse(await this.http.node.POST('/lock'));
        this._log.info('lockWallet() -> ok');
    }

    async changePassword(body: ChangePasswordRequest): Promise<void> {
        this._log.info('changePassword()');
        assertResponse(await this.http.node.POST('/changepassword', { body }));
        this._log.info('changePassword() -> ok');
    }

    async backup(body: BackupRequest): Promise<void> {
        this._log.info('backup()');
        assertResponse(await this.http.node.POST('/backup', { body }));
        this._log.info('backup() -> ok');
    }

    async restore(body: RestoreRequest): Promise<void> {
        this._log.info('restore()');
        assertResponse(await this.http.node.POST('/restore', { body }));
        this._log.info('restore() -> ok');
    }

    async shutdown(): Promise<void> {
        this._log.info('shutdown()');
        assertResponse(await this.http.node.POST('/shutdown'));
        this._log.info('shutdown() -> ok');
    }

    // ============================================================================
    // BTC Operations
    // ============================================================================

    async getAddress(): Promise<AddressResponse> {
        this._log.debug('getAddress()');
        const result = assertResponse(await this.http.node.POST('/address'));
        this._log.debug('getAddress() -> %s', result.address);
        return result;
    }

    async getBtcBalance(skipSync: boolean = false): Promise<BtcBalanceResponse> {
        this._log.debug('getBtcBalance()');
        return assertResponse(
            await this.http.node.POST('/btcbalance', { body: { skip_sync: skipSync } }),
        );
    }

    async sendBtc(body: SendBtcRequest): Promise<void> {
        this._log.info('sendBtc(): amount=%s address=%s', body.amount, body.address);
        assertResponse(await this.http.node.POST('/sendbtc', { body }));
        this._log.info('sendBtc() -> ok');
    }

    async listTransactions(request?: ListTransactionsRequest): Promise<ListTransactionsResponse> {
        this._log.debug('listTransactions()');
        return assertResponse(
            await this.http.node.POST('/listtransactions', {
                body: { skip_sync: false, ...request },
            }),
        );
    }

    async listUnspents(): Promise<ListUnspentsResponse> {
        this._log.debug('listUnspents()');
        return assertResponse(
            await this.http.node.POST('/listunspents', { body: { skip_sync: false } }),
        );
    }

    async createUtxos(body: CreateUtxosRequest): Promise<void> {
        this._log.info('createUtxos()');
        assertResponse(await this.http.node.POST('/createutxos', { body }));
        this._log.info('createUtxos() -> ok');
    }

    async estimateFee(body: EstimateFeeRequest): Promise<EstimateFeeResponse> {
        this._log.debug('estimateFee()');
        return assertResponse(await this.http.node.POST('/estimatefee', { body }));
    }

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    async listAssets(
        filterAssetSchemas: AssetSchema[] = [],
    ): Promise<ListAssetsResponse> {
        this._log.debug('listAssets()');
        return assertResponse(
            await this.http.node.POST('/listassets', {
                body: { filter_asset_schemas: filterAssetSchemas },
            }),
        );
    }

    async getAssetBalance(body: AssetBalanceRequest): Promise<AssetBalanceResponse> {
        this._log.debug('getAssetBalance(): asset_id=%s', body.asset_id);
        return assertResponse(await this.http.node.POST('/assetbalance', { body }));
    }

    async getAssetMetadata(body: AssetMetadataRequest): Promise<AssetMetadataResponse> {
        this._log.debug('getAssetMetadata(): asset_id=%s', body.asset_id);
        return assertResponse(await this.http.node.POST('/assetmetadata', { body }));
    }

    async getAssetMedia(body: GetAssetMediaRequest): Promise<GetAssetMediaResponse> {
        this._log.debug('getAssetMedia(): digest=%s', body.digest);
        return assertResponse(await this.http.node.POST('/getassetmedia', { body }));
    }

    async issueAssetNIA(body: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
        this._log.info('issueAssetNIA(): ticker=%s', body.ticker);
        const result = assertResponse(await this.http.node.POST('/issueassetnia', { body }));
        this._log.info('issueAssetNIA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async issueAssetCFA(body: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
        this._log.info('issueAssetCFA(): name=%s', body.name);
        const result = assertResponse(await this.http.node.POST('/issueassetcfa', { body }));
        this._log.info('issueAssetCFA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async issueAssetUDA(body: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
        this._log.info('issueAssetUDA(): ticker=%s', body.ticker);
        const result = assertResponse(await this.http.node.POST('/issueassetuda', { body }));
        this._log.info('issueAssetUDA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async sendRgb(body: SendRgbRequest): Promise<SendRgbResponse> {
        this._log.info('sendRgb()');
        const result = assertResponse(await this.http.node.POST('/sendrgb', { body }));
        this._log.info('sendRgb() -> txid=%s', result.txid);
        return result;
    }

    async listTransfers(body: ListTransfersRequest): Promise<ListTransfersResponse> {
        this._log.debug('listTransfers(): asset_id=%s', body.asset_id);
        return assertResponse(await this.http.node.POST('/listtransfers', { body }));
    }

    async refreshTransfers(body?: RefreshRequest): Promise<void> {
        this._log.debug('refreshTransfers()');
        assertResponse(await this.http.node.POST('/refreshtransfers', { body: body || {} }));
    }

    async syncRgbWallet(): Promise<void> {
        this._log.info('syncRgbWallet()');
        assertResponse(await this.http.node.POST('/sync'));
        this._log.info('syncRgbWallet() -> ok');
    }

    async failTransfers(body: FailTransfersRequest): Promise<void> {
        this._log.info('failTransfers()');
        assertResponse(await this.http.node.POST('/failtransfers', { body }));
    }

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    async listChannels(): Promise<ListChannelsResponse> {
        this._log.debug('listChannels()');
        return assertResponse(await this.http.node.GET('/listchannels'));
    }

    async openChannel(body: OpenChannelRequest): Promise<OpenChannelResponse> {
        this._log.info(
            'openChannel(): peer_pubkey=%s capacity=%s',
            body.peer_pubkey_and_opt_addr,
            body.capacity_sat,
        );
        const result = assertResponse(await this.http.node.POST('/openchannel', { body }));
        this._log.info('openChannel() -> temporary_channel_id=%s', result.temporary_channel_id);
        return result;
    }

    async closeChannel(body: CloseChannelRequest): Promise<void> {
        this._log.info('closeChannel(): channel_id=%s', body.channel_id);
        assertResponse(await this.http.node.POST('/closechannel', { body }));
        this._log.info('closeChannel() -> ok');
    }

    async getChannelId(body: GetChannelIdRequest): Promise<GetChannelIdResponse> {
        this._log.debug('getChannelId()');
        return assertResponse(await this.http.node.POST('/getchannelid', { body }));
    }

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    async listPeers(): Promise<ListPeersResponse> {
        this._log.debug('listPeers()');
        return assertResponse(await this.http.node.GET('/listpeers'));
    }

    async connectPeer(body: ConnectPeerRequest): Promise<ConnectPeerResponse> {
        this._log.info('connectPeer(): %s', body.peer_pubkey_and_addr);
        const result = assertResponse(await this.http.node.POST('/connectpeer', { body }));
        this._log.info('connectPeer() -> ok');
        return result;
    }

    async disconnectPeer(body: DisconnectPeerRequest): Promise<void> {
        this._log.info('disconnectPeer(): peer_pubkey=%s', body.peer_pubkey);
        assertResponse(await this.http.node.POST('/disconnectpeer', { body }));
        this._log.info('disconnectPeer() -> ok');
    }

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    async createLNInvoice(body: LNInvoiceRequest): Promise<CreateLNInvoiceResponse> {
        this._log.info('createLNInvoice(): amount_msat=%s', body.amt_msat);
        const result = assertResponse(await this.http.node.POST('/lninvoice', { body }));
        this._log.info('createLNInvoice() -> invoice=%s', result.invoice);
        return result;
    }

    async createRgbInvoice(body: RgbInvoiceRequest): Promise<RgbInvoiceResponse> {
        this._log.info('createRgbInvoice(): asset_id=%s', body.asset_id);
        const result = assertResponse(await this.http.node.POST('/rgbinvoice', { body }));
        this._log.info('createRgbInvoice() -> invoice=%s', result.invoice);
        return result;
    }

    async decodeLNInvoice(body: DecodeLNInvoiceRequest | string): Promise<DecodeLNInvoiceResponse> {
        this._log.debug('decodeLNInvoice()');
        const requestBody = typeof body === 'string' ? { invoice: body } : body;
        return assertResponse(await this.http.node.POST('/decodelninvoice', { body: requestBody }));
    }

    async decodeRgbInvoice(body: DecodeRGBInvoiceRequest): Promise<DecodeRGBInvoiceResponse> {
        this._log.debug('decodeRgbInvoice()');
        return assertResponse(await this.http.node.POST('/decodergbinvoice', { body }));
    }

    async getInvoiceStatus(body: InvoiceStatusRequest): Promise<InvoiceStatusResponse> {
        this._log.debug('getInvoiceStatus(): invoice=%s', body.invoice);
        return assertResponse(await this.http.node.POST('/invoicestatus', { body }));
    }

    async sendPayment(body: SendPaymentRequest): Promise<SendPaymentResponse> {
        this._log.info('sendPayment(): invoice=%s', body.invoice);
        const result = assertResponse(await this.http.node.POST('/sendpayment', { body }));
        this._log.info(
            'sendPayment() -> payment_hash=%s status=%s',
            result.payment_hash,
            result.status,
        );
        return result;
    }

    async keysend(body: KeysendRequest): Promise<KeysendResponse> {
        this._log.info('keysend(): dest_pubkey=%s amount_msat=%s', body.dest_pubkey, body.amt_msat);
        const result = assertResponse(await this.http.node.POST('/keysend', { body }));
        this._log.info('keysend() -> payment_hash=%s', result.payment_hash);
        return result;
    }

    async listPayments(): Promise<ListPaymentsResponse> {
        this._log.debug('listPayments()');
        return assertResponse(await this.http.node.GET('/listpayments'));
    }

    async getPayment(body: GetPaymentRequest): Promise<GetPaymentResponse> {
        this._log.debug('getPayment(): payment_hash=%s', body.payment_hash);
        return assertResponse(await this.http.node.POST('/getpayment', { body }));
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

    async getTakerPubkey(): Promise<string> {
        this._log.debug('getTakerPubkey()');
        const data = assertResponse(await this.http.node.GET('/nodeinfo'));
        this._log.debug('getTakerPubkey() -> %s', data.pubkey);
        return data.pubkey!;
    }

    async whitelistSwap(body: TakerRequest | string): Promise<void> {
        this._log.info('whitelistSwap()');
        const requestBody = typeof body === 'string' ? { swapstring: body } : body;
        assertResponse(await this.http.node.POST('/taker', { body: requestBody }));
        this._log.info('whitelistSwap() -> ok');
    }

    async close(): Promise<void> {
        await this.shutdown();
    }

    async makerInit(body: MakerInitRequest): Promise<MakerInitResponse> {
        this._log.info('makerInit(): qty_from=%s qty_to=%s', body.qty_from, body.qty_to);
        const result = assertResponse(await this.http.node.POST('/makerinit', { body }));
        this._log.info('makerInit() -> swapstring=%s', result.swapstring);
        return result;
    }

    async makerExecute(body: MakerExecuteRequest): Promise<MakerExecuteResponse> {
        this._log.info('makerExecute(): swapstring=%s', body.swapstring);
        const result = assertResponse(await this.http.node.POST('/makerexecute', { body }));
        this._log.info('makerExecute() -> ok');
        return result;
    }

    async listSwaps(): Promise<ListSwapsResponse> {
        this._log.debug('listSwaps()');
        return assertResponse(await this.http.node.GET('/listswaps'));
    }

    async getSwap(body: GetSwapRequest): Promise<GetSwapResponse> {
        this._log.debug('getSwap(): payment_hash=%s', body.payment_hash);
        return assertResponse(await this.http.node.POST('/getswap', { body }));
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    async signMessage(body: SignMessageRequest): Promise<SignMessageResponse> {
        this._log.debug('signMessage()');
        return assertResponse(await this.http.node.POST('/signmessage', { body }));
    }

    async sendOnionMessage(body: SendOnionMessageRequest): Promise<void> {
        this._log.debug('sendOnionMessage()');
        assertResponse(await this.http.node.POST('/sendonionmessage', { body }));
    }

    async checkIndexerUrl(body: CheckIndexerUrlRequest): Promise<void> {
        this._log.debug('checkIndexerUrl()');
        assertResponse(await this.http.node.POST('/checkindexerurl', { body }));
    }

    async checkProxyEndpoint(body: CheckProxyEndpointRequest): Promise<void> {
        this._log.debug('checkProxyEndpoint()');
        assertResponse(await this.http.node.POST('/checkproxyendpoint', { body }));
    }

    async revokeToken(body: RevokeTokenRequest): Promise<void> {
        this._log.info('revokeToken()');
        assertResponse(await this.http.node.POST('/revoketoken', { body }));
        this._log.info('revokeToken() -> ok');
    }
}
