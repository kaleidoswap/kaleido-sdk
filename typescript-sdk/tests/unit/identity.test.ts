import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    generateInstallId,
    generateSessionId,
    loadOrCreateInstallId,
    MemoryInstallIdStore,
    resolveInstallIdStore,
} from '../../src/identity.js';

describe('identity', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

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

    it('defaults browser install ID storage to memory even when localStorage exists', async () => {
        const backing = new Map<string, string>();
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => backing.get(key) ?? null),
            setItem: vi.fn((key: string, value: string) => {
                backing.set(key, value);
            }),
            removeItem: vi.fn((key: string) => {
                backing.delete(key);
            }),
        });

        const firstStore = resolveInstallIdStore();
        const secondStore = resolveInstallIdStore();
        await firstStore.save('inst_memory_only');

        await expect(firstStore.load()).resolves.toBe('inst_memory_only');
        await expect(secondStore.load()).resolves.toBeUndefined();
        expect(backing.has('kld_install_id')).toBe(false);
    });

    it('uses browser localStorage only when persistence is opted in', async () => {
        const backing = new Map<string, string>();
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => backing.get(key) ?? null),
            setItem: vi.fn((key: string, value: string) => {
                backing.set(key, value);
            }),
            removeItem: vi.fn((key: string) => {
                backing.delete(key);
            }),
        });

        const firstStore = resolveInstallIdStore({ persistBrowser: true });
        const secondStore = resolveInstallIdStore({ persistBrowser: true });
        await firstStore.save('inst_persistent');

        await expect(secondStore.load()).resolves.toBe('inst_persistent');
        expect(backing.get('kld_install_id')).toBe('inst_persistent');
    });

    it('throws when secure crypto is unavailable for generated IDs', () => {
        vi.stubGlobal('crypto', undefined);

        expect(() => generateInstallId()).toThrow('Secure crypto.getRandomValues');
    });

    it('generates UUID-like session IDs', () => {
        expect(generateSessionId()).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
    });
});
