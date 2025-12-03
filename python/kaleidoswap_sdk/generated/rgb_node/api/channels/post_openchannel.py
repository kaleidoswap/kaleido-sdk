from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.open_channel_request import OpenChannelRequest
from ...models.open_channel_response import OpenChannelResponse
from ...types import Response


def _get_kwargs(
    *,
    body: OpenChannelRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/openchannel",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> OpenChannelResponse | None:
    if response.status_code == 200:
        response_200 = OpenChannelResponse.from_dict(response.json())

        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[OpenChannelResponse]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: OpenChannelRequest,
) -> Response[OpenChannelResponse]:
    """Open a channel

     Open a new LN channel (RGB-enabled when both asset_id and asset_amount are specified). You can
    optionally provide a 32 bytes temporary channel ID as a hex-encoded string.

    Args:
        body (OpenChannelRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[OpenChannelResponse]
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
    body: OpenChannelRequest,
) -> OpenChannelResponse | None:
    """Open a channel

     Open a new LN channel (RGB-enabled when both asset_id and asset_amount are specified). You can
    optionally provide a 32 bytes temporary channel ID as a hex-encoded string.

    Args:
        body (OpenChannelRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        OpenChannelResponse
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: OpenChannelRequest,
) -> Response[OpenChannelResponse]:
    """Open a channel

     Open a new LN channel (RGB-enabled when both asset_id and asset_amount are specified). You can
    optionally provide a 32 bytes temporary channel ID as a hex-encoded string.

    Args:
        body (OpenChannelRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[OpenChannelResponse]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: OpenChannelRequest,
) -> OpenChannelResponse | None:
    """Open a channel

     Open a new LN channel (RGB-enabled when both asset_id and asset_amount are specified). You can
    optionally provide a 32 bytes temporary channel ID as a hex-encoded string.

    Args:
        body (OpenChannelRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        OpenChannelResponse
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
