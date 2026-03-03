/**
 * Example 01: Hello Kaleidoswap
 *
 * Basic client setup, fetching market data, and demonstrating the SDK's
 * logging interface.
 *
 * Logging philosophy (mirroring the Python SDK):
 *   - The SDK is completely silent by default — no console noise unless you
 *     opt in by setting `logLevel` in the config.
 *   - `logLevel` controls *which* records the SDK emits.
 *   - An optional `logger` controls *where* they go (defaults to `console`).
 *   - Per-component overrides let you fine-tune verbosity after creation.
 */

import {
    KaleidoClient,
    getSdkName,
    getVersion,
    LogLevel,
    applyLogLevel,
    setComponentLogLevel,
} from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com';

// ---------------------------------------------------------------------------
// Logging setup  (application's responsibility — the SDK never does this)
// ---------------------------------------------------------------------------
//
// Option A — built-in console logger, all levels:
//   Pass logLevel in the config (see client creation below).
//
// Option B — your own logger (Winston, Pino, etc.):
//   import pino from 'pino';
//   const logger = pino();
//   KaleidoClient.create({ baseUrl: '…', logLevel: LogLevel.DEBUG, logger });
//
// Option C — silence a noisy sub-component after creation:
//   applyLogLevel(LogLevel.DEBUG);
//   setComponentLogLevel('http', LogLevel.WARNING);  // mute HTTP noise
//
// The example below uses Option A so you can see all SDK log output.
// Change LogLevel.DEBUG to LogLevel.WARNING to reduce noise.
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    console.log(`🎨 ${getSdkName()} v${getVersion()}`);
    console.log('-'.repeat(40));

    // Create client — logLevel tells the SDK which records to emit.
    // The SDK defaults to LogLevel.SILENT when logLevel is omitted.
    const client = KaleidoClient.create({
        baseUrl: API_URL,
        logLevel: LogLevel.DEBUG, // Show all HTTP, WebSocket, and swap traces
        // logger: console,       // Explicit — also the built-in default
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
    // Demonstrate per-component level control
    // ---------------------------------------------------------------------------
    console.log('\n🔧 Adjusting log levels at runtime…');

    // Silence HTTP noise — keep maker-level events visible
    setComponentLogLevel('http', LogLevel.WARNING);
    console.log('  HTTP component set to WARNING (HTTP debug logs will be suppressed)');

    // Re-fetch assets — no HTTP debug output this time
    console.log('\n📦 Fetching assets again (HTTP logs now suppressed)…');
    await client.maker.listAssets();

    // Restore full debug output
    setComponentLogLevel('http', null); // null = inherit root level (DEBUG)
    applyLogLevel(LogLevel.INFO); // Drop root level to INFO
    console.log('\n  Root level set to INFO, http override cleared');

    console.log('\n✅ Done!');
}

main().catch(console.error);
