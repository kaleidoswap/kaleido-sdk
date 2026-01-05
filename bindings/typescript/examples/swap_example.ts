import { KaleidoClient, KaleidoConfig } from "../pkg-node/kaleidoswap_sdk.js";

const KALEIDO_API_URL = process.env.KALEIDO_API_URL || "http://localhost:8000";
const KALEIDO_NODE_URL = process.env.KALEIDO_NODE_URL || "http://localhost:3001";

/**
 * Format amount with correct units based on layer
 */
function formatAmount(amount: any, ticker: string, layer: string): string {
    const amtNum = typeof amount === 'bigint' ? Number(amount) : amount;

    if (layer === "BTC_LN" || layer === "RGB_LN") {
        // Lightning uses millisatoshi (msat)
        return `${amtNum.toLocaleString()} msat`;
    } else {
        // On-chain uses satoshi (sat) for BTC and smallest units for RGB
        const unit = ticker.includes("BTC") ? "sat" : ticker;
        return `${amtNum.toLocaleString()} ${unit}`;
    }
}

/**
 * Extract the best identifier for an asset (protocol ID or ticker)
 */
function getAssetId(asset: any): string {
    if (!asset.protocol_ids) return asset.ticker;

    const entries = asset.protocol_ids instanceof Map
        ? Array.from(asset.protocol_ids.entries())
        : Object.entries(asset.protocol_ids);

    for (const [key, value] of entries) {
        const k = String(key);
        if (k.toLowerCase().includes("rgb")) return value as string;
        if (k.includes("BTC") && asset.ticker.includes("BTC")) return value as string;
    }

    return entries.length > 0 ? entries[0][1] as string : asset.ticker;
}

/**
 * Workaround: Extract pubkey from error message when node info fails
 */
