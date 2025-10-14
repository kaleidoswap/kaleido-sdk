"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NostrWalletService = void 0;
const ndk_1 = __importStar(require("@nostr-dev-kit/ndk"));
class NostrWalletService {
    constructor(config) {
        this.ndk = new ndk_1.default({
            explicitRelayUrls: config.relays,
            signer: new ndk_1.NDKPrivateKeySigner(config.secretKey)
        });
        // Initialize RGB node implementation here
        this.rgbNode = {};
        this.pubkey = config.pubkey;
        this.secretKey = config.secretKey;
    }
    async start() {
        await this.ndk.connect();
        await this.publishInfoEvent();
        this.subscribeToRequests();
    }
    async publishInfoEvent() {
        const event = new ndk_1.NDKEvent(this.ndk, {
            kind: 13194,
            content: 'pay_invoice get_balance make_invoice lookup_invoice list_transactions get_info',
            tags: [],
            created_at: Math.floor(Date.now() / 1000),
            pubkey: this.pubkey
        });
        await event.sign();
        await this.ndk.publish(event);
    }
    subscribeToRequests() {
        const filter = {
            kinds: [23194],
            '#p': [this.pubkey],
        };
        const options = {
            closeOnEose: false
        };
        const subscription = this.ndk.subscribe(filter, options);
        subscription.on('event', async (event) => {
            await this.handleRequest(event);
        });
    }
    async handleRequest(event) {
        try {
            await event.decrypt();
            const decryptedContent = event.content || '';
            const request = JSON.parse(decryptedContent);
            let response;
            switch (request.method) {
                case 'pay_invoice':
                    response = await this.handlePayInvoice(request.params);
                    break;
                case 'get_balance':
                    response = await this.handleGetBalance();
                    break;
                case 'make_invoice':
                    response = await this.handleMakeInvoice(request.params);
                    break;
                case 'lookup_invoice':
                    response = await this.handleLookupInvoice(request.params);
                    break;
                case 'list_transactions':
                    response = await this.handleListTransactions(request.params);
                    break;
                case 'get_info':
                    response = await this.handleGetInfo();
                    break;
                default:
                    response = {
                        result_type: request.method,
                        error: {
                            code: 'NOT_IMPLEMENTED',
                            message: `Method ${request.method} not implemented`,
                        },
                        result: null,
                    };
            }
            await this.sendResponse(event, response);
        }
        catch (error) {
            const err = error;
            console.error('Error handling request:', err);
            await this.sendResponse(event, {
                result_type: 'error',
                error: {
                    code: 'INTERNAL',
                    message: err.message || 'Internal error processing request',
                },
                result: null,
            });
        }
    }
    async handlePayInvoice(params) {
        try {
            const response = await this.rgbNode.sendPayment({
                invoice: params.invoice,
            });
            return {
                result_type: 'pay_invoice',
                error: null,
                result: {
                    preimage: response.payment_preimage,
                },
            };
        }
        catch (error) {
            return {
                result_type: 'pay_invoice',
                error: {
                    code: 'PAYMENT_FAILED',
                    message: error.message,
                },
                result: null,
            };
        }
    }
    async handleGetBalance() {
        try {
            const balance = await this.rgbNode.btcBalance({});
            return {
                result_type: 'get_balance',
                error: null,
                result: {
                    balance: balance.vanilla.settled,
                },
            };
        }
        catch (error) {
            return {
                result_type: 'get_balance',
                error: {
                    code: 'INTERNAL',
                    message: error.message,
                },
                result: null,
            };
        }
    }
    async handleMakeInvoice(params) {
        try {
            const response = await this.rgbNode.lnInvoice({
                amt_msat: params.amount,
                expiry_sec: params.expiry,
            });
            return {
                result_type: 'make_invoice',
                error: null,
                result: {
                    type: 'incoming',
                    invoice: response.invoice,
                    description: params.description,
                    amount: params.amount,
                    created_at: Math.floor(Date.now() / 1000),
                    expires_at: params.expiry ? Math.floor(Date.now() / 1000) + params.expiry : undefined,
                },
            };
        }
        catch (error) {
            return {
                result_type: 'make_invoice',
                error: {
                    code: 'INTERNAL',
                    message: error.message,
                },
                result: null,
            };
        }
    }
    async handleLookupInvoice(params) {
        try {
            if (!params.invoice && !params.payment_hash) {
                throw new Error('Either payment_hash or invoice must be provided');
            }
            const response = await this.rgbNode.invoiceStatus({
                invoice: params.invoice,
            });
            return {
                result_type: 'lookup_invoice',
                error: null,
                result: {
                    type: 'incoming',
                    invoice: params.invoice,
                    payment_hash: params.payment_hash,
                    status: response.status,
                },
            };
        }
        catch (error) {
            return {
                result_type: 'lookup_invoice',
                error: {
                    code: 'NOT_FOUND',
                    message: error.message,
                },
                result: null,
            };
        }
    }
    async handleListTransactions(params) {
        try {
            const payments = await this.rgbNode.listPayments();
            let transactions = payments.payments.map((payment) => ({
                type: payment.inbound ? 'incoming' : 'outgoing',
                payment_hash: payment.payment_hash,
                amount: payment.amt_msat,
                created_at: payment.created_at,
                settled_at: payment.updated_at,
                status: payment.status,
            }));
            // Apply filters
            if (params.from) {
                transactions = transactions.filter((tx) => tx.created_at >= params.from);
            }
            if (params.until) {
                transactions = transactions.filter((tx) => tx.created_at <= params.until);
            }
            if (params.type) {
                transactions = transactions.filter((tx) => tx.type === params.type);
            }
            if (!params.unpaid) {
                transactions = transactions.filter((tx) => tx.status === 'Succeeded');
            }
            // Apply pagination
            if (params.offset) {
                transactions = transactions.slice(params.offset);
            }
            if (params.limit) {
                transactions = transactions.slice(0, params.limit);
            }
            return {
                result_type: 'list_transactions',
                error: null,
                result: {
                    transactions,
                },
            };
        }
        catch (error) {
            return {
                result_type: 'list_transactions',
                error: {
                    code: 'INTERNAL',
                    message: error.message,
                },
                result: null,
            };
        }
    }
    async handleGetInfo() {
        try {
            const info = await this.rgbNode.nodeInfo();
            const networkInfo = await this.rgbNode.networkInfo();
            return {
                result_type: 'get_info',
                error: null,
                result: {
                    alias: info.alias || '',
                    color: '', // RGB Node doesn't provide color
                    pubkey: info.pubkey,
                    network: networkInfo.network.toLowerCase(),
                    block_height: networkInfo.height,
                    methods: [
                        'pay_invoice',
                        'get_balance',
                        'make_invoice',
                        'lookup_invoice',
                        'list_transactions',
                        'get_info',
                    ],
                },
            };
        }
        catch (error) {
            return {
                result_type: 'get_info',
                error: {
                    code: 'INTERNAL',
                    message: error.message,
                },
                result: null,
            };
        }
    }
    async sendResponse(requestEvent, response) {
        const event = new ndk_1.NDKEvent(this.ndk, {
            kind: 23195,
            content: JSON.stringify(response),
            tags: [
                ['p', requestEvent.pubkey],
                ['e', requestEvent.id],
            ],
            created_at: Math.floor(Date.now() / 1000),
            pubkey: this.pubkey
        });
        await event.sign();
        await this.ndk.publish(event);
    }
    generateConnectionUri(relayUrls, lud16) {
        const params = new URLSearchParams();
        relayUrls.forEach(url => params.append('relay', url));
        params.append('secret', this.secretKey);
        if (lud16) {
            params.append('lud16', lud16);
        }
        return `nostr+walletconnect://${this.pubkey}?${params.toString()}`;
    }
}
exports.NostrWalletService = NostrWalletService;
//# sourceMappingURL=NostrWalletService.js.map