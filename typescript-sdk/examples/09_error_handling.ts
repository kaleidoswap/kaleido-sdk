/**
 * Example 09: Error Handling
 *
 * Demonstrates proper error handling patterns with the SDK:
 * 1. API errors (validation, not found, etc.)
 * 2. Network errors and timeouts
 * 3. Quote expiration handling
 * 4. Validation errors
 * 5. Retry strategies
 */

import {
    KaleidoClient,
    createAssetPairMapper,
    Layer,
    KaleidoError,
    APIError,
    ValidationError,
    NetworkError,
    TimeoutError,
    NotFoundError,
    QuoteExpiredError,
} from 'kaleido-sdk';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function main() {
    console.log('🛡️ Error Handling Examples\n');

    const client = await KaleidoClient.create({ baseUrl: API_URL });

    // ========================================================================
    // Example 1: Handling API Errors
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Example 1: API Error Handling\n');

    try {
        // Try to get status for non-existent order
        await client.maker.getSwapOrderStatus({
            order_id: 'non-existent-order-id',
            access_token: 'invalid-access-token',
        });
    } catch (error) {
        if (error instanceof APIError) {
            console.log('  Caught APIError:');
            console.log(`    Message: ${error.message}`);
            console.log(`    Status: ${error.statusCode}`);
            console.log(`    Retryable: ${error.isRetryable()}`);
        } else if (error instanceof KaleidoError) {
            console.log('  Caught KaleidoError:');
            console.log(`    Message: ${error.message}`);
        } else {
            console.log('  Caught unexpected error:', error);
        }
    }

    // ========================================================================
    // Example 2: Handling Validation Errors
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Example 2: Validation Error Handling\n');

    try {
        // Try to get quote with invalid parameters
        await client.maker.getQuote({
            from_asset: {
                asset_id: '',  // Invalid empty asset ID
                layer: Layer.BTC_LN,
                amount: -100,  // Invalid negative amount
            },
            to_asset: {
                asset_id: 'usdt',
                layer: Layer.RGB_LN,
            },
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            console.log('  Caught ValidationError:');
            console.log(`    Message: ${error.message}`);
        } else if (error instanceof APIError) {
            console.log('  Caught APIError (validation failed on server):');
            console.log(`    Message: ${error.message}`);
        } else {
            console.log('  Caught error:', error instanceof Error ? error.message : error);
        }
    }

    // ========================================================================
    // Example 3: Network Error Simulation
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Example 3: Network Error Handling\n');

    // Create client with invalid URL to simulate network error
    const badClient = await KaleidoClient.create({
        baseUrl: 'http://invalid-host-that-does-not-exist.local:9999',
        timeout: 2,  // 2 second timeout
    });

    try {
        await badClient.maker.listAssets();
    } catch (error) {
        if (error instanceof NetworkError) {
            console.log('  Caught NetworkError:');
            console.log(`    Message: ${error.message}`);
        } else if (error instanceof TimeoutError) {
            console.log('  Caught TimeoutError:');
            console.log(`    Message: ${error.message}`);
        } else {
            console.log('  Caught error:', error instanceof Error ? error.message : error);
        }
    }

    // ========================================================================
    // Example 4: Safe API Calls with Error Recovery
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Example 4: Safe API Calls with Recovery\n');

    // Helper function for safe API calls
    async function safeApiCall<T>(
        operation: () => Promise<T>,
        fallback: T,
        operationName: string,
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof APIError && error.isRetryable()) {
                console.log(`  ⚠️ ${operationName} failed (retryable): ${error.message}`);
            } else if (error instanceof NetworkError) {
                console.log(`  ⚠️ ${operationName} network error: ${error.message}`);
            } else {
                console.log(`  ⚠️ ${operationName} failed: ${error instanceof Error ? error.message : error}`);
            }
            return fallback;
        }
    }

    const assets = await safeApiCall(
        () => client.maker.listAssets(),
        { assets: [], network: 'unknown', total: 0, limit: 0, offset: 0 },
        'listAssets',
    );
    console.log(`  Retrieved ${assets.assets.length} assets safely`);

    // ========================================================================
    // Example 5: Quote Workflow with Error Handling
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Example 5: Complete Quote Workflow with Error Handling\n');

    try {
        // Step 1: Get pairs
        const pairsResponse = await client.maker.listPairs();
        const mapper = createAssetPairMapper(pairsResponse);

        // Step 2: Find assets
        const btc = mapper.findByTicker('BTC');
        const usdt = mapper.findByTicker('USDT');

        if (!btc || !usdt) {
            throw new NotFoundError('Required assets not found');
        }

        // Step 3: Check if tradable
        if (!mapper.canTrade(btc.asset_id, usdt.asset_id)) {
            throw new ValidationError('BTC/USDT pair not tradable');
        }

        // Step 4: Get pair and route
        const pair = mapper.findPairByTickers('BTC', 'USDT');
        if (!pair?.routes?.length) {
            throw new NotFoundError('No routes available for BTC/USDT');
        }

        const route = pair.routes[0];
        console.log(`  ✓ Found route: ${route.from_layer} → ${route.to_layer}`);

        // Step 5: Get quote
        const quote = await client.maker.getQuote({
            from_asset: {
                asset_id: btc.asset_id,
                layer: route.from_layer as Layer,
                amount: 10000000,
            },
            to_asset: {
                asset_id: usdt.asset_id,
                layer: route.to_layer as Layer,
            },
        });

        console.log(`  ✓ Got quote: ${quote.from_asset.amount} ${quote.from_asset.ticker} → ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
        console.log(`  ✓ Quote expires: ${new Date(quote.expires_at).toLocaleString()}`);

        // Check if quote is still valid
        const now = Date.now();
        const expiresAt = quote.expires_at * 1000; // Convert to ms if needed
        if (now > expiresAt) {
            throw new QuoteExpiredError();
        }

        console.log('  ✓ Quote is still valid');
    } catch (error) {
        if (error instanceof QuoteExpiredError) {
            console.log('  ⚠️ Quote expired - would need to request new quote');
        } else if (error instanceof NotFoundError) {
            console.log(`  ⚠️ Not found: ${error.message}`);
        } else if (error instanceof ValidationError) {
            console.log(`  ⚠️ Validation error: ${error.message}`);
        } else if (error instanceof APIError) {
            console.log(`  ⚠️ API error: ${error.message}`);
        } else {
            console.log(`  ⚠️ Error: ${error instanceof Error ? error.message : error}`);
        }
    }

    // ========================================================================
    // Example 6: Error Type Checking Pattern
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Example 6: Error Type Checking Pattern\n');

    function handleError(error: unknown): string {
        if (error instanceof QuoteExpiredError) {
            return 'QUOTE_EXPIRED: Please request a new quote';
        }
        if (error instanceof ValidationError) {
            return `VALIDATION: ${error.message}`;
        }
        if (error instanceof NotFoundError) {
            return `NOT_FOUND: ${error.message}`;
        }
        if (error instanceof NetworkError) {
            return 'NETWORK: Check your connection and try again';
        }
        if (error instanceof TimeoutError) {
            return 'TIMEOUT: Request timed out, please retry';
        }
        if (error instanceof APIError) {
            if (error.isRetryable()) {
                return `API_RETRYABLE: ${error.message} (will retry)`;
            }
            return `API_ERROR: ${error.message}`;
        }
        if (error instanceof KaleidoError) {
            return `SDK_ERROR: ${error.message}`;
        }
        if (error instanceof Error) {
            return `UNKNOWN: ${error.message}`;
        }
        return 'UNKNOWN: An unexpected error occurred';
    }

    // Test the handler
    console.log('  Testing error handler:');
    console.log(`    ${handleError(new QuoteExpiredError())}`);
    console.log(`    ${handleError(new ValidationError('Invalid amount'))}`);
    console.log(`    ${handleError(new NetworkError('Connection refused'))}`);
    console.log(`    ${handleError(new Error('Generic error'))}`);

    console.log('\n✅ Error handling examples completed!');
}

main().catch(console.error);
