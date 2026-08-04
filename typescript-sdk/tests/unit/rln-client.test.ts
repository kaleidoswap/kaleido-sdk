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

    it('decodes a swapstring and returns the generated response shape', async () => {
        const response = {
            qty_from: 30,
            qty_to: 10,
            from_asset: null,
            to_asset: 'rgb:asset',
            expiry: 1715896416,
            payment_hash: 'a'.repeat(64),
        };
        const post = vi.fn().mockResolvedValue({ data: response });
        const client = new RlnClient({
            node: {
                POST: post,
            },
        } as never);

        const result = await client.decodeSwapstring('30///10/rgb:asset/1715896416/hash');

        expect(post).toHaveBeenCalledWith('/decodeswapstring', {
            body: { swapstring: '30///10/rgb:asset/1715896416/hash' },
        });
        expect(result).toEqual(response);
    });
});

describe('RlnClient.listSwaps integer precision', () => {
    const RAW = (qty: string) =>
        JSON.stringify({ maker: [], taker: [] }).replace(
            '"taker":[]',
            `"taker":[{"qty_from":${qty},"qty_to":1,"payment_hash":"ph","status":"Succeeded","requested_at":1700000000}]`,
        );

    it('preserves quantities above Number.MAX_SAFE_INTEGER', async () => {
        // JSON.parse would round this to ...992.
        const exact = '9007199254740993';
        const client = new RlnClient({
            node: {
                GET: vi.fn().mockResolvedValue({ data: RAW(exact) }),
                POST: vi.fn(),
            },
        } as never);

        const result = await client.listSwaps();
        expect(String(result.taker[0].qty_from)).toBe(exact);
        expect(BigInt(result.taker[0].qty_from)).toBe(BigInt(exact));
    });

    it('requests the response as text so quantities can be reparsed', async () => {
        const get = vi.fn().mockResolvedValue({ data: RAW('1') });
        const client = new RlnClient({ node: { GET: get, POST: vi.fn() } } as never);
        await client.listSwaps();
        expect(get).toHaveBeenCalledWith('/listswaps', { parseAs: 'text' });
    });

    it('passes through an already-decoded object from an injected transport', async () => {
        const decoded = { maker: [], taker: [{ qty_from: 5, qty_to: 6 }] };
        const client = new RlnClient({
            node: { GET: vi.fn().mockResolvedValue({ data: decoded }), POST: vi.fn() },
        } as never);
        const result = await client.listSwaps();
        expect(result.taker[0].qty_from).toBe(5);
    });

    it('leaves non-quantity numeric fields as numbers', async () => {
        const client = new RlnClient({
            node: { GET: vi.fn().mockResolvedValue({ data: RAW('1') }), POST: vi.fn() },
        } as never);
        const result = await client.listSwaps();
        expect(typeof (result.taker[0] as { requested_at: number }).requested_at).toBe('number');
    });
});
