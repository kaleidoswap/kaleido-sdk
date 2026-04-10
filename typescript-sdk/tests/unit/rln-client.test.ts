import { describe, expect, it, vi } from 'vitest';
import { TimeoutError } from '../../src/errors.js';
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
});
