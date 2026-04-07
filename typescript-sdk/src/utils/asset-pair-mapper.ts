/**
 * Utilities for working with trading pairs and assets.
 */

import type { TradingPairResponseModel, TradingPairsResponse } from '../api-types-ext.js';

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

export class AssetPairMapper {
    private assetMap: Map<string, MappedAsset> = new Map();
    private tickerMap: Map<string, string> = new Map(); // ticker -> asset_id
    private pairs: TradingPairResponseModel[];

    constructor(pairsResponse: TradingPairsResponse) {
        this.pairs = pairsResponse.pairs;
        this.buildAssetMap();
    }

    private buildAssetMap(): void {
        this.pairs.forEach((pair) => {
            if (!pair.is_active) return;

            const baseAssetId = pair.base.asset_id;
            const quoteAssetId = pair.quote.asset_id;

            const baseEndpoint = pair.base.endpoints?.[0];
            const quoteEndpoint = pair.quote.endpoints?.[0];

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

        this.tickerMap.set(assetData.ticker.toUpperCase(), assetData.asset_id);

        if (existing) {
            if (!existing.trading_pairs.includes(assetData.trading_partner)) {
                existing.trading_pairs.push(assetData.trading_partner);
            }
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

    findByTicker(ticker: string): MappedAsset | undefined {
        const assetId = this.tickerMap.get(ticker.toUpperCase());
        if (!assetId) return undefined;
        return this.assetMap.get(assetId);
    }

    findById(assetId: string): MappedAsset | undefined {
        return this.assetMap.get(assetId);
    }

    getAllAssets(): MappedAsset[] {
        return Array.from(this.assetMap.values());
    }

    canTrade(fromAssetId: string, toAssetId: string): boolean {
        const fromAsset = this.assetMap.get(fromAssetId);
        return fromAsset ? fromAsset.trading_pairs.includes(toAssetId) : false;
    }

    canTradeByTicker(fromTicker: string, toTicker: string): boolean {
        const fromAsset = this.findByTicker(fromTicker);
        const toAsset = this.findByTicker(toTicker);
        if (!fromAsset || !toAsset) return false;
        return this.canTrade(fromAsset.asset_id, toAsset.asset_id);
    }

    getTradingPartners(assetId: string): MappedAsset[] {
        const asset = this.assetMap.get(assetId);
        if (!asset) return [];

        return asset.trading_pairs
            .map((partnerId) => this.assetMap.get(partnerId))
            .filter((partner): partner is MappedAsset => partner !== undefined);
    }

    getActivePairs(): TradingPairResponseModel[] {
        return this.pairs.filter((pair) => pair.is_active);
    }

    findPairByTickers(
        baseTicker: string,
        quoteTicker: string,
    ): TradingPairResponseModel | undefined {
        const upperBase = baseTicker.toUpperCase();
        const upperQuote = quoteTicker.toUpperCase();

        return this.pairs.find(
            (pair) =>
                pair.base.ticker.toUpperCase() === upperBase &&
                pair.quote.ticker.toUpperCase() === upperQuote,
        );
    }
}

export function createAssetPairMapper(pairsResponse: TradingPairsResponse): AssetPairMapper {
    return new AssetPairMapper(pairsResponse);
}
