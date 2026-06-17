/**
 * RLN Client - RGB Lightning Node Operations
 */

import { HttpClient } from './http-client.js';
import { APIError, TimeoutError, assertResponse } from './errors.js';
import { createLogger, LogState } from './logging.js';
import type { ComponentLogger } from './logging.js';
import { AssetSchema, SyncKeychainOneOf0, SyncStrategy } from './node-types-ext.js';
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
    PostAssetMediaRequest,
    PostAssetMediaResponse,
    InflateRequest,
    InflateResponse,
    IssueAssetNIARequest,
    IssueAssetNIAResponse,
    IssueAssetIFARequest,
    IssueAssetIFAResponse,
    IssueAssetCFARequest,
    IssueAssetCFAResponse,
    IssueAssetUDARequest,
    IssueAssetUDAResponse,
    SendRgbRequest,
    SendRgbResponse,
    ListTransfersRequest,
    ListTransfersResponse,
    SyncRequest,
    RefreshRequest,
    FailTransfersRequest,
    FailTransfersResponse,
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
    DecodeSwapstringRequest,
    DecodeSwapstringResponse,
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
    CheckIndexerUrlResponse,
    CheckProxyEndpointRequest,
    RevokeTokenRequest,
} from './node-types-ext.js';

/**
 * Minimal node-call surface RlnClient depends on. The default implementation is
 * openapi-fetch over HTTP (`HttpClient.node`); an alternative (e.g. NWC, see
 * `NwcRlnNodeClient`) can be injected to run node operations over a different
 * transport. `data` is `any` so RlnClient's per-method return types are kept.
 */
export interface RlnNodeClient {
    GET(path: string, init?: any): Promise<{ data?: any; error?: unknown; response?: Response }>;
    POST(path: string, init?: any): Promise<{ data?: any; error?: unknown; response?: Response }>;
}

export class RlnClient {
    private http: HttpClient;
    private readonly _log: ComponentLogger;
    private readonly _nodeOverride?: RlnNodeClient;

    constructor(
        http: HttpClient,
        logState: LogState = new LogState(),
        nodeClient?: RlnNodeClient,
    ) {
        this.http = http;
        this._log = createLogger('rln', logState);
        this._nodeOverride = nodeClient;
    }

    /** The node-call surface: an injected transport if provided, else HTTP. */
    private get node(): RlnNodeClient {
        return this._nodeOverride ?? (this.http.node as unknown as RlnNodeClient);
    }

    // ============================================================================
    // Wallet Management
    // ============================================================================

    async getNodeInfo(): Promise<NodeInfoResponse> {
        this._log.debug('getNodeInfo()');
        const result = assertResponse(await this.node.GET('/nodeinfo'));
        this._log.debug('getNodeInfo() -> pubkey=%s', result.pubkey);
        return result;
    }

    async getNetworkInfo(): Promise<NetworkInfoResponse> {
        this._log.debug('getNetworkInfo()');
        return assertResponse(await this.node.GET('/networkinfo'));
    }

    async initWallet(body: InitRequest): Promise<InitResponse> {
        this._log.info('initWallet()');
        const result = assertResponse(await this.node.POST('/init', { body }));
        this._log.info('initWallet() -> ok');
        return result;
    }

    async unlockWallet(body: UnlockRequest): Promise<void> {
        this._log.info('unlockWallet()');
        try {
            assertResponse(await this.node.POST('/unlock', { body }));
            this._log.info('unlockWallet() -> ok');
        } catch (error) {
            if (error instanceof TimeoutError) {
                throw new TimeoutError(
                    'Unlock request timed out. If the node has been offline or locked for a long time, it may still be syncing. Wait a few minutes and check the node state again.',
                );
            }
            throw error;
        }
    }

    async lockWallet(): Promise<void> {
        this._log.info('lockWallet()');
        assertResponse(await this.node.POST('/lock'));
        this._log.info('lockWallet() -> ok');
    }

    async changePassword(body: ChangePasswordRequest): Promise<void> {
        this._log.info('changePassword()');
        assertResponse(await this.node.POST('/changepassword', { body }));
        this._log.info('changePassword() -> ok');
    }

    async backup(body: BackupRequest): Promise<void> {
        this._log.info('backup()');
        assertResponse(await this.node.POST('/backup', { body }));
        this._log.info('backup() -> ok');
    }

    async restore(body: RestoreRequest): Promise<void> {
        this._log.info('restore()');
        assertResponse(await this.node.POST('/restore', { body }));
        this._log.info('restore() -> ok');
    }

    async shutdown(): Promise<void> {
        this._log.info('shutdown()');
        assertResponse(await this.node.POST('/shutdown'));
        this._log.info('shutdown() -> ok');
    }

