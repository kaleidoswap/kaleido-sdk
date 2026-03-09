/**
 * Precision Handling Utilities
 *
 * Handles conversion between display amounts (human-readable) and raw amounts (atomic units).
 * For example: 1.5 BTC (display) <-> 150000000 satoshis (raw, precision=8)
 */

/**
 * Asset with precision and order size info (compatible with AssetPairMapper.MappedAsset)
 */
export interface MappedAsset {
    asset_id: string;
    ticker: string;
    precision: number;
    min_order_size: bigint;
    max_order_size: bigint;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
    rawAmount: bigint;
    minRawAmount: bigint;
    maxRawAmount: bigint;
}

export interface OrderSizeLimits {
    minDisplayAmount: number;
    maxDisplayAmount: number;
    minRawAmount: bigint;
    maxRawAmount: bigint;
    precision: number;
}

/**
 * Precision Handler for converting between display and raw amounts
 */
export class PrecisionHandler {
    private assetPrecisionMap: Map<string, number> = new Map();

    constructor(assets: MappedAsset[]) {
        if (assets.length === 0) {
            throw new Error('Cannot create PrecisionHandler with empty assets array');
        }
        assets.forEach((asset) => {
            this.assetPrecisionMap.set(asset.asset_id, asset.precision);
        });
    }

    /**
     * Convert display amount to raw/atomic units
     * @param displayAmount - Human-readable amount (e.g., 1.5 BTC)
     * @param assetId - Asset ID
     * @returns Raw amount in atomic units (e.g., 150000000 sats)
     */
    toRawAmount(displayAmount: number, assetId: string): bigint {
        const assetPrecision = this.assetPrecisionMap.get(assetId);
        if (assetPrecision === undefined) {
            throw new Error(`Asset ${assetId} not found in precision handler`);
        }

        return BigInt(Math.floor(displayAmount * Math.pow(10, assetPrecision)));
    }

    /**
     * Convert raw/atomic units to display amount
     * @param rawAmount - Amount in atomic units (e.g., 150000000n sats)
     * @param assetId - Asset ID
     * @returns Human-readable amount (e.g., 1.5 BTC)
     */
    toDisplayAmount(rawAmount: bigint, assetId: string): number {
        const assetPrecision = this.assetPrecisionMap.get(assetId);
        if (assetPrecision === undefined) {
            throw new Error(`Asset ${assetId} not found in precision handler`);
        }

        return Number(rawAmount) / Math.pow(10, assetPrecision);
    }

    /**
     * Get the precision for an asset
     * @param assetId - Asset ID
     * @returns Number of decimal places
     */
    getAssetPrecision(assetId: string): number {
        const assetPrecision = this.assetPrecisionMap.get(assetId);
        if (assetPrecision === undefined) {
            throw new Error(`Asset ${assetId} not found in precision handler`);
        }
        return assetPrecision;
    }

    /**
     * Format a display amount with the correct precision
     * @param displayAmount - Amount to format
     * @param assetId - Asset ID
     * @returns Formatted string with correct decimal places
     */
    formatDisplayAmount(displayAmount: number, assetId: string): string {
        const assetPrecision = this.getAssetPrecision(assetId);
        return displayAmount.toFixed(assetPrecision);
    }

    /**
     * Validate that an order size is within the asset's limits
     * @param displayAmount - Amount to validate
     * @param asset - Asset with min/max order sizes
     * @returns Validation result with error message if invalid
     */
    validateOrderSize(displayAmount: number, asset: MappedAsset): ValidationResult {
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


    /**
     * Get the order size limits for an asset
     * @param asset - Asset to get limits for
     * @returns Limits in both display and raw formats
     */
    getOrderSizeLimits(asset: MappedAsset): OrderSizeLimits {
        return {
            minDisplayAmount: this.toDisplayAmount(asset.min_order_size, asset.asset_id),
            maxDisplayAmount: this.toDisplayAmount(asset.max_order_size, asset.asset_id),
            minRawAmount: asset.min_order_size,
            maxRawAmount: asset.max_order_size,
            precision: asset.precision,
        };
    }
}

/**
 * Factory function to create a PrecisionHandler
 * @param assets - Array of assets with precision information
 * @returns New PrecisionHandler instance
 */
export function createPrecisionHandler(assets: MappedAsset[]): PrecisionHandler {
    return new PrecisionHandler(assets);
}

/**
 * Standalone function to convert display amount to raw amount
 * @param displayAmount - Human-readable amount
 * @param precision - Number of decimal places
 * @returns Raw amount in atomic units
 */
export function toRawAmount(displayAmount: number, precision: number): bigint {
    return BigInt(Math.floor(displayAmount * Math.pow(10, precision)));
}

/**
 * Standalone function to convert raw amount to display amount
 * @param rawAmount - Amount in atomic units (bigint)
 * @param precision - Number of decimal places
 * @returns Human-readable amount
 */
export function toDisplayAmount(rawAmount: bigint, precision: number): number {
    return Number(rawAmount) / Math.pow(10, precision);
}
