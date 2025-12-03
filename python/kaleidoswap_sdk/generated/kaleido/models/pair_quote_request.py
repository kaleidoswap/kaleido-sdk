from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="PairQuoteRequest")


@_attrs_define
class PairQuoteRequest:
    """
    Attributes:
        from_asset (str):  Example: BTC.
        to_asset (str):  Example: rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd.
        from_amount (int | None | Unset): Amount of from_asset to convert. Either from_amount or to_amount must be
            provided, but not both. Example: 1000000.
        to_amount (int | None | Unset): Desired amount of to_asset to receive. Either from_amount or to_amount must be
            provided, but not both. Example: 1000000.
    """

    from_asset: str
    to_asset: str
    from_amount: int | None | Unset = UNSET
    to_amount: int | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from_asset = self.from_asset

        to_asset = self.to_asset

        from_amount: int | None | Unset
        if isinstance(self.from_amount, Unset):
            from_amount = UNSET
        else:
            from_amount = self.from_amount

        to_amount: int | None | Unset
        if isinstance(self.to_amount, Unset):
            to_amount = UNSET
        else:
            to_amount = self.to_amount

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "from_asset": from_asset,
                "to_asset": to_asset,
            }
        )
        if from_amount is not UNSET:
            field_dict["from_amount"] = from_amount
        if to_amount is not UNSET:
            field_dict["to_amount"] = to_amount

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        from_asset = d.pop("from_asset")

        to_asset = d.pop("to_asset")

        def _parse_from_amount(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        from_amount = _parse_from_amount(d.pop("from_amount", UNSET))

        def _parse_to_amount(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        to_amount = _parse_to_amount(d.pop("to_amount", UNSET))

        pair_quote_request = cls(
            from_asset=from_asset,
            to_asset=to_asset,
            from_amount=from_amount,
            to_amount=to_amount,
        )

        pair_quote_request.additional_properties = d
        return pair_quote_request

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
