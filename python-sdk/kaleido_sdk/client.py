"""
Kaleidoswap SDK Client

Main client class that coordinates Maker and RLN operations.
"""

from __future__ import annotations

import logging
from dataclasses import replace

from ._http_client import HttpClient
from ._identity import generate_session_id, load_or_create_install_id
from ._logging import SdkLogger, apply_log_level, set_logger
from ._maker_client import MakerClient
from ._rln_client import RlnClient
from ._version import __sdk_name__, __version__
from .errors import NodeNotConfiguredError
from .types import KaleidoConfig


class KaleidoClient:
    """
    Kaleidoswap SDK Client.

    Provides a typed interface for interacting with the Kaleidoswap protocol.

    Example:
        ```python
        from kaleido_sdk import KaleidoClient

        client = await KaleidoClient.create(
            base_url="https://api.kaleidoswap.com"
        )

        assets = await client.maker.list_assets()
        print(assets.assets[0].ticker)  # "BTC"
        ```
    """

    def __init__(self, config: KaleidoConfig) -> None:
        """
        Initialize KaleidoClient.

        Use `KaleidoClient.create()` factory method instead of direct instantiation.

        Args:
            config: Client configuration
        """
        self._config = config
        apply_log_level(config.log_level)
        set_logger(config.logger)
        self._http = HttpClient(config)
        self._maker = MakerClient(self._http)
        self._rln = RlnClient(self._http)

    @classmethod
    async def create(
        cls,
        base_url: str = "https://api.regtest.kaleidoswap.com",
        node_url: str | None = None,
        api_key: str | None = None,
        allow_insecure: bool = False,
        install_id: str | None = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        log_level: int | str = logging.CRITICAL + 1,
        logger: SdkLogger | None = None,
    ) -> KaleidoClient:
        """
        Create a new KaleidoClient instance.

        Args:
            base_url: Base URL for the Kaleidoswap Maker API.
                Defaults to the regtest environment (https://api.regtest.kaleidoswap.com).
            node_url: Optional URL for RGB Lightning Node
            api_key: Optional API key for authenticated requests
            allow_insecure: Allow attribution headers over non-HTTPS Maker URLs.
                HTTP localhost is allowed automatically for local development.
            install_id: Optional persistent install identifier. Generated and stored when omitted.
            timeout: Request timeout in seconds (default: 30)
            max_retries: Maximum retry attempts (default: 3)
            log_level: Python logging level for SDK loggers (default: silent).
                Set to logging.DEBUG to see full HTTP, WebSocket, and swap traces.
                The application must configure log handlers separately.
            logger: Optional custom logger (any object with debug/info/warning/error
                methods). When provided, SDK log records are forwarded to it via a
                ``logging.Handler`` bridge — handy for loguru, structlog, or test
                recorders. Mirrors the TypeScript SDK's `logger` config field.

        Returns:
            Initialized client

        Example:
            ```python
            # Zero-config — connects to regtest
            client = await KaleidoClient.create()

            # Production Maker API
            client = await KaleidoClient.create(base_url="https://api.kaleidoswap.com")

            # With RGB Node only
            client = await KaleidoClient.create(node_url="http://localhost:3000")

            # Both
            client = await KaleidoClient.create(
                base_url="https://api.kaleidoswap.com",
                node_url="http://localhost:3000",
            )
            ```
        """
        resolved_install_id = await load_or_create_install_id(install_id)
        config = KaleidoConfig(
            base_url=base_url,
            node_url=node_url,
            api_key=api_key,
            allow_insecure=allow_insecure,
            install_id=resolved_install_id,
            session_id=generate_session_id(),
            timeout=timeout,
            max_retries=max_retries,
            log_level=log_level,
            logger=logger,
        )
        return cls(config)

    @classmethod
    async def from_config(cls, config: KaleidoConfig) -> KaleidoClient:
        """
        Create a new KaleidoClient instance from a config object.

        Args:
            config: Client configuration

        Returns:
            Initialized client
        """
        resolved_config = replace(
            config,
            install_id=await load_or_create_install_id(config.install_id),
            session_id=config.session_id or generate_session_id(),
        )
        return cls(resolved_config)

    def has_maker(self) -> bool:
        """
        Check if the Maker (market) API is configured.

        Returns:
            True if Maker base URL is set. The factory always populates
            ``base_url`` with the regtest default, so this is False only when
            callers build a ``KaleidoConfig`` directly with an empty string.
        """
        return bool(self._config.base_url)

    def has_node(self) -> bool:
        """
        Check if RGB Lightning Node is configured.

        Returns:
            True if node URL is configured
        """
        return self._config.node_url is not None

    @property
    def maker(self) -> MakerClient:
        """
        Access Market (Maker) Operations.

        Returns:
            MakerClient for market operations
        """
        return self._maker

    @property
    def rln(self) -> RlnClient:
        """
        Access RGB/Lightning Node Operations.

        Returns:
            RlnClient for node operations

        Raises:
            NodeNotConfiguredError: If node URL is not configured
        """
        if not self.has_node():
            raise NodeNotConfiguredError()
        return self._rln

    async def close(self) -> None:
        """Close all HTTP connections."""
        await self._http.close()

    async def __aenter__(self) -> KaleidoClient:
        """Async context manager entry."""
        return self

    async def __aexit__(self, *args: object) -> None:
        """Async context manager exit."""
        await self.close()


def get_version() -> str:
    """
    Get SDK version.

    Returns:
        Version string
    """
    return __version__


def get_sdk_name() -> str:
    """
    Get SDK name.

    Returns:
        SDK name string
    """
    return __sdk_name__


__all__ = [
    "KaleidoClient",
    "get_version",
    "get_sdk_name",
]
