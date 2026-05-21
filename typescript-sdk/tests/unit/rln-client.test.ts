import { describe, expect, it, vi } from 'vitest';
import { TimeoutError } from '../../src/errors.js';
import { SyncKeychainOneOf0, SyncStrategy } from '../../src/node-types-ext.js';
import { RlnClient } from '../../src/rln-client.js';

describe('RlnClient', () => {
    it('preserves ifa entries in listAssets responses', async () => {
        const client = new RlnClient({
            node: {
                POST: vi.fn().mockResolvedValue({
                    data: {
                        nia: [],
                        uda: [],
                        cfa: [],
                        ifa: [
                            {
                                asset_id: 'rgb1ifaassetid',
                                ticker: 'IFA',
                                name: 'IFA Asset',
                                details: null,
                                precision: 0,
                                initial_supply: 1,
                                max_supply: 1,
                                known_circulating_supply: 1,
                                timestamp: 1700000000,
                                added_at: 1700000001,
                                balance: {
                                    settled: 1,
                                    future: 0,
                                    spendable: 1,
                                    offchain_outbound: 0,
                                    offchain_inbound: 0,
                                },
                                media: null,
                                reject_list_url: null,
                            },
                        ],
                    },
                }),
            },
        } as never);

        const result = await client.listAssets();

        expect(result.ifa).toHaveLength(1);
        expect(result.ifa?.[0]?.ticker).toBe('IFA');
    });

    it('surfaces a sync hint when unlock times out', async () => {
        const client = new RlnClient({
            node: {
                POST: vi.fn().mockRejectedValue(new TimeoutError('Request timeout after 30000ms')),
            },
        } as never);

        await expect(client.unlockWallet({ password: 'secret' })).rejects.toMatchObject({
            code: 'TIMEOUT_ERROR',
            message: expect.stringContaining('it may still be syncing'),
        });
    });

    it('sends the default sync request body', async () => {
        const post = vi.fn().mockResolvedValue({ data: {} });
        const client = new RlnClient({
            node: {
                POST: post,
            },
        } as never);

        await client.syncRgbWallet();

        expect(post).toHaveBeenCalledWith('/sync', {
            body: {
                options: {
                    keychain: SyncKeychainOneOf0.Colored,
                    strategy: SyncStrategy.FastSync,
                },
            },
        });
    });

    it('accepts explicit sync request options', async () => {
        const post = vi.fn().mockResolvedValue({ data: {} });
        const client = new RlnClient({
            node: {
                POST: post,
            },
        } as never);
        const request = {
            options: {
                keychain: { Vanilla: { lookback: 20 } },
                strategy: SyncStrategy.FullScan,
            },
        };

        await client.syncRgbWallet(request);

        expect(post).toHaveBeenCalledWith('/sync', { body: request });
    });

    it('forwards listUnspents filters while keeping the default skip_sync', async () => {
        const post = vi.fn().mockResolvedValue({ data: { unspents: [] } });
        const client = new RlnClient({
            node: { POST: post },
        } as never);

        await client.listUnspents({ skip_sync: true });

        expect(post).toHaveBeenCalledWith('/listunspents', {
            body: { skip_sync: true },
        });
    });

    // ========================================================================
    // sendBtc surfaces the response (Batch B1 — Python parity)
    // Mirrors the Python TestRlnClient that asserts SendBtcResponse is returned.
    // ========================================================================

    it('sendBtc returns the SendBtcResponse with the txid', async () => {
        const post = vi.fn().mockResolvedValue({
            data: { txid: 'abc123def456' },
        });
        const client = new RlnClient({
            node: { POST: post },
        } as never);

        const result = await client.sendBtc({
            amount: 10_000,
            address: 'bcrt1qexample',
            fee_rate: 5,
            skip_sync: false,
        });

        expect(result).toEqual({ txid: 'abc123def456' });
        expect(post).toHaveBeenCalledWith('/sendbtc', {
            body: {
                amount: 10_000,
                address: 'bcrt1qexample',
                fee_rate: 5,
                skip_sync: false,
            },
        });
    });

    // ========================================================================
    // connectPeer returns the response (Batch B2 — Python parity)
    // The /connectpeer endpoint returns EmptyResponse per OpenAPI; TS surfaces
    // it as ConnectPeerResponse so callers can distinguish "completed" from a
    // future iteration that might enrich the response.
    // ========================================================================

    it('connectPeer returns the (empty) ConnectPeerResponse', async () => {
        const post = vi.fn().mockResolvedValue({ data: {} });
        const client = new RlnClient({
            node: { POST: post },
        } as never);

        const result = await client.connectPeer({
            peer_pubkey_and_addr: '03abc@127.0.0.1:9735',
        });

        expect(result).toEqual({});
        expect(post).toHaveBeenCalledWith('/connectpeer', {
            body: { peer_pubkey_and_addr: '03abc@127.0.0.1:9735' },
        });
    });
});
