/**
 * Example: Auto-generated client usage (openapi-fetch)
 *
 * Demonstrates calling the Maker API directly using the generated OpenAPI types.
 */
import createClient from 'openapi-fetch';
import { Layer } from 'kaleidoswap-sdk';
import type { paths } from 'kaleidoswap-sdk/generated/api-types';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';

async function listAssets(client: ReturnType<typeof createClient<paths>>) {
    console.log('📋 Listing all assets...');
    const { data, error } = await client.GET('/api/v1/market/assets');

    if (error) {
        console.error('❌ Failed to list assets:', error);
        return;
    }

    const assets = data?.assets ?? [];
    console.log(`✅ Found ${assets.length} assets`);
    for (const asset of assets.slice(0, 5)) {
        console.log(`  • ${asset.ticker} - ${asset.name}`);
    }

    if (assets.length > 5) {
        console.log(`  ... and ${assets.length - 5} more`);
    }
}

async function getQuote(client: ReturnType<typeof createClient<paths>>) {
    console.log('\n💱 Getting a swap quote...');

    const { data, error } = await client.POST('/api/v1/market/quote', {
        body: {
            from_asset: {
                asset_id: 'BTC',
                layer: Layer.BTC_LN,
                amount: 100000, // 0.001 BTC in sats
            },
            to_asset: {
                asset_id: 'USDT',
                layer: Layer.RGB_LN,
            },
        },
    });

    if (error) {
        console.error('❌ Failed to get quote:', error);
        return;
    }

    if (!data) {
        console.error('❌ No quote data returned');
        return;
    }

    console.log('✅ Quote received:');
    console.log(`  RFQ ID: ${data.rfq_id}`);
    console.log(`  From: ${data.from_asset.amount} ${data.from_asset.ticker}`);
    console.log(`  To: ${data.to_asset.amount} ${data.to_asset.ticker}`);
    console.log(`  Price: ${data.price}`);
    console.log(`  Expires: ${new Date(data.expires_at).toLocaleString()}`);
}

async function main() {
    console.log('Kaleidoswap SDK - Generated Client Example');
    console.log('='.repeat(60));

    const client = createClient<paths>({
        baseUrl: API_URL,
    });

    await listAssets(client);
    await getQuote(client);

    console.log('\n✅ Done!');
}

main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exitCode = 1;
});
