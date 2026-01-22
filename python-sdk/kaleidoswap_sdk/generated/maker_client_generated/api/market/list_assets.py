from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.assets_response import AssetsResponse
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    asset_id: None | Unset | str = UNSET,
    ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    network: None | Unset | str = UNSET,
    protocol: None | Unset | str = UNSET,
    is_active: None | Unset | bool = UNSET,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> dict[str, Any]:
    params: dict[str, Any] = {}

    json_asset_id: None | Unset | str
    if isinstance(asset_id, Unset):
        json_asset_id = UNSET
    else:
        json_asset_id = asset_id
    params["asset_id"] = json_asset_id

    json_ticker: None | Unset | str
    if isinstance(ticker, Unset):
        json_ticker = UNSET
    else:
        json_ticker = ticker
    params["ticker"] = json_ticker

    json_layer: None | Unset | str
    if isinstance(layer, Unset):
        json_layer = UNSET
    else:
        json_layer = layer
    params["layer"] = json_layer

    json_network: None | Unset | str
    if isinstance(network, Unset):
        json_network = UNSET
    else:
        json_network = network
    params["network"] = json_network

    json_protocol: None | Unset | str
    if isinstance(protocol, Unset):
        json_protocol = UNSET
    else:
        json_protocol = protocol
    params["protocol"] = json_protocol

    json_is_active: None | Unset | bool
    if isinstance(is_active, Unset):
        json_is_active = UNSET
    else:
        json_is_active = is_active
    params["is_active"] = json_is_active

    params["limit"] = limit

    params["offset"] = offset

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/api/v1/market/assets",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> AssetsResponse | HTTPValidationError | None:
    if response.status_code == 200:
        response_200 = AssetsResponse.from_dict(response.json())

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
) -> Response[AssetsResponse | HTTPValidationError]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    asset_id: None | Unset | str = UNSET,
    ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    network: None | Unset | str = UNSET,
    protocol: None | Unset | str = UNSET,
    is_active: None | Unset | bool = UNSET,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> Response[AssetsResponse | HTTPValidationError]:
    """List Assets

     List assets with optional filters and pagination.

    All filters are AND-combined. Examples:
    - GET /assets                           → All active assets (paginated)
    - GET /assets?asset_id=rgb:2dkSTbr-...  → Single asset by ID
    - GET /assets?ticker=BTC                → Single asset by ticker
    - GET /assets?layer=BTC_LN              → Assets supporting BTC on Lightning
    - GET /assets?network=LN                → Assets on Lightning Network
    - GET /assets?protocol=RGB              → All RGB assets
    - GET /assets?is_active=true            → Only active assets (default behavior)
    - GET /assets?protocol=RGB&network=LN   → RGB assets on Lightning
    - GET /assets?limit=10&offset=20        → Pagination (page 3, 10 items per page)

    Args:
        asset_id (Union[None, Unset, str]): Filter by asset UUID (e.g., 'rgb:2dkSTbr-...')
        ticker (Union[None, Unset, str]): Filter by ticker (e.g., 'BTC', 'USDT')
        layer (Union[None, Unset, str]): Filter by layer (e.g., 'BTC_LN', 'RGB_L1')
        network (Union[None, Unset, str]): Filter by network (e.g., 'LN', 'L1')
        protocol (Union[None, Unset, str]): Filter by protocol (e.g., 'BTC', 'RGB')
        is_active (Union[None, Unset, bool]): Filter by active status
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[AssetsResponse, HTTPValidationError]]
    """

    kwargs = _get_kwargs(
        asset_id=asset_id,
        ticker=ticker,
        layer=layer,
        network=network,
        protocol=protocol,
        is_active=is_active,
        limit=limit,
        offset=offset,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient | Client,
    asset_id: None | Unset | str = UNSET,
    ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    network: None | Unset | str = UNSET,
    protocol: None | Unset | str = UNSET,
    is_active: None | Unset | bool = UNSET,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> AssetsResponse | HTTPValidationError | None:
    """List Assets

     List assets with optional filters and pagination.

    All filters are AND-combined. Examples:
    - GET /assets                           → All active assets (paginated)
    - GET /assets?asset_id=rgb:2dkSTbr-...  → Single asset by ID
    - GET /assets?ticker=BTC                → Single asset by ticker
    - GET /assets?layer=BTC_LN              → Assets supporting BTC on Lightning
    - GET /assets?network=LN                → Assets on Lightning Network
    - GET /assets?protocol=RGB              → All RGB assets
    - GET /assets?is_active=true            → Only active assets (default behavior)
    - GET /assets?protocol=RGB&network=LN   → RGB assets on Lightning
    - GET /assets?limit=10&offset=20        → Pagination (page 3, 10 items per page)

    Args:
        asset_id (Union[None, Unset, str]): Filter by asset UUID (e.g., 'rgb:2dkSTbr-...')
        ticker (Union[None, Unset, str]): Filter by ticker (e.g., 'BTC', 'USDT')
        layer (Union[None, Unset, str]): Filter by layer (e.g., 'BTC_LN', 'RGB_L1')
        network (Union[None, Unset, str]): Filter by network (e.g., 'LN', 'L1')
        protocol (Union[None, Unset, str]): Filter by protocol (e.g., 'BTC', 'RGB')
        is_active (Union[None, Unset, bool]): Filter by active status
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[AssetsResponse, HTTPValidationError]
    """

    return sync_detailed(
        client=client,
        asset_id=asset_id,
        ticker=ticker,
        layer=layer,
        network=network,
        protocol=protocol,
        is_active=is_active,
        limit=limit,
        offset=offset,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    asset_id: None | Unset | str = UNSET,
    ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    network: None | Unset | str = UNSET,
    protocol: None | Unset | str = UNSET,
    is_active: None | Unset | bool = UNSET,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> Response[AssetsResponse | HTTPValidationError]:
    """List Assets

     List assets with optional filters and pagination.

    All filters are AND-combined. Examples:
    - GET /assets                           → All active assets (paginated)
    - GET /assets?asset_id=rgb:2dkSTbr-...  → Single asset by ID
    - GET /assets?ticker=BTC                → Single asset by ticker
    - GET /assets?layer=BTC_LN              → Assets supporting BTC on Lightning
    - GET /assets?network=LN                → Assets on Lightning Network
    - GET /assets?protocol=RGB              → All RGB assets
    - GET /assets?is_active=true            → Only active assets (default behavior)
    - GET /assets?protocol=RGB&network=LN   → RGB assets on Lightning
    - GET /assets?limit=10&offset=20        → Pagination (page 3, 10 items per page)

    Args:
        asset_id (Union[None, Unset, str]): Filter by asset UUID (e.g., 'rgb:2dkSTbr-...')
        ticker (Union[None, Unset, str]): Filter by ticker (e.g., 'BTC', 'USDT')
        layer (Union[None, Unset, str]): Filter by layer (e.g., 'BTC_LN', 'RGB_L1')
        network (Union[None, Unset, str]): Filter by network (e.g., 'LN', 'L1')
        protocol (Union[None, Unset, str]): Filter by protocol (e.g., 'BTC', 'RGB')
        is_active (Union[None, Unset, bool]): Filter by active status
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[AssetsResponse, HTTPValidationError]]
    """

    kwargs = _get_kwargs(
        asset_id=asset_id,
        ticker=ticker,
        layer=layer,
        network=network,
        protocol=protocol,
        is_active=is_active,
        limit=limit,
        offset=offset,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    asset_id: None | Unset | str = UNSET,
    ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    network: None | Unset | str = UNSET,
    protocol: None | Unset | str = UNSET,
    is_active: None | Unset | bool = UNSET,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> AssetsResponse | HTTPValidationError | None:
    """List Assets

     List assets with optional filters and pagination.

    All filters are AND-combined. Examples:
    - GET /assets                           → All active assets (paginated)
    - GET /assets?asset_id=rgb:2dkSTbr-...  → Single asset by ID
    - GET /assets?ticker=BTC                → Single asset by ticker
    - GET /assets?layer=BTC_LN              → Assets supporting BTC on Lightning
    - GET /assets?network=LN                → Assets on Lightning Network
    - GET /assets?protocol=RGB              → All RGB assets
    - GET /assets?is_active=true            → Only active assets (default behavior)
    - GET /assets?protocol=RGB&network=LN   → RGB assets on Lightning
    - GET /assets?limit=10&offset=20        → Pagination (page 3, 10 items per page)

    Args:
        asset_id (Union[None, Unset, str]): Filter by asset UUID (e.g., 'rgb:2dkSTbr-...')
        ticker (Union[None, Unset, str]): Filter by ticker (e.g., 'BTC', 'USDT')
        layer (Union[None, Unset, str]): Filter by layer (e.g., 'BTC_LN', 'RGB_L1')
        network (Union[None, Unset, str]): Filter by network (e.g., 'LN', 'L1')
        protocol (Union[None, Unset, str]): Filter by protocol (e.g., 'BTC', 'RGB')
        is_active (Union[None, Unset, bool]): Filter by active status
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[AssetsResponse, HTTPValidationError]
    """

    return (
        await asyncio_detailed(
            client=client,
            asset_id=asset_id,
            ticker=ticker,
            layer=layer,
            network=network,
            protocol=protocol,
            is_active=is_active,
            limit=limit,
            offset=offset,
        )
    ).parsed
