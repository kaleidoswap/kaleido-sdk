"""
Kaleidoswap SDK Client

Main client class that coordinates Maker and RLN operations.
"""

from __future__ import annotations

import logging

from ._http_client import HttpClient
from ._logging import apply_log_level
from ._maker_client import MakerClient
from ._rln_client import RlnClient
from .errors import NodeNotConfiguredError
from .types import KaleidoConfig

__version__ = "0.1.1"
__sdk_name__ = "kaleido-sdk"


class KaleidoClient:
    """
    Kaleidoswap SDK Client.

    Provides a typed interface for interacting with the Kaleidoswap protocol.

    Example:
        ```python
        from kaleido_sdk import KaleidoClient

        client = KaleidoClient.create(
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
        self._http = HttpClient(config)
        self._maker = MakerClient(self._http)
        self._rln = RlnClient(self._http)

    @classmethod
    def create(
        cls,
        base_url: str = "https://api.regtest.kaleidoswap.com",
        node_url: str | None = None,
        api_key: str | None = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        cache_ttl: int = 60,
        log_level: int | str = logging.WARNING,
    ) -> KaleidoClient:
        """
        Create a new KaleidoClient instance.

        Args:
            base_url: Base URL for the Kaleidoswap Maker API.
                Defaults to the regtest environment (https://api.regtest.kaleidoswap.com).
            node_url: Optional URL for RGB Lightning Node
            api_key: Optional API key for authenticated requests
            timeout: Request timeout in seconds (default: 30)
            max_retries: Maximum retry attempts (default: 3)
            cache_ttl: Cache TTL in seconds (default: 60)
            log_level: Python logging level for SDK loggers (default: logging.WARNING).
                Set to logging.DEBUG to see full HTTP, WebSocket, and swap traces.
                The application must configure log handlers separately.

        Returns:
            Initialized client

        Example:
            ```python
            # Zero-config — connects to regtest
            client = KaleidoClient.create()

            # Production Maker API
            client = KaleidoClient.create(base_url="https://api.kaleidoswap.com")

            # With RGB Node only
            client = KaleidoClient.create(node_url="http://localhost:3000")

            # Both
            client = KaleidoClient.create(
                base_url="https://api.kaleidoswap.com",
                node_url="http://localhost:3000",
            )
            ```
        """
        config = KaleidoConfig(
            base_url=base_url,
            node_url=node_url,
            api_key=api_key,
            timeout=timeout,
            max_retries=max_retries,
            cache_ttl=cache_ttl,
            log_level=log_level,
        )
        return cls(config)

    @classmethod
    def from_config(cls, config: KaleidoConfig) -> KaleidoClient:
        """
        Create a new KaleidoClient instance from a config object.

        Args:
            config: Client configuration

        Returns:
            Initialized client
        """
        return cls(config)

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
