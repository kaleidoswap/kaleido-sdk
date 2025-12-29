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

  toRawAmount(displayAmount: number, assetId: string): number {
    const assetPrecision = this.assetPrecisionMap.get(assetId);
    if (assetPrecision === undefined) {
      throw new Error(`Asset ${assetId} not found`);
    }

    return Math.floor(displayAmount * Math.pow(10, assetPrecision));
  }

  toDisplayAmount(rawAmount: number, assetId: string): number {
    const assetPrecision = this.assetPrecisionMap.get(assetId);
    if (assetPrecision === undefined) {
      throw new Error(`Asset ${assetId} not found`);
    }

    return rawAmount / Math.pow(10, assetPrecision);
  }

  getAssetPrecision(assetId: string): number {
    const assetPrecision = this.assetPrecisionMap.get(assetId);
    if (assetPrecision === undefined) {
      throw new Error(`Asset ${assetId} not found`);
    }
    return assetPrecision;
  }

  formatDisplayAmount(displayAmount: number, assetId: string): string {
    const assetPrecision = this.getAssetPrecision(assetId);
    return displayAmount.toFixed(assetPrecision);
  }

  validateOrderSize(
    displayAmount: number,
    asset: MappedAsset
  ): {
    valid: boolean;
    error?: string;
    rawAmount: number;
    minRawAmount: number;
    maxRawAmount: number;
  } {
    const rawAmount = this.toRawAmount(displayAmount, asset.asset_id);
    const minDisplayAmount = this.toDisplayAmount(asset.min_order_size, asset.asset_id);
    const maxDisplayAmount = this.toDisplayAmount(asset.max_order_size, asset.asset_id);

    if (rawAmount < asset.min_order_size) {
      return {
        valid: false,
        error: `Amount ${displayAmount} ${asset.ticker} is below minimum order size of ${minDisplayAmount} ${asset.ticker}`,
        rawAmount,
        minRawAmount: asset.min_order_size,
        maxRawAmount: asset.max_order_size,
      };
    }

    if (rawAmount > asset.max_order_size) {
      return {
        valid: false,
        error: `Amount ${displayAmount} ${asset.ticker} is above maximum order size of ${maxDisplayAmount} ${asset.ticker}`,
        rawAmount,
        minRawAmount: asset.min_order_size,
        maxRawAmount: asset.max_order_size,
      };
    }

    return {
      valid: true,
      rawAmount,
      minRawAmount: asset.min_order_size,
      maxRawAmount: asset.max_order_size,
    };
  }

  getOrderSizeLimits(asset: MappedAsset): {
    minDisplayAmount: number;
    maxDisplayAmount: number;
    minRawAmount: number;
    maxRawAmount: number;
    precision: number;
  } {
    return {
      minDisplayAmount: this.toDisplayAmount(asset.min_order_size, asset.asset_id),
      maxDisplayAmount: this.toDisplayAmount(asset.max_order_size, asset.asset_id),
      minRawAmount: asset.min_order_size,
      maxRawAmount: asset.max_order_size,
      precision: asset.precision,
    };
  }
}

export function createPrecisionHandler(assets: MappedAsset[]): PrecisionHandler {
  return new PrecisionHandler(assets);
}
