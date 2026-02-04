from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.decode_rgb_invoice_request import DecodeRGBInvoiceRequest
from ...models.decode_rgb_invoice_response import DecodeRGBInvoiceResponse
from ...types import Response


def _get_kwargs(
    *,
    body: DecodeRGBInvoiceRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/decodergbinvoice",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> DecodeRGBInvoiceResponse | None:
    if response.status_code == 200:
        response_200 = DecodeRGBInvoiceResponse.from_dict(response.json())

        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[DecodeRGBInvoiceResponse]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: DecodeRGBInvoiceRequest,
) -> Response[DecodeRGBInvoiceResponse]:
    """Decode an RGB invoice

     Decode the provided RGB invoice string

    Args:
        body (DecodeRGBInvoiceRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[DecodeRGBInvoiceResponse]
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
    body: DecodeRGBInvoiceRequest,
) -> DecodeRGBInvoiceResponse | None:
    """Decode an RGB invoice

     Decode the provided RGB invoice string

    Args:
        body (DecodeRGBInvoiceRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        DecodeRGBInvoiceResponse
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: DecodeRGBInvoiceRequest,
) -> Response[DecodeRGBInvoiceResponse]:
    """Decode an RGB invoice

     Decode the provided RGB invoice string

    Args:
        body (DecodeRGBInvoiceRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[DecodeRGBInvoiceResponse]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: DecodeRGBInvoiceRequest,
) -> DecodeRGBInvoiceResponse | None:
    """Decode an RGB invoice

     Decode the provided RGB invoice string

    Args:
        body (DecodeRGBInvoiceRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        DecodeRGBInvoiceResponse
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
