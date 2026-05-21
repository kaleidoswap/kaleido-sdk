import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    generateInstallId,
    generateSessionId,
    loadOrCreateInstallId,
    MemoryInstallIdStore,
    resolveInstallIdStore,
} from '../../src/identity.js';
import { KaleidoClient } from '../../src/client.js';

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

    it('defaults browser install ID storage to page-lifetime memory even when localStorage exists', async () => {
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
        await expect(secondStore.load()).resolves.toBe('inst_memory_only');
        expect(backing.has('kld_install_id')).toBe(false);
    });

    it('reuses browser memory install IDs across clients without localStorage persistence', async () => {
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

        const firstInstallId = await loadOrCreateInstallId();
        const secondInstallId = await loadOrCreateInstallId();

        expect(secondInstallId).toBe(firstInstallId);
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

    it('uses an explicit session ID in maker attribution headers', async () => {
        let capturedRequest: Request | undefined;
        vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
            capturedRequest = input instanceof Request ? input : new Request(input, init);
            return new Response('{"assets":[],"total":0,"limit":100,"offset":0}', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        });

        const client = await KaleidoClient.create({
            baseUrl: 'https://api.example.com',
            installId: 'inst_session_override',
            sessionId: 'session_override',
        });

        await client.maker.listAssets();

        expect(capturedRequest?.headers.get('x-kaleido-session-id')).toBe('session_override');
        await client.close();
    });

    describe('Node install ID store (E5, E6)', () => {
        // Use the actual filesystem under a temp path. We resolve the store
        // indirectly through loadOrCreateInstallId after pointing the env var
        // at a fresh location so we exercise the same code path users hit.

        it('honours the KALEIDO_INSTALL_ID_PATH env var override', async () => {
            const os = await import('node:os');
            const path = await import('node:path');
            const { promises: fs } = await import('node:fs');

            const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kld-id-'));
            const target = path.join(tmpDir, 'custom_install_id');
            const prev = process.env.KALEIDO_INSTALL_ID_PATH;
            process.env.KALEIDO_INSTALL_ID_PATH = target;

            try {
                const store = resolveInstallIdStore();
                const installId = await loadOrCreateInstallId({ store });
                expect(installId).toMatch(/^inst_/);
                const onDisk = (await fs.readFile(target, 'utf8')).trim();
                expect(onDisk).toBe(installId);
            } finally {
                if (prev === undefined) {
                    delete process.env.KALEIDO_INSTALL_ID_PATH;
                } else {
                    process.env.KALEIDO_INSTALL_ID_PATH = prev;
                }
                await fs.rm(tmpDir, { recursive: true, force: true });
            }
        });

        it('is race-safe: concurrent saves do not overwrite an existing file', async () => {
            const os = await import('node:os');
            const path = await import('node:path');
            const { promises: fs } = await import('node:fs');

            const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kld-id-'));
            const target = path.join(tmpDir, 'install_id');
            const prev = process.env.KALEIDO_INSTALL_ID_PATH;
            process.env.KALEIDO_INSTALL_ID_PATH = target;

            try {
                const store = resolveInstallIdStore();
                await store.save('inst_first_writer');
                // Second save must be a no-op because the file exists.
                await store.save('inst_second_writer');

                const onDisk = (await fs.readFile(target, 'utf8')).trim();
                expect(onDisk).toBe('inst_first_writer');
            } finally {
                if (prev === undefined) {
                    delete process.env.KALEIDO_INSTALL_ID_PATH;
                } else {
                    process.env.KALEIDO_INSTALL_ID_PATH = prev;
                }
                await fs.rm(tmpDir, { recursive: true, force: true });
            }
        });
    });
});
