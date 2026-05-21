"""
Unit tests for ``kaleido_sdk._maker_client.MakerClient``.

Counterpart of ``typescript-sdk/tests/unit/maker-client.test.ts``.
"""

from unittest.mock import AsyncMock, patch

import pytest

from kaleido_sdk import KaleidoClient


class TestPairRoutes:
    """Pair route helpers follow the generated OpenAPI models."""

    async def test_get_pair_routes_uses_spec_request_and_response(
        self, client: KaleidoClient
    ) -> None:
        from kaleido_sdk import PairRoutesRequest

        maker = client.maker

        with patch.object(maker._http, "maker_post", new_callable=AsyncMock) as mock:
            mock.return_value = {"routes": []}
            routes = await maker.get_pair_routes(PairRoutesRequest(pair_ticker="BTC/USDT"))

        assert routes.routes == []
        assert mock.call_args.args[0] == "/api/v1/market/pairs/routes"
        sent_request = mock.call_args.kwargs["data"]
        assert isinstance(sent_request, PairRoutesRequest)
        assert sent_request.pair_ticker == "BTC/USDT"

    async def test_get_pair_routes_by_ticker_keeps_list_shape(self, client: KaleidoClient) -> None:
        maker = client.maker

        with patch.object(maker._http, "maker_post", new_callable=AsyncMock) as mock:
            mock.return_value = {"routes": []}
            with pytest.warns(DeprecationWarning, match="get_pair_routes_by_ticker"):
                routes = await maker.get_pair_routes_by_ticker("BTC/USDT")

        assert routes == []
        assert mock.call_args.kwargs["data"].pair_ticker == "BTC/USDT"

    async def test_get_pair_routes_string_shorthand_warns(self, client: KaleidoClient) -> None:
        maker = client.maker

        with patch.object(maker._http, "maker_post", new_callable=AsyncMock) as mock:
            mock.return_value = {"routes": []}
            with pytest.warns(DeprecationWarning, match="Passing a string"):
                routes = await maker.get_pair_routes("BTC/USDT")

        assert routes.routes == []
        assert mock.call_args.kwargs["data"].pair_ticker == "BTC/USDT"

    async def test_get_market_routes_uses_spec_native_routes_models(
        self, client: KaleidoClient
    ) -> None:
        from kaleido_sdk import RoutesRequest

        maker = client.maker

        with patch.object(maker._http, "maker_post", new_callable=AsyncMock) as mock:
            mock.return_value = {"routes": [], "timestamp": 1234}
            routes = await maker.get_market_routes(
                RoutesRequest(from_asset="BTC", to_asset="USDT", max_hops=2)
            )

        assert routes.routes == []
        assert routes.timestamp == 1234
        assert mock.call_args.args[0] == "/api/v1/market/routes"
        sent_request = mock.call_args.kwargs["data"]
        assert isinstance(sent_request, RoutesRequest)
        assert sent_request.from_asset == "BTC"
        assert sent_request.to_asset == "USDT"
        assert sent_request.max_hops == 2


class TestWaitForSwapCompletionAccessToken:
    """wait_for_swap_completion must forward access_token to the status poll."""

    async def test_no_access_token_when_omitted(self, client: KaleidoClient) -> None:
        """When access_token is not supplied, the status request omits it."""
        from kaleido_sdk import SwapCompletionOptions
        from kaleido_sdk._generated.api_types import (
            SwapOrder,
            SwapOrderStatus,
            SwapOrderStatusResponse,
        )

        maker = client.maker
        fake_order = SwapOrder.model_construct(
            id="order_123",
            status=SwapOrderStatus.FILLED,
        )
        fake_response = SwapOrderStatusResponse.model_construct(order=fake_order)

        with patch.object(maker, "get_swap_order_status", new_callable=AsyncMock) as mock:
            mock.return_value = fake_response
            result = await maker.wait_for_swap_completion(
                "order_123",
                SwapCompletionOptions(timeout=5.0, poll_interval=0.01),
            )

        assert result.id == "order_123"
        sent_request = mock.call_args[0][0]
        # access_token defaults to "" in the model when not explicitly passed
        assert sent_request.access_token == ""
        assert sent_request.order_id == "order_123"

    async def test_forwards_access_token_when_provided(self, client: KaleidoClient) -> None:
        """When access_token is set on options, it lands in the request body."""
        from kaleido_sdk import SwapCompletionOptions
        from kaleido_sdk._generated.api_types import (
            SwapOrder,
            SwapOrderStatus,
            SwapOrderStatusResponse,
        )

        maker = client.maker
        fake_order = SwapOrder.model_construct(
            id="order_456",
            status=SwapOrderStatus.FILLED,
        )
        fake_response = SwapOrderStatusResponse.model_construct(order=fake_order)

        with patch.object(maker, "get_swap_order_status", new_callable=AsyncMock) as mock:
            mock.return_value = fake_response
            await maker.wait_for_swap_completion(
                "order_456",
                SwapCompletionOptions(
                    timeout=5.0,
                    poll_interval=0.01,
                    access_token="tok_authenticated_user",
                ),
            )

        sent_request = mock.call_args[0][0]
        assert sent_request.access_token == "tok_authenticated_user"
        assert sent_request.order_id == "order_456"

    async def test_treats_canonical_swap_completion_intervals_as_seconds(
        self, client: KaleidoClient
    ) -> None:
        from kaleido_sdk import SwapCompletionOptions
        from kaleido_sdk._generated.api_types import (
            SwapOrder,
            SwapOrderStatus,
            SwapOrderStatusResponse,
        )

        maker = client.maker
        pending_response = SwapOrderStatusResponse.model_construct(
            order=SwapOrder.model_construct(id="o-seconds", status=SwapOrderStatus.OPEN)
        )
        filled_response = SwapOrderStatusResponse.model_construct(
            order=SwapOrder.model_construct(id="o-seconds", status=SwapOrderStatus.FILLED)
        )

        with (
            patch.object(maker, "get_swap_order_status", new_callable=AsyncMock) as status,
            patch("kaleido_sdk._maker_client.asyncio.sleep", new_callable=AsyncMock) as sleep,
        ):
            status.side_effect = [pending_response, filled_response]
            result = await maker.wait_for_swap_completion(
                "o-seconds",
                SwapCompletionOptions(timeout=5.0, poll_interval=2.0),
            )

        assert result.id == "o-seconds"
        sleep.assert_awaited_once_with(2.0)
