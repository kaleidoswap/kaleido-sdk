/**
 * Asset Pair Mapper Utility
 *
 * Provides convenient methods for working with trading pairs and assets.
 * Maps asset data from API responses for easy lookup and validation.
 */

import type { TradingPair } from '../api-types-ext.js';
import type { ListPairsResponse } from '../api-types-ext.js';

/**
 * Extended asset with trading information
 */
export interface MappedAsset {
    asset_id: string;
    ticker: string;
    name: string;
    precision: number;
    is_active: boolean;
    min_order_size: number;
    max_order_size: number;
    trading_pairs: string[]; // Asset IDs this asset can trade with
    protocol_ids: { [key: string]: string };
}

/**
 * Get primary asset ID from a TradableAsset
 * Prefers RGB, then BTC, then first available
 */
function getAssetId(ticker: string, protocolIds?: { [key: string]: string }): string {
    if (!protocolIds || Object.keys(protocolIds).length === 0) {
        // For native assets like BTC, use ticker as ID
        return ticker;
    }

    // Prefer RGB contract ID, then TAPASS, then BTC, then first available
    return (
        protocolIds['RGB'] ||
        protocolIds['TAPASS'] ||
        protocolIds['BTC'] ||
        Object.values(protocolIds)[0] ||
        ticker
    );
}

/**
 * Asset Pair Mapper
 *
 * Provides convenient methods for working with trading pairs:
 * - Find assets by ticker or ID
 * - Check if two assets can be traded
 * - Get trading partners for an asset
 *
 * @example
 * ```typescript
 * const pairs = await client.maker.listPairs();
 * const mapper = createAssetPairMapper(pairs);
 *
 * const btc = mapper.findByTicker('BTC');
 * const usdt = mapper.findByTicker('USDT');
 *
 * if (mapper.canTrade(btc.asset_id, usdt.asset_id)) {
 *   console.log('Can trade BTC for USDT');
 * }
 * ```
 */
export class AssetPairMapper {
    private assetMap: Map<string, MappedAsset> = new Map();
    private tickerMap: Map<string, string> = new Map(); // ticker -> asset_id
    private pairs: TradingPair[];

    constructor(pairsResponse: ListPairsResponse) {
        this.pairs = pairsResponse.pairs;
        this.buildAssetMap();
    }

    private buildAssetMap(): void {
        this.pairs.forEach((pair) => {
            if (!pair.is_active) return;

            const baseAssetId = getAssetId(pair.base.ticker, pair.base.protocol_ids);
            const quoteAssetId = getAssetId(pair.quote.ticker, pair.quote.protocol_ids);

            // Get trading limits from endpoints
            const baseEndpoint = pair.base.endpoints?.[0];
            const quoteEndpoint = pair.quote.endpoints?.[0];

            // Process base asset
            this.processAsset({
                asset_id: baseAssetId,
                ticker: pair.base.ticker,
                name: pair.base.name,
                precision: pair.base.precision,
                is_active: pair.is_active,
                min_order_size: baseEndpoint?.min_amount ?? 0,
                max_order_size: baseEndpoint?.max_amount ?? Number.MAX_SAFE_INTEGER,
                trading_partner: quoteAssetId,
                protocol_ids: pair.base.protocol_ids || {},
            });

            // Process quote asset
            this.processAsset({
                asset_id: quoteAssetId,
                ticker: pair.quote.ticker,
                name: pair.quote.name,
                precision: pair.quote.precision,
                is_active: pair.is_active,
                min_order_size: quoteEndpoint?.min_amount ?? 0,
                max_order_size: quoteEndpoint?.max_amount ?? Number.MAX_SAFE_INTEGER,
                trading_partner: baseAssetId,
                protocol_ids: pair.quote.protocol_ids || {},
            });
        });
    }

