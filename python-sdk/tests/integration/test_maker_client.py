import pytest

from kaleidoswap_sdk import (
    ConfirmSwapRequest,
    CreateOrderRequest,
    CreateSwapOrderRequest,
    KaleidoClient,
    Layer,
    MakerClient,
    ReceiverAddress,
    ReceiverAddressFormat,
    RoutesRequest,
    SwapCompletionOptions,
    SwapRequest,
    SwapStatusRequest,
)
from kaleidoswap_sdk.rln import TakerRequest
from tests.utils import get_fresh_quote, initiate_swap


class TestMakerClient:
    """Tests for MakerClient."""

    def test_maker_client_exists(self, client: KaleidoClient) -> None:
        """Test that maker client is accessible."""
        assert client.maker is not None
        assert isinstance(client.maker, MakerClient)

    def test_to_raw_conversion(self, client: KaleidoClient) -> None:
        """Test to_raw convenience method."""
        raw = client.maker.to_raw(1.5, 8)
        assert raw == 150_000_000

    def test_to_display_conversion(self, client: KaleidoClient) -> None:
        """Test to_display convenience method."""
        display = client.maker.to_display(150_000_000, 8)
        assert display == 1.5


class TestSwapCompletionOptions:
    """Tests for SwapCompletionOptions."""

    def test_default_values(self) -> None:
        """Test default option values."""
        options = SwapCompletionOptions()
        assert options.timeout == 300.0
        assert options.poll_interval == 2.0
        assert options.on_status_update is None

    def test_custom_values(self) -> None:
        """Test custom option values."""
        callback_called = False

        def callback(status: str) -> None:
            nonlocal callback_called
            callback_called = True

        options = SwapCompletionOptions(
            timeout=600.0,
            poll_interval=5.0,
            on_status_update=callback,
        )
        assert options.timeout == 600.0
        assert options.poll_interval == 5.0
        assert options.on_status_update is not None

        # Test callback
        options.on_status_update("test")
        assert callback_called


