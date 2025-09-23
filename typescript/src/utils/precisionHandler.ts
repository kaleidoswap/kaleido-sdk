import { MappedAsset } from './assetPairMapper';

/**
 * Precision handling utility for asset amounts
 */
export class PrecisionHandler {
  private assetPrecisionMap: Map<string, number> = new Map();

  constructor(assets: MappedAsset[]) {
    // Build precision map from assets
    assets.forEach(asset => {
      this.assetPrecisionMap.set(asset.asset_id, asset.precision);
    });
  }

  /**
   * Convert decimal amount to atomic units (raw amount for API)
   * @param amount - Decimal amount (e.g., 0.001 BTC)
   * @param assetId - Asset ID
   * @returns Atomic amount (e.g., 100000 satoshis for 0.001 BTC with precision 8)
   */
  toAtomicAmount(amount: number, assetId: string): number {
    const precision = this.assetPrecisionMap.get(assetId);
    if (precision === undefined) {
      throw new Error(`Precision not found for asset: ${assetId}`);
    }
    
    return Math.floor(amount * Math.pow(10, precision));
  }

  /**
   * Convert atomic units to decimal amount (for display)
   * @param atomicAmount - Atomic amount from API
   * @param assetId - Asset ID
   * @returns Decimal amount for display
   */
  toDecimalAmount(atomicAmount: number, assetId: string): number {
    const precision = this.assetPrecisionMap.get(assetId);
    if (precision === undefined) {
      throw new Error(`Precision not found for asset: ${assetId}`);
    }
    
    return atomicAmount / Math.pow(10, precision);
  }

  /**
   * Get precision for an asset
   */
  getPrecision(assetId: string): number {
    const precision = this.assetPrecisionMap.get(assetId);
    if (precision === undefined) {
      throw new Error(`Precision not found for asset: ${assetId}`);
    }
    return precision;
  }

  /**
   * Format amount for display with proper decimal places
   */
  formatAmount(amount: number, assetId: string): string {
    const precision = this.getPrecision(assetId);
    return amount.toFixed(precision);
  }

  /**
   * Validate if amount meets minimum order size requirements
   */
  validateMinOrderSize(decimalAmount: number, asset: MappedAsset): boolean {
    const atomicAmount = this.toAtomicAmount(decimalAmount, asset.asset_id);
    return atomicAmount >= asset.min_order_size;
  }

  /**
   * Validate if amount meets maximum order size requirements
   */
  validateMaxOrderSize(decimalAmount: number, asset: MappedAsset): boolean {
    const atomicAmount = this.toAtomicAmount(decimalAmount, asset.asset_id);
    return atomicAmount <= asset.max_order_size;
  }

  /**
   * Validate order size (both min and max)
   */
  validateOrderSize(decimalAmount: number, asset: MappedAsset): {
    valid: boolean;
    error?: string;
    atomicAmount: number;
    minOrderSize: number;
    maxOrderSize: number;
  } {
    const atomicAmount = this.toAtomicAmount(decimalAmount, asset.asset_id);
    const minDecimal = this.toDecimalAmount(asset.min_order_size, asset.asset_id);
    const maxDecimal = this.toDecimalAmount(asset.max_order_size, asset.asset_id);

    if (atomicAmount < asset.min_order_size) {
      return {
        valid: false,
        error: `Amount ${decimalAmount} ${asset.ticker} is below minimum order size of ${minDecimal} ${asset.ticker}`,
        atomicAmount,
        minOrderSize: asset.min_order_size,
        maxOrderSize: asset.max_order_size
      };
    }

    if (atomicAmount > asset.max_order_size) {
      return {
        valid: false,
        error: `Amount ${decimalAmount} ${asset.ticker} exceeds maximum order size of ${maxDecimal} ${asset.ticker}`,
        atomicAmount,
        minOrderSize: asset.min_order_size,
        maxOrderSize: asset.max_order_size
      };
    }

    return {
      valid: true,
      atomicAmount,
      minOrderSize: asset.min_order_size,
      maxOrderSize: asset.max_order_size
    };
  }

  /**
   * Get human-readable order size limits for an asset
   */
  getOrderSizeLimits(asset: MappedAsset): {
    minDecimal: number;
    maxDecimal: number;
    minAtomic: number;
    maxAtomic: number;
    precision: number;
  } {
    return {
      minDecimal: this.toDecimalAmount(asset.min_order_size, asset.asset_id),
      maxDecimal: this.toDecimalAmount(asset.max_order_size, asset.asset_id),
      minAtomic: asset.min_order_size,
      maxAtomic: asset.max_order_size,
      precision: asset.precision
    };
  }
}

/**
 * Create a PrecisionHandler instance
 */
export function createPrecisionHandler(assets: MappedAsset[]): PrecisionHandler {
  return new PrecisionHandler(assets);
}
