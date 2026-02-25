"""ProtocolIds model - asset IDs per protocol (e.g. {'RGB': 'rgb:xxx', 'TAPASS': 'tap:xxx'})."""

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="ProtocolIds")


@_attrs_define
class ProtocolIds:
    """
    Asset IDs per protocol (e.g. {'RGB': 'rgb:xxx', 'TAPASS': 'tap:xxx'}).

    Stored as additional_properties (string keys, string values).
    """

    additional_properties: dict[str, str] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return dict(self.additional_properties)

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        instance = cls()
        for k, v in d.items():
            instance.additional_properties[k] = str(v) if v is not None else ""
        return instance

    def __getitem__(self, key: str) -> str:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: str) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
