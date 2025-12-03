from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define

from ..types import UNSET, Unset

T = TypeVar("T", bound="AssetsOptions")


@_attrs_define
class AssetsOptions:
    """
    Attributes:
        name (str | Unset):  Default: 'US Dollar Notes'.
        asset_id (None | str | Unset):  Default: 'rgb:$i4cFKwt-2C5LZ3X-l$kOTGN-O6l1AOP-aP9COyn-7IeBkEM'.
        ticker (str | Unset):  Default: 'USDT'.
        precision (int | Unset):  Default: 6.
        issued_supply (int | Unset):  Default: 0.
        min_initial_client_amount (int | Unset):  Default: 0.
        max_initial_client_amount (int | Unset):  Default: 0.
        min_initial_lsp_amount (int | Unset):  Default: 0.
        max_initial_lsp_amount (int | Unset):  Default: 10000.
        min_channel_amount (int | Unset):  Default: 0.
        max_channel_amount (int | Unset):  Default: 10000.
    """

    name: str | Unset = "US Dollar Notes"
    asset_id: None | str | Unset = (
        "rgb:$i4cFKwt-2C5LZ3X-l$kOTGN-O6l1AOP-aP9COyn-7IeBkEM"
    )
    ticker: str | Unset = "USDT"
    precision: int | Unset = 6
    issued_supply: int | Unset = 0
    min_initial_client_amount: int | Unset = 0
    max_initial_client_amount: int | Unset = 0
    min_initial_lsp_amount: int | Unset = 0
    max_initial_lsp_amount: int | Unset = 10000
    min_channel_amount: int | Unset = 0
    max_channel_amount: int | Unset = 10000

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        asset_id: None | str | Unset
        if isinstance(self.asset_id, Unset):
            asset_id = UNSET
        else:
            asset_id = self.asset_id

        ticker = self.ticker

        precision = self.precision

        issued_supply = self.issued_supply

        min_initial_client_amount = self.min_initial_client_amount

        max_initial_client_amount = self.max_initial_client_amount

        min_initial_lsp_amount = self.min_initial_lsp_amount

        max_initial_lsp_amount = self.max_initial_lsp_amount

        min_channel_amount = self.min_channel_amount

        max_channel_amount = self.max_channel_amount

        field_dict: dict[str, Any] = {}

        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if ticker is not UNSET:
            field_dict["ticker"] = ticker
        if precision is not UNSET:
            field_dict["precision"] = precision
        if issued_supply is not UNSET:
            field_dict["issued_supply"] = issued_supply
        if min_initial_client_amount is not UNSET:
            field_dict["min_initial_client_amount"] = min_initial_client_amount
        if max_initial_client_amount is not UNSET:
            field_dict["max_initial_client_amount"] = max_initial_client_amount
        if min_initial_lsp_amount is not UNSET:
            field_dict["min_initial_lsp_amount"] = min_initial_lsp_amount
        if max_initial_lsp_amount is not UNSET:
            field_dict["max_initial_lsp_amount"] = max_initial_lsp_amount
        if min_channel_amount is not UNSET:
            field_dict["min_channel_amount"] = min_channel_amount
        if max_channel_amount is not UNSET:
            field_dict["max_channel_amount"] = max_channel_amount

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        def _parse_asset_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        asset_id = _parse_asset_id(d.pop("asset_id", UNSET))

        ticker = d.pop("ticker", UNSET)

        precision = d.pop("precision", UNSET)

        issued_supply = d.pop("issued_supply", UNSET)

        min_initial_client_amount = d.pop("min_initial_client_amount", UNSET)

        max_initial_client_amount = d.pop("max_initial_client_amount", UNSET)

        min_initial_lsp_amount = d.pop("min_initial_lsp_amount", UNSET)

        max_initial_lsp_amount = d.pop("max_initial_lsp_amount", UNSET)

        min_channel_amount = d.pop("min_channel_amount", UNSET)

        max_channel_amount = d.pop("max_channel_amount", UNSET)

        assets_options = cls(
            name=name,
            asset_id=asset_id,
            ticker=ticker,
            precision=precision,
            issued_supply=issued_supply,
            min_initial_client_amount=min_initial_client_amount,
            max_initial_client_amount=max_initial_client_amount,
            min_initial_lsp_amount=min_initial_lsp_amount,
            max_initial_lsp_amount=max_initial_lsp_amount,
            min_channel_amount=min_channel_amount,
            max_channel_amount=max_channel_amount,
        )

        return assets_options
