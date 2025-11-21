from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="Pair")


@_attrs_define
class Pair:
    """
    Attributes:
        base_asset (str):
        base_asset_id (str):
        base_precision (int):
        quote_asset (str):
        quote_asset_id (str):
        quote_precision (int):
        is_active (bool):
        min_base_order_size (int):
        max_base_order_size (int):
        min_quote_order_size (int):
        max_quote_order_size (int):
        id (str | Unset):
    """

    base_asset: str
    base_asset_id: str
    base_precision: int
    quote_asset: str
    quote_asset_id: str
    quote_precision: int
    is_active: bool
    min_base_order_size: int
    max_base_order_size: int
    min_quote_order_size: int
    max_quote_order_size: int
    id: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        base_asset = self.base_asset

        base_asset_id = self.base_asset_id

        base_precision = self.base_precision

        quote_asset = self.quote_asset

        quote_asset_id = self.quote_asset_id

        quote_precision = self.quote_precision

        is_active = self.is_active

        min_base_order_size = self.min_base_order_size

        max_base_order_size = self.max_base_order_size

        min_quote_order_size = self.min_quote_order_size

        max_quote_order_size = self.max_quote_order_size

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "base_asset": base_asset,
                "base_asset_id": base_asset_id,
                "base_precision": base_precision,
                "quote_asset": quote_asset,
                "quote_asset_id": quote_asset_id,
                "quote_precision": quote_precision,
                "is_active": is_active,
                "min_base_order_size": min_base_order_size,
                "max_base_order_size": max_base_order_size,
                "min_quote_order_size": min_quote_order_size,
                "max_quote_order_size": max_quote_order_size,
            }
        )
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        base_asset = d.pop("base_asset")

        base_asset_id = d.pop("base_asset_id")

        base_precision = d.pop("base_precision")

        quote_asset = d.pop("quote_asset")

        quote_asset_id = d.pop("quote_asset_id")

        quote_precision = d.pop("quote_precision")

        is_active = d.pop("is_active")

        min_base_order_size = d.pop("min_base_order_size")

        max_base_order_size = d.pop("max_base_order_size")

        min_quote_order_size = d.pop("min_quote_order_size")

        max_quote_order_size = d.pop("max_quote_order_size")

        id = d.pop("id", UNSET)

        pair = cls(
            base_asset=base_asset,
            base_asset_id=base_asset_id,
            base_precision=base_precision,
            quote_asset=quote_asset,
            quote_asset_id=quote_asset_id,
            quote_precision=quote_precision,
            is_active=is_active,
            min_base_order_size=min_base_order_size,
            max_base_order_size=max_base_order_size,
            min_quote_order_size=min_quote_order_size,
            max_quote_order_size=max_quote_order_size,
            id=id,
        )

        pair.additional_properties = d
        return pair

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