    // ============================================================================
    // BTC Operations
    // ============================================================================

    async getAddress(): Promise<AddressResponse> {
        this._log.debug('getAddress()');
        const result = assertResponse(await this.node.POST('/address'));
        this._log.debug('getAddress() -> %s', result.address);
        return result;
    }

    async getBtcBalance(skipSync: boolean = false): Promise<BtcBalanceResponse> {
        this._log.debug('getBtcBalance()');
        return assertResponse(
            await this.node.POST('/btcbalance', { body: { skip_sync: skipSync } }),
        );
    }

    async sendBtc(body: SendBtcRequest): Promise<void> {
        this._log.info('sendBtc(): amount=%s address=%s', body.amount, body.address);
        assertResponse(await this.node.POST('/sendbtc', { body }));
        this._log.info('sendBtc() -> ok');
    }

    async listTransactions(request?: ListTransactionsRequest): Promise<ListTransactionsResponse> {
        this._log.debug('listTransactions()');
        return assertResponse(
            await this.node.POST('/listtransactions', {
                body: { skip_sync: false, ...request },
            }),
        );
    }

    async listUnspents(): Promise<ListUnspentsResponse> {
        this._log.debug('listUnspents()');
        return assertResponse(
            await this.node.POST('/listunspents', { body: { skip_sync: false } }),
        );
    }

    async createUtxos(body: CreateUtxosRequest): Promise<void> {
        this._log.info('createUtxos()');
        assertResponse(await this.node.POST('/createutxos', { body }));
        this._log.info('createUtxos() -> ok');
    }

    async estimateFee(body: EstimateFeeRequest): Promise<EstimateFeeResponse> {
        this._log.debug('estimateFee()');
        return assertResponse(await this.node.POST('/estimatefee', { body }));
    }

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    async listAssets(filterAssetSchemas: AssetSchema[] = []): Promise<ListAssetsResponse> {
        this._log.debug('listAssets()');
        return assertResponse(
            await this.node.POST('/listassets', {
                body: { filter_asset_schemas: filterAssetSchemas },
            }),
        );
    }

    async getAssetBalance(body: AssetBalanceRequest): Promise<AssetBalanceResponse> {
        this._log.debug('getAssetBalance(): asset_id=%s', body.asset_id);
        return assertResponse(await this.node.POST('/assetbalance', { body }));
    }

    async getAssetMetadata(body: AssetMetadataRequest): Promise<AssetMetadataResponse> {
        this._log.debug('getAssetMetadata(): asset_id=%s', body.asset_id);
        return assertResponse(await this.node.POST('/assetmetadata', { body }));
    }

    async getAssetMedia(body: GetAssetMediaRequest): Promise<GetAssetMediaResponse> {
        this._log.debug('getAssetMedia(): digest=%s', body.digest);
        return assertResponse(await this.node.POST('/getassetmedia', { body }));
    }

    async postAssetMedia(body: PostAssetMediaRequest): Promise<PostAssetMediaResponse> {
        this._log.info('postAssetMedia()');
        return assertResponse(
            await this.node.POST('/postassetmedia', {
                body,
                bodySerializer() {
                    const form = new FormData();
                    form.set('file', new Blob([body.file]));
                    return form;
                },
            }),
        );
    }

    async inflate(body: InflateRequest): Promise<InflateResponse> {
        this._log.info('inflate(): asset_id=%s', body.asset_id);
        const result = assertResponse(await this.node.POST('/inflate', { body }));
        this._log.info('inflate() -> txid=%s', result.txid);
        return result;
    }

