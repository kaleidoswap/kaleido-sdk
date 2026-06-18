import { describe, it, expect } from 'vitest';

import { NWCClient, NwcError, parseNwcUri } from '../../src/nwc-client.js';
import { NwcRlnNodeClient } from '../../src/nwc-rln-transport.js';

const WALLET_PUBKEY = 'b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4';
// 32-byte hex secret (deterministic test key).
const SECRET = '0000000000000000000000000000000000000000000000000000000000000001';
const RELAY = 'wss://relay.example.com';

function buildUri(extra = ''): string {
    return `nostr+walletconnect://${WALLET_PUBKEY}?relay=${encodeURIComponent(
        RELAY,
    )}&secret=${SECRET}${extra}`;
}

describe('parseNwcUri', () => {
    it('parses a valid URI', () => {
        const info = parseNwcUri(buildUri());
        expect(info.walletPubkey).toBe(WALLET_PUBKEY);
        expect(info.relays).toEqual([RELAY]);
        expect(info.secret).toBe(SECRET);
        expect(info.lud16).toBeUndefined();
    });

    it('parses multiple relays and lud16', () => {
        const info = parseNwcUri(
            `nostr+walletconnect://${WALLET_PUBKEY}?relay=${encodeURIComponent(
                RELAY,
            )}&relay=${encodeURIComponent('wss://relay2.example.com')}&secret=${SECRET}&lud16=${encodeURIComponent('a@b.com')}`,
        );
        expect(info.relays).toHaveLength(2);
        expect(info.lud16).toBe('a@b.com');
    });

    it('rejects a non-NWC scheme', () => {
        expect(() => parseNwcUri('https://example.com')).toThrow(/scheme/);
    });

    it('rejects a URI missing the secret', () => {
        expect(() =>
            parseNwcUri(
                `nostr+walletconnect://${WALLET_PUBKEY}?relay=${encodeURIComponent(RELAY)}`,
            ),
        ).toThrow(/secret/);
    });

    it('rejects a URI missing relays', () => {
        expect(() =>
            parseNwcUri(`nostr+walletconnect://${WALLET_PUBKEY}?secret=${SECRET}`),
        ).toThrow(/relay/);
    });
});

describe('NWCClient', () => {
    it('derives the client pubkey from the connection secret', () => {
        const client = new NWCClient(buildUri());
        // secp256k1 x-only pubkey for private key = 1
        expect(client.clientPubkey).toBe(
            '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        );
        client.close();
    });

    it('exposes lud16 when present', () => {
        const client = new NWCClient(buildUri('&lud16=tips%40example.com'));
        expect(client.lud16).toBe('tips@example.com');
        client.close();
    });
});

describe('NwcError', () => {
    it('carries a code and message', () => {
        const err = new NwcError('QUOTA_EXCEEDED', 'over budget');
        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe('NwcError');
        expect(err.code).toBe('QUOTA_EXCEEDED');
        expect(err.message).toBe('over budget');
    });
});

describe('NwcRlnNodeClient', () => {
    // Fake NWCClient that echoes the method + params it was called with.
    const fakeNwc = {
        request: async (method: string, params: unknown) => ({ method, params }),
    } as unknown as NWCClient;

    it('maps GET endpoints to rln_ methods', async () => {
        const node = new NwcRlnNodeClient(fakeNwc);
        const res = await node.GET('/nodeinfo');
        expect(res.error).toBeUndefined();
        expect(res.data).toEqual({ method: 'rln_node_info', params: {} });
    });

    it('maps POST endpoints and forwards the body as params', async () => {
        const node = new NwcRlnNodeClient(fakeNwc);
        const res = await node.POST('/assetbalance', { body: { asset_id: 'x' } });
        expect(res.data).toEqual({
            method: 'rln_asset_balance',
            params: { asset_id: 'x' },
        });
    });

    it('returns an error for unsupported endpoints', async () => {
        const node = new NwcRlnNodeClient(fakeNwc);
        const res = await node.GET('/networkinfo');
        expect(res.data).toBeUndefined();
        expect(res.error).toMatchObject({ message: expect.stringContaining('not available') });
    });
});
