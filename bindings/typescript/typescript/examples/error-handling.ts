/**
 * Error Handling Best Practices
 *
 * This example demonstrates:
 * 1. Proper exception handling with typed errors
 * 2. Retry strategies
 * 3. Graceful degradation
 * 4. Working with the error hierarchy
 */

import {
    KaleidoClient,
    KaleidoError,
    APIError,
    NetworkError,
    ValidationError,
    NotFoundError,
    ConfigError,
    type KaleidoConfig,
} from '../src/index.js';

const API_URL = process.env.KALEIDO_API_URL || 'https://api.regtest.kaleidoswap.com';

// ============================================================================
// Example 1: Basic Error Handling with Typed Exceptions
// ============================================================================

async function exampleTypedErrorHandling() {
    console.log('\n🔐 Example 1: Typed Error Handling');
    console.log('-'.repeat(50));

    const client = await KaleidoClient.create({ baseUrl: API_URL });

    try {
        // Try to get a non-existent asset
        const asset = await client.getAssetByTicker('NONEXISTENT_ASSET');
        console.log(`  Found asset: ${asset.name}`);
    } catch (e) {
        if (e instanceof NotFoundError) {
            console.log(`  ℹ️  Asset not found: ${e.message}`);
        } else if (e instanceof APIError) {
            console.log(`  ⚠️  API error (${e.statusCode}): ${e.message}`);
        } else if (e instanceof NetworkError) {
            console.log(`  🔌 Network error: ${e.message}`);
        } else if (e instanceof KaleidoError) {
            console.log(`  ❌ Kaleido error: ${e.message}`);
        } else {
            console.log(`  ❌ Unexpected error: ${e}`);
        }
    }
}

// ============================================================================
// Example 2: Error Hierarchy Navigation
// ============================================================================

async function exampleErrorHierarchy() {
    console.log('\n📋 Example 2: Error Hierarchy');
    console.log('-'.repeat(50));

    const client = await KaleidoClient.create({ baseUrl: 'https://invalid-url-that-does-not-exist.com' });

    try {
        await client.listAssets();
    } catch (e) {
        // All SDK errors extend KaleidoError
        if (e instanceof KaleidoError) {
            console.log(`  Error type: ${e.constructor.name}`);
            console.log(`  Message: ${e.message}`);

            // Check specific error types
            if (e instanceof NetworkError) {
                console.log(`  ↳ This is a network-related error`);
            }
        }
    }
}

// ============================================================================
// Example 3: Retry Strategy with Exponential Backoff
// ============================================================================

async function exampleRetryStrategy() {
    console.log('\n🔄 Example 3: Retry Strategy');
    console.log('-'.repeat(50));

    const maxRetries = 3;
    let retryDelay = 1000;

    const client = await KaleidoClient.create({ baseUrl: API_URL });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`  Attempt ${attempt}/${maxRetries}...`);
            const assets = await client.listAssets();
            console.log(`  ✅ Success! Found ${assets.length} assets`);
            return;
        } catch (e) {
            // Only retry on network errors
            if (e instanceof NetworkError && attempt < maxRetries) {
                console.log(`  ⚠️  Network error, retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2; // Exponential backoff
            } else if (e instanceof APIError && e.statusCode === 429) {
                // Rate limited - wait longer
                console.log(`  ⏳ Rate limited, waiting 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                // Non-retryable error
                console.log(`  ❌ Non-retryable error: ${e}`);
                return;
            }
        }
    }

    console.log(`  ❌ Failed after ${maxRetries} attempts`);
}

// ============================================================================
// Example 4: Graceful Degradation
// ============================================================================

async function exampleGracefulDegradation() {
    console.log('\n🛡️  Example 4: Graceful Degradation');
    console.log('-'.repeat(50));

    // Client without RGB node
    const clientNoNode = await KaleidoClient.create({ baseUrl: API_URL });

    if (clientNoNode.hasNode()) {
        console.log('  ✓ RGB node is configured');
    } else {
        console.log('  ℹ️  No RGB node configured - operating in API-only mode');
        console.log('    Available: Market data, quotes');
        console.log('    Not available: Direct node operations');
    }

    // Client with RGB node
    const clientWithNode = await KaleidoClient.create({
        baseUrl: API_URL,
        nodeUrl: 'http://localhost:3001',
    });

    if (clientWithNode.hasNode()) {
        console.log('  ✓ RGB node is configured (with nodeUrl)');
    }
}

// ============================================================================
// Example 5: Validation Error Details
// ============================================================================

async function exampleValidationErrors() {
    console.log('\n✅ Example 5: Validation Errors');
    console.log('-'.repeat(50));

    const client = await KaleidoClient.create({ baseUrl: API_URL });

    try {
        // Try to get quote with invalid parameters
        await client.getQuote(
            'INVALID/PAIR',
            null,
            null,  // Both null - should fail validation
            'BTC_LN',
            'RGB_LN'
        );
    } catch (e) {
        if (e instanceof ValidationError) {
            console.log(`  Validation failed: ${e.message}`);
        } else {
            console.log(`  Error: ${e}`);
        }
    }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    console.log('='.repeat(60));
    console.log('Kaleidoswap SDK - Error Handling Examples');
    console.log('='.repeat(60));

    try {
        await exampleTypedErrorHandling();
        await exampleErrorHierarchy();
        await exampleRetryStrategy();
        await exampleGracefulDegradation();
        await exampleValidationErrors();

        console.log('\n' + '='.repeat(60));
        console.log('✅ All error handling examples completed!');
        console.log('='.repeat(60));
    } catch (e) {
        console.error('❌ Unexpected error in main:', e);
    }
}

main();
