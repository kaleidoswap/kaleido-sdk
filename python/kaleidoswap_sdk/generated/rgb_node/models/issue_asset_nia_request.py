from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="IssueAssetNIARequest")


@_attrs_define
class IssueAssetNIARequest:
    """
    Attributes:
        amounts (list[int] | Unset):  Example: [1000, 600].
        ticker (str | Unset):  Example: USDT.
        name (str | Unset):  Example: Tether.
        precision (int | Unset):
    """

    amounts: list[int] | Unset = UNSET
    ticker: str | Unset = UNSET
    name: str | Unset = UNSET
    precision: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amounts: list[int] | Unset = UNSET
        if not isinstance(self.amounts, Unset):
            amounts = self.amounts

        ticker = self.ticker

        name = self.name

        precision = self.precision

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if amounts is not UNSET:
            field_dict["amounts"] = amounts
        if ticker is not UNSET:
            field_dict["ticker"] = ticker
        if name is not UNSET:
            field_dict["name"] = name
        if precision is not UNSET:
            field_dict["precision"] = precision

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        amounts = cast(list[int], d.pop("amounts", UNSET))

        ticker = d.pop("ticker", UNSET)

        name = d.pop("name", UNSET)

        precision = d.pop("precision", UNSET)

        issue_asset_nia_request = cls(
            amounts=amounts,
            ticker=ticker,
            name=name,
            precision=precision,
        )

        issue_asset_nia_request.additional_properties = d
        return issue_asset_nia_request

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
