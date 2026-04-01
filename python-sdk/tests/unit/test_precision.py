"""
Tests for precision utilities.
"""

from decimal import Decimal

import pytest

from kaleido_sdk import (
    MappedAsset,
    OrderSizeLimits,
    PrecisionHandler,
    ValidationError,
    ValidationResult,
    create_precision_handler,
    parse_raw_amount,
    to_display_amount,
)


class TestStandaloneFunctions:
    """Tests for standalone precision functions."""

    def test_parse_raw_amount(self) -> None:
        """Test converting display to raw amount."""
        # BTC precision 8
        assert parse_raw_amount(1.0, 8) == 100_000_000
        assert parse_raw_amount(0.5, 8) == 50_000_000
        assert parse_raw_amount(0.00000001, 8) == 1

        # USDT precision 6
        assert parse_raw_amount(1.0, 6) == 1_000_000
        assert parse_raw_amount(100.5, 6) == 100_500_000

    def test_to_display_amount(self) -> None:
        """Test converting raw to display amount."""
        # BTC precision 8
        assert to_display_amount(100_000_000, 8) == 1.0
        assert to_display_amount(50_000_000, 8) == 0.5
        assert to_display_amount(1, 8) == 0.00000001

        # USDT precision 6
        assert to_display_amount(1_000_000, 6) == 1.0
        assert to_display_amount(100_500_000, 6) == 100.5

    def test_parse_raw_amount_rejects_too_many_decimal_places(self) -> None:
        """Amounts beyond asset precision must be rejected, not truncated."""
        with pytest.raises(ValidationError, match="more than 8 decimal places"):
            parse_raw_amount(0.000000001, 8)

    def test_parse_raw_amount_rejects_non_finite_values(self) -> None:
        """NaN and infinity are invalid display amounts."""
        with pytest.raises(ValidationError, match="must be finite"):
            parse_raw_amount(float("nan"), 8)

        with pytest.raises(ValidationError, match="must be finite"):
            parse_raw_amount(float("inf"), 8)

    def test_parse_raw_amount_from_string(self) -> None:
        """Exact string inputs should convert without float round-tripping."""
        assert parse_raw_amount("1.0", 8) == 100_000_000
        assert parse_raw_amount("0.00000001", 8) == 1
        assert parse_raw_amount("100.5", 6) == 100_500_000

    def test_parse_raw_amount_from_decimal_and_int(self) -> None:
        """Decimal and integer inputs should be supported by the exact helper."""
        assert parse_raw_amount(Decimal("1.5"), 8) == 150_000_000
        assert parse_raw_amount(2, 8) == 200_000_000

    def test_parse_raw_amount_rejects_extra_precision(self) -> None:
        """Parse helper must reject amounts beyond asset precision."""
        with pytest.raises(ValidationError, match="more than 8 decimal places"):
            parse_raw_amount("0.000000001", 8)

    def test_parse_raw_amount_exported_from_package_root(self) -> None:
        """Package root should export the parse-oriented name."""
        assert parse_raw_amount("2", 8) == 200_000_000


