from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    pair_id: None | Unset | str = UNSET,
    from_asset_id: None | Unset | str = UNSET,
    quote_asset_id: None | Unset | str = UNSET,
    pair_ticker: None | Unset | str = UNSET,
    base_ticker: None | Unset | str = UNSET,
    quote_ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    asset: None | Unset | str = UNSET,
    active_only: Unset | bool = True,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> dict[str, Any]:
    params: dict[str, Any] = {}

    json_pair_id: None | Unset | str
    if isinstance(pair_id, Unset):
        json_pair_id = UNSET
    else:
        json_pair_id = pair_id
    params["pair_id"] = json_pair_id

    json_from_asset_id: None | Unset | str
    if isinstance(from_asset_id, Unset):
        json_from_asset_id = UNSET
    else:
        json_from_asset_id = from_asset_id
    params["from_asset_id"] = json_from_asset_id

    json_quote_asset_id: None | Unset | str
    if isinstance(quote_asset_id, Unset):
        json_quote_asset_id = UNSET
    else:
        json_quote_asset_id = quote_asset_id
    params["quote_asset_id"] = json_quote_asset_id

    json_pair_ticker: None | Unset | str
    if isinstance(pair_ticker, Unset):
        json_pair_ticker = UNSET
    else:
        json_pair_ticker = pair_ticker
    params["pair_ticker"] = json_pair_ticker

    json_base_ticker: None | Unset | str
    if isinstance(base_ticker, Unset):
        json_base_ticker = UNSET
    else:
        json_base_ticker = base_ticker
    params["base_ticker"] = json_base_ticker

    json_quote_ticker: None | Unset | str
    if isinstance(quote_ticker, Unset):
        json_quote_ticker = UNSET
    else:
        json_quote_ticker = quote_ticker
    params["quote_ticker"] = json_quote_ticker

    json_layer: None | Unset | str
    if isinstance(layer, Unset):
        json_layer = UNSET
    else:
        json_layer = layer
    params["layer"] = json_layer

    json_asset: None | Unset | str
    if isinstance(asset, Unset):
        json_asset = UNSET
    else:
        json_asset = asset
    params["asset"] = json_asset

    params["active_only"] = active_only

    params["limit"] = limit

    params["offset"] = offset

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/api/v1/market/pairs",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> HTTPValidationError | None:
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())

        return response_422

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[HTTPValidationError]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    pair_id: None | Unset | str = UNSET,
    from_asset_id: None | Unset | str = UNSET,
    quote_asset_id: None | Unset | str = UNSET,
    pair_ticker: None | Unset | str = UNSET,
    base_ticker: None | Unset | str = UNSET,
    quote_ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    asset: None | Unset | str = UNSET,
    active_only: Unset | bool = True,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> Response[HTTPValidationError]:
    r"""Get Pairs

     Get trading pairs with optional filters and pagination.

    **Single Pair Filters** (returns list with 0-1 items):
    - pair_id: Filter by pair UUID
    - pair_ticker: Filter by pair ticker (e.g., \"BTC/USDT\")
    - base_ticker + quote_ticker: Filter by asset tickers
    - from_asset_id + quote_asset_id: Filter by asset IDs

    **List Filters**:
    - layer: Filter by layer (e.g., BTC_LN, RGB_LN)
    - asset: Filter by asset ticker or ID
    - active_only: Only return active pairs (default: true)

    **Pagination**:
    - limit: Items per page (default: 50, max: 100)
    - offset: Offset for pagination (default: 0)

    Always returns TradingPairsResponse with pagination metadata.

    Args:
        pair_id (Union[None, Unset, str]): Pair ID (UUID)
        from_asset_id (Union[None, Unset, str]): Base asset ID
        quote_asset_id (Union[None, Unset, str]): Quote asset ID
        pair_ticker (Union[None, Unset, str]): Pair ticker 'BASE/QUOTE'
        base_ticker (Union[None, Unset, str]): Base asset ticker
        quote_ticker (Union[None, Unset, str]): Quote asset ticker
        layer (Union[None, Unset, str]): Filter by layer (e.g., BTC_LN, RGB_LN, BTC_L1)
        asset (Union[None, Unset, str]): Filter by asset ticker or ID
        active_only (Union[Unset, bool]): Only return active pairs Default: True.
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[HTTPValidationError]
    """

    kwargs = _get_kwargs(
        pair_id=pair_id,
        from_asset_id=from_asset_id,
        quote_asset_id=quote_asset_id,
        pair_ticker=pair_ticker,
        base_ticker=base_ticker,
        quote_ticker=quote_ticker,
        layer=layer,
        asset=asset,
        active_only=active_only,
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
    pair_id: None | Unset | str = UNSET,
    from_asset_id: None | Unset | str = UNSET,
    quote_asset_id: None | Unset | str = UNSET,
    pair_ticker: None | Unset | str = UNSET,
    base_ticker: None | Unset | str = UNSET,
    quote_ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    asset: None | Unset | str = UNSET,
    active_only: Unset | bool = True,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> HTTPValidationError | None:
    r"""Get Pairs

     Get trading pairs with optional filters and pagination.

    **Single Pair Filters** (returns list with 0-1 items):
    - pair_id: Filter by pair UUID
    - pair_ticker: Filter by pair ticker (e.g., \"BTC/USDT\")
    - base_ticker + quote_ticker: Filter by asset tickers
    - from_asset_id + quote_asset_id: Filter by asset IDs

    **List Filters**:
    - layer: Filter by layer (e.g., BTC_LN, RGB_LN)
    - asset: Filter by asset ticker or ID
    - active_only: Only return active pairs (default: true)

    **Pagination**:
    - limit: Items per page (default: 50, max: 100)
    - offset: Offset for pagination (default: 0)

    Always returns TradingPairsResponse with pagination metadata.

    Args:
        pair_id (Union[None, Unset, str]): Pair ID (UUID)
        from_asset_id (Union[None, Unset, str]): Base asset ID
        quote_asset_id (Union[None, Unset, str]): Quote asset ID
        pair_ticker (Union[None, Unset, str]): Pair ticker 'BASE/QUOTE'
        base_ticker (Union[None, Unset, str]): Base asset ticker
        quote_ticker (Union[None, Unset, str]): Quote asset ticker
        layer (Union[None, Unset, str]): Filter by layer (e.g., BTC_LN, RGB_LN, BTC_L1)
        asset (Union[None, Unset, str]): Filter by asset ticker or ID
        active_only (Union[Unset, bool]): Only return active pairs Default: True.
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        HTTPValidationError
    """

    return sync_detailed(
        client=client,
        pair_id=pair_id,
        from_asset_id=from_asset_id,
        quote_asset_id=quote_asset_id,
        pair_ticker=pair_ticker,
        base_ticker=base_ticker,
        quote_ticker=quote_ticker,
        layer=layer,
        asset=asset,
        active_only=active_only,
        limit=limit,
        offset=offset,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    pair_id: None | Unset | str = UNSET,
    from_asset_id: None | Unset | str = UNSET,
    quote_asset_id: None | Unset | str = UNSET,
    pair_ticker: None | Unset | str = UNSET,
    base_ticker: None | Unset | str = UNSET,
    quote_ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    asset: None | Unset | str = UNSET,
    active_only: Unset | bool = True,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> Response[HTTPValidationError]:
    r"""Get Pairs

     Get trading pairs with optional filters and pagination.

    **Single Pair Filters** (returns list with 0-1 items):
    - pair_id: Filter by pair UUID
    - pair_ticker: Filter by pair ticker (e.g., \"BTC/USDT\")
    - base_ticker + quote_ticker: Filter by asset tickers
    - from_asset_id + quote_asset_id: Filter by asset IDs

    **List Filters**:
    - layer: Filter by layer (e.g., BTC_LN, RGB_LN)
    - asset: Filter by asset ticker or ID
    - active_only: Only return active pairs (default: true)

    **Pagination**:
    - limit: Items per page (default: 50, max: 100)
    - offset: Offset for pagination (default: 0)

    Always returns TradingPairsResponse with pagination metadata.

    Args:
        pair_id (Union[None, Unset, str]): Pair ID (UUID)
        from_asset_id (Union[None, Unset, str]): Base asset ID
        quote_asset_id (Union[None, Unset, str]): Quote asset ID
        pair_ticker (Union[None, Unset, str]): Pair ticker 'BASE/QUOTE'
        base_ticker (Union[None, Unset, str]): Base asset ticker
        quote_ticker (Union[None, Unset, str]): Quote asset ticker
        layer (Union[None, Unset, str]): Filter by layer (e.g., BTC_LN, RGB_LN, BTC_L1)
        asset (Union[None, Unset, str]): Filter by asset ticker or ID
        active_only (Union[Unset, bool]): Only return active pairs Default: True.
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[HTTPValidationError]
    """

    kwargs = _get_kwargs(
        pair_id=pair_id,
        from_asset_id=from_asset_id,
        quote_asset_id=quote_asset_id,
        pair_ticker=pair_ticker,
        base_ticker=base_ticker,
        quote_ticker=quote_ticker,
        layer=layer,
        asset=asset,
        active_only=active_only,
        limit=limit,
        offset=offset,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    pair_id: None | Unset | str = UNSET,
    from_asset_id: None | Unset | str = UNSET,
    quote_asset_id: None | Unset | str = UNSET,
    pair_ticker: None | Unset | str = UNSET,
    base_ticker: None | Unset | str = UNSET,
    quote_ticker: None | Unset | str = UNSET,
    layer: None | Unset | str = UNSET,
    asset: None | Unset | str = UNSET,
    active_only: Unset | bool = True,
    limit: Unset | int = 50,
    offset: Unset | int = 0,
) -> HTTPValidationError | None:
    r"""Get Pairs

     Get trading pairs with optional filters and pagination.

    **Single Pair Filters** (returns list with 0-1 items):
    - pair_id: Filter by pair UUID
    - pair_ticker: Filter by pair ticker (e.g., \"BTC/USDT\")
    - base_ticker + quote_ticker: Filter by asset tickers
    - from_asset_id + quote_asset_id: Filter by asset IDs

    **List Filters**:
    - layer: Filter by layer (e.g., BTC_LN, RGB_LN)
    - asset: Filter by asset ticker or ID
    - active_only: Only return active pairs (default: true)

    **Pagination**:
    - limit: Items per page (default: 50, max: 100)
    - offset: Offset for pagination (default: 0)

    Always returns TradingPairsResponse with pagination metadata.

    Args:
        pair_id (Union[None, Unset, str]): Pair ID (UUID)
        from_asset_id (Union[None, Unset, str]): Base asset ID
        quote_asset_id (Union[None, Unset, str]): Quote asset ID
        pair_ticker (Union[None, Unset, str]): Pair ticker 'BASE/QUOTE'
        base_ticker (Union[None, Unset, str]): Base asset ticker
        quote_ticker (Union[None, Unset, str]): Quote asset ticker
        layer (Union[None, Unset, str]): Filter by layer (e.g., BTC_LN, RGB_LN, BTC_L1)
        asset (Union[None, Unset, str]): Filter by asset ticker or ID
        active_only (Union[Unset, bool]): Only return active pairs Default: True.
        limit (Union[Unset, int]): Items per page (max 100) Default: 50.
        offset (Union[Unset, int]): Offset for pagination Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        HTTPValidationError
    """

    return (
        await asyncio_detailed(
            client=client,
            pair_id=pair_id,
            from_asset_id=from_asset_id,
            quote_asset_id=quote_asset_id,
            pair_ticker=pair_ticker,
            base_ticker=base_ticker,
            quote_ticker=quote_ticker,
            layer=layer,
            asset=asset,
            active_only=active_only,
            limit=limit,
            offset=offset,
        )
    ).parsed
