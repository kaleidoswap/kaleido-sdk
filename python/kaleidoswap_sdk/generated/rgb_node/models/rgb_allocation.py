from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.assignment_fungible import AssignmentFungible


T = TypeVar("T", bound="RgbAllocation")


@_attrs_define
class RgbAllocation:
    """
    Attributes:
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        assignment (AssignmentFungible | Unset):  Example: {'type': 'Fungible', 'value': 42}.
        settled (bool | Unset):
    """

    asset_id: str | Unset = UNSET
    assignment: AssignmentFungible | Unset = UNSET
    settled: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_id = self.asset_id

        assignment: dict[str, Any] | Unset = UNSET
        if not isinstance(self.assignment, Unset):
            assignment = self.assignment.to_dict()

        settled = self.settled

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if assignment is not UNSET:
            field_dict["assignment"] = assignment
        if settled is not UNSET:
            field_dict["settled"] = settled

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.assignment_fungible import AssignmentFungible

        d = dict(src_dict)
        asset_id = d.pop("asset_id", UNSET)

        _assignment = d.pop("assignment", UNSET)
        assignment: AssignmentFungible | Unset
        if isinstance(_assignment, Unset):
            assignment = UNSET
        else:
            assignment = AssignmentFungible.from_dict(_assignment)

        settled = d.pop("settled", UNSET)

        rgb_allocation = cls(
            asset_id=asset_id,
            assignment=assignment,
            settled=settled,
        )

        rgb_allocation.additional_properties = d
        return rgb_allocation

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
