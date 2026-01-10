/**
 * RLN Client - RGB Lightning Node Operations
 * 
 * Type-safe client matching the exact OpenAPI specification.
 * All Node API endpoints use POST method.
 */

import { HttpClient } from './http-client.js';
import { mapHttpError } from './errors.js';

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

    // Note: /nodeinfo and /networkinfo endpoints exist but may have different signatures
    // Commenting out until OpenAPI spec is confirmed

    async initWallet(body: { password: string; mnemonic?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/init', { body });
        if (error) handleError(error);
        return data;
    }

    async unlockWallet(body: { password: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/unlock', { body });
        if (error) handleError(error);
        return data;
    }

    async lockWallet(): Promise<any> {
        const { data, error } = await this.http.node.POST('/lock');
        if (error) handleError(error);
        return data;
    }

    async changePassword(body: { old_password: string; new_password: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/changepassword', { body });
        if (error) handleError(error);
        return data;
    }

    async backup(body: { backup_path: string; password: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/backup', { body });
        if (error) handleError(error);
        return data;
    }

    async restore(body: { backup_path: string; password: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/restore', { body });
        if (error) handleError(error);
        return data;
    }

    async shutdown(): Promise<any> {
        const { data, error } = await this.http.node.POST('/shutdown');
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // BTC Operations
    // ============================================================================

    async getAddress(): Promise<any> {
        const { data, error } = await this.http.node.POST('/address');
        if (error) handleError(error);
        return data;
    }

    async getBtcBalance(): Promise<any> {
        const { data, error } = await this.http.node.POST('/btcbalance', { body: {} });
        if (error) handleError(error);
        return data;
    }

    async sendBtc(body: { address: string; amount: number; fee_rate?: number }): Promise<any> {
        const { data, error } = await this.http.node.POST('/sendbtc', { body });
        if (error) handleError(error);
        return data;
    }

    async listTransactions(): Promise<any> {
        const { data, error } = await this.http.node.POST('/listtransactions', { body: {} });
        if (error) handleError(error);
        return data;
    }

    async listUnspents(): Promise<any> {
        const { data, error } = await this.http.node.POST('/listunspents', { body: {} });
        if (error) handleError(error);
        return data;
    }

    async createUtxos(body: { up_to?: boolean; num?: number }): Promise<any> {
        const { data, error } = await this.http.node.POST('/createutxos', { body });
        if (error) handleError(error);
        return data;
    }

    async estimateFee(body: { blocks?: number }): Promise<any> {
        const { data, error } = await this.http.node.POST('/estimatefee', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    async listAssets(): Promise<any> {
        const { data, error } = await this.http.node.POST('/listassets', { body: {} });
        if (error) handleError(error);
        return data;
    }

    async getAssetBalance(body: { asset_id: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/assetbalance', { body });
        if (error) handleError(error);
        return data;
    }

    async getAssetMetadata(body: { asset_id?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/assetmetadata', { body });
        if (error) handleError(error);
        return data;
    }

    async getAssetMedia(body: { digest?: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getassetmedia', { body });
        if (error) handleError(error);
        return data;
    }

    async issueAssetNIA(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/issueassetnia', { body });
        if (error) handleError(error);
        return data;
    }

    async issueAssetCFA(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/issueassetcfa', { body });
        if (error) handleError(error);
        return data;
    }

    async issueAssetUDA(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/issueassetuda', { body });
        if (error) handleError(error);
        return data;
    }

    async sendAsset(body: any): Promise<any> {
        const { data, error } = await this.http.node.POST('/sendasset', { body });
        if (error) handleError(error);
        return data;
    }

    async listTransfers(): Promise<any> {
        const { data, error } = await this.http.node.POST('/listtransfers', { body: {} });
        if (error) handleError(error);
        return data;
    }

    async refreshTransfers(body?: { skip_sync?: boolean }): Promise<any> {
        const { data, error } = await this.http.node.POST('/refreshtransfers', { body: body || {} });
        if (error) handleError(error);
        return data;
    }

    async failTransfers(body: { batch_transfer_idx?: number; no_asset_only?: boolean; skip_sync?: boolean }): Promise<any> {
        const { data, error } = await this.http.node.POST('/failtransfers', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    // listchannels endpoint not in current OpenAPI spec
    // Commented out until endpoint is added to spec

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

    // listpeers endpoint not in current OpenAPI spec
    // Commented out until endpoint is added to spec

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

    // listpayments endpoint not in current OpenAPI spec
    // Commented out until endpoint is added to spec

    async getPayment(body: { payment_hash: string }): Promise<any> {
        const { data, error } = await this.http.node.POST('/getpayment', { body });
        if (error) handleError(error);
        return data;
    }

    // ============================================================================
    // Maker/Taker Swap Operations
    // ============================================================================

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

    // listswaps endpoint not in current OpenAPI spec
    // Commented out until endpoint is added to spec

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
