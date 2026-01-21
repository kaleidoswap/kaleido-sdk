"""
Test fixtures and configuration for Kaleidoswap SDK tests.
"""

import pytest
from kaleidoswap_sdk import KaleidoClient, KaleidoConfig


@pytest.fixture
def base_url() -> str:
    """Base URL for test API."""
    return "https://api.kaleidoswap.com"


@pytest.fixture
def node_url() -> str:
    """Node URL for test API."""
    return "http://localhost:3000"


@pytest.fixture
def config(base_url: str) -> KaleidoConfig:
    """Basic SDK configuration."""
    return KaleidoConfig(base_url=base_url)


@pytest.fixture
def config_with_node(base_url: str, node_url: str) -> KaleidoConfig:
    """SDK configuration with node URL."""
    return KaleidoConfig(base_url=base_url, node_url=node_url)


@pytest.fixture
def client(base_url: str) -> KaleidoClient:
    """Basic KaleidoClient instance."""
    return KaleidoClient.create(base_url=base_url)


@pytest.fixture
def client_with_node(base_url: str, node_url: str) -> KaleidoClient:
    """KaleidoClient instance with node configured."""
    return KaleidoClient.create(base_url=base_url, node_url=node_url)
