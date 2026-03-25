"""
Precision Handling Utilities

Handles conversion between display amounts (human-readable) and raw amounts (atomic units).
For example: 1.5 BTC (display) <-> 150000000 satoshis (raw, precision=8)
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_DOWN, Decimal, InvalidOperation
from typing import TypedDict

from ..errors import ValidationError


class MappedAsset(TypedDict):
    """Asset with precision and order size limits."""

    asset_id: str
    ticker: str
    precision: int
    min_order_size: int
    max_order_size: int


@dataclass
class ValidationResult:
    """Result of order size validation."""

    valid: bool
    raw_amount: int
    min_raw_amount: int
    max_raw_amount: int
    error: str | None = None


@dataclass
class OrderSizeLimits:
    """Order size limits for an asset."""

    min_display_amount: float
    max_display_amount: float
    min_raw_amount: int
    max_raw_amount: int
    precision: int


class PrecisionHandler:
    """
    Precision Handler for converting between display and raw amounts.

    This class manages precision information for multiple assets and provides
    methods to convert between human-readable amounts and atomic units.
    """

    def __init__(self, assets: list[MappedAsset]) -> None:
        """
        Initialize the precision handler with a list of assets.

        Args:
            assets: List of assets with precision information

        Raises:
            ValueError: If assets list is empty
        """
        if not assets:
            raise ValueError("Cannot create PrecisionHandler with empty assets array")

        self._asset_precision_map: dict[str, int] = {}
        for asset in assets:
            self._asset_precision_map[asset["asset_id"]] = asset["precision"]

    def to_raw_amount(self, display_amount: float, asset_id: str) -> int:
        """
        Convert display amount to raw/atomic units.

        Args:
            display_amount: Human-readable amount (e.g., 1.5 BTC)
            asset_id: Asset ID

        Returns:
            Raw amount in atomic units (e.g., 150000000 sats)

        Raises:
            KeyError: If asset not found in precision handler
        """
        precision = self._asset_precision_map.get(asset_id)
        if precision is None:
            raise KeyError(f"Asset {asset_id} not found in precision handler")

        return to_raw_amount(display_amount, precision)

    def to_display_amount(self, raw_amount: int, asset_id: str) -> float:
        """
        Convert raw/atomic units to display amount.

        Args:
            raw_amount: Amount in atomic units (e.g., 150000000 sats)
            asset_id: Asset ID

        Returns:
            Human-readable amount (e.g., 1.5 BTC)

        Raises:
            KeyError: If asset not found in precision handler
        """
        precision = self._asset_precision_map.get(asset_id)
        if precision is None:
            raise KeyError(f"Asset {asset_id} not found in precision handler")

        return to_display_amount(raw_amount, precision)

    def get_asset_precision(self, asset_id: str) -> int:
        """
        Get the precision for an asset.

        Args:
            asset_id: Asset ID

        Returns:
            Number of decimal places

        Raises:
            KeyError: If asset not found in precision handler
        """
        precision = self._asset_precision_map.get(asset_id)
        if precision is None:
            raise KeyError(f"Asset {asset_id} not found in precision handler")
        return precision

    def format_display_amount(self, display_amount: float, asset_id: str) -> str:
        """
        Format a display amount with the correct precision.

        Args:
            display_amount: Amount to format
            asset_id: Asset ID

        Returns:
            Formatted string with correct decimal places
        """
        precision = self.get_asset_precision(asset_id)
        decimal_amount = _normalize_display_amount(display_amount, precision)
        return f"{decimal_amount:.{precision}f}"

    def validate_order_size(self, display_amount: float, asset: MappedAsset) -> ValidationResult:
        """
        Validate that an order size is within the asset's limits.

        Args:
            display_amount: Amount to validate
            asset: Asset with min/max order sizes

        Returns:
            Validation result with error message if invalid
        """
        try:
            raw_amount = self.to_raw_amount(display_amount, asset["asset_id"])
        except ValidationError as exc:
            return ValidationResult(
                valid=False,
                error=str(exc),
                raw_amount=0,
                min_raw_amount=asset["min_order_size"],
                max_raw_amount=asset["max_order_size"],
            )
        min_display = self.to_display_amount(asset["min_order_size"], asset["asset_id"])
        max_display = self.to_display_amount(asset["max_order_size"], asset["asset_id"])

        if raw_amount < asset["min_order_size"]:
            return ValidationResult(
                valid=False,
                error=f"Amount {display_amount} {asset['ticker']} is below minimum order size of {min_display} {asset['ticker']}",
                raw_amount=raw_amount,
                min_raw_amount=asset["min_order_size"],
                max_raw_amount=asset["max_order_size"],
            )

        if raw_amount > asset["max_order_size"]:
            return ValidationResult(
                valid=False,
                error=f"Amount {display_amount} {asset['ticker']} is above maximum order size of {max_display} {asset['ticker']}",
                raw_amount=raw_amount,
                min_raw_amount=asset["min_order_size"],
                max_raw_amount=asset["max_order_size"],
            )

        return ValidationResult(
            valid=True,
            raw_amount=raw_amount,
            min_raw_amount=asset["min_order_size"],
            max_raw_amount=asset["max_order_size"],
        )

    def get_order_size_limits(self, asset: MappedAsset) -> OrderSizeLimits:
        """
        Get the order size limits for an asset.

        Args:
            asset: Asset to get limits for

        Returns:
            Limits in both display and raw formats
        """
        return OrderSizeLimits(
            min_display_amount=self.to_display_amount(asset["min_order_size"], asset["asset_id"]),
            max_display_amount=self.to_display_amount(asset["max_order_size"], asset["asset_id"]),
            min_raw_amount=asset["min_order_size"],
            max_raw_amount=asset["max_order_size"],
            precision=asset["precision"],
        )


def create_precision_handler(assets: list[MappedAsset]) -> PrecisionHandler:
    """
    Factory function to create a PrecisionHandler.

    Args:
        assets: Array of assets with precision information

    Returns:
        New PrecisionHandler instance
    """
    return PrecisionHandler(assets)


def _normalize_display_amount(display_amount: float | Decimal | str, precision: int) -> Decimal:
    if precision < 0:
        raise ValidationError(f"Precision must be non-negative, got {precision}")

    try:
        amount = Decimal(str(display_amount))
    except (InvalidOperation, ValueError) as exc:
        raise ValidationError(f"Invalid amount: {display_amount!r}") from exc

    if not amount.is_finite():
        raise ValidationError(f"Amount must be finite, got {display_amount!r}")

    quantum = Decimal(1).scaleb(-precision)
    normalized = amount.quantize(quantum, rounding=ROUND_DOWN)
    if normalized != amount:
        raise ValidationError(f"Amount {display_amount!r} has more than {precision} decimal places")

    return normalized


def to_raw_amount(display_amount: float, precision: int) -> int:
    """
    Standalone function to convert display amount to raw amount.

    Args:
        display_amount: Human-readable amount
        precision: Number of decimal places

    Returns:
        Raw amount in atomic units
    """
    normalized = _normalize_display_amount(display_amount, precision)
    return int(normalized.scaleb(precision))


def to_display_amount(raw_amount: int, precision: int) -> float:
    """
    Standalone function to convert raw amount to display amount.

    Args:
        raw_amount: Amount in atomic units
        precision: Number of decimal places

    Returns:
        Human-readable amount
    """
    if precision < 0:
        raise ValidationError(f"Precision must be non-negative, got {precision}")

    return float(Decimal(raw_amount).scaleb(-precision))
