from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.body import Body
from ...models.http_validation_error import HTTPValidationError
from ...models.swap_route import SwapRoute
from ...types import Response


def _get_kwargs(
    *,
    body: Body,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/api/v1/market/pairs/routes",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> HTTPValidationError | list["SwapRoute"] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = SwapRoute.from_dict(response_200_item_data)

            response_200.append(response_200_item)

        return response_200

    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())

        return response_422

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[HTTPValidationError | list["SwapRoute"]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: Body,
) -> Response[HTTPValidationError | list["SwapRoute"]]:
    r"""Get Pair Routes

     Get available swap routes for a trading pair.

    Supports multiple identification methods:
    1. By pair_id: {\"pair_id\": \"2c188c7b-a823-4e5b-a82f-4d9fcb5e80ba\"}
    2. By asset IDs: {\"from_asset_id\": \"BTC\", \"quote_asset_id\": \"rgb:...\"}
    3. By pair ticker: {\"pair_ticker\": \"BTC/USDT\"}
    4. By separate tickers: {\"base_ticker\": \"BTC\", \"quote_ticker\": \"USDT\"}

    Exactly one identification method must be provided.

    Returns list of pre-computed routes with:
    - Source network and protocol
    - Destination network and protocol
    - Submarine swap indicator (same asset, different networks)

    Args:
        body (Body):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['SwapRoute']]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient | Client,
    body: Body,
) -> HTTPValidationError | list["SwapRoute"] | None:
    r"""Get Pair Routes

     Get available swap routes for a trading pair.

    Supports multiple identification methods:
    1. By pair_id: {\"pair_id\": \"2c188c7b-a823-4e5b-a82f-4d9fcb5e80ba\"}
    2. By asset IDs: {\"from_asset_id\": \"BTC\", \"quote_asset_id\": \"rgb:...\"}
    3. By pair ticker: {\"pair_ticker\": \"BTC/USDT\"}
    4. By separate tickers: {\"base_ticker\": \"BTC\", \"quote_ticker\": \"USDT\"}

    Exactly one identification method must be provided.

    Returns list of pre-computed routes with:
    - Source network and protocol
    - Destination network and protocol
    - Submarine swap indicator (same asset, different networks)

    Args:
        body (Body):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['SwapRoute']]
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: Body,
) -> Response[HTTPValidationError | list["SwapRoute"]]:
    r"""Get Pair Routes

     Get available swap routes for a trading pair.

    Supports multiple identification methods:
    1. By pair_id: {\"pair_id\": \"2c188c7b-a823-4e5b-a82f-4d9fcb5e80ba\"}
    2. By asset IDs: {\"from_asset_id\": \"BTC\", \"quote_asset_id\": \"rgb:...\"}
    3. By pair ticker: {\"pair_ticker\": \"BTC/USDT\"}
    4. By separate tickers: {\"base_ticker\": \"BTC\", \"quote_ticker\": \"USDT\"}

    Exactly one identification method must be provided.

    Returns list of pre-computed routes with:
    - Source network and protocol
    - Destination network and protocol
    - Submarine swap indicator (same asset, different networks)

    Args:
        body (Body):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['SwapRoute']]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: Body,
) -> HTTPValidationError | list["SwapRoute"] | None:
    r"""Get Pair Routes

     Get available swap routes for a trading pair.

    Supports multiple identification methods:
    1. By pair_id: {\"pair_id\": \"2c188c7b-a823-4e5b-a82f-4d9fcb5e80ba\"}
    2. By asset IDs: {\"from_asset_id\": \"BTC\", \"quote_asset_id\": \"rgb:...\"}
    3. By pair ticker: {\"pair_ticker\": \"BTC/USDT\"}
    4. By separate tickers: {\"base_ticker\": \"BTC\", \"quote_ticker\": \"USDT\"}

    Exactly one identification method must be provided.

    Returns list of pre-computed routes with:
    - Source network and protocol
    - Destination network and protocol
    - Submarine swap indicator (same asset, different networks)

    Args:
        body (Body):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['SwapRoute']]
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
