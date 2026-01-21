"""
Tests for RlnClient.
"""

import pytest
from kaleidoswap_sdk import (
    KaleidoClient,
    RlnClient,
    NodeNotConfiguredError,
)


class TestRlnClient:
    """Tests for RlnClient."""

    def test_rln_client_requires_node(self, client: KaleidoClient) -> None:
        """Test that RlnClient requires node URL."""
        with pytest.raises(NodeNotConfiguredError):
            _ = client.rln

    def test_rln_client_with_node(self, client_with_node: KaleidoClient) -> None:
        """Test that RlnClient is accessible with node URL."""
        assert client_with_node.rln is not None
        assert isinstance(client_with_node.rln, RlnClient)


# Integration tests would require a running RGB Lightning Node
class TestRlnClientIntegration:
    """Integration tests for RlnClient (requires running node)."""

    @pytest.mark.integration
    async def test_get_node_info(self, client_with_node: KaleidoClient) -> None:
        """Test getting node info from running node."""
        info = await client_with_node.rln.get_node_info()
        assert info is not None
        assert hasattr(info, "pubkey")

    @pytest.mark.integration
    async def test_get_network_info(self, client_with_node: KaleidoClient) -> None:
        """Test getting network info from running node."""
        info = await client_with_node.rln.get_network_info()
        assert info is not None
        assert hasattr(info, "network")

    @pytest.mark.integration
    async def test_list_channels(self, client_with_node: KaleidoClient) -> None:
        """Test listing channels from running node."""
        channels = await client_with_node.rln.list_channels()
        assert channels is not None
        assert hasattr(channels, "channels")

    @pytest.mark.integration
    async def test_list_peers(self, client_with_node: KaleidoClient) -> None:
        """Test listing peers from running node."""
        peers = await client_with_node.rln.list_peers()
        assert peers is not None
        assert hasattr(peers, "peers")
