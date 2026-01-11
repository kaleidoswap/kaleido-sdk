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

    async getBtcBalance(): Promise<BtcBalanceResponse> {
        const { data, error } = await this.http.node.POST('/btcbalance', { body: {} });
        checkError({ error });
        return data!;
    }

    async sendBtc(body: SendBtcRequest): Promise<void> {
        const { error } = await this.http.node.POST('/sendbtc', { body });
        checkError({ error });
    }

    async listTransactions(): Promise<ListTransactionsResponse> {
        const { data, error } = await this.http.node.POST('/listtransactions', { body: {} });
        checkError({ error });
        return data!;
    }

    async listUnspents(): Promise<ListUnspentsResponse> {
        const { data, error } = await this.http.node.POST('/listunspents', { body: {} });
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

    async listAssets(): Promise<ListAssetsResponse> {
        const { data, error } = await this.http.node.POST('/listassets', { body: {} });
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

    async sendAsset(body: SendAssetRequest): Promise<SendAssetResponse> {
        const { data, error } = await this.http.node.POST('/sendasset', { body });
        checkError({ error });
        return data!;
    }

    async listTransfers(): Promise<ListTransfersResponse> {
        const { data, error } = await this.http.node.POST('/listtransfers', { body: {} });
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

    async listChannels(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listchannels');
        checkError({ error });
        return data;
    }

    async openChannel(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/openchannel', { body });
        checkError({ error });
        return data;
    }

    async closeChannel(body: { channel_id: string; peer_pubkey: string; force?: boolean }): Promise<any> {
        const { data, error } = await this.http.node.POST('/closechannel', { body });
        checkError({ error });
        return data;
    }

    async getChannelId(body: { temporary_channel_id: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getchannelid', { body });
        checkError({ error });
        return data;
    }

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    async listPeers(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listpeers');
        checkError({ error });
        return data;
    }

    async connectPeer(body: { peer_pubkey_and_addr: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/connectpeer', { body });
        checkError({ error });
        return data;
    }

    async disconnectPeer(body: { peer_pubkey: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/disconnectpeer', { body });
        checkError({ error });
        return data;
    }

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    async createLNInvoice(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/lninvoice', { body });
        checkError({ error });
        return data;
    }

    async createRgbInvoice(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/rgbinvoice', { body });
        checkError({ error });
        return data;
    }

    async decodeLNInvoice(body: { invoice: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/decodelninvoice', { body });
        checkError({ error });
        return data;
    }

    async decodeRgbInvoice(body: { invoice: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/decodergbinvoice', { body });
        checkError({ error });
        return data;
    }

    async getInvoiceStatus(body: { invoice?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/invoicestatus', { body });
        checkError({ error });
        return data;
    }

    async sendPayment(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/sendpayment', { body });
        checkError({ error });
        return data;
    }

    async keysend(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/keysend', { body });
        checkError({ error });
        return data;
    }

    async listPayments(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listpayments');
        checkError({ error });
        return data;
    }

    async getPayment(body: { payment_hash: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getpayment', { body });
        checkError({ error });
        return data;
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

    async getTakerPubkey(): Promise<any> {
        const { data, error } = await this.http.node.GET('/nodeinfo');
        checkError({ error });
        return data.pubkey;
    }

    async whitelistTrade(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/taker', { body });
        checkError({ error });
        return data;
    }

    async makerInit(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/makerinit', { body });
        checkError({ error });
        return data;
    }

    async makerExecute(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/makerexecute', { body });
        checkError({ error });
        return data;
    }

    async listSwaps(): Promise<any> {
        const { data, error } = await this.http.node.GET('/listswaps');
        checkError({ error });
        return data;
    }

    async getSwap(body: { payment_hash?: string; taker?: boolean }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getswap', { body });
        checkError({ error });
        return data;
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    async signMessage(body: { message: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/signmessage', { body });
        checkError({ error });
        return data;
    }

    async sendOnionMessage(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/sendonionmessage', { body });
        checkError({ error });
        return data;
    }

    async checkIndexerUrl(body: { indexer_url?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/checkindexerurl', { body });
        checkError({ error });
        return data;
    }

    async checkProxyEndpoint(body: { proxy_url?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/checkproxyendpoint', { body });
        checkError({ error });
        return data;
    }

    async revokeToken(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/revoketoken', { body });
        checkError({ error });
        return data;
    }
}
