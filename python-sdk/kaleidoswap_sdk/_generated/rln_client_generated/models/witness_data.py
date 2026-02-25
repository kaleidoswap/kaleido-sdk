from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="WitnessData")


@_attrs_define
class WitnessData:
    """
    Attributes:
        amount_sat (Union[Unset, float]):
        blinding (Union[Unset, float]):
    """

    amount_sat: Unset | float = UNSET
    blinding: Unset | float = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amount_sat = self.amount_sat

        blinding = self.blinding

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if amount_sat is not UNSET:
            field_dict["amount_sat"] = amount_sat
        if blinding is not UNSET:
            field_dict["blinding"] = blinding

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        amount_sat = d.pop("amount_sat", UNSET)

        blinding = d.pop("blinding", UNSET)

        witness_data = cls(
            amount_sat=amount_sat,
            blinding=blinding,
        )

        witness_data.additional_properties = d
        return witness_data

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
