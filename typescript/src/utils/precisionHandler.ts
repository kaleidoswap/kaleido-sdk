import { MappedAsset } from './assetPairMapper';

export class PrecisionHandler {
  private assetPrecisionMap: Map<string, number> = new Map();

  constructor(assets: MappedAsset[]) {
    if (assets.length === 0) {
      throw new Error('Cannot create PrecisionHandler with empty assets array');
    }
    assets.forEach(asset => {
      this.assetPrecisionMap.set(asset.asset_id, asset.precision);
    });
  }

  toAssetAmount(assetDecimalAmount: number, assetId: string): number {
    const assetPrecision = this.assetPrecisionMap.get(assetId);
    if (assetPrecision === undefined) {
      throw new Error(`Asset ${assetId} not found`);
    }

    return Math.floor(assetDecimalAmount * Math.pow(10, assetPrecision));
  }

  toAssetDecimalAmount(assetAmount: number, assetId: string): number {
    const assetPrecision = this.assetPrecisionMap.get(assetId);
    if (assetPrecision === undefined) {
      throw new Error(`Asset ${assetId} not found`);
    }

    return assetAmount / Math.pow(10, assetPrecision);
  }

  getAssetPrecision(assetId: string): number {
    const assetPrecision = this.assetPrecisionMap.get(assetId);
    if (assetPrecision === undefined) {
      throw new Error(`Asset ${assetId} not found`);
    }
    return assetPrecision;
  }

  formatAssetDecimalAmount(assetDecimalAmount: number, assetId: string): string {
    const assetPrecision = this.getAssetPrecision(assetId);
    return assetDecimalAmount.toFixed(assetPrecision);
  }

  validateOrderSize(assetDecimalAmount: number, asset: MappedAsset): {
    valid: boolean;
    error?: string;
    assetAmount: number;
    assetMinAmount: number;
    assetMaxAmount: number;
  } {
    const assetAmount = this.toAssetAmount(assetDecimalAmount, asset.asset_id);
    const assetMinDecimalAmount = this.toAssetDecimalAmount(asset.min_order_size, asset.asset_id);
    const assetMaxDecimalAmount = this.toAssetDecimalAmount(asset.max_order_size, asset.asset_id);

    if (assetAmount < asset.min_order_size) {
      return {
        valid: false,
        error: `Amount ${assetDecimalAmount} ${asset.ticker} is below minimum order size of ${assetMinDecimalAmount} ${asset.ticker}`,
        assetAmount,
        assetMinAmount: asset.min_order_size,
        assetMaxAmount: asset.max_order_size
      };
    }

    if (assetAmount > asset.max_order_size) {
      return {
        valid: false,
        error: `Amount ${assetDecimalAmount} ${asset.ticker} is above maximum order size of ${assetMaxDecimalAmount} ${asset.ticker}`,
        assetAmount,
        assetMinAmount: asset.min_order_size,
        assetMaxAmount: asset.max_order_size
      };
    }

    return {
      valid: true,
      assetAmount,
      assetMinAmount: asset.min_order_size,
      assetMaxAmount: asset.max_order_size
    };
  }

  getOrderSizeLimits(asset: MappedAsset): {
    assetMinDecimalAmount: number;
    assetMaxDecimalAmount: number;
    assetMinAmount: number;
    assetMaxAmount: number;
    assetPrecision: number;
  } {
    return {
      assetMinDecimalAmount: this.toAssetDecimalAmount(asset.min_order_size, asset.asset_id),
      assetMaxDecimalAmount: this.toAssetDecimalAmount(asset.max_order_size, asset.asset_id),
      assetMinAmount: asset.min_order_size,
      assetMaxAmount: asset.max_order_size,
      assetPrecision: asset.precision
    };
  }
}

export function createPrecisionHandler(assets: MappedAsset[]): PrecisionHandler {
  return new PrecisionHandler(assets);
}
