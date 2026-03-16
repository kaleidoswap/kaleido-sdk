import type { WSClient } from '../../src/ws-client.js';

const BACKEND_UNAVAILABLE_PATTERNS = [
    'fetch failed',
    'connection timeout',
    'connection closed before opening',
    'websocket availability check timed out',
    'econnrefused',
    'econnreset',
    'eperm',
    'und_err_socket',
    'other side closed',
    'network error',
];

function collectErrorDetails(
    error: unknown,
    details: string[] = [],
    seen = new Set<unknown>(),
): string[] {
    if (error == null || seen.has(error)) {
        return details;
    }

    seen.add(error);

    if (typeof error === 'string') {
        details.push(error);
        return details;
    }

    if (error instanceof Error) {
        details.push(error.name, error.message);
        collectErrorDetails((error as Error & { cause?: unknown }).cause, details, seen);
        return details;
    }

    if (typeof error === 'object') {
        const maybeCode = (error as { code?: unknown }).code;
        const maybeMessage = (error as { message?: unknown }).message;
        const maybeCause = (error as { cause?: unknown }).cause;

        if (typeof maybeCode === 'string') {
            details.push(maybeCode);
        }

        if (typeof maybeMessage === 'string') {
            details.push(maybeMessage);
        }

        collectErrorDetails(maybeCause, details, seen);
    }

    return details;
}

export function isBackendUnavailable(error: unknown): boolean {
    const detailText = collectErrorDetails(error).join(' ').toLowerCase();

    return BACKEND_UNAVAILABLE_PATTERNS.some((pattern) => detailText.includes(pattern));
}

export function skipIfBackendUnavailable(context: string, error: unknown): boolean {
    if (!isBackendUnavailable(error)) {
        return false;
    }

    console.warn(`Skipping - ${context}:`, error);
    return true;
}

export async function connectWebSocketOrSkip(
    ws: WSClient,
    context: string,
    timeoutMs: number = 3000,
): Promise<boolean> {
    const connectPromise = ws.connect();

    // Avoid an unhandled rejection if the timeout wins the race.
    connectPromise.catch(() => undefined);

    try {
        await Promise.race([
            connectPromise,
            new Promise<never>((_, reject) =>
                setTimeout(
                    () => reject(new Error('WebSocket availability check timed out')),
                    timeoutMs,
                ),
            ),
        ]);
        return true;
    } catch (error) {
        ws.disconnect();

        if (skipIfBackendUnavailable(context, error)) {
            return false;
        }

        throw error;
    }
}
