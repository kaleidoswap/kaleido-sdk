from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="MakerInitRequest")


@_attrs_define
class MakerInitRequest:
    """
    Attributes:
        qty_from (int | Unset):  Example: 30.
        qty_to (int | Unset):  Example: 10.
        from_asset (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        to_asset (str | Unset):  Example: rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE.
        timeout_sec (int | Unset):  Example: 100.
    """

    qty_from: int | Unset = UNSET
    qty_to: int | Unset = UNSET
    from_asset: str | Unset = UNSET
    to_asset: str | Unset = UNSET
    timeout_sec: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        qty_from = self.qty_from

        qty_to = self.qty_to

        from_asset = self.from_asset

        to_asset = self.to_asset

        timeout_sec = self.timeout_sec

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if qty_from is not UNSET:
            field_dict["qty_from"] = qty_from
        if qty_to is not UNSET:
            field_dict["qty_to"] = qty_to
        if from_asset is not UNSET:
            field_dict["from_asset"] = from_asset
        if to_asset is not UNSET:
            field_dict["to_asset"] = to_asset
        if timeout_sec is not UNSET:
            field_dict["timeout_sec"] = timeout_sec

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        qty_from = d.pop("qty_from", UNSET)

        qty_to = d.pop("qty_to", UNSET)

        from_asset = d.pop("from_asset", UNSET)

        to_asset = d.pop("to_asset", UNSET)

        timeout_sec = d.pop("timeout_sec", UNSET)

        maker_init_request = cls(
            qty_from=qty_from,
            qty_to=qty_to,
            from_asset=from_asset,
            to_asset=to_asset,
            timeout_sec=timeout_sec,
        )

        maker_init_request.additional_properties = d
        return maker_init_request

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
