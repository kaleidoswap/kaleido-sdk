import { Pair, PairResponse, ClientAsset } from '../types';

export interface MappedAsset extends ClientAsset {
  asset_id: string;
  ticker: string;
  precision: number;
  min_order_size: number;
  max_order_size: number;
  trading_pairs: string[]; // Asset IDs this asset can trade with
}

export class AssetPairMapper {
  private assetMap: Map<string, MappedAsset> = new Map();
  private pairs: Pair[];

  constructor(pairsResponse: PairResponse) {
    this.pairs = pairsResponse.pairs;
    this.buildAssetMap();
  }

  private buildAssetMap(): void {
    this.pairs.forEach(pair => {
      if (!pair.is_active) return;

      // Process base asset
      this.processAsset({
        asset_id: pair.base_asset_id,
        ticker: pair.base_asset,
        name: pair.base_asset,
        precision: pair.base_precision,
        is_active: pair.is_active,
        min_order_size: pair.min_base_order_size,
        max_order_size: pair.max_base_order_size,
        trading_partner: pair.quote_asset_id
      });

      // Process quote asset
      this.processAsset({
        asset_id: pair.quote_asset_id,
        ticker: pair.quote_asset,
        name: pair.quote_asset,
        precision: pair.quote_precision,
        is_active: pair.is_active,
        min_order_size: pair.min_quote_order_size,
        max_order_size: pair.max_quote_order_size,
        trading_partner: pair.base_asset_id
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
  }): void {
    const existing = this.assetMap.get(assetData.asset_id);

    if (existing) {
      if (!existing.trading_pairs.includes(assetData.trading_partner)) {
        existing.trading_pairs.push(assetData.trading_partner);
      }
      existing.min_order_size = Math.max(existing.min_order_size, assetData.min_order_size);
      existing.max_order_size = Math.min(existing.max_order_size, assetData.max_order_size);
    } else {

      this.assetMap.set(assetData.asset_id, {
        asset_id: assetData.asset_id,
        ticker: assetData.ticker,
        name: assetData.name,
        precision: assetData.precision,
        is_active: assetData.is_active,
        min_order_size: assetData.min_order_size,
        max_order_size: assetData.max_order_size,
        trading_pairs: [assetData.trading_partner]
      });
    }
  }

  findByTicker(ticker: string): MappedAsset | undefined {
    for (const asset of this.assetMap.values()) {
      if (asset.ticker === ticker) {
        return asset;
      }
    }
    return undefined;
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

  getTradingPartners(assetId: string): MappedAsset[] {
    const asset = this.assetMap.get(assetId);
    if (!asset) return [];

    return asset.trading_pairs
      .map(partnerId => this.assetMap.get(partnerId))
      .filter((partner): partner is MappedAsset => partner !== undefined);
  }

  getActivePairs(): Pair[] {
    return this.pairs.filter(pair => pair.is_active);
  }
}

export function createAssetPairMapper(pairsResponse: PairResponse): AssetPairMapper {
  return new AssetPairMapper(pairsResponse);
}
