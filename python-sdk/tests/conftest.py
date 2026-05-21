"""
Test fixtures and configuration for Kaleidoswap SDK tests.
"""

import pytest

from kaleido_sdk import KaleidoClient, KaleidoConfig


@pytest.fixture
def base_url() -> str:
    """Base URL for test API."""
    return "http://localhost:8000"


@pytest.fixture
def node_url() -> str:
    """Node URL for test API."""
    return "http://localhost:3002"


@pytest.fixture
def second_node_url() -> str:
    """Second node URL for test API."""
    return "http://localhost:3001"


@pytest.fixture
def config(base_url: str) -> KaleidoConfig:
    """Basic SDK configuration."""
    return KaleidoConfig(
        base_url=base_url, install_id="inst_test_config", session_id="test-session"
    )


@pytest.fixture
def config_with_node(base_url: str, node_url: str) -> KaleidoConfig:
    """SDK configuration with node URL."""
    return KaleidoConfig(
        base_url=base_url,
        node_url=node_url,
        install_id="inst_test_config_node",
        session_id="test-session-node",
    )


@pytest.fixture
def client(base_url: str) -> KaleidoClient:
    """Basic KaleidoClient instance."""
    return KaleidoClient(
        KaleidoConfig(base_url=base_url, install_id="inst_test_client", session_id="test-session")
    )


@pytest.fixture
def client_with_node(base_url: str, node_url: str) -> KaleidoClient:
    """KaleidoClient instance with node configured."""
    return KaleidoClient(
        KaleidoConfig(
            base_url=base_url,
            node_url=node_url,
            install_id="inst_test_client_node",
            session_id="test-session-node",
        )
    )


@pytest.fixture
def second_client_with_node(base_url: str, second_node_url: str) -> KaleidoClient:
    """KaleidoClient instance with second node configured."""
    return KaleidoClient(
        KaleidoConfig(
            base_url=base_url,
            node_url=second_node_url,
            install_id="inst_test_second_client_node",
            session_id="test-session-second-node",
        )
    )
