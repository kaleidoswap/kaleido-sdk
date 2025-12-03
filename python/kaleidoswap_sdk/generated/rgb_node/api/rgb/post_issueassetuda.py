from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.issue_asset_uda_request import IssueAssetUDARequest
from ...models.issue_asset_uda_response import IssueAssetUDAResponse
from ...types import Response


def _get_kwargs(
    *,
    body: IssueAssetUDARequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/issueassetuda",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> IssueAssetUDAResponse | None:
    if response.status_code == 200:
        response_200 = IssueAssetUDAResponse.from_dict(response.json())

        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[IssueAssetUDAResponse]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: IssueAssetUDARequest,
) -> Response[IssueAssetUDAResponse]:
    """Issue an RGB UDA asset

     Issue an RGB UDA asset. To provide a media first call the /postassetmedia API.

    Args:
        body (IssueAssetUDARequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[IssueAssetUDAResponse]
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
    body: IssueAssetUDARequest,
) -> IssueAssetUDAResponse | None:
    """Issue an RGB UDA asset

     Issue an RGB UDA asset. To provide a media first call the /postassetmedia API.

    Args:
        body (IssueAssetUDARequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        IssueAssetUDAResponse
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: IssueAssetUDARequest,
) -> Response[IssueAssetUDAResponse]:
    """Issue an RGB UDA asset

     Issue an RGB UDA asset. To provide a media first call the /postassetmedia API.

    Args:
        body (IssueAssetUDARequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[IssueAssetUDAResponse]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: IssueAssetUDARequest,
) -> IssueAssetUDAResponse | None:
    """Issue an RGB UDA asset

     Issue an RGB UDA asset. To provide a media first call the /postassetmedia API.

    Args:
        body (IssueAssetUDARequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        IssueAssetUDAResponse
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
