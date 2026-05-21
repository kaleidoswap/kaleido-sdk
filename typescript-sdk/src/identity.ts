const INSTALL_ID_STORAGE_KEY = 'kld_install_id';
const INSTALL_ID_FILE_NAME = 'install_id';
const INSTALL_ID_PREFIX = 'inst_';
const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export interface InstallIdStore {
    load(): Promise<string | undefined>;
    save(installId: string): Promise<void>;
}

export class MemoryInstallIdStore implements InstallIdStore {
    private installId?: string;

    async load(): Promise<string | undefined> {
        return this.installId;
    }

    async save(installId: string): Promise<void> {
        this.installId = installId;
    }
}

class BrowserInstallIdStore implements InstallIdStore {
    constructor(private readonly storage: Storage) {}

    async load(): Promise<string | undefined> {
        return this.storage.getItem(INSTALL_ID_STORAGE_KEY) ?? undefined;
    }

    async save(installId: string): Promise<void> {
        this.storage.setItem(INSTALL_ID_STORAGE_KEY, installId);
    }
}

async function importNodeModule<T>(specifier: string): Promise<T> {
    // We need to dynamically import Node built-ins (`node:fs` etc.) without
    // bundlers (Vite, webpack) statically resolving them when this SDK is
    // bundled for the browser. Two layered strategies:
    //
    //   1) Prefer a plain `await import(specifier)` with `/* @vite-ignore */`.
    //      This works in Node directly, in vitest's VM context, and Vite
    //      consumers skip the static analysis because of the magic comment.
    //
    //   2) Fall back to `new Function('return import(...)')` for environments
    //      whose static analysis ignores the Vite magic comment but accept
    //      runtime-constructed function bodies. This branch is unreachable
    //      under vitest (constructed functions live in the global VM context,
    //      not the test VM, and would fail with
    //      ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING).
    try {
        return (await import(/* @vite-ignore */ specifier)) as T;
    } catch {
        const dynamicImport = new Function('specifier', 'return import(specifier)') as (
            specifier: string,
        ) => Promise<T>;
        return dynamicImport(specifier);
    }
}

const INSTALL_ID_PATH_ENV_VAR = 'KALEIDO_INSTALL_ID_PATH';

function readInstallIdPathOverride(): string | undefined {
    const maybeProcess = (
        globalThis as {
            process?: { env?: Record<string, string | undefined> };
        }
    ).process;
    const override = maybeProcess?.env?.[INSTALL_ID_PATH_ENV_VAR];
    return override && override.length > 0 ? override : undefined;
}

class NodeInstallIdStore implements InstallIdStore {
    private async getInstallIdPath(): Promise<string> {
        const [{ promises: fs }, os, path] = await Promise.all([
            importNodeModule<typeof import('node:fs')>('node:fs'),
            importNodeModule<typeof import('node:os')>('node:os'),
            importNodeModule<typeof import('node:path')>('node:path'),
        ]);

        const override = readInstallIdPathOverride();
        if (override) {
            // Honour the same env-var override as the Python SDK
            // (`KALEIDO_INSTALL_ID_PATH`). Caller is responsible for the file
            // location; we still create the parent directory if missing.
            const directory = path.dirname(override);
            if (directory && directory !== '.' && directory !== override) {
                await fs.mkdir(directory, { recursive: true });
            }
            return override;
        }

        const directory = path.join(os.homedir(), '.kaleido');
        await fs.mkdir(directory, { recursive: true });
        return path.join(directory, INSTALL_ID_FILE_NAME);
    }

    async load(): Promise<string | undefined> {
        try {
            const [{ promises: fs }, filePath] = await Promise.all([
                importNodeModule<typeof import('node:fs')>('node:fs'),
                this.getInstallIdPath(),
            ]);
            const installId = (await fs.readFile(filePath, 'utf8')).trim();
            return installId || undefined;
        } catch {
            return undefined;
        }
    }

