import { KaleidoClient, Layer, ReceiverAddressFormat } from '../src';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.KALEIDO_API_URL || 'http://localhost:8000';
const NODE_URL = process.env.KALEIDO_NODE_URL || 'http://localhost:3001';

describe('BTC LN to RGB Onchain Swap (Integration)', () => {
    let client: KaleidoClient;

    beforeAll(() => {
        client = new KaleidoClient({
            baseUrl: API_URL,
            nodeUrl: NODE_URL,
        });
    });

    it('should create a BTC LN to RGB Onchain swap order', async () => {
        if (!client.hasNode()) {
            console.warn('Node not configured, skipping test');
            return;
        }

        // SDK now returns typed objects by default
        const pairs = await client.listPairs() as any[];

        if (pairs.length > 0) {
            console.log('Sample Pair:', JSON.stringify(pairs[0]));
        }

        let targetPair: any = null;
        let rgbAssetTicker = '';

        for (const pair of pairs) {
            const base = pair.baseAsset || pair.base?.ticker;
            const q = pair.quoteAsset || pair.quote?.ticker;

            if (base === 'BTC' && q !== 'BTC') {
                targetPair = pair;
                rgbAssetTicker = q;
                break;
            } else if (q === 'BTC' && base !== 'BTC') {
                targetPair = pair;
                rgbAssetTicker = base;
                break;
            }
        }

        if (!targetPair) {
            console.warn('No BTC/RGB pair found, skipping');
            return;
        }

        const baseTicker = targetPair.baseAsset || targetPair.base?.ticker;
        const quoteTicker = targetPair.quoteAsset || targetPair.quote?.ticker;
        const isBaseBtc = baseTicker === 'BTC';
        const pairTicker = `${baseTicker}/${quoteTicker}`;
        console.log(`Using pair: ${pairTicker} to acquire ${rgbAssetTicker}`);

        // Use endpoints from the pair object directly to avoid potential lookup issues with getAssetByTicker
        const btcAsset = isBaseBtc ? targetPair.base : targetPair.quote;
        const rgbAsset = isBaseBtc ? targetPair.quote : targetPair.base;

        // Extract min_amount from BTC_LN endpoint (we're spending BTC)
        const btcEndpoint = btcAsset.endpoints?.find((e: any) => e.layer === 'BTC_LN');
        const btcMinAmount = btcEndpoint?.min_amount || btcEndpoint?.minAmount || 500000;

        // Request 2x the BTC minimum to have buffer (using from_amount approach like atomic_swap.py)
        let fromAmount = Math.ceil(btcMinAmount * 2);

        console.log(`BTC Endpoint (BTC_LN): min=${btcMinAmount}`);
        console.log(`Requesting quote with from_amount=${fromAmount} BTC to acquire ${rgbAssetTicker}`);

        // Use from_amount (how much BTC to spend), not to_amount
        const quoteResponse = await client.getQuoteByAssets('BTC', rgbAssetTicker, fromAmount, null, 'BTC_LN', 'RGB_L1') as any;

        // SDK now returns typed objects by default
        const addressResponse = await client.node!.getOnchainAddress() as any;
        const receiverAddr = addressResponse.address;

        const fromAsset = { ...quoteResponse.from_asset, layer: 'BTC_LN' as Layer };
        const toAsset = { ...quoteResponse.to_asset, layer: 'RGB_L1' as Layer };

        const request = {
            rfq_id: quoteResponse.rfq_id,
            from_asset: fromAsset,
            to_asset: toAsset,
            receiver_address: {
                address: receiverAddr,
                format: 'BTC_ADDRESS' as ReceiverAddressFormat
            }
        };

        const orderResponseStr = await client.createSwapOrder(request);
        const orderResponse = JSON.parse(orderResponseStr);

        expect(orderResponse.id).toBeDefined();
        expect(['CREATED', 'OPEN']).toContain(orderResponse.status);
        console.log('Swap Order Created:', orderResponse.id);
    });
});
