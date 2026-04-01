import { ValidationError } from '../errors.js';

export interface MappedAsset {
    asset_id: string;
    ticker: string;
    precision: number;
    min_order_size: number;
    max_order_size: number;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
    rawAmount: number;
    minRawAmount: number;
    maxRawAmount: number;
}

export interface OrderSizeLimits {
    minDisplayAmount: number;
    maxDisplayAmount: number;
    minRawAmount: number;
    maxRawAmount: number;
    precision: number;
}

function expandExponentialNumber(value: number): string {
    const str = value.toString();
    if (!/[eE]/.test(str)) {
        return str;
    }

    const match = str.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
    if (!match) {
        throw new ValidationError(`Invalid amount: ${str}`);
    }

    const [, sign, integerPart, fractionalPart = '', exponentText] = match;
    const exponent = Number.parseInt(exponentText, 10);
    const digits = integerPart + fractionalPart;
    const decimalIndex = integerPart.length + exponent;

    if (decimalIndex <= 0) {
        return `${sign}0.${'0'.repeat(Math.abs(decimalIndex))}${digits}`;
    }

    if (decimalIndex >= digits.length) {
        return `${sign}${digits}${'0'.repeat(decimalIndex - digits.length)}`;
    }

    return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function expandExponentialString(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/);
    if (!match) {
        throw new ValidationError(`Invalid amount: ${value}`);
    }

    const [, sign, integerPartRaw, fractionalPartRaw, leadingFractionRaw, exponentText] = match;
    const integerPart = integerPartRaw ?? '0';
    const fractionalPart = fractionalPartRaw ?? leadingFractionRaw ?? '';
    const digits = `${integerPart}${fractionalPart}`;
    const exponent = exponentText ? Number.parseInt(exponentText, 10) : 0;
    const decimalIndex = integerPart.length + exponent;

    if (/^0+$/.test(digits)) {
        return '0';
    }

    if (decimalIndex <= 0) {
        return `${sign}0.${'0'.repeat(Math.abs(decimalIndex))}${digits}`;
    }

    if (decimalIndex >= digits.length) {
        return `${sign}${digits}${'0'.repeat(decimalIndex - digits.length)}`;
    }

    return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function normalizeDisplayAmount(displayAmount: number, precision: number): string {
    if (!Number.isInteger(precision) || precision < 0) {
        throw new ValidationError(`Precision must be a non-negative integer, got ${precision}`);
    }

    if (!Number.isFinite(displayAmount)) {
        throw new ValidationError(`Amount must be finite, got ${displayAmount}`);
    }

    const normalized = expandExponentialNumber(displayAmount);
    const unsigned =
        normalized.startsWith('-') || normalized.startsWith('+') ? normalized.slice(1) : normalized;
    const [, fractional = ''] = unsigned.split('.');

    if (fractional.length > precision) {
        throw new ValidationError(
            `Amount ${displayAmount} has more than ${precision} decimal places`,
        );
    }

    return normalized;
}

function parseNormalizedDisplayAmount(displayAmount: string | number, precision: number): number {
    const normalized =
        typeof displayAmount === 'number'
            ? normalizeDisplayAmount(displayAmount, precision)
            : (() => {
                  if (!Number.isInteger(precision) || precision < 0) {
                      throw new ValidationError(
                          `Precision must be a non-negative integer, got ${precision}`,
                      );
                  }

                  const exactNormalized = expandExponentialString(displayAmount);
                  const unsigned =
                      exactNormalized.startsWith('-') || exactNormalized.startsWith('+')
                          ? exactNormalized.slice(1)
                          : exactNormalized;
                  const [, fractional = ''] = unsigned.split('.');

                  if (fractional.length > precision) {
                      throw new ValidationError(
                          `Amount ${displayAmount} has more than ${precision} decimal places`,
                      );
                  }

                  return exactNormalized;
              })();
    const sign = normalized.startsWith('-') ? -1 : 1;
    const unsigned =
        normalized.startsWith('-') || normalized.startsWith('+') ? normalized.slice(1) : normalized;
    const [integerPart, fractionalPart = ''] = unsigned.split('.');
    const rawDigits = `${integerPart}${fractionalPart.padEnd(precision, '0')}`;
    const rawAmount = Number(rawDigits || '0') * sign;

    if (!Number.isSafeInteger(rawAmount)) {
        throw new ValidationError(`Raw amount exceeds JavaScript safe integer range`);
    }

    return rawAmount;
}

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

    toRawAmount(displayAmount: number, assetId: string): number {
        const assetPrecision = this.assetPrecisionMap.get(assetId);
        if (assetPrecision === undefined) {
            throw new Error(`Asset ${assetId} not found in precision handler`);
        }

        return parseRawAmount(displayAmount, assetPrecision);
    }

    toDisplayAmount(rawAmount: number, assetId: string): number {
        const assetPrecision = this.assetPrecisionMap.get(assetId);
        if (assetPrecision === undefined) {
            throw new Error(`Asset ${assetId} not found in precision handler`);
        }

        return rawAmount / Math.pow(10, assetPrecision);
    }

    getAssetPrecision(assetId: string): number {
        const assetPrecision = this.assetPrecisionMap.get(assetId);
        if (assetPrecision === undefined) {
            throw new Error(`Asset ${assetId} not found in precision handler`);
        }
        return assetPrecision;
    }

    formatDisplayAmount(displayAmount: number, assetId: string): string {
        const assetPrecision = this.getAssetPrecision(assetId);
        const normalized = normalizeDisplayAmount(displayAmount, assetPrecision);
        const sign = normalized.startsWith('-') ? '-' : '';
        const unsigned =
            normalized.startsWith('-') || normalized.startsWith('+')
                ? normalized.slice(1)
                : normalized;
        const [integerPart, fractionalPart = ''] = unsigned.split('.');

        return `${sign}${integerPart}.${fractionalPart.padEnd(assetPrecision, '0')}`;
    }

    validateOrderSize(displayAmount: number, asset: MappedAsset): ValidationResult {
        let rawAmount: number;
        try {
            rawAmount = this.toRawAmount(displayAmount, asset.asset_id);
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Invalid amount',
                rawAmount: 0,
                minRawAmount: asset.min_order_size,
                maxRawAmount: asset.max_order_size,
            };
        }
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

export function createPrecisionHandler(assets: MappedAsset[]): PrecisionHandler {
    return new PrecisionHandler(assets);
}

export function parseRawAmount(displayAmount: string | number, precision: number): number {
    return parseNormalizedDisplayAmount(displayAmount, precision);
}

export function toDisplayAmount(rawAmount: number, precision: number): number {
    if (!Number.isInteger(precision) || precision < 0) {
        throw new ValidationError(`Precision must be a non-negative integer, got ${precision}`);
    }

    return rawAmount / Math.pow(10, precision);
}
