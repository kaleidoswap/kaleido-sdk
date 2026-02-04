from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="FailTransfersResponse")


@_attrs_define
class FailTransfersResponse:
    """
    Attributes:
        transfers_changed (Union[Unset, bool]):
    """

    transfers_changed: Unset | bool = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        transfers_changed = self.transfers_changed

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if transfers_changed is not UNSET:
            field_dict["transfers_changed"] = transfers_changed

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        transfers_changed = d.pop("transfers_changed", UNSET)

        fail_transfers_response = cls(
            transfers_changed=transfers_changed,
        )

        fail_transfers_response.additional_properties = d
        return fail_transfers_response

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
