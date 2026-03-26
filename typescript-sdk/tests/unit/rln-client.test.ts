import { describe, expect, it, vi } from 'vitest';
import { TimeoutError } from '../../src/errors.js';
import { RlnClient } from '../../src/rln-client.js';

describe('RlnClient', () => {
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
