from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ChangePasswordRequest")


@_attrs_define
class ChangePasswordRequest:
    """
    Attributes:
        old_password (str | Unset):  Example: nodepassword.
        new_password (str | Unset):  Example: nodenewpassword.
    """

    old_password: str | Unset = UNSET
    new_password: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        old_password = self.old_password

        new_password = self.new_password

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if old_password is not UNSET:
            field_dict["old_password"] = old_password
        if new_password is not UNSET:
            field_dict["new_password"] = new_password

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        old_password = d.pop("old_password", UNSET)

        new_password = d.pop("new_password", UNSET)

        change_password_request = cls(
            old_password=old_password,
            new_password=new_password,
        )

        change_password_request.additional_properties = d
        return change_password_request

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