class TestPrecisionHandler:
    """Tests for PrecisionHandler class."""

    @pytest.fixture
    def btc_asset(self) -> MappedAsset:
        """BTC asset fixture."""
        return {
            "asset_id": "btc-123",
            "ticker": "BTC",
            "precision": 8,
            "min_order_size": 10000,  # 0.0001 BTC
            "max_order_size": 100_000_000,  # 1 BTC
        }

    @pytest.fixture
    def usdt_asset(self) -> MappedAsset:
        """USDT asset fixture."""
        return {
            "asset_id": "usdt-456",
            "ticker": "USDT",
            "precision": 6,
            "min_order_size": 1_000_000,  # 1 USDT
            "max_order_size": 100_000_000_000,  # 100,000 USDT
        }

    @pytest.fixture
    def handler(self, btc_asset: MappedAsset, usdt_asset: MappedAsset) -> PrecisionHandler:
        """PrecisionHandler fixture with BTC and USDT."""
        return PrecisionHandler([btc_asset, usdt_asset])

    def test_create_handler(self, btc_asset: MappedAsset) -> None:
        """Test creating a precision handler."""
        handler = PrecisionHandler([btc_asset])
        assert handler is not None

    def test_create_handler_empty_raises(self) -> None:
        """Test that empty assets list raises ValueError."""
        with pytest.raises(ValueError):
            PrecisionHandler([])

    def test_factory_function(self, btc_asset: MappedAsset) -> None:
        """Test create_precision_handler factory function."""
        handler = create_precision_handler([btc_asset])
        assert handler is not None

    def test_to_raw_amount(self, handler: PrecisionHandler, btc_asset: MappedAsset) -> None:
        """Test handler to_raw_amount method."""
        raw = handler.to_raw_amount(1.5, btc_asset["asset_id"])
        assert raw == 150_000_000

    def test_to_raw_amount_rejects_extra_precision(
        self, handler: PrecisionHandler, btc_asset: MappedAsset
    ) -> None:
        """Handler conversion must reject values beyond configured precision."""
        with pytest.raises(ValidationError, match="more than 8 decimal places"):
            handler.to_raw_amount(0.000000001, btc_asset["asset_id"])

    def test_to_display_amount(self, handler: PrecisionHandler, btc_asset: MappedAsset) -> None:
        """Test handler to_display_amount method."""
        display = handler.to_display_amount(150_000_000, btc_asset["asset_id"])
        assert display == 1.5

    def test_unknown_asset_raises(self, handler: PrecisionHandler) -> None:
        """Test that unknown asset ID raises KeyError."""
        with pytest.raises(KeyError):
            handler.to_raw_amount(1.0, "unknown-asset")

        with pytest.raises(KeyError):
            handler.to_display_amount(1, "unknown-asset")

    def test_get_asset_precision(self, handler: PrecisionHandler, btc_asset: MappedAsset) -> None:
        """Test getting asset precision."""
        precision = handler.get_asset_precision(btc_asset["asset_id"])
        assert precision == 8

    def test_format_display_amount(self, handler: PrecisionHandler, btc_asset: MappedAsset) -> None:
        """Test formatting display amount."""
        formatted = handler.format_display_amount(1.5, btc_asset["asset_id"])
        assert formatted == "1.50000000"

    def test_validate_order_size_valid(
        self, handler: PrecisionHandler, btc_asset: MappedAsset
    ) -> None:
        """Test validating valid order size."""
        result = handler.validate_order_size(0.001, btc_asset)
        assert result.valid is True
        assert result.error is None

    def test_validate_order_size_too_small(
        self, handler: PrecisionHandler, btc_asset: MappedAsset
    ) -> None:
        """Test validating order size below minimum."""
        result = handler.validate_order_size(0.00000001, btc_asset)
        assert result.valid is False
        assert result.error is not None
        assert "below minimum" in result.error

    def test_validate_order_size_too_large(
        self, handler: PrecisionHandler, btc_asset: MappedAsset
    ) -> None:
        """Test validating order size above maximum."""
        result = handler.validate_order_size(10.0, btc_asset)
        assert result.valid is False
        assert result.error is not None
        assert "above maximum" in result.error

    def test_validate_order_size_rejects_invalid_precision(
        self, handler: PrecisionHandler, btc_asset: MappedAsset
    ) -> None:
        """Validation should surface precision errors instead of silently flooring."""
        result = handler.validate_order_size(0.000000001, btc_asset)
        assert result.valid is False
        assert result.error is not None
        assert "more than 8 decimal places" in result.error

    def test_get_order_size_limits(self, handler: PrecisionHandler, btc_asset: MappedAsset) -> None:
        """Test getting order size limits."""
        limits = handler.get_order_size_limits(btc_asset)
        assert limits.min_raw_amount == 10000
        assert limits.max_raw_amount == 100_000_000
        assert limits.precision == 8
        assert limits.min_display_amount == 0.0001
        assert limits.max_display_amount == 1.0


class TestPublicExports:
    """Tests for utility symbols exported from the package root."""

    def test_precision_result_types_are_importable(self) -> None:
        validation = ValidationResult(
            valid=True,
            raw_amount=10,
            min_raw_amount=1,
            max_raw_amount=100,
        )
        limits = OrderSizeLimits(
            min_display_amount=0.1,
            max_display_amount=1.0,
            min_raw_amount=1,
            max_raw_amount=100,
            precision=8,
        )

        assert validation.valid is True
        assert limits.precision == 8
