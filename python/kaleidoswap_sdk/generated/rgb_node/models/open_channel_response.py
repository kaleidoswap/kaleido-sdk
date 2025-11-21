from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="OpenChannelResponse")


@_attrs_define
class OpenChannelResponse:
    """
    Attributes:
        temporary_channel_id (str | Unset):  Example: a8b60c8ce3067b5fc881d4831323e24751daec3b64353c8df3205ec5d838f1c5.
    """

    temporary_channel_id: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        temporary_channel_id = self.temporary_channel_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if temporary_channel_id is not UNSET:
            field_dict["temporary_channel_id"] = temporary_channel_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        temporary_channel_id = d.pop("temporary_channel_id", UNSET)

        open_channel_response = cls(
            temporary_channel_id=temporary_channel_id,
        )

        open_channel_response.additional_properties = d
        return open_channel_response

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