    async save(installId: string): Promise<void> {
        const [{ promises: fs }, filePath] = await Promise.all([
            importNodeModule<typeof import('node:fs')>('node:fs'),
            this.getInstallIdPath(),
        ]);

        // Race-safe write: O_EXCL via the `wx` flag ensures we never overwrite
        // an install ID set by a concurrent process. If another writer beat us,
        // re-read and silently accept their value (idempotent fallback).
        try {
            await fs.writeFile(filePath, `${installId}\n`, {
                encoding: 'utf8',
                mode: 0o600,
                flag: 'wx',
            });
        } catch (error) {
            const code = (error as NodeJS.ErrnoException | undefined)?.code;
            if (code === 'EEXIST') {
                // Another process won the race — leave their value in place.
                return;
            }
            throw error;
        }
    }
}

const fallbackMemoryStore = new MemoryInstallIdStore();
const browserMemoryStores = new WeakMap<Storage, MemoryInstallIdStore>();

function getBrowserMemoryStore(storage: Storage): MemoryInstallIdStore {
    let store = browserMemoryStores.get(storage);
    if (!store) {
        store = new MemoryInstallIdStore();
        browserMemoryStores.set(storage, store);
    }
    return store;
}

function getBrowserStorage(): Storage | undefined {
    try {
        if (typeof globalThis.localStorage === 'undefined') {
            return undefined;
        }

        const probeKey = `${INSTALL_ID_STORAGE_KEY}_probe`;
        globalThis.localStorage.setItem(probeKey, '1');
        globalThis.localStorage.removeItem(probeKey);
        return globalThis.localStorage;
    } catch {
        return undefined;
    }
}

function isNodeRuntime(): boolean {
    const maybeProcess = (
        globalThis as {
            process?: { versions?: { node?: string } };
        }
    ).process;
    return typeof maybeProcess?.versions?.node === 'string';
}

export function resolveInstallIdStore({
    persistBrowser = false,
}: {
    persistBrowser?: boolean;
} = {}): InstallIdStore {
    const browserStorage = getBrowserStorage();
    if (browserStorage && persistBrowser) {
        return new BrowserInstallIdStore(browserStorage);
    }
    if (browserStorage) {
        return getBrowserMemoryStore(browserStorage);
    }

    if (isNodeRuntime()) {
        return new NodeInstallIdStore();
    }

    return fallbackMemoryStore;
}

function randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);

    if (globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes);
        return bytes;
    }

    throw new Error('Secure crypto.getRandomValues is required to generate Kaleido IDs.');
}

function encodeTime(timeMs: number): string {
    let value = timeMs;
    let encoded = '';

    for (let index = 0; index < 10; index += 1) {
        const mod = value % 32;
        encoded = CROCKFORD_BASE32[mod] + encoded;
        value = Math.floor(value / 32);
    }

    return encoded;
}

function encodeRandom(length: number): string {
    const bytes = randomBytes(length);
    let encoded = '';

    for (const byte of bytes) {
        encoded += CROCKFORD_BASE32[byte % 32];
    }

    return encoded;
}

export function generateInstallId(): string {
    return `${INSTALL_ID_PREFIX}${encodeTime(Date.now())}${encodeRandom(16)}`;
}

export function generateSessionId(): string {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
        16,
        20,
    )}-${hex.slice(20)}`;
}

export async function loadOrCreateInstallId({
    override,
    store,
    persistBrowser,
}: {
    override?: string;
    store?: InstallIdStore;
    persistBrowser?: boolean;
} = {}): Promise<string> {
    if (override) {
        return override;
    }

    store ??= resolveInstallIdStore({ persistBrowser });
    const existingInstallId = await store.load().catch(() => undefined);
    if (existingInstallId) {
        return existingInstallId;
    }

    const installId = generateInstallId();
    await store.save(installId).catch(() => undefined);
    return installId;
}
