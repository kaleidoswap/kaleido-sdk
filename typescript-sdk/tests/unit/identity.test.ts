import { describe, expect, it } from 'vitest';
import {
    generateInstallId,
    generateSessionId,
    loadOrCreateInstallId,
    MemoryInstallIdStore,
} from '../../src/identity.js';

describe('identity', () => {
    it('generates install IDs with the telemetry prefix', () => {
        expect(generateInstallId()).toMatch(/^inst_[0-9A-HJKMNP-TV-Z]{26}$/);
    });

    it('uses an explicit install ID override without touching storage', async () => {
        const store = new MemoryInstallIdStore();

        await expect(loadOrCreateInstallId({ override: 'inst_override', store })).resolves.toBe(
            'inst_override',
        );
        await expect(store.load()).resolves.toBeUndefined();
    });

    it('persists generated install IDs in the provided store', async () => {
        const store = new MemoryInstallIdStore();
        const firstInstallId = await loadOrCreateInstallId({ store });
        const secondInstallId = await loadOrCreateInstallId({ store });

        expect(secondInstallId).toBe(firstInstallId);
    });

    it('generates UUID-like session IDs', () => {
        expect(generateSessionId()).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
    });
});
