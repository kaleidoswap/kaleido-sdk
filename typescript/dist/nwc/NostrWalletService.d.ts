export interface NostrWalletServiceConfig {
    rgbNodeUrl: string;
    relays: string[];
    secretKey: string;
    pubkey: string;
}
export declare class NostrWalletService {
    private ndk;
    private rgbNode;
    private pubkey;
    private secretKey;
    constructor(config: NostrWalletServiceConfig);
    start(): Promise<void>;
    private publishInfoEvent;
    private subscribeToRequests;
    private handleRequest;
    private handlePayInvoice;
    private handleGetBalance;
    private handleMakeInvoice;
    private handleLookupInvoice;
    private handleListTransactions;
    private handleGetInfo;
    private sendResponse;
    generateConnectionUri(relayUrls: string[], lud16?: string): string;
}
