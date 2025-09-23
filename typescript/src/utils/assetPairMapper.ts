import { Pair, PairResponse } from '../types';

/**
 * Asset information extracted from trading pairs
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
}

/**
 * Asset pair mapping utility
 * Creates a comprehensive asset list from trading pairs data
 */
export class AssetPairMapper {
  private assetMap: Map<string, MappedAsset> = new Map();
  private pairs: Pair[];

  constructor(pairsResponse: PairResponse) {
    this.pairs = pairsResponse.pairs;
    this.buildAssetMap();
  }

  /**
   * Build asset map from pairs data
   */
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

  /**
   * Process a single asset from pair data
   */
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
      // Add trading partner if not already present
      if (!existing.trading_pairs.includes(assetData.trading_partner)) {
        existing.trading_pairs.push(assetData.trading_partner);
      }
      // Update min/max order sizes (take most restrictive)
      existing.min_order_size = Math.max(existing.min_order_size, assetData.min_order_size);
      existing.max_order_size = Math.min(existing.max_order_size, assetData.max_order_size);
    } else {
      // Create new asset entry
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

  /**
   * Find asset by ticker
   */
  findByTicker(ticker: string): MappedAsset | undefined {
    for (const asset of this.assetMap.values()) {
      if (asset.ticker.toLowerCase() === ticker.toLowerCase()) {
        return asset;
      }
    }
    return undefined;
  }

  /**
   * Find asset by ID
   */
  findById(assetId: string): MappedAsset | undefined {
    return this.assetMap.get(assetId);
  }

  /**
   * Get all assets
   */
  getAllAssets(): MappedAsset[] {
    return Array.from(this.assetMap.values());
  }

  /**
   * Check if two assets can be traded directly
   */
  canTrade(fromAssetId: string, toAssetId: string): boolean {
    const fromAsset = this.assetMap.get(fromAssetId);
    return fromAsset ? fromAsset.trading_pairs.includes(toAssetId) : false;
  }

  /**
   * Get trading partners for an asset
   */
  getTradingPartners(assetId: string): MappedAsset[] {
    const asset = this.assetMap.get(assetId);
    if (!asset) return [];

    return asset.trading_pairs
      .map(partnerId => this.assetMap.get(partnerId))
      .filter((partner): partner is MappedAsset => partner !== undefined);
  }

  /**
   * Get all active trading pairs
   */
  getActivePairs(): Pair[] {
    return this.pairs.filter(pair => pair.is_active);
  }
}

/**
 * Create an AssetPairMapper instance
 */
export function createAssetPairMapper(pairsResponse: PairResponse): AssetPairMapper {
  return new AssetPairMapper(pairsResponse);
}
