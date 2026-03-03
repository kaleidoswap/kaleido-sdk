/**
 * Example 01: Hello Kaleidoswap
 *
 * Basic client setup, fetching market data, and demonstrating the SDK's
 * logging interface.
 *
 * Logging philosophy (mirroring the Python SDK):
 *   - The SDK is completely silent by default — no output unless you opt in
 *     by setting `logLevel` in the config.
 *   - `logLevel` controls *which* records the SDK emits.
 *   - An optional `logger` controls *where* they go (defaults to stderr via
 *     the built-in StreamLogger).
 *   - Per-component overrides let you fine-tune verbosity after creation via
 *     the client's `logState`.
 */

import {
    KaleidoClient,
    getSdkName,
    getVersion,
    LogLevel,
    StreamLogger,
    applyLogLevel,
    setComponentLogLevel,
    setLogger,
} from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com';

// ---------------------------------------------------------------------------
// Logging setup  (application's responsibility — the SDK never does this)
// ---------------------------------------------------------------------------
//
// Option A — built-in StreamLogger (writes to process.stderr, default):
//   Pass logLevel in the config. No logger needed — the SDK will use stderr.
//
// Option B — custom stream (e.g. stdout or a file stream):
//   import { createWriteStream } from 'fs';
//   const logger = new StreamLogger({ stream: createWriteStream('sdk.log') });
//   KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger });
//
// Option C — your own logger (Winston, Pino, etc.):
//   import pino from 'pino';
//   const logger = pino();
//   KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger });
//
// Option D — silence a noisy sub-component after creation:
//   setComponentLogLevel(client.logState, 'http', LogLevel.WARN);
//
// The example below uses Option A so you can see all SDK log output on stderr.
// Change LogLevel.DEBUG to LogLevel.WARN to reduce noise.
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    console.log(`🎨 ${getSdkName()} v${getVersion()}`);
    console.log('-'.repeat(40));

    // Create client — logLevel tells the SDK which records to emit.
    // Omitting logLevel (or setting it to LogLevel.SILENT) produces zero output.
    const client = KaleidoClient.create({
        baseUrl: API_URL,
        logLevel: LogLevel.DEBUG, // Show all HTTP and swap traces on stderr
        // logger: new StreamLogger({ stream: process.stdout }), // redirect to stdout
    });

    // ---------------------------------------------------------------------------
    // Fetch assets
    // ---------------------------------------------------------------------------
    console.log('\n📦 Fetching available assets…');
    const assetsResponse = await client.maker.listAssets();

    console.log(`\nFound ${assetsResponse.assets.length} assets:`);
    for (const asset of assetsResponse.assets.slice(0, 5)) {
        console.log(`  • ${asset.ticker} — ${asset.name} (precision: ${asset.precision})`);
    }
    if (assetsResponse.assets.length > 5) {
        console.log(`  … and ${assetsResponse.assets.length - 5} more`);
    }

    // ---------------------------------------------------------------------------
    // Fetch trading pairs
    // ---------------------------------------------------------------------------
    console.log('\n📋 Fetching trading pairs…');
    const pairsResponse = await client.maker.listPairs();

    console.log(`\nFound ${pairsResponse.pairs.length} pairs:`);
    for (const pair of pairsResponse.pairs.slice(0, 5)) {
        console.log(`  • ${pair.base.ticker}/${pair.quote.ticker}`);
    }
    if (pairsResponse.pairs.length > 5) {
        console.log(`  … and ${pairsResponse.pairs.length - 5} more`);
    }

    // ---------------------------------------------------------------------------
    // Demonstrate per-component level control via client.logState
    // ---------------------------------------------------------------------------
    console.log('\n🔧 Adjusting log levels at runtime via client.logState…');

    // Silence HTTP noise — keep maker-level events visible.
    // Each client has its own logState, so this only affects *this* client.
    setComponentLogLevel(client.logState, 'http', LogLevel.WARN);
    console.log('  HTTP component → WARN (HTTP debug logs suppressed)');

    // Re-fetch assets — no HTTP debug output this time
    console.log('\n📦 Fetching assets again (HTTP logs suppressed)…');
    await client.maker.listAssets();

    // Clear the component override — 'http' inherits the root level again
    setComponentLogLevel(client.logState, 'http', null);
    console.log('\n  HTTP override cleared — inheriting root level (DEBUG)');

    // Raise root level to INFO for less noisy output going forward
    applyLogLevel(client.logState, LogLevel.INFO);
    console.log('  Root level raised to INFO');

    // Swap to a custom formatter (still writing to stderr, but no timestamp)
    setLogger(
        client.logState,
        new StreamLogger({
            format: (label, msg) => `[${label.trim()}] ${msg}`,
        }),
    );
    console.log('  Logger swapped to a compact formatter (no timestamp)\n');

    // This fetch will use the compact formatter at INFO level
    console.log('📦 Fetching assets one more time…');
    await client.maker.listAssets();

    console.log('\n✅ Done!');
}

main().catch(console.error);
