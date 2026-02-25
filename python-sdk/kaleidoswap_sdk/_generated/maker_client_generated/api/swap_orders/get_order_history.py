from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.order_history_response import OrderHistoryResponse
from ...models.swap_order_status import SwapOrderStatus
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    status: None | SwapOrderStatus | Unset = UNSET,
    limit: Unset | int = 50,
    skip: Unset | int = 0,
) -> dict[str, Any]:
    params: dict[str, Any] = {}

    json_status: None | Unset | str
    if isinstance(status, Unset):
        json_status = UNSET
    elif isinstance(status, SwapOrderStatus):
        json_status = status.value
    else:
        json_status = status
    params["status"] = json_status

    params["limit"] = limit

    params["skip"] = skip

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/api/v1/swaps/orders/history",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> HTTPValidationError | OrderHistoryResponse | None:
    if response.status_code == 200:
        response_200 = OrderHistoryResponse.from_dict(response.json())

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
) -> Response[HTTPValidationError | OrderHistoryResponse]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    status: None | SwapOrderStatus | Unset = UNSET,
    limit: Unset | int = 50,
    skip: Unset | int = 0,
) -> Response[HTTPValidationError | OrderHistoryResponse]:
    """Get Order History

     Get order history with optional status filtering and pagination

    Args:
        status (Union[None, SwapOrderStatus, Unset]):
        limit (Union[Unset, int]):  Default: 50.
        skip (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, OrderHistoryResponse]]
    """

    kwargs = _get_kwargs(
        status=status,
        limit=limit,
        skip=skip,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient | Client,
    status: None | SwapOrderStatus | Unset = UNSET,
    limit: Unset | int = 50,
    skip: Unset | int = 0,
) -> HTTPValidationError | OrderHistoryResponse | None:
    """Get Order History

     Get order history with optional status filtering and pagination

    Args:
        status (Union[None, SwapOrderStatus, Unset]):
        limit (Union[Unset, int]):  Default: 50.
        skip (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, OrderHistoryResponse]
    """

    return sync_detailed(
        client=client,
        status=status,
        limit=limit,
        skip=skip,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    status: None | SwapOrderStatus | Unset = UNSET,
    limit: Unset | int = 50,
    skip: Unset | int = 0,
) -> Response[HTTPValidationError | OrderHistoryResponse]:
    """Get Order History

     Get order history with optional status filtering and pagination

    Args:
        status (Union[None, SwapOrderStatus, Unset]):
        limit (Union[Unset, int]):  Default: 50.
        skip (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, OrderHistoryResponse]]
    """

    kwargs = _get_kwargs(
        status=status,
        limit=limit,
        skip=skip,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    status: None | SwapOrderStatus | Unset = UNSET,
    limit: Unset | int = 50,
    skip: Unset | int = 0,
) -> HTTPValidationError | OrderHistoryResponse | None:
    """Get Order History

     Get order history with optional status filtering and pagination

    Args:
        status (Union[None, SwapOrderStatus, Unset]):
        limit (Union[Unset, int]):  Default: 50.
        skip (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, OrderHistoryResponse]
    """

    return (
        await asyncio_detailed(
            client=client,
            status=status,
            limit=limit,
            skip=skip,
        )
    ).parsed