    private processAsset(assetData: {
        asset_id: string;
        ticker: string;
        name: string;
        precision: number;
        is_active: boolean;
        min_order_size: number;
        max_order_size: number;
        trading_partner: string;
        protocol_ids: { [key: string]: string };
    }): void {
        const existing = this.assetMap.get(assetData.asset_id);

        // Map ticker to asset_id
        this.tickerMap.set(assetData.ticker.toUpperCase(), assetData.asset_id);

        if (existing) {
            // Asset already exists, update trading pairs
            if (!existing.trading_pairs.includes(assetData.trading_partner)) {
                existing.trading_pairs.push(assetData.trading_partner);
            }
            // Use most restrictive order sizes
            if (assetData.min_order_size > 0) {
                existing.min_order_size =
                    existing.min_order_size > assetData.min_order_size
                        ? existing.min_order_size
                        : assetData.min_order_size;
            }
            if (assetData.max_order_size < Number.MAX_SAFE_INTEGER) {
                existing.max_order_size =
                    existing.max_order_size < assetData.max_order_size
                        ? existing.max_order_size
                        : assetData.max_order_size;
            }
        } else {
            // Create new mapped asset
            this.assetMap.set(assetData.asset_id, {
                asset_id: assetData.asset_id,
                ticker: assetData.ticker,
                name: assetData.name,
                precision: assetData.precision,
                is_active: assetData.is_active,
                min_order_size: assetData.min_order_size,
                max_order_size: assetData.max_order_size,
                trading_pairs: [assetData.trading_partner],
                protocol_ids: assetData.protocol_ids,
            });
        }
    }

    /**
     * Find an asset by its ticker symbol
     * @param ticker - Asset ticker (e.g., 'BTC', 'USDT')
     * @returns MappedAsset or undefined if not found
     */
    findByTicker(ticker: string): MappedAsset | undefined {
        const assetId = this.tickerMap.get(ticker.toUpperCase());
        if (!assetId) return undefined;
        return this.assetMap.get(assetId);
    }

    /**
     * Find an asset by its ID
     * @param assetId - Full asset ID
     * @returns MappedAsset or undefined if not found
     */
    findById(assetId: string): MappedAsset | undefined {
        return this.assetMap.get(assetId);
    }

    /**
     * Get all mapped assets
     * @returns Array of all MappedAssets
     */
    getAllAssets(): MappedAsset[] {
        return Array.from(this.assetMap.values());
    }

    /**
     * Check if two assets can be traded
     * @param fromAssetId - Source asset ID
     * @param toAssetId - Target asset ID
     * @returns true if the pair can be traded
     */
    canTrade(fromAssetId: string, toAssetId: string): boolean {
        const fromAsset = this.assetMap.get(fromAssetId);
        return fromAsset ? fromAsset.trading_pairs.includes(toAssetId) : false;
    }

    /**
     * Check if two assets can be traded (by ticker)
     * @param fromTicker - Source asset ticker
     * @param toTicker - Target asset ticker
     * @returns true if the pair can be traded
     */
    canTradeByTicker(fromTicker: string, toTicker: string): boolean {
        const fromAsset = this.findByTicker(fromTicker);
        const toAsset = this.findByTicker(toTicker);
        if (!fromAsset || !toAsset) return false;
        return this.canTrade(fromAsset.asset_id, toAsset.asset_id);
    }

    /**
     * Get all trading partners for an asset
     * @param assetId - Asset ID
     * @returns Array of MappedAssets that can be traded with this asset
     */
    getTradingPartners(assetId: string): MappedAsset[] {
        const asset = this.assetMap.get(assetId);
        if (!asset) return [];

        return asset.trading_pairs
            .map((partnerId) => this.assetMap.get(partnerId))
            .filter((partner): partner is MappedAsset => partner !== undefined);
    }

    /**
     * Get all active trading pairs
     * @returns Array of active TradingPairs
     */
    getActivePairs(): TradingPair[] {
        return this.pairs.filter((pair) => pair.is_active);
    }

    /**
     * Find a trading pair by base and quote tickers
     * @param baseTicker - Base asset ticker
     * @param quoteTicker - Quote asset ticker
     * @returns TradingPair or undefined if not found
     */
    findPairByTickers(baseTicker: string, quoteTicker: string): TradingPair | undefined {
        const upperBase = baseTicker.toUpperCase();
        const upperQuote = quoteTicker.toUpperCase();

        return this.pairs.find(
            (pair) =>
                pair.base.ticker.toUpperCase() === upperBase &&
                pair.quote.ticker.toUpperCase() === upperQuote,
        );
    }
}

/**
 * Factory function to create an AssetPairMapper
 * @param pairsResponse - Response from listPairs() API call
 * @returns New AssetPairMapper instance
 */
export function createAssetPairMapper(pairsResponse: ListPairsResponse): AssetPairMapper {
    return new AssetPairMapper(pairsResponse);
}