    async issueAssetNIA(body: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
        this._log.info('issueAssetNIA(): ticker=%s', body.ticker);
        const result = assertResponse(await this.node.POST('/issueassetnia', { body }));
        this._log.info('issueAssetNIA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async issueAssetIFA(body: IssueAssetIFARequest): Promise<IssueAssetIFAResponse> {
        this._log.info('issueAssetIFA(): ticker=%s', body.ticker);
        const result = assertResponse(await this.node.POST('/issueassetifa', { body }));
        this._log.info('issueAssetIFA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async issueAssetCFA(body: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
        this._log.info('issueAssetCFA(): name=%s', body.name);
        const result = assertResponse(await this.node.POST('/issueassetcfa', { body }));
        this._log.info('issueAssetCFA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async issueAssetUDA(body: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
        this._log.info('issueAssetUDA(): ticker=%s', body.ticker);
        const result = assertResponse(await this.node.POST('/issueassetuda', { body }));
        this._log.info('issueAssetUDA() -> asset_id=%s', result.asset?.asset_id);
        return result;
    }

    async sendRgb(body: SendRgbRequest): Promise<SendRgbResponse> {
        this._log.info('sendRgb()');
        const result = assertResponse(await this.node.POST('/sendrgb', { body }));
        this._log.info('sendRgb() -> txid=%s', result.txid);
        return result;
    }

    async listTransfers(body: ListTransfersRequest): Promise<ListTransfersResponse> {
        this._log.debug('listTransfers(): asset_id=%s', body.asset_id);
        return assertResponse(await this.node.POST('/listtransfers', { body }));
    }

    async refreshTransfers(body?: RefreshRequest): Promise<void> {
        this._log.debug('refreshTransfers()');
        assertResponse(
            await this.node.POST('/refreshtransfers', {
                body: body || { skip_sync: false },
            }),
        );
    }

    async syncRgbWallet(body?: SyncRequest): Promise<void> {
        this._log.info('syncRgbWallet()');
        const request = body ?? {
            options: {
                keychain: SyncKeychainOneOf0.Colored,
                strategy: SyncStrategy.FastSync,
            },
        };
        assertResponse(await this.node.POST('/sync', { body: request }));
        this._log.info('syncRgbWallet() -> ok');
    }

    async failTransfers(body: FailTransfersRequest): Promise<FailTransfersResponse> {
        this._log.info('failTransfers()');
        return assertResponse(await this.node.POST('/failtransfers', { body }));
    }

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    async listChannels(): Promise<ListChannelsResponse> {
        this._log.debug('listChannels()');
        return assertResponse(await this.node.GET('/listchannels'));
    }

    async openChannel(body: OpenChannelRequest): Promise<OpenChannelResponse> {
        this._log.info(
            'openChannel(): peer_pubkey=%s capacity=%s',
            body.peer_pubkey_and_opt_addr,
            body.capacity_sat,
        );
        const result = assertResponse(await this.node.POST('/openchannel', { body }));
        this._log.info('openChannel() -> temporary_channel_id=%s', result.temporary_channel_id);
        return result;
    }

    async closeChannel(body: CloseChannelRequest): Promise<void> {
        this._log.info('closeChannel(): channel_id=%s', body.channel_id);
        assertResponse(await this.node.POST('/closechannel', { body }));
        this._log.info('closeChannel() -> ok');
    }

    async getChannelId(body: GetChannelIdRequest): Promise<GetChannelIdResponse> {
        this._log.debug('getChannelId()');
        return assertResponse(await this.node.POST('/getchannelid', { body }));
    }

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    async listPeers(): Promise<ListPeersResponse> {
        this._log.debug('listPeers()');
        return assertResponse(await this.node.GET('/listpeers'));
    }

    async connectPeer(body: ConnectPeerRequest): Promise<ConnectPeerResponse> {
        this._log.info('connectPeer(): %s', body.peer_pubkey_and_addr);
        const result = assertResponse(await this.node.POST('/connectpeer', { body }));
        this._log.info('connectPeer() -> ok');
        return result;
    }

    async disconnectPeer(body: DisconnectPeerRequest): Promise<void> {
        this._log.info('disconnectPeer(): peer_pubkey=%s', body.peer_pubkey);
        assertResponse(await this.node.POST('/disconnectpeer', { body }));
        this._log.info('disconnectPeer() -> ok');
    }

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    async createLNInvoice(body: LNInvoiceRequest): Promise<CreateLNInvoiceResponse> {
        this._log.info('createLNInvoice(): amount_msat=%s', body.amt_msat);
        const result = assertResponse(await this.node.POST('/lninvoice', { body }));
        this._log.info('createLNInvoice() -> invoice=%s', result.invoice);
        return result;
    }

    async createRgbInvoice(body: RgbInvoiceRequest): Promise<RgbInvoiceResponse> {
        this._log.info('createRgbInvoice(): asset_id=%s', body.asset_id);
        const result = assertResponse(await this.node.POST('/rgbinvoice', { body }));
        this._log.info('createRgbInvoice() -> invoice=%s', result.invoice);
        return result;
    }

    async decodeLNInvoice(body: DecodeLNInvoiceRequest | string): Promise<DecodeLNInvoiceResponse> {
        this._log.debug('decodeLNInvoice()');
        const requestBody = typeof body === 'string' ? { invoice: body } : body;
        return assertResponse(await this.node.POST('/decodelninvoice', { body: requestBody }));
    }

    async decodeRgbInvoice(body: DecodeRGBInvoiceRequest): Promise<DecodeRGBInvoiceResponse> {
        this._log.debug('decodeRgbInvoice()');
        return assertResponse(await this.node.POST('/decodergbinvoice', { body }));
    }

    async decodeSwapstring(
        body: DecodeSwapstringRequest | string,
    ): Promise<DecodeSwapstringResponse> {
        this._log.debug('decodeSwapstring()');
        const requestBody = typeof body === 'string' ? { swapstring: body } : body;
        return assertResponse(
            await this.http.node.POST('/decodeswapstring', { body: requestBody }),
        );
    }

    async getInvoiceStatus(body: InvoiceStatusRequest): Promise<InvoiceStatusResponse> {
        this._log.debug('getInvoiceStatus(): invoice=%s', body.invoice);
        return assertResponse(await this.node.POST('/invoicestatus', { body }));
    }

    async sendPayment(body: SendPaymentRequest): Promise<SendPaymentResponse> {
        this._log.info('sendPayment(): invoice=%s', body.invoice);
        const result = assertResponse(await this.node.POST('/sendpayment', { body }));
        this._log.info(
            'sendPayment() -> payment_hash=%s status=%s',
            result.payment_hash,
            result.status,
        );
        return result;
    }

    async keysend(body: KeysendRequest): Promise<KeysendResponse> {
        this._log.info('keysend(): dest_pubkey=%s amount_msat=%s', body.dest_pubkey, body.amt_msat);
        const result = assertResponse(await this.node.POST('/keysend', { body }));
        this._log.info('keysend() -> payment_hash=%s', result.payment_hash);
        return result;
    }

    async listPayments(): Promise<ListPaymentsResponse> {
        this._log.debug('listPayments()');
        return assertResponse(await this.node.GET('/listpayments'));
    }

    async getPayment(body: GetPaymentRequest): Promise<GetPaymentResponse> {
        this._log.debug('getPayment(): payment_hash=%s', body.payment_hash);
        return assertResponse(await this.node.POST('/getpayment', { body }));
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

    async getTakerPubkey(): Promise<string> {
        this._log.debug('getTakerPubkey()');
        const data = assertResponse(await this.node.GET('/nodeinfo'));
        this._log.debug('getTakerPubkey() -> %s', data.pubkey);
        if (!data.pubkey) {
            throw new APIError('Node info response did not include pubkey', 500);
        }
        return data.pubkey;
    }

    async whitelistSwap(body: TakerRequest | string): Promise<void> {
        this._log.info('whitelistSwap()');
        const requestBody = typeof body === 'string' ? { swapstring: body } : body;
        assertResponse(await this.node.POST('/taker', { body: requestBody }));
        this._log.info('whitelistSwap() -> ok');
    }

    async close(): Promise<void> {
        await this.http.close();
    }

    async makerInit(body: MakerInitRequest): Promise<MakerInitResponse> {
        this._log.info('makerInit(): qty_from=%s qty_to=%s', body.qty_from, body.qty_to);
        const result = assertResponse(await this.node.POST('/makerinit', { body }));
        this._log.info('makerInit() -> swapstring=%s', result.swapstring);
        return result;
    }

    async makerExecute(body: MakerExecuteRequest): Promise<MakerExecuteResponse> {
        this._log.info('makerExecute(): swapstring=%s', body.swapstring);
        const result = assertResponse(await this.node.POST('/makerexecute', { body }));
        this._log.info('makerExecute() -> ok');
        return result;
    }

    async listSwaps(): Promise<ListSwapsResponse> {
        this._log.debug('listSwaps()');
        return assertResponse(await this.node.GET('/listswaps'));
    }

    async getSwap(body: GetSwapRequest): Promise<GetSwapResponse> {
        this._log.debug('getSwap(): payment_hash=%s', body.payment_hash);
        return assertResponse(await this.node.POST('/getswap', { body }));
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    async signMessage(body: SignMessageRequest): Promise<SignMessageResponse> {
        this._log.debug('signMessage()');
        return assertResponse(await this.node.POST('/signmessage', { body }));
    }

    async sendOnionMessage(body: SendOnionMessageRequest): Promise<void> {
        this._log.debug('sendOnionMessage()');
        assertResponse(await this.node.POST('/sendonionmessage', { body }));
    }

    async checkIndexerUrl(body: CheckIndexerUrlRequest): Promise<CheckIndexerUrlResponse> {
        this._log.debug('checkIndexerUrl()');
        return assertResponse(await this.node.POST('/checkindexerurl', { body }));
    }

    async checkProxyEndpoint(body: CheckProxyEndpointRequest): Promise<void> {
        this._log.debug('checkProxyEndpoint()');
        assertResponse(await this.node.POST('/checkproxyendpoint', { body }));
    }

    async revokeToken(body: RevokeTokenRequest): Promise<void> {
        this._log.info('revokeToken()');
        assertResponse(await this.node.POST('/revoketoken', { body }));
        this._log.info('revokeToken() -> ok');
    }
}
