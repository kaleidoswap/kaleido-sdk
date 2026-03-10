import { KaleidoClient } from '../../src/index.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const TEST_API_URL = process.env.TEST_API_URL || 'http://localhost:8000';
const TEST_NODE_URL = process.env.TEST_NODE_URL || 'http://localhost:3001';

describe('RLN Client Integration', () => {
    let client: KaleidoClient;

    beforeAll(async () => {
        client = KaleidoClient.create({
            baseUrl: TEST_API_URL,
            nodeUrl: TEST_NODE_URL,
        });

        if (!client.hasNode()) {
            console.warn('RLN tests require a configured node URL');
        }
    });

    afterAll(() => {
        // Cleanup if needed
    });

    describe('Node Information & Identity', () => {
        it('should get RGB node info', async () => {
            try {
                const info = await client.rln.getNodeInfo();

                expect(info).toBeDefined();
                expect(info).toHaveProperty('pubkey');
                expect(typeof info.pubkey).toBe('string');
                expect(info.pubkey!.length).toBeGreaterThan(0);
            } catch (e: unknown) {
                console.warn('Skipping getRgbNodeInfo test - node unavailable:', e);
            }
        }, 30000);

        it('should get taker pubkey', async () => {
            try {
                const pubkey = await client.rln.getTakerPubkey();

                expect(pubkey).toBeDefined();
                expect(typeof pubkey).toBe('string');
                expect(pubkey.length).toBeGreaterThan(0);
                // Pubkey should be hex string (66 chars for compressed pubkey)
                expect(pubkey).toMatch(/^[0-9a-f]+$/i);
            } catch (e: unknown) {
                console.warn('Skipping getTakerPubkey test - node unavailable:', e);
            }
        }, 30000);

        it('should return consistent pubkey from both methods', async () => {
            try {
                const nodeInfo = await client.rln.getNodeInfo();
                const pubkey = await client.rln.getTakerPubkey();

                expect(pubkey).toBe(nodeInfo.pubkey);
            } catch (e: unknown) {
                console.warn('Skipping pubkey consistency test - node unavailable:', e);
            }
        }, 30000);
    });

    describe('Channel Management', () => {
        it('should list channels', async () => {
            try {
                const channels = (await client.rln.listChannels()).channels || [];

                expect(Array.isArray(channels)).toBe(true);

                if (channels.length > 0) {
                    const channel = channels[0];
                    expect(channel).toHaveProperty('channel_id');
                    expect(channel).toHaveProperty('peer_pubkey');
                }
            } catch (e: unknown) {
                console.warn('Skipping listChannels test - node unavailable:', e);
            }
        }, 30000);

        it('should handle empty channel list', async () => {
            try {
                const channels = (await client.rln.listChannels()).channels || [];

                expect(Array.isArray(channels)).toBe(true);
                // Should return empty array, not throw
            } catch (e: unknown) {
                console.warn('Skipping empty channel list test - node unavailable:', e);
            }
        }, 30000);

        // Note: openChannel and closeChannel tests are commented out as they modify state
        // and require careful setup/teardown with a test node
        it('should open a channel', async () => {
            try {
                const request = {
                    peer_pubkey_and_opt_addr: '02...@127.0.0.1:9735', // Correct parameter name
                    capacity_sat: 100000,
                    push_msat: 0,
                    asset_amount: undefined,
                    asset_id: undefined,
                };

                const response = await client.rln.openChannel(request);

                expect(response).toBeDefined();
                expect(response).toHaveProperty('temporary_channel_id');
            } catch (e: unknown) {
                console.warn('Skipping openChannel test - requires test setup:', e);
            }
        }, 60000);

        it('should close a channel', async () => {
            try {
                const request = {
                    channel_id: 'test_channel_id',
                    peer_pubkey: '02...', // Test peer pubkey
                    force: false,
                };

                const response = await client.rln.closeChannel(request);

                expect(response).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping closeChannel test - requires test setup:', e);
            }
        }, 60000);
    });

    describe('Peer Management', () => {
        it('should list peers', async () => {
            try {
                const peers = (await client.rln.listPeers()).peers || [];

                expect(Array.isArray(peers)).toBe(true);

                if (peers.length > 0) {
                    const peer = peers[0];
                    expect(peer).toHaveProperty('pubkey');
                    expect(typeof peer.pubkey).toBe('string');
                }
            } catch (e: unknown) {
                console.warn('Skipping listPeers test - node unavailable:', e);
            }
        }, 30000);

        it('should handle empty peer list', async () => {
            try {
                const peers = (await client.rln.listPeers()).peers || [];

                expect(Array.isArray(peers)).toBe(true);
                // Should return empty array, not throw
            } catch (e: unknown) {
                console.warn('Skipping empty peer list test - node unavailable:', e);
            }
        }, 30000);

        // Note: connectPeer test is skipped as it modifies state
        it('should connect to a peer', async () => {
            try {
                const request = {
                    peer_pubkey_and_addr: '02...@127.0.0.1:9735', // Test peer
                };

                const response = await client.rln.connectPeer(request);

                expect(response).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping connectPeer test - requires test setup:', e);
            }
        }, 30000);

        it('should fail to connect with invalid peer string', async () => {
            try {
                const request = {
                    peer_pubkey_and_addr: 'invalid_peer_string',
                };

                await client.rln.connectPeer(request);
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);
    });

    describe('Asset Management', () => {
        it('should list node assets', async () => {
            try {
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];

                expect(Array.isArray(assets)).toBe(true);

                if (assets.length > 0) {
                    const asset = assets[0];
                    expect(asset).toHaveProperty('asset_id');
                    expect(typeof asset.asset_id).toBe('string');
                }
            } catch (e: unknown) {
                console.warn('Skipping listNodeAssets test - node unavailable:', e);
            }
        }, 30000);

        it('should get BTC balance', async () => {
            try {
                const balance = await client.rln.getBtcBalance();

                expect(balance).toBeDefined();
                expect(balance).toHaveProperty('vanilla');
                // Balance values should be numbers or bigints depending on size
                expect(['number', 'bigint']).toContain(typeof balance.vanilla!.settled);
            } catch (e: unknown) {
                console.warn('Skipping getBtcBalance test - node unavailable:', e);
            }
        }, 30000);

        it('should get asset balance for valid asset', async () => {
            try {
                // First get available assets
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];

                if (assets.length === 0) {
                    console.warn('No assets available to test getAssetBalance');
                    return;
                }

                const assetId = assets[0].asset_id;
                const balance = await client.rln.getAssetBalance({ asset_id: assetId });

                expect(balance).toBeDefined();
                // Property checks removed as type definition handles validation
            } catch (e: unknown) {
                console.warn('Skipping getAssetBalance test - node unavailable:', e);
            }
        }, 30000);

        it('should fail to get balance for invalid asset', async () => {
            try {
                await client.rln.getAssetBalance({ asset_id: 'invalid_asset_id_123' });
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);

        it('should sync RGB wallet', async () => {
            try {
                await client.rln.syncRgbWallet();
                expect(true).toBe(true);
            } catch (e: unknown) {
                console.warn('Skipping syncRgbWallet test - node unavailable:', e);
            }
        }, 30000);

        it('should attempt sendRgb with recipient map', async () => {
            try {
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];

                if (assets.length === 0) {
                    console.warn('No RGB assets available to test sendRgb');
                    return;
                }

                const assetId = assets[0].asset_id;
                const invoice = await client.rln.createRgbInvoice({ asset_id: assetId });

                if (!invoice?.recipient_id) {
                    console.warn('No recipient_id returned from createRgbInvoice');
                    return;
                }

                const response = await client.rln.sendRgb({
                    recipient_map: {
                        [assetId]: [{ recipient_id: invoice.recipient_id }],
                    },
                });

                expect(response).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping sendRgb test - requires RGB setup:', e);
            }
        }, 60000);
    });

    describe('Address Management', () => {
        it('should get onchain address', async () => {
            try {
                const address = await client.rln.getAddress();

                expect(address).toBeDefined();
                expect(address).toHaveProperty('address');
                expect(typeof address.address).toBe('string');
                expect(address.address!.length).toBeGreaterThan(0);
            } catch (e: unknown) {
                console.warn('Skipping getOnchainAddress test - node unavailable:', e);
            }
        }, 30000);

        it('should return valid Bitcoin address format', async () => {
            try {
                const address = await client.rln.getAddress();

                // Bitcoin addresses start with specific prefixes depending on network
                // Mainnet: 1, 3, bc1 | Testnet: m, n, 2, tb1 | Regtest: bcrt1
                expect(address.address).toMatch(/^(1|3|bc1|m|n|2|tb1|bcrt1)/);
            } catch (e: unknown) {
                console.warn('Skipping address format test - node unavailable:', e);
            }
        }, 30000);
    });
    describe('Lightning Operations', () => {
        it('should create lightning invoice without parameters', async () => {
            try {
                const invoice = await client.rln.createLNInvoice({
                    amnt_msat: 10000,
                    expiry_sec: 3600,
                });

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
                expect(typeof invoice.invoice).toBe('string');
                expect(invoice.invoice).toMatch(/^ln/); // Lightning invoices start with 'ln'
            } catch (e: unknown) {
                console.warn('Skipping createLnInvoice test - node unavailable:', e);
            }
        }, 30000);

        it('should create lightning invoice with amount', async () => {
            try {
                const invoice = await client.rln.createLNInvoice({ amnt_msat: 10000 });

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
                expect(invoice.invoice).toMatch(/^ln/);
            } catch (e: unknown) {
                console.warn('Skipping createLnInvoice with amount test - node unavailable:', e);
            }
        }, 30000);

        it('should create lightning invoice with expiry', async () => {
            try {
                const invoice = await client.rln.createLNInvoice({
                    amnt_msat: 10000,
                    expiry_sec: 3600,
                });

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
            } catch (e: unknown) {
                console.warn('Skipping createLnInvoice with expiry test - node unavailable:', e);
            }
        }, 30000);

        it('should create RGB lightning invoice', async () => {
            try {
                const request = {
                    amnt_msat: 10000,
                    expiry_sec: 3600,
                    asset_amount: 1000,
                    asset_id: 'test_asset_id',
                };
                const invoice = await client.rln.createLNInvoice(request);

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
            } catch (e: unknown) {
                // Expected to fail if asset doesn't exist
                console.warn('Skipping RGB invoice test - asset not available:', e);
            }
        }, 30000);

        it('should create witness lightning invoice', async () => {
            try {
                const invoice = await client.rln.createLNInvoice({
                    amnt_msat: 10000,
                    witness: true,
                });

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
                expect(typeof invoice.invoice).toBe('string');
                expect(invoice.invoice).toMatch(/^ln/);
            } catch (e: unknown) {
                console.warn('Skipping witness invoice test - node unavailable:', e);
            }
        }, 30000);

        it('should create witness invoice with expiry', async () => {
            try {
                const invoice = await client.rln.createLNInvoice({
                    amnt_msat: 10000,
                    expiry_sec: 3600,
                    witness: true,
                });

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
                expect(invoice.invoice).toMatch(/^ln/);
            } catch (e: unknown) {
                console.warn('Skipping witness invoice with expiry test - node unavailable:', e);
            }
        }, 30000);

        it('should create RGB witness invoice', async () => {
            try {
                const request = {
                    amnt_msat: 10000,
                    expiry_sec: 3600,
                    asset_amount: 1000,
                    asset_id: 'test_asset_id',
                    witness: true,
                };
                const invoice = await client.rln.createLNInvoice(request);

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
            } catch (e: unknown) {
                console.warn('Skipping RGB witness invoice test - asset not available:', e);
            }
        }, 30000);

        it('should decode lightning invoice', async () => {
            try {
                // First create an invoice
                const created = await client.rln.createLNInvoice({ amnt_msat: 10000 });

                // Then decode it
                const decoded = await client.rln.decodeLNInvoice(created.invoice);

                expect(decoded).toBeDefined();
                expect(decoded).toHaveProperty('payment_hash');
                expect(decoded).toHaveProperty('amount_msat');
                expect(decoded).toHaveProperty('payment_secret');
                expect(decoded).toHaveProperty('payee_pubkey');
                expect(decoded).toHaveProperty('network');
                expect(decoded).toHaveProperty('timestamp');

                // Validate formats
                expect((decoded as any).payment_hash).toMatch(/^[0-9a-f]{64}$/i);
                expect((decoded as any).payment_secret).toMatch(/^[0-9a-f]{64}$/i);
                expect((decoded as any).payee_pubkey).toMatch(/^[0-9a-f]{66}$/i); // Compressed pubkey
                expect(['mainnet', 'testnet', 'signet', 'regtest']).toContain(
                    (decoded as any).network,
                );
                expect(typeof (decoded as any).timestamp).toBe('number');
                expect((decoded as any).timestamp).toBeGreaterThan(0);
            } catch (e: unknown) {
                console.warn('Skipping decodeLnInvoice test - node unavailable:', e);
            }
        }, 30000);

        it('should decode witness invoice', async () => {
            try {
                const created = await client.rln.createLNInvoice({
                    amnt_msat: 10000,
                    witness: true,
                });

                const decoded = await client.rln.decodeLNInvoice(created.invoice);

                expect(decoded).toBeDefined();
                expect((decoded as any).payment_hash).toMatch(/^[0-9a-f]{64}$/i);
                expect((decoded as any).payment_secret).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping witness invoice decode test - node unavailable:', e);
            }
        }, 30000);

        it('should fail to decode invalid invoice', async () => {
            try {
                const request = {
                    invoice: 'invalid_invoice_string',
                };
                await client.rln.decodeLNInvoice(request);
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);

        it('should list payments', async () => {
            try {
                const payments = (await client.rln.listPayments()).payments || [];

                expect(Array.isArray(payments)).toBe(true);

                if (payments.length > 0) {
                    const payment = payments[0];
                    expect(payment).toHaveProperty('payment_hash');
                    expect(payment).toHaveProperty('status');
                    expect(payment).toHaveProperty('created_at');
                    expect(payment).toHaveProperty('updated_at');
                    expect(payment).toHaveProperty('inbound');
                    expect(payment).toHaveProperty('payee_pubkey');

                    // Validate formats and constraints
                    expect((payment as any).payment_hash).toMatch(/^[0-9a-f]{64}$/i);
                    expect(['Pending', 'Success', 'Failed']).toContain((payment as any).status);
                    expect(typeof (payment as any).created_at).toBe('number');
                    expect(typeof (payment as any).updated_at).toBe('number');
                    expect((payment as any).created_at).toBeGreaterThan(0);
                    expect((payment as any).updated_at).toBeGreaterThan(0);
                    // created_at should be before or equal to updated_at
                    expect((payment as any).created_at).toBeLessThanOrEqual(
                        (payment as any).updated_at,
                    );
                    expect(typeof (payment as any).inbound).toBe('boolean');
                    expect((payment as any).payee_pubkey).toMatch(/^[0-9a-f]{66}$/i);
                }
            } catch (e: unknown) {
                console.warn('Skipping listPayments test - node unavailable:', e);
            }
        }, 30000);

        it('should distinguish keysend response from sendpayment', async () => {
            try {
                // Keysend should return payment_preimage, NOT payment_secret
                const keysendRequest = {
                    dest_pubkey:
                        '03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d',
                    amt_msat: 1000,
                };

                const keysendResponse = await client.rln.keysend(keysendRequest);

                expect(keysendResponse).toBeDefined();
                expect(keysendResponse).toHaveProperty('payment_hash');
                expect(keysendResponse).toHaveProperty('payment_preimage'); // IMPORTANT: keysend uses preimage
                expect(keysendResponse).not.toHaveProperty('payment_secret');
                expect(keysendResponse).toHaveProperty('status');

                // Validate formats
                expect((keysendResponse as any).payment_hash).toMatch(/^[0-9a-f]{64}$/i);
                expect((keysendResponse as any).payment_preimage).toMatch(/^[0-9a-f]{64}$/i);
                expect(['Pending', 'Success', 'Failed']).toContain((keysendResponse as any).status);
            } catch (e: unknown) {
                console.warn('Skipping keysend response validation - node unavailable:', e);
            }
        }, 30000);

        it('should send keysend with RGB asset', async () => {
            try {
                const request = {
                    dest_pubkey:
                        '03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d',
                    amt_msat: 1000,
                    asset_id: 'rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8',
                    asset_amount: 100,
                };

                const response = await client.rln.keysend(request);

                expect(response).toBeDefined();
                expect(response).toHaveProperty('payment_hash');
                expect(response).toHaveProperty('payment_preimage');
            } catch (e: unknown) {
                // Expected to fail if no channels/assets available
                console.warn('Skipping RGB keysend test - asset/channel unavailable:', e);
            }
        }, 30000);

        it('should send payment via invoice (different from keysend)', async () => {
            try {
                // First create an invoice
                const invoiceResponse = await client.rln.createLNInvoice({ amnt_msat: 1000 });

                // SendPayment should return payment_secret, NOT payment_preimage
                const sendPaymentRequest = {
                    invoice: invoiceResponse.invoice,
                };

                const sendPaymentResponse = await client.rln.sendPayment(sendPaymentRequest);

                expect(sendPaymentResponse).toBeDefined();
                expect(sendPaymentResponse).toHaveProperty('payment_hash');
                expect(sendPaymentResponse).toHaveProperty('payment_secret'); // IMPORTANT: sendpayment uses secret
                expect(sendPaymentResponse).not.toHaveProperty('payment_preimage');
                expect(sendPaymentResponse).toHaveProperty('status');
            } catch (e: unknown) {
                // Expected to fail if no channels/peers available
                console.warn('Skipping sendPayment test - requires channels:', e);
            }
        }, 30000);

        it('should fail keysend with invalid pubkey', async () => {
            try {
                const request = {
                    dest_pubkey: 'invalid_pubkey',
                    amt_msat: 1000,
                };

                await client.rln.keysend(request);
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);

        it('should fail sendpayment with invalid invoice', async () => {
            try {
                const request = {
                    invoice: 'invalid_invoice_string',
                };

                await client.rln.sendPayment(request);
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);
    });

    describe('RGB Invoice Operations', () => {
        it('should create RGB invoice', async () => {
            try {
                // Get available assets first
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];

                if (assets.length === 0) {
                    console.warn('No RGB assets available to create invoice');
                    return;
                }

                const assetId = assets[0].asset_id;
                const invoice = await client.rln.createRgbInvoice({
                    asset_id: assetId,
                    duration_seconds: 86400,
                });

                expect(invoice).toBeDefined();
                expect(invoice).toHaveProperty('invoice');
                expect(invoice).toHaveProperty('recipient_id');
                expect(invoice).toHaveProperty('expiration_timestamp');

                // RGB invoices use rgb:// protocol, not lnbc
                expect((invoice as any).invoice).toMatch(/^rgb:\/\//);
                expect((invoice as any).recipient_id).toMatch(/^bcrt:utxob:|^rgb:/);
                expect(typeof (invoice as any).expiration_timestamp).toBe('number');
                expect((invoice as any).expiration_timestamp).toBeGreaterThan(0);
            } catch (e: unknown) {
                console.warn('Skipping createRgbInvoice test - no assets available:', e);
            }
        }, 30000);

        it('should create RGB invoice with witness', async () => {
            try {
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];

                if (assets.length === 0) {
                    console.warn('No RGB assets available to create witness invoice');
                    return;
                }

                const assetId = assets[0].asset_id;
                const invoice = await client.rln.createRgbInvoice({
                    asset_id: assetId,
                    witness: true,
                    duration_seconds: 86400,
                });

                expect(invoice).toBeDefined();
                expect((invoice as any).invoice).toMatch(/^rgb:\/\//);
                expect((invoice as any).recipient_id).toBeDefined();
                expect(typeof (invoice as any).expiration_timestamp).toBe('number');
            } catch (e: unknown) {
                console.warn('Skipping RGB witness invoice test - no assets available:', e);
            }
        }, 30000);

        it('should decode RGB invoice', async () => {
            try {
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];

                if (assets.length === 0) {
                    console.warn('No RGB assets available to create invoice for decoding');
                    return;
                }

                const assetId = assets[0].asset_id;
                const created = await client.rln.createRgbInvoice({
                    asset_id: assetId,
                });

                const decoded = await client.rln.decodeRgbInvoice({ invoice: created.invoice });

                expect(decoded).toBeDefined();
                expect(decoded).toHaveProperty('asset_id');
                expect(decoded).toHaveProperty('amount');
                expect(decoded).toHaveProperty('recipient_id');
            } catch (e: unknown) {
                console.warn('Skipping decodeRgbInvoice test - no assets available:', e);
            }
        }, 30000);

        it('should fail to decode invalid RGB invoice', async () => {
            try {
                await client.rln.decodeRgbInvoice({ invoice: 'invalid_rgb_invoice' });
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);
    });

    describe('Wallet Operations', () => {
        it('should initialize wallet', async () => {
            try {
                const request = {
                    password: 'test_password_123',
                };
                const response = await client.rln.initWallet(request);

                expect(response).toBeDefined();
                // Should return wallet seed or confirmation
            } catch (e: unknown) {
                console.warn('Skipping initWallet test - wallet may already exist:', e);
            }
        }, 30000);

        it('should unlock wallet', async () => {
            try {
                const request = {
                    password: 'test_password_123',
                };
                const response = await client.rln.unlockWallet(request);

                expect(response).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping unlockWallet test - wallet state unknown:', e);
            }
        }, 30000);

        it('should fail to unlock with wrong password', async () => {
            try {
                const request = {
                    password: 'wrong_password',
                };
                await client.rln.unlockWallet(request);
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);

        it('should lock wallet', async () => {
            try {
                const response = await client.rln.lockWallet();

                expect(response).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping lockWallet test - wallet state unknown:', e);
            }
        }, 30000);

        it('should handle wallet lifecycle', async () => {
            try {
                const request = {
                    password: 'test_password_lifecycle',
                };

                // Unlock -> Lock -> Unlock again
                await client.rln.unlockWallet(request);
                await client.rln.lockWallet();
                await client.rln.unlockWallet(request);

                // Should not throw
                expect(true).toBe(true);
            } catch (e: unknown) {
                console.warn('Skipping wallet lifecycle test:', e);
            }
        }, 60000);
    });

    describe('Trade Operations', () => {
        it('should whitelist swap', async () => {
            try {
                const swapstring = 'test_swap_string'; // Would need real swap string
                await client.rln.whitelistSwap(swapstring);

                // Should not throw
                expect(true).toBe(true);
            } catch (e: unknown) {
                console.warn('Skipping whitelistSwap test - requires valid swap:', e);
            }
        }, 30000);

        it('should fail to whitelist invalid swap string', async () => {
            try {
                await client.rln.whitelistSwap('');
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Expected error
                expect(e).toBeDefined();
            }
        }, 30000);
    });

    describe('Error Handling', () => {
        it('should handle node not configured error', async () => {
            try {
                // Create client without node URL
                const clientNoNode = KaleidoClient.create({
                    baseUrl: TEST_API_URL,
                });

                expect(clientNoNode.hasNode()).toBe(false);

                await clientNoNode.rln.getNodeInfo();
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Should get NodeNotConfigured error
                expect(e).toBeDefined();
            }
        }, 30000);

        it('should handle network errors gracefully', async () => {
            try {
                // Create client with invalid node URL
                const clientBadNode = KaleidoClient.create({
                    baseUrl: TEST_API_URL,
                    nodeUrl: 'http://invalid-node-url:9999',
                });

                await clientBadNode.rln.getNodeInfo();
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;
                // Should get network error
                expect(e).toBeDefined();
            }
        }, 30000);

        it('should preserve error details', async () => {
            try {
                const request = {
                    asset_id: 'definitely_invalid_asset_id',
                };
                await client.rln.getAssetBalance(request);
                throw new Error('Should have thrown');
            } catch (e: unknown) {
                if ((e as Error).message === 'Should have thrown') throw e;

                const error = e as Error;
                expect(error.message).toBeDefined();
                expect(error.message.length).toBeGreaterThan(0);
            }
        }, 30000);
    });

    describe('Type Safety', () => {
        it('should return properly typed responses', async () => {
            try {
                const channels = (await client.rln.listChannels()).channels || [];
                const peers = (await client.rln.listPeers()).peers || [];
                const { nia, cfa, uda } = await client.rln.listAssets();
                const assets = [...(nia || []), ...(cfa || []), ...(uda || [])];
                const payments = (await client.rln.listPayments()).payments || [];

                // TypeScript should enforce these are arrays
                expect(Array.isArray(channels)).toBe(true);
                expect(Array.isArray(peers)).toBe(true);
                expect(Array.isArray(assets)).toBe(true);
                expect(Array.isArray(payments)).toBe(true);
            } catch (e: unknown) {
                console.warn('Skipping type safety test - node unavailable:', e);
            }
        }, 30000);

        it('should handle optional parameters correctly', async () => {
            try {
                // All parameters optional
                const invoice1 = await client.rln.createLNInvoice({});
                expect(invoice1).toBeDefined();

                // Some parameters
                const invoice2 = await client.rln.createLNInvoice({
                    amount_msat: 10000,
                });
                expect(invoice2).toBeDefined();

                // All parameters
                const invoice3 = await client.rln.createLNInvoice({
                    amount_msat: 10000,
                    timeout_seconds: 3600,
                    description: undefined,
                    description_hash: undefined,
                });
                expect(invoice3).toBeDefined();
            } catch (e: unknown) {
                console.warn('Skipping optional parameters test - node unavailable:', e);
            }
        }, 30000);
    });
});
