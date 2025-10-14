export interface RGBLightningNodeAPI {
    sendPayment(params: {
        invoice: string;
    }): Promise<{
        payment_preimage: string;
        payment_hash: string;
        status: string;
    }>;
    btcBalance(params: {}): Promise<{
        vanilla: {
            settled: number;
            future: number;
            spendable: number;
        };
        colored: {
            settled: number;
            future: number;
            spendable: number;
        };
    }>;
    lnInvoice(params: {
        amt_msat: number;
        expiry_sec?: number;
    }): Promise<{
        invoice: string;
    }>;
    invoiceStatus(params: {
        invoice: string;
    }): Promise<{
        status: string;
    }>;
    listPayments(): Promise<{
        payments: Array<{
            inbound: boolean;
            payment_hash: string;
            amt_msat: number;
            created_at: number;
            updated_at: number;
            status: string;
        }>;
    }>;
    nodeInfo(): Promise<{
        pubkey: string;
        alias?: string;
        num_channels: number;
        num_peers: number;
    }>;
    networkInfo(): Promise<{
        network: string;
        height: number;
    }>;
}
