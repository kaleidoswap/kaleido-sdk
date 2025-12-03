from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.rgb_allocation import RgbAllocation
    from ..models.utxo import Utxo


T = TypeVar("T", bound="Unspent")


@_attrs_define
class Unspent:
    """
    Attributes:
        utxo (Utxo | Unset):
        rgb_allocations (list[RgbAllocation] | Unset):
    """

    utxo: Utxo | Unset = UNSET
    rgb_allocations: list[RgbAllocation] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        utxo: dict[str, Any] | Unset = UNSET
        if not isinstance(self.utxo, Unset):
            utxo = self.utxo.to_dict()

        rgb_allocations: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.rgb_allocations, Unset):
            rgb_allocations = []
            for rgb_allocations_item_data in self.rgb_allocations:
                rgb_allocations_item = rgb_allocations_item_data.to_dict()
                rgb_allocations.append(rgb_allocations_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if utxo is not UNSET:
            field_dict["utxo"] = utxo
        if rgb_allocations is not UNSET:
            field_dict["rgb_allocations"] = rgb_allocations

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.rgb_allocation import RgbAllocation
        from ..models.utxo import Utxo

        d = dict(src_dict)
        _utxo = d.pop("utxo", UNSET)
        utxo: Utxo | Unset
        if isinstance(_utxo, Unset):
            utxo = UNSET
        else:
            utxo = Utxo.from_dict(_utxo)

        _rgb_allocations = d.pop("rgb_allocations", UNSET)
        rgb_allocations: list[RgbAllocation] | Unset = UNSET
        if _rgb_allocations is not UNSET:
            rgb_allocations = []
            for rgb_allocations_item_data in _rgb_allocations:
                rgb_allocations_item = RgbAllocation.from_dict(
                    rgb_allocations_item_data
                )

                rgb_allocations.append(rgb_allocations_item)

        unspent = cls(
            utxo=utxo,
            rgb_allocations=rgb_allocations,
        )

        unspent.additional_properties = d
        return unspent

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
