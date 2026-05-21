"""
Tests for ``KaleidoClient`` (constructor, factories, properties) and the
package-root utility helpers. Larger concerns (HTTP transport, identity,
WebSocket, RLN methods, public-export surface) live in sibling test files.
"""

import pytest

from kaleido_sdk import (
    KaleidoClient,
    KaleidoConfig,
    NodeNotConfiguredError,
    ValidationError,
    get_sdk_name,
    get_version,
    parse_raw_amount,
    to_display_amount,
)


class TestKaleidoClient:
    """Tests for KaleidoClient."""

    async def test_create_basic(self, base_url: str) -> None:
        """Test basic client creation."""
        client = await KaleidoClient.create(base_url=base_url, install_id="inst_test_create_basic")
        assert client is not None
        assert not client.has_node()

    async def test_create_with_node(self, base_url: str, node_url: str) -> None:
        """Test client creation with node URL."""
        client = await KaleidoClient.create(
            base_url=base_url,
            node_url=node_url,
            install_id="inst_test_create_node",
        )
        assert client is not None
        assert client.has_node()

    async def test_create_from_config(self, config: KaleidoConfig) -> None:
        """Test client creation from config object."""
        client = await KaleidoClient.from_config(config)
        assert client is not None

    def test_maker_property(self, client: KaleidoClient) -> None:
        """Test maker property returns MakerClient."""
        from kaleido_sdk import MakerClient

        assert isinstance(client.maker, MakerClient)

    def test_rln_property_without_node(self, client: KaleidoClient) -> None:
        """Test rln property raises error without node configured."""
        with pytest.raises(NodeNotConfiguredError):
            _ = client.rln

    def test_rln_property_with_node(self, client_with_node: KaleidoClient) -> None:
        """Test rln property returns RlnClient with node configured."""
        from kaleido_sdk import RlnClient

        assert isinstance(client_with_node.rln, RlnClient)


class TestUtilityFunctions:
    """Tests for utility functions."""

    def test_parse_raw_amount(self) -> None:
        """Test converting to smallest units."""
        # BTC to satoshis
        assert parse_raw_amount(1.0, 8) == 100_000_000
        assert parse_raw_amount(0.5, 8) == 50_000_000
        assert parse_raw_amount(1.5, 8) == 150_000_000
        assert parse_raw_amount(0.00000001, 8) == 1

        # USDT with precision 6
        assert parse_raw_amount(1.0, 6) == 1_000_000
        assert parse_raw_amount(100.50, 6) == 100_500_000

    def test_to_display_amount(self) -> None:
        """Test converting to display units."""
        # Satoshis to BTC
        assert to_display_amount(100_000_000, 8) == 1.0
        assert to_display_amount(50_000_000, 8) == 0.5
        assert to_display_amount(150_000_000, 8) == 1.5
        assert to_display_amount(1, 8) == 0.00000001

        # USDT smallest units to display
        assert to_display_amount(1_000_000, 6) == 1.0
        assert to_display_amount(100_500_000, 6) == 100.5

    def test_parse_raw_amount_rejects_extra_precision(self) -> None:
        """Public helper must reject values that would otherwise be rounded."""
        with pytest.raises(ValidationError, match="more than 8 decimal places"):
            parse_raw_amount(1.234567891, 8)

    def test_conversion_roundtrip(self) -> None:
        """Test that conversion roundtrips correctly."""
        original = 1.23456789
        precision = 8
        smallest = parse_raw_amount(original, precision)
        display = to_display_amount(smallest, precision)
        # Note: floating point precision limits
        assert abs(display - 1.23456789) < 1e-8

    def test_get_version(self) -> None:
        """Test get_version returns a string."""
        version = get_version()
        assert isinstance(version, str)
        assert len(version) > 0
        # Check version format (semver-like)
        parts = version.split(".")
        assert len(parts) >= 2

    def test_get_sdk_name(self) -> None:
        """Test get_sdk_name returns expected name."""
        name = get_sdk_name()
        assert name == "kaleido-sdk"


class TestHasMaker:
    """``has_maker()`` returns True when base_url is non-empty."""

    def test_default_create_has_maker(self, client: KaleidoClient) -> None:
        assert client.has_maker() is True

    def test_empty_base_url_lacks_maker(self) -> None:
        config = KaleidoConfig(base_url="", install_id="inst_test", session_id="s")
        client = KaleidoClient(config)
        assert client.has_maker() is False


class TestCustomLogger:
    """``KaleidoConfig.logger`` should receive SDK log records via the bridge."""

    async def test_default_log_level_is_silent(self) -> None:
        captured: list[str] = []

        class Recorder:
            def debug(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(msg)

            def info(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(msg)

            def warning(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(msg)

            def error(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(msg)

        client = await KaleidoClient.create(
            base_url="https://api.example.com",
            install_id="inst_test_silent_logger",
            logger=Recorder(),
        )

        from kaleido_sdk._logging import get_logger, set_logger

        try:
            get_logger("test").warning("default should stay silent")
            assert captured == []
        finally:
            set_logger(None)
            await client.close()

    async def test_logger_receives_info_records(self) -> None:
        captured: list[tuple[str, str]] = []

        class Recorder:
            def debug(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("debug", msg))

            def info(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("info", msg))

            def warning(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("warning", msg))

            def error(self, msg: str, *args: object, **kwargs: object) -> None:
                captured.append(("error", msg))

        client = await KaleidoClient.create(
            base_url="https://api.example.com",
            install_id="inst_test_logger",
            log_level="DEBUG",
            logger=Recorder(),
        )

        # Trigger any internal log; using a direct logger call mirrors what
        # the SDK does internally and avoids needing a live HTTP request.
        from kaleido_sdk._logging import get_logger

        get_logger("test").info("hello from sdk")

        # Reset the global logger handler so subsequent tests aren't affected.
        from kaleido_sdk._logging import set_logger as _set_logger

        try:
            assert any(level == "info" and "hello from sdk" in msg for level, msg in captured), (
                f"expected info bridge record, got {captured!r}"
            )
        finally:
            _set_logger(None)
            await client.close()

    def test_set_logger_is_idempotent(self) -> None:
        from kaleido_sdk._logging import (
            _root,
            _SdkLoggerHandler,  # type: ignore[attr-defined]
            set_logger,
        )

        class _Noop:
            def debug(self, *a: object, **k: object) -> None: ...
            def info(self, *a: object, **k: object) -> None: ...
            def warning(self, *a: object, **k: object) -> None: ...
            def error(self, *a: object, **k: object) -> None: ...

        try:
            set_logger(_Noop())
            set_logger(_Noop())
            set_logger(_Noop())
            bridges = [h for h in _root.handlers if isinstance(h, _SdkLoggerHandler)]
            assert len(bridges) == 1
        finally:
            set_logger(None)
