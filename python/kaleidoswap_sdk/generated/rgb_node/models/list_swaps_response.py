from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.swap import Swap


T = TypeVar("T", bound="ListSwapsResponse")


@_attrs_define
class ListSwapsResponse:
    """
    Attributes:
        maker (list[Swap] | Unset):
        taker (list[Swap] | Unset):
    """

    maker: list[Swap] | Unset = UNSET
    taker: list[Swap] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        maker: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.maker, Unset):
            maker = []
            for maker_item_data in self.maker:
                maker_item = maker_item_data.to_dict()
                maker.append(maker_item)

        taker: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.taker, Unset):
            taker = []
            for taker_item_data in self.taker:
                taker_item = taker_item_data.to_dict()
                taker.append(taker_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if maker is not UNSET:
            field_dict["maker"] = maker
        if taker is not UNSET:
            field_dict["taker"] = taker

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.swap import Swap

        d = dict(src_dict)
        _maker = d.pop("maker", UNSET)
        maker: list[Swap] | Unset = UNSET
        if _maker is not UNSET:
            maker = []
            for maker_item_data in _maker:
                maker_item = Swap.from_dict(maker_item_data)

                maker.append(maker_item)

        _taker = d.pop("taker", UNSET)
        taker: list[Swap] | Unset = UNSET
        if _taker is not UNSET:
            taker = []
            for taker_item_data in _taker:
                taker_item = Swap.from_dict(taker_item_data)

                taker.append(taker_item)

        list_swaps_response = cls(
            maker=maker,
            taker=taker,
        )

        list_swaps_response.additional_properties = d
        return list_swaps_response

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
