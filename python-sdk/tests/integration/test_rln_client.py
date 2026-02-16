"""
Tests for RlnClient.
"""

import pytest

from kaleidoswap_sdk import (
    AssetBalanceRequest,
    AssetMetadataRequest,
    ChangePasswordRequest,
    CheckIndexerUrlRequest,
    ConnectPeerRequest,
    DecodeLNInvoiceRequest,
    DecodeRGBInvoiceRequest,
    DisconnectPeerRequest,
    EstimateFeeRequest,
    FailTransfersRequest,
    GetChannelIdRequest,
    GetPaymentRequest,
    GetSwapRequest,
    InvoiceStatusRequest,
    KaleidoClient,
    ListTransactionsRequest,
    ListTransfersRequest,
    ListUnspentsRequest,
    LNInvoiceRequest,
    NodeNotConfiguredError,
    RefreshRequest,
    RevokeTokenRequest,
    RgbInvoiceRequest,
    RlnClient,
    SignMessageRequest,
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


# Integration tests require a running RGB Lightning Node (run with -m integration)
class TestRlnClientIntegration:
    """Integration tests for RlnClient (requires running node)."""

    # -------------------------------------------------------------------------
    # Wallet & Node Info
    # -------------------------------------------------------------------------

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
    @pytest.mark.skip(reason="lock_wallet affects subsequent tests (wallet stays locked)")
    async def test_lock_wallet(self, client_with_node: KaleidoClient) -> None:
        """Test locking the wallet (no-op if already locked)."""
        await client_with_node.rln.lock_wallet()

    @pytest.mark.integration
    @pytest.mark.skip(reason="change password cannot happen while the node is unlocked")
    async def test_change_password(self, client_with_node: KaleidoClient) -> None:
        """Test change password endpoint (requires valid old/new password)."""
        body = ChangePasswordRequest(old_password="old", new_password="new")
        await client_with_node.rln.change_password(body)

    @pytest.mark.integration
    @pytest.mark.skip(
        reason="To change the indexer URL we need another valid indexer URL in the network the node has been initialized with"
    )
    async def test_check_indexer_url(self, client_with_node: KaleidoClient) -> None:
        """Test checking indexer URL validity."""
        body = CheckIndexerUrlRequest(indexer_url="")
        await client_with_node.rln.check_indexer_url(body)

    @pytest.mark.integration
    @pytest.mark.skip(reason="The node has not been initialized with any tokens")
    async def test_revoke_token(self, client_with_node: KaleidoClient) -> None:
        """Test revoking a token."""
        body = RevokeTokenRequest(token="")
        await client_with_node.rln.revoke_token(body)

    # -------------------------------------------------------------------------
    # BTC Operations
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_get_address(self, client_with_node: KaleidoClient) -> None:
        """Test getting a Bitcoin address."""
        resp = await client_with_node.rln.get_address()
        assert resp is not None
        assert hasattr(resp, "address")

    @pytest.mark.integration
    async def test_get_btc_balance(self, client_with_node: KaleidoClient) -> None:
        """Test getting BTC balance."""
        resp = await client_with_node.rln.get_btc_balance(skip_sync=False)
        assert resp is not None
        assert hasattr(resp, "vanilla") or hasattr(resp, "colored")

    @pytest.mark.integration
    async def test_list_transactions(self, client_with_node: KaleidoClient) -> None:
        """Test listing on-chain transactions."""
        body = ListTransactionsRequest(skip_sync=False)
        resp = await client_with_node.rln.list_transactions(body)
        assert resp is not None
        assert hasattr(resp, "transactions")

    @pytest.mark.integration
    async def test_list_unspents(self, client_with_node: KaleidoClient) -> None:
        """Test listing unspent outputs."""
        body = ListUnspentsRequest(skip_sync=True)
        resp = await client_with_node.rln.list_unspents(body)
        assert resp is not None
        assert hasattr(resp, "unspents")

    @pytest.mark.integration
    @pytest.mark.skip(reason="Node may return 403 Cannot estimate fees when indexer unavailable")
    async def test_estimate_fee(self, client_with_node: KaleidoClient) -> None:
        """Test estimating on-chain fee."""
        body = EstimateFeeRequest(blocks=1)
        resp = await client_with_node.rln.estimate_fee(body)
        assert resp is not None
        assert hasattr(resp, "fee_rate")

    # -------------------------------------------------------------------------
    # RGB Asset Operations
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_list_assets(self, client_with_node: KaleidoClient) -> None:
        """Test listing RGB assets."""
        resp = await client_with_node.rln.list_assets()
        assert resp is not None
        assert hasattr(resp, "nia") or hasattr(resp, "cfa") or hasattr(resp, "uda")

    @pytest.mark.integration
    async def test_get_asset_balance(self, client_with_node: KaleidoClient) -> None:
        """Test getting asset balance (requires valid asset_id)."""
        # First we need to extract an asset_id from the list of assets
        assets = await client_with_node.rln.list_assets()
        asset_id = assets.nia[0].asset_id
        body = AssetBalanceRequest(asset_id=asset_id)
        resp = await client_with_node.rln.get_asset_balance(body)
        assert resp is not None
        assert hasattr(resp, "settled") or hasattr(resp, "spendable")

    @pytest.mark.integration
    async def test_get_asset_metadata(self, client_with_node: KaleidoClient) -> None:
        """Test getting asset metadata (requires valid asset_id)."""
        # First we need to extract an asset_id from the list of assets
        assets = await client_with_node.rln.list_assets()
        asset_id = assets.nia[0].asset_id
        body = AssetMetadataRequest(asset_id=asset_id)
        resp = await client_with_node.rln.get_asset_metadata(body)
        assert resp is not None

    @pytest.mark.integration
    async def test_list_transfers(self, client_with_node: KaleidoClient) -> None:
        """Test listing RGB transfers."""
        # First we need to extract an asset_id from the list of assets
        assets = await client_with_node.rln.list_assets()
        asset_id = assets.nia[0].asset_id
        body = ListTransfersRequest(asset_id=asset_id)
        resp = await client_with_node.rln.list_transfers(body)
        assert resp is not None
        assert hasattr(resp, "transfers")

    @pytest.mark.integration
    async def test_refresh_transfers(self, client_with_node: KaleidoClient) -> None:
        """Test refreshing pending RGB transfers."""
        body = RefreshRequest(skip_sync=False)
        await client_with_node.rln.refresh_transfers(body)

    @pytest.mark.integration
    async def test_sync_rgb_wallet(self, client_with_node: KaleidoClient) -> None:
        """Test syncing the RGB wallet (POST /sync)."""
        await client_with_node.rln.sync_rgb_wallet()

    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires valid digest from an asset with media")
    async def test_get_asset_media(self, client_with_node: KaleidoClient) -> None:
        """Test getting asset media (POST /getassetmedia)."""
        from kaleidoswap_sdk import GetAssetMediaRequest

        body = GetAssetMediaRequest(digest="")
        resp = await client_with_node.rln.get_asset_media(body)
        assert resp is not None

    @pytest.mark.integration
    @pytest.mark.skip(reason="No pending transfers to fail")
    async def test_fail_transfers(self, client_with_node: KaleidoClient) -> None:
        """Test failing pending RGB transfers (no-op if none pending)."""
        body = FailTransfersRequest()
        resp = await client_with_node.rln.fail_transfers(body)
        assert resp is not None

    # -------------------------------------------------------------------------
    # Lightning Channels
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_list_channels(self, client_with_node: KaleidoClient) -> None:
        """Test listing channels from running node."""
        channels = await client_with_node.rln.list_channels()
        assert channels is not None
        assert hasattr(channels, "channels")

    @pytest.mark.integration
    @pytest.mark.skip(reason="No temporary channel ID to get")
    async def test_get_channel_id(self, client_with_node: KaleidoClient) -> None:
        """Test getting channel ID from temporary channel ID."""
        body = GetChannelIdRequest(temporary_channel_id="")
        resp = await client_with_node.rln.get_channel_id(body)
        assert resp is not None
        assert hasattr(resp, "channel_id")

    # -------------------------------------------------------------------------
    # Lightning Peers
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_list_peers(self, client_with_node: KaleidoClient) -> None:
        """Test listing peers from running node."""
        peers = await client_with_node.rln.list_peers()
        assert peers is not None
        assert hasattr(peers, "peers")

    @pytest.mark.integration
    @pytest.mark.skip(reason="No peer pubkey and address to connect to")
    async def test_connect_peer(self, client_with_node: KaleidoClient) -> None:
        """Test connect peer endpoint (requires valid peer_pubkey_and_addr)."""
        body = ConnectPeerRequest(peer_pubkey_and_addr="")
        resp = await client_with_node.rln.connect_peer(body)
        assert resp is not None

    @pytest.mark.integration
    @pytest.mark.skip(reason="No peer pubkey to disconnect from")
    async def test_disconnect_peer(self, client_with_node: KaleidoClient) -> None:
        """Test disconnect peer endpoint (requires valid peer_pubkey)."""
        body = DisconnectPeerRequest(
            peer_pubkey="",
        )
        await client_with_node.rln.disconnect_peer(body)

    # -------------------------------------------------------------------------
    # Invoices & Payments
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_decode_ln_invoice_str(
        self, client_with_node: KaleidoClient, second_client_with_node: KaleidoClient
    ) -> None:
        """Test decoding LN invoice (string overload)."""
        body = LNInvoiceRequest(amt_msat=1000, expiry_sec=3600)
        resp = await second_client_with_node.rln.create_ln_invoice(body)
        assert resp is not None
        assert hasattr(resp, "invoice")
        body = resp.invoice
        resp = await client_with_node.rln.decode_ln_invoice(body)
        assert resp is not None

    @pytest.mark.integration
    async def test_decode_ln_invoice_request(
        self, client_with_node: KaleidoClient, second_client_with_node: KaleidoClient
    ) -> None:
        """Test decoding LN invoice (request body)."""
        body = LNInvoiceRequest(amt_msat=1000, expiry_sec=3600)
        resp = await second_client_with_node.rln.create_ln_invoice(body)
        assert resp is not None
        assert hasattr(resp, "invoice")
        body = DecodeLNInvoiceRequest(invoice=resp.invoice)
        resp = await client_with_node.rln.decode_ln_invoice(body)
        assert resp is not None

    @pytest.mark.integration
    async def test_decode_rgb_invoice(
        self, client_with_node: KaleidoClient, second_client_with_node: KaleidoClient
    ) -> None:
        """Test decoding RGB invoice (requires valid invoice string)."""
        body = RgbInvoiceRequest(min_confirmations=1, witness=False)
        resp = await second_client_with_node.rln.create_rgb_invoice(body)
        assert resp is not None
        assert hasattr(resp, "invoice")
        body = DecodeRGBInvoiceRequest(invoice=resp.invoice)
        resp = await client_with_node.rln.decode_rgb_invoice(body)
        assert resp is not None

    @pytest.mark.integration
    async def test_get_invoice_status(self, client_with_node: KaleidoClient) -> None:
        """Test getting invoice status (query the same node that created the invoice)."""
        create_req = LNInvoiceRequest(amt_msat=1000, expiry_sec=3600)
        invoice_resp = await client_with_node.rln.create_ln_invoice(create_req)
        assert invoice_resp is not None
        assert hasattr(invoice_resp, "invoice")
        assert invoice_resp.invoice
        status_resp = await client_with_node.rln.get_invoice_status(
            InvoiceStatusRequest(invoice=invoice_resp.invoice)
        )
        assert status_resp is not None
        assert hasattr(status_resp, "status")

    @pytest.mark.integration
    async def test_list_payments(self, client_with_node: KaleidoClient) -> None:
        """Test listing Lightning payments."""
        resp = await client_with_node.rln.list_payments()
        assert resp is not None
        assert hasattr(resp, "payments")

    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires existing payment hash; node returns 403 when not found")
    async def test_get_payment(self, client_with_node: KaleidoClient) -> None:
        """Test getting payment by hash."""
        body = GetPaymentRequest(payment_hash="0" * 64)
        resp = await client_with_node.rln.get_payment(body)
        assert resp is not None

    # -------------------------------------------------------------------------
    # Maker/Taker Swaps
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_get_taker_pubkey(self, client_with_node: KaleidoClient) -> None:
        """Test getting taker public key."""
        pubkey = await client_with_node.rln.get_taker_pubkey()
        assert isinstance(pubkey, str)

    @pytest.mark.integration
    async def test_list_swaps(self, client_with_node: KaleidoClient) -> None:
        """Test listing swaps."""
        resp = await client_with_node.rln.list_swaps()
        assert resp is not None
        assert hasattr(resp, "maker") or hasattr(resp, "taker")

    @pytest.mark.integration
    @pytest.mark.skip(reason="No swap payment hash to get")
    async def test_get_swap(self, client_with_node: KaleidoClient) -> None:
        """Test getting swap by payment hash."""
        body = GetSwapRequest(payment_hash="", taker=False)
        resp = await client_with_node.rln.get_swap(body)
        assert resp is not None

    # -------------------------------------------------------------------------
    # Utility
    # -------------------------------------------------------------------------

    @pytest.mark.integration
    async def test_sign_message(self, client_with_node: KaleidoClient) -> None:
        """Test signing a message."""
        body = SignMessageRequest(message="test")
        resp = await client_with_node.rln.sign_message(body)
        assert resp is not None
        assert hasattr(resp, "signed_message")
