"""
Unit tests for ``kaleido_sdk._maker_client.MakerClient``.

Counterpart of ``typescript-sdk/tests/unit/maker-client.test.ts``.
"""

from unittest.mock import AsyncMock, patch

from kaleido_sdk import KaleidoClient


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
