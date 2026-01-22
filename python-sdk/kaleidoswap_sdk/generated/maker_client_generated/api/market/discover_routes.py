from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.routes_request import RoutesRequest
from ...models.routes_response import RoutesResponse
from ...types import Response


def _get_kwargs(
    *,
    body: RoutesRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/api/v1/market/routes",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> HTTPValidationError | RoutesResponse | None:
    if response.status_code == 200:
        response_200 = RoutesResponse.from_dict(response.json())

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
) -> Response[HTTPValidationError | RoutesResponse]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: RoutesRequest,
) -> Response[HTTPValidationError | RoutesResponse]:
    """Discover Routes

     Discover all possible routes from source to destination.

    Supports multi-hop routing up to max_hops (default: 2).

    Request body:
    - from_asset: Source asset ticker (required)
    - from_layer: Filter by source layer (optional)
    - to_asset: Destination asset ticker (if None, returns all reachable assets)
    - to_layer: Filter by destination layer (optional)
    - max_hops: Maximum number of hops (1-5, default: 2)

    Returns list of routes, each with:
    - steps: List of RouteStep objects with asset, layer, and indicative price
    - total_hops: Number of hops in the route

    Args:
        body (RoutesRequest): Request for route discovery.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, RoutesResponse]]
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
    body: RoutesRequest,
) -> HTTPValidationError | RoutesResponse | None:
    """Discover Routes

     Discover all possible routes from source to destination.

    Supports multi-hop routing up to max_hops (default: 2).

    Request body:
    - from_asset: Source asset ticker (required)
    - from_layer: Filter by source layer (optional)
    - to_asset: Destination asset ticker (if None, returns all reachable assets)
    - to_layer: Filter by destination layer (optional)
    - max_hops: Maximum number of hops (1-5, default: 2)

    Returns list of routes, each with:
    - steps: List of RouteStep objects with asset, layer, and indicative price
    - total_hops: Number of hops in the route

    Args:
        body (RoutesRequest): Request for route discovery.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, RoutesResponse]
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: RoutesRequest,
) -> Response[HTTPValidationError | RoutesResponse]:
    """Discover Routes

     Discover all possible routes from source to destination.

    Supports multi-hop routing up to max_hops (default: 2).

    Request body:
    - from_asset: Source asset ticker (required)
    - from_layer: Filter by source layer (optional)
    - to_asset: Destination asset ticker (if None, returns all reachable assets)
    - to_layer: Filter by destination layer (optional)
    - max_hops: Maximum number of hops (1-5, default: 2)

    Returns list of routes, each with:
    - steps: List of RouteStep objects with asset, layer, and indicative price
    - total_hops: Number of hops in the route

    Args:
        body (RoutesRequest): Request for route discovery.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, RoutesResponse]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: RoutesRequest,
) -> HTTPValidationError | RoutesResponse | None:
    """Discover Routes

     Discover all possible routes from source to destination.

    Supports multi-hop routing up to max_hops (default: 2).

    Request body:
    - from_asset: Source asset ticker (required)
    - from_layer: Filter by source layer (optional)
    - to_asset: Destination asset ticker (if None, returns all reachable assets)
    - to_layer: Filter by destination layer (optional)
    - max_hops: Maximum number of hops (1-5, default: 2)

    Returns list of routes, each with:
    - steps: List of RouteStep objects with asset, layer, and indicative price
    - total_hops: Number of hops in the route

    Args:
        body (RoutesRequest): Request for route discovery.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, RoutesResponse]
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