# Integration tests would require mocking or a live API
class TestMakerClientIntegration:
    """Integration tests for MakerClient (requires API)."""

    # ==========================================================================
    # MARKET ENDPOINTS (/market/*)
    # ==========================================================================

    @pytest.mark.integration
    async def test_list_assets(self, client: KaleidoClient) -> None:
        """Test GET /market/assets - List available assets."""
        assets = await client.maker.list_assets()
        assert assets is not None
        assert hasattr(assets, "assets")

    @pytest.mark.integration
    async def test_list_pairs(self, client: KaleidoClient) -> None:
        """Test GET /market/pairs - List trading pairs."""
        pairs = await client.maker.list_pairs()
        assert pairs is not None
        assert hasattr(pairs, "pairs")

    @pytest.mark.integration
    async def test_get_pair_routes(self, client: KaleidoClient) -> None:
        """Test POST /market/pairs/routes - Get available swap routes for a pair."""
        # Test with pair_ticker
        routes = await client.maker.get_pair_routes("BTC/USDT")
        assert routes is not None
        assert isinstance(routes, list)

    @pytest.mark.integration
    async def test_get_market_routes(self, client: KaleidoClient) -> None:
        """Test POST /market/routes - Discover multi-hop routes."""
        request = RoutesRequest(from_asset="BTC", to_asset="USDT", max_hops=2)
        routes = await client.maker.get_market_routes(request)
        assert routes is not None
        assert hasattr(routes, "routes")

    @pytest.mark.integration
    async def test_get_quote(self, client: KaleidoClient) -> None:
        """Test POST /market/quote - Get a price quote."""
        quote = await get_fresh_quote(client, from_amount=100_000)
        assert quote is not None
        assert quote.rfq_id is not None, "Quote must have RFQ ID"
        assert quote.from_asset.asset_id == "BTC", "From asset should be BTC"
        assert quote.to_asset.asset_id == "USDT", "To asset should be USDT"
        assert quote.from_asset.amount == 100_000, "From amount should match request"
        assert quote.to_asset.amount is not None, "To amount must be calculated"
        assert quote.to_asset.amount > 0, "To amount must be positive"
        assert quote.price > 0, "Price must be set"

    # ==========================================================================
    # SWAP ORDER ENDPOINTS (/orders/*)
    # ==========================================================================

    @pytest.mark.integration
    async def test_create_swap_order(
        self, client: KaleidoClient, second_client_with_node: KaleidoClient
    ) -> None:
        """Test POST /orders - Create a swap order.

        1. Get a quote (RFQ)
        2. Get receiver invoice/address from taker node
        3. Create swap order with receiver address
        4. Verify order creation
        """
        # Step 1: List assets and get RGB asset id for USDT
        assets = await client.maker.list_assets()
        assert assets is not None
        usdt_asset = next((a for a in assets.assets if a.ticker == "USDT"), None)
        assert usdt_asset is not None, "USDT asset not found in list_assets"
        pid = usdt_asset.protocol_ids
        asset_id = (pid or {}).get("RGB") if isinstance(pid, dict) else None
        assert asset_id is not None, "USDT RGB asset id not found in protocol_ids"
        quote = await get_fresh_quote(
            client,
            from_asset=asset_id,
            to_asset="BTC",
            from_layer=Layer.RGB_LN,
            to_layer=Layer.BTC_L1,
        )
        assert quote.rfq_id is not None, "Quote must have RFQ ID"
        assert quote.from_asset.amount is not None and quote.from_asset.amount > 0, (
            "From amount must be set"
        )
        assert quote.to_asset.amount is not None and quote.to_asset.amount > 0, (
            "To amount must be calculated"
        )

        # Step 2: Get receiver address from second node (taker)
        address_response = await second_client_with_node.rln.get_address()
        receiver_address_str = address_response.address

        # Step 3: Create swap order (use quote's from_asset/to_asset as dicts for generated client)
        from_asset_dict = (
            quote.from_asset.to_dict()
            if hasattr(quote.from_asset, "to_dict")
            else getattr(quote.from_asset, "model_dump", lambda: quote.from_asset)()
        )
        to_asset_dict = (
            quote.to_asset.to_dict()
            if hasattr(quote.to_asset, "to_dict")
            else getattr(quote.to_asset, "model_dump", lambda: quote.to_asset)()
        )
        request = CreateSwapOrderRequest(
            rfq_id=quote.rfq_id,
            from_asset=from_asset_dict,
            to_asset=to_asset_dict,
            receiver_address=ReceiverAddress(
                address=receiver_address_str,
                format=ReceiverAddressFormat.BTC_ADDRESS,
            ),
            min_onchain_conf=1,
            refund_address=receiver_address_str,
            email="test@example.com",
        )
        order = await client.maker.create_swap_order(request)
        # Step 4: Verify order creation
        assert order is not None
        order_id = getattr(order, "order_id", None) or getattr(order, "id", None)
        assert order_id is not None, "Order must have id or order_id"
        assert hasattr(order, "status")
        status_val = getattr(order.status, "value", str(order.status))
        assert status_val == "PENDING_PAYMENT"

    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires existing swap order in backend")
    async def test_get_swap_order_status(self, client: KaleidoClient) -> None:
        """Test POST /orders/status - Get swap order status."""
        pass

    @pytest.mark.integration
    async def test_get_order_history(self, client: KaleidoClient) -> None:
        """Test GET /orders/history - Get order history with pagination."""
        history = await client.maker.get_order_history(limit=10, skip=0)
        assert history is not None
        assert hasattr(history, "data")
        assert hasattr(history, "pagination")

    @pytest.mark.integration
    async def test_get_order_analytics(self, client: KaleidoClient) -> None:
        """Test GET /orders/analytics - Get order statistics."""
        analytics = await client.maker.get_order_analytics()
        assert analytics is not None
        assert hasattr(analytics, "status_counts")

    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires order in PENDING_RATE_DECISION state")
    async def test_submit_rate_decision(self, client: KaleidoClient) -> None:
        """Test POST /orders/rate_decision - Handle rate change decision."""
        pass

    # ==========================================================================
    # ATOMIC SWAP ENDPOINTS (/swaps/*)
    # ==========================================================================

    @pytest.mark.integration
    async def test_get_swap_node_info(self, client: KaleidoClient) -> None:
        """Test GET /swaps/nodeinfo - Get node information."""
        node_info = await client.maker.get_swap_node_info()
        assert node_info is not None
        assert hasattr(node_info, "pubkey")
        assert hasattr(node_info, "network")
        assert node_info.pubkey is not None
        assert node_info.network.lower() in ["mainnet", "testnet", "signet", "regtest"]

    @pytest.mark.integration
    async def test_init_swap(self, client: KaleidoClient) -> None:
        """Test POST /swaps/init - Initialize maker swap.

        1. Get quote
        2. Initialize swap with RFQ ID
        3. Returns swapstring and payment_hash
        """
        # Step 1: Get a fresh quote
        quote = await get_fresh_quote(client)
        assert quote.rfq_id is not None, "Quote must have RFQ ID"
        assert quote.from_asset.asset_id == "BTC", "From asset must be BTC"
        assert quote.from_asset.amount == 4_100_000, "From amount must be 4.1M sats"

        # Step 2: Initialize swap
        swap_response = await initiate_swap(client, quote)
        assert swap_response is not None, "Swap response should not be None"
        assert swap_response.swapstring is not None, "Swapstring must be generated"
        assert swap_response.payment_hash is not None, "Payment hash must be generated"
        assert len(swap_response.swapstring) > 100, "Swapstring should have content"
        assert len(swap_response.payment_hash) == 64, "Payment hash should be 64 hex chars"

    @pytest.mark.integration
    async def test_execute_swap(
        self, client: KaleidoClient, second_client_with_node: KaleidoClient
    ) -> None:
        """Test POST /swaps/execute - Execute/confirm swap.

        1. Get quote
        2. Initialize swap
        3. Taker whitelists the swap on their node
        4. Execute the swap with taker_pubkey
        5. Verify execution response
        """
        # Step 1: Get quote
        quote = await get_fresh_quote(client, from_amount=1_000_000)
        assert quote.rfq_id is not None, "Quote must have RFQ ID"
        assert quote.from_asset.amount == 1_000_000, "From amount must be 1M sats"
        assert quote.to_asset.amount is not None, "To amount must be calculated"

        # Step 2: Initialize swap
        swap = await initiate_swap(client, quote)
        assert swap.swapstring is not None, "Swap must have swapstring"
        assert swap.payment_hash is not None, "Swap must have payment_hash"

        # Step 3: Taker node info and whitelist
        taker_node_info = await second_client_with_node.rln.get_node_info()
        taker_pubkey = taker_node_info.pubkey
        await second_client_with_node.rln.whitelist_swap(TakerRequest(swapstring=swap.swapstring))

        # Step 4: Execute the swap
        confirm_request = ConfirmSwapRequest(
            swapstring=swap.swapstring,
            payment_hash=swap.payment_hash,
            taker_pubkey=taker_pubkey,
        )
        confirm_response = await client.maker.execute_swap(confirm_request)

        # Step 5: Verify execution response
        assert confirm_response is not None, "Execute response should not be None"
        assert confirm_response.status == 200, "Execute should return status 200"
        assert confirm_response.message is not None, "Should have success message"

    @pytest.mark.integration
    async def test_get_atomic_swap_status(self, client: KaleidoClient) -> None:
        """Test POST /swaps/atomic/status - Get atomic swap status."""
        quote = await get_fresh_quote(client)

        swap_request = SwapRequest(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset.asset_id,
            from_amount=quote.from_asset.amount or 0,
            to_asset=quote.to_asset.asset_id,
            to_amount=quote.to_asset.amount or 0,
        )
        swap = await client.maker.init_swap(swap_request)
        status_request = SwapStatusRequest(payment_hash=swap.payment_hash)
        status_response = await client.maker.get_atomic_swap_status(status_request)

        # Verify response
        assert status_response is not None
        assert status_response.swap.payment_hash == swap.payment_hash
        status_val = getattr(status_response.swap.status, "value", str(status_response.swap.status))
        assert status_val in [
            "Waiting",
            "Pending",
            "Succeeded",
            "Expired",
            "Failed",
        ]

    @pytest.mark.integration
    async def test_complete_atomic_swap_flow(self, client: KaleidoClient) -> None:
        """Test complete atomic swap lifecycle.

        1. Get quote
        2. Initialize swap
        3. Check initial status
        """
        # Step 1: Get quote
        quote = await get_fresh_quote(client)
        assert quote.from_asset.asset_id == "BTC"

        # Step 2: Initialize swap
        swap_request = SwapRequest(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset.asset_id,
            from_amount=quote.from_asset.amount or 0,
            to_asset=quote.to_asset.asset_id,
            to_amount=quote.to_asset.amount or 0,
        )
        swap = await client.maker.init_swap(swap_request)
        assert swap.swapstring is not None
        assert swap.payment_hash is not None

        # Step 3: Check initial status
        status_request = SwapStatusRequest(payment_hash=swap.payment_hash)
        initial_status = await client.maker.get_atomic_swap_status(status_request)
        status_val = getattr(initial_status.swap.status, "value", str(initial_status.swap.status))
        assert status_val in ["Waiting", "Pending"]

    # ==========================================================================
    # LSPS1 CHANNEL ORDER ENDPOINTS (/lsps1/*)
    # ==========================================================================

    @pytest.mark.integration
    async def test_get_lsp_info(self, client: KaleidoClient) -> None:
        """Test GET /lsps1/get_info - Get LSP information."""
        lsp_info = await client.maker.get_lsp_info()
        assert lsp_info is not None
        assert hasattr(lsp_info, "lsp_connection_url")
        assert hasattr(lsp_info, "options")

    @pytest.mark.integration
    async def test_get_lsp_network_info(self, client: KaleidoClient) -> None:
        """Test GET /lsps1/network_info - Get LSP network information."""
        network_info = await client.maker.get_lsp_network_info()
        assert network_info is not None
        assert hasattr(network_info, "network")
        assert hasattr(network_info, "height")

    @pytest.mark.integration
    async def test_create_lsp_order(self, second_client_with_node: KaleidoClient) -> None:
        """Test POST /lsps1/create_order - Create LSPS1 channel order.

        1. Get LSP info
        2. Get real client pubkey and refund address from the node
        3. Create channel order
        4. Verify order creation
        """
        # Step 1: Get LSP info
        lsp_info = await second_client_with_node.maker.get_lsp_info()
        assert lsp_info is not None, "LSP info should be available"
        assert lsp_info.options is not None, "LSP options should be set"
        min_client_balance = lsp_info.options.min_initial_client_balance_sat
        max_client_balance = lsp_info.options.max_initial_client_balance_sat
        min_lsp_balance = lsp_info.options.min_initial_lsp_balance_sat

        # Step 2: Get real client identity from the node (required by LSP)
        client_pubkey = await second_client_with_node.rln.get_taker_pubkey()
        assert client_pubkey is not None, "Client pubkey should not be None"
        address_response = await second_client_with_node.rln.get_address()
        assert address_response.address is not None, "Address response should not be None"

        # Step 3: Create channel order (inbound = LSP side must be positive)
        client_balance = (min_client_balance + max_client_balance) // 2
        lsp_balance = max(1, min_lsp_balance)
        order_request = CreateOrderRequest(
            lsp_balance_sat=lsp_balance,
            client_balance_sat=client_balance,
            required_channel_confirmations=1,
            funding_confirms_within_blocks=6,
            channel_expiry_blocks=144,
            token="",
            announce_channel=False,
            refund_onchain_address=address_response.address,
            client_pubkey=client_pubkey,
        )

        order_response = await second_client_with_node.maker.create_lsp_order(order_request)

        # Step 4: Verify order creation
        assert order_response is not None, "Order response should not be None"
        assert order_response.order_id is not None, "Order must have ID"
        assert order_response.payment is not None, "Payment details required"
        assert order_response.payment.bolt11 is not None, "BOLT11 payment required"
        assert order_response.payment.bolt11.invoice is not None, "Invoice required"

    @pytest.mark.integration
    async def test_estimate_lsp_fees(self, client: KaleidoClient) -> None:
        """Test POST /lsps1/estimate_fees - Estimate channel fees."""
        pass

    @pytest.mark.integration
    async def test_get_lsp_order(self, client: KaleidoClient) -> None:
        """Test POST /lsps1/get_order - Get LSPS1 order by ID."""
        pass

    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires order in PENDING_RATE_DECISION state")
    async def test_submit_lsp_rate_decision(self, client: KaleidoClient) -> None:
        """Test POST /lsps1/rate_decision - Handle LSPS1 rate decision."""
        pass

    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires order failed in asset delivery")
    async def test_retry_asset_delivery(self, client: KaleidoClient) -> None:
        """Test POST /lsps1/retry_delivery - Retry asset delivery."""
        pass