function recoverPubkeyFromError(error: any): string | null {
    const msg = String(error);
    const match = msg.match(/Payload \((.*?)\):/);

    if (!match) return null;

    try {
        const raw = match[1];
        const jsonMatch = raw.match(/({.*})/);

        if (jsonMatch) {
            const unescaped = jsonMatch[1]
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
            const data = JSON.parse(unescaped);
            return data.pubkey;
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Find BTC/USDT pair or return first available
 */
function findBtcUsdtPair(pairs: any[]): any | null {
    for (const pair of pairs) {
        const fromTicker = pair.base?.ticker || "";
        const toTicker = pair.quote?.ticker || "";

        if ((fromTicker.includes("BTC") && toTicker.includes("USDT")) ||
            (fromTicker.includes("USDT") && toTicker.includes("BTC"))) {
            return pair;
        }
    }

    return pairs.length > 0 ? pairs[0] : null;
}

async function main() {
    console.log("=".repeat(60));
    console.log("Kaleidoswap SDK - TypeScript Swap Example");
    console.log(`API: ${KALEIDO_API_URL} | Node: ${KALEIDO_NODE_URL}`);
    console.log("=".repeat(60));

    const config = KaleidoConfig.withDefaults(KALEIDO_API_URL);
    if (KALEIDO_NODE_URL) {
        config.setNodeUrl(KALEIDO_NODE_URL);
    }

    const client = new KaleidoClient(config);

    if (!client.hasNode()) {
        console.log("\n⚠️  Node not configured - cannot execute swaps");
        return;
    }

    // Step 1: List Assets
    console.log("\n📦 Listing Assets...");
    let assets: any[];
    try {
        assets = await client.listAssets();
        console.log(`   Found ${assets.length} assets`);

        for (const asset of assets.slice(0, 3)) {
            const id = getAssetId(asset);
            console.log(`   - ${asset.ticker}: ${asset.name} (${String(id).substring(0, 10)}...)`);
        }
    } catch (e) {
        console.error("   ❌ Failed:", e);
        return;
    }

    // Step 2: Find Trading Pair
    console.log("\n💱 Finding BTC/USDT pair...");
    let targetPair: any;
    try {
        const pairs = await client.listPairs();
        targetPair = findBtcUsdtPair(pairs);

        if (!targetPair) {
            console.error("   ❌ No pairs found");
            return;
        }

        const fromTicker = targetPair.base.ticker;
        const toTicker = targetPair.quote.ticker;
        console.log(`   Using pair: ${fromTicker}/${toTicker}`);

        // Display pair limits if available
        if (targetPair.endpoints) {
            for (const endpoint of targetPair.endpoints) {
                if (endpoint.layer === "BTC_LN" || endpoint.layer === "RGB_L1") {
                    const minAmt = formatAmount(endpoint.min_amount, fromTicker, endpoint.layer);
                    const maxAmt = formatAmount(endpoint.max_amount, fromTicker, endpoint.layer);
                    console.log(`   Limits (${endpoint.layer}): ${minAmt} - ${maxAmt}`);
                }
            }
        }
    } catch (e) {
        console.error("   ❌ Failed:", e);
        return;
    }

    // Step 3: Get Quote
    console.log("\n💰 Getting quote for BTC/LN → RGB/L1...");

    const assetA = targetPair.base;
    const assetB = targetPair.quote;

    const [sourceAsset, targetAsset] = assetA.ticker.includes("BTC")
        ? [assetA, assetB]
        : [assetB, assetA];

    const fromId = getAssetId(sourceAsset);
    const toId = getAssetId(targetAsset);
    const fromAmount = 10000000; // Minimum required

    console.log(`   Using: ${fromId} → ${toId}`);

    let quote: any;
    try {
        quote = await client.getQuoteByPair(
            `${fromId}/${toId}`,
            BigInt(fromAmount),
            undefined,
            "BTC_LN",
            "RGB_L1"
        );

        console.log("   ✅ Quote received:");
        console.log(`      ${quote.from_asset.amount} ${quote.from_asset.ticker} → ` +
            `${quote.to_asset.amount} ${quote.to_asset.ticker}`);
        console.log(`      Fee: ${quote.fee.final_fee} | RFQ: ${quote.rfq_id}`);
    } catch (e) {
        console.error("   ❌ Failed:", e);
        return;
    }

    // Step 4: Get Taker Pubkey
    console.log("\n🔑 Getting taker pubkey...");
    let takerPubkey = "";
    try {
        // Use getRgbNodeInfo to get the taker's local node pubkey
        const nodeInfo = await client.getRgbNodeInfo();

        // The response might be a plain object or need parsing
        const info = typeof nodeInfo === 'string' ? JSON.parse(nodeInfo) : nodeInfo;
        takerPubkey = info.pubkey || "";

        if (takerPubkey) {
            console.log(`   ✅ Pubkey: ${takerPubkey.substring(0, 20)}...`);
        } else {
            console.log("   ⚠️  No pubkey in node info response");
        }
    } catch (e) {
        console.log("   ⚠️  RGB Node info failed, trying getTakerPubkey...");
        try {
            takerPubkey = await client.getTakerPubkey() || "";
            if (takerPubkey) {
                console.log(`   ✅ Pubkey: ${takerPubkey.substring(0, 20)}...`);
            }
        } catch (e2) {
            // Fallback: try to recover from error message
            takerPubkey = recoverPubkeyFromError(e) || "";
            if (takerPubkey) {
                console.log(`   ✅ Recovered: ${takerPubkey.substring(0, 20)}...`);
            } else {
                console.error("   ❌ Recovery failed:", e);
                return;
            }
        }
    }

    // Validate pubkey was obtained
    if (!takerPubkey) {
        console.error("   ❌ Failed to obtain taker pubkey");
        return;
    }

    // Step 5: Execute Swap
    console.log("\n⚡ Executing swap...");
    try {
        const swapRequest = {
            rfq_id: quote.rfq_id,
            from_asset: quote.from_asset.asset_id,
            from_amount: quote.from_asset.amount,
            to_asset: quote.to_asset.asset_id,
            to_amount: quote.to_asset.amount
        };

        const initResponse = await client.initSwap(swapRequest);
        console.log(`   Initialized: ${initResponse.swapstring.substring(0, 40)}...`);

        await client.whitelistTrade(initResponse.swapstring);

        const confirmRequest = {
            swapstring: initResponse.swapstring,
            taker_pubkey: takerPubkey,
            payment_hash: initResponse.payment_hash
        };

        const confirmResult = await client.executeSwap(confirmRequest);
        console.log("   ✅ Swap completed!");
        console.log(`      Payment Hash: ${initResponse.payment_hash}`);

        // Poll for completion
        for (let i = 0; i < 20; i++) {
            const status = await client.getSwapStatus(initResponse.payment_hash);
            if (status.swap?.status &&
                status.swap.status !== "Pending" &&
                status.swap.status !== "Created") {
                console.log(`      Status: ${status.swap.status}`);
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log("\n🎉 Example finished successfully!");
    } catch (e) {
        console.error("   ❌ Swap failed:", e);
    }
}

main().catch(console.error);
