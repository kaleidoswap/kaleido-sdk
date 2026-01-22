from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.pair_quote_request import PairQuoteRequest
from ...models.pair_quote_response import PairQuoteResponse
from ...types import Response


def _get_kwargs(
    *,
    body: PairQuoteRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/api/v1/market/quote",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> HTTPValidationError | PairQuoteResponse | None:
    if response.status_code == 200:
        response_200 = PairQuoteResponse.from_dict(response.json())

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
) -> Response[HTTPValidationError | PairQuoteResponse]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: PairQuoteRequest,
) -> Response[HTTPValidationError | PairQuoteResponse]:
    """Get Quote

     Get a quote for a swap between two assets.

    Request body contains SwapLegInput for both from_asset and to_asset,
    specifying asset_id, layer, and amount (on one side).

    Returns a quote with full SwapLeg details including:
    - Complete asset information (ticker, name, precision)
    - Layer configuration
    - Calculated amounts and fees
    - Submarine swap indicator (if same asset on different networks)

    Args:
        body (PairQuoteRequest): Request for a quote on a trading pair using SwapLegInput.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, PairQuoteResponse]]
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
    body: PairQuoteRequest,
) -> HTTPValidationError | PairQuoteResponse | None:
    """Get Quote

     Get a quote for a swap between two assets.

    Request body contains SwapLegInput for both from_asset and to_asset,
    specifying asset_id, layer, and amount (on one side).

    Returns a quote with full SwapLeg details including:
    - Complete asset information (ticker, name, precision)
    - Layer configuration
    - Calculated amounts and fees
    - Submarine swap indicator (if same asset on different networks)

    Args:
        body (PairQuoteRequest): Request for a quote on a trading pair using SwapLegInput.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, PairQuoteResponse]
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: PairQuoteRequest,
) -> Response[HTTPValidationError | PairQuoteResponse]:
    """Get Quote

     Get a quote for a swap between two assets.

    Request body contains SwapLegInput for both from_asset and to_asset,
    specifying asset_id, layer, and amount (on one side).

    Returns a quote with full SwapLeg details including:
    - Complete asset information (ticker, name, precision)
    - Layer configuration
    - Calculated amounts and fees
    - Submarine swap indicator (if same asset on different networks)

    Args:
        body (PairQuoteRequest): Request for a quote on a trading pair using SwapLegInput.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, PairQuoteResponse]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: PairQuoteRequest,
) -> HTTPValidationError | PairQuoteResponse | None:
    """Get Quote

     Get a quote for a swap between two assets.

    Request body contains SwapLegInput for both from_asset and to_asset,
    specifying asset_id, layer, and amount (on one side).

    Returns a quote with full SwapLeg details including:
    - Complete asset information (ticker, name, precision)
    - Layer configuration
    - Calculated amounts and fees
    - Submarine swap indicator (if same asset on different networks)

    Args:
        body (PairQuoteRequest): Request for a quote on a trading pair using SwapLegInput.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, PairQuoteResponse]
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
