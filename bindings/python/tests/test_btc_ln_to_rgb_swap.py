import pytest
import os
from kaleidoswap import KaleidoClient, KaleidoConfig
from kaleidoswap.generated_models import (
    CreateSwapOrderRequest,
    ReceiverAddress,
    ReceiverAddressFormat,
    Layer
)

# Use real URLs (or environment variables)
API_URL = os.getenv("KALEIDO_API_URL", "http://localhost:8000")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")

@pytest.mark.integration
class TestBtcLnToRgbSwap:
    @pytest.fixture
    def client(self):
        config = KaleidoConfig(base_url=API_URL, node_url=NODE_URL)
        return KaleidoClient(config)

    def test_create_swap_order_btc_ln_to_rgb_onchain(self, client):
        # 1. Verify connection and get a valid pair
        pairs = client.list_pairs()
        assert len(pairs) > 0, "No trading pairs available"

        target_pair = None
        for pair in pairs:
            if pair.base.ticker == "BTC" and pair.quote.ticker != "BTC":
                target_pair = pair
                break
            elif pair.quote.ticker == "BTC" and pair.base.ticker != "BTC":
                target_pair = pair
                break
        
        assert target_pair is not None, "Could not find a BTC/RGB trading pair"
        pair_ticker = f"{target_pair.base.ticker}/{target_pair.quote.ticker}"
        
        is_base_btc = target_pair.base.ticker == "BTC"
        btc_asset = target_pair.base if is_base_btc else target_pair.quote
        rgb_asset = target_pair.quote if is_base_btc else target_pair.base
        
        # Extract min_amount from BTC_LN endpoint (we're spending BTC)
        btc_endpoint = next((e for e in btc_asset.endpoints if e.layer == "BTC_LN"), None)
        btc_min_amount = btc_endpoint.min_amount if btc_endpoint else 500000
        
        # Request 2x the BTC minimum to have buffer (using from_amount approach like atomic_swap.py)
        from_amount = int(btc_min_amount * 2)
        
        print(f"BTC Endpoint (BTC_LN): min={btc_min_amount}")
        print(f"Using pair {pair_ticker}. Requesting from_amount={from_amount} BTC to acquire {rgb_asset.ticker}")

        try:
            # Use from_amount (how much BTC to spend), not to_amount
            quote = client.get_quote_by_assets(
                from_ticker="BTC",
                to_ticker=rgb_asset.ticker,
                from_amount=from_amount,
                from_layer="BTC_LN",
                to_layer="RGB_L1"
            )
        except Exception as e:
            pytest.fail(f"Failed to get quote for {pair_ticker}: {e}")

        assert quote is not None
        assert quote.rfq_id is not None
        print(f"Quote received: {quote.price} (RFQ: {quote.rfq_id})")

        # 2. Get Receiver Address
        if client.has_node():
             address_response = client.node.get_onchain_address()
             real_addr = address_response.address
        else:
            pytest.skip("Node not configured, cannot fetch onchain address")
        
        # 3. Create Swap Order
        request = CreateSwapOrderRequest(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset, 
            to_asset=quote.to_asset,
            receiver_address=ReceiverAddress(
                address=real_addr,
                format=ReceiverAddressFormat.btc_address
            )
        )
        
        # Force LN on source
        request.from_asset.layer = Layer.btc_ln
        # Ensure To is RGB L1
        request.to_asset.layer = Layer.rgb_l1

        print(f"Creating swap order with RFQ {quote.rfq_id} using address {real_addr}...")
        
        try:
            order_response_json = client.create_swap_order(request)
            import json
            order_response = json.loads(order_response_json)
            
            assert "id" in order_response
            print(f"Order created successfully: {order_response['id']}")
            
        except Exception as e:
            pytest.fail(f"Failed to create swap order: {e}")
