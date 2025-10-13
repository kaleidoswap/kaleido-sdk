import { MappedAsset } from './assetPairMapper';

export class PrecisionHandler {
  private asset_precision_map: Map<string, number> = new Map();

  constructor(assets: MappedAsset[]) {
    assets.forEach(asset => {
      this.asset_precision_map.set(asset.asset_id, asset.precision);
    });
  }

  toAssetAmount(asset_decimal_amount: number, assetId: string): number {
    const asset_precision = this.asset_precision_map.get(assetId);
    if (asset_precision === undefined) {
      throw new Error(`Precision not found for asset: ${assetId}`);
    }
    
    return Math.floor(asset_decimal_amount * Math.pow(10, asset_precision));
  }

  toAssetDecimalAmount(asset_amount: number, assetId: string): number {
    const asset_precision = this.asset_precision_map.get(assetId);
    if (asset_precision === undefined) {
      throw new Error(`Precision not found for asset: ${assetId}`);
    }
    
    return asset_amount / Math.pow(10, asset_precision);
  }

  getAssetPrecision(assetId: string): number {
    const asset_precision = this.asset_precision_map.get(assetId);
    if (asset_precision === undefined) {
      throw new Error(`Precision not found for asset: ${assetId}`);
    }
    return asset_precision;
  }

  formatAssetDecimalAmount(asset_decimal_amount: number, assetId: string): string {
    const asset_precision = this.getAssetPrecision(assetId);
    return asset_decimal_amount.toFixed(asset_precision);
  }

  validateOrderSize(asset_decimal_amount: number, asset: MappedAsset): {
    valid: boolean;
    error?: string;
    asset_amount: number;
    asset_min_amount: number;
    asset_max_amount: number;
  } {
    const asset_amount = this.toAssetAmount(asset_decimal_amount, asset.asset_id);
    const asset_min_decimal_amount = this.toAssetDecimalAmount(asset.min_order_size, asset.asset_id);
    const asset_max_decimal_amount = this.toAssetDecimalAmount(asset.max_order_size, asset.asset_id);

    if (asset_amount < asset.min_order_size) {
      return {
        valid: false,
        error: `Amount ${asset_decimal_amount} ${asset.ticker} is below minimum order size of ${asset_min_decimal_amount} ${asset.ticker}`,
        asset_amount,
        asset_min_amount: asset.min_order_size,
        asset_max_amount: asset.max_order_size
      };
    }

    if (asset_amount > asset.max_order_size) {
      return {
        valid: false,
        error: `Amount ${asset_decimal_amount} ${asset.ticker} exceeds maximum order size of ${asset_max_decimal_amount} ${asset.ticker}`,
        asset_amount,
        asset_min_amount: asset.min_order_size,
        asset_max_amount: asset.max_order_size
      };
    }

    return {
      valid: true,
      asset_amount,
      asset_min_amount: asset.min_order_size,
      asset_max_amount: asset.max_order_size
    };
  }

  getOrderSizeLimits(asset: MappedAsset): {
    asset_min_decimal_amount: number;
    asset_max_decimal_amount: number;
    asset_min_amount: number;
    asset_max_amount: number;
    asset_precision: number;
  } {
    return {
      asset_min_decimal_amount: this.toAssetDecimalAmount(asset.min_order_size, asset.asset_id),
      asset_max_decimal_amount: this.toAssetDecimalAmount(asset.max_order_size, asset.asset_id),
      asset_min_amount: asset.min_order_size,
      asset_max_amount: asset.max_order_size,
      asset_precision: asset.precision
    };
  }
}

export function createPrecisionHandler(assets: MappedAsset[]): PrecisionHandler {
  return new PrecisionHandler(assets);
}
