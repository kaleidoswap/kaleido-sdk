from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="CheckIndexerUrlRequest")


@_attrs_define
class CheckIndexerUrlRequest:
    """
    Attributes:
        indexer_url (str | Unset):  Example: 127.0.0.1:50001.
    """

    indexer_url: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        indexer_url = self.indexer_url

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if indexer_url is not UNSET:
            field_dict["indexer_url"] = indexer_url

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        indexer_url = d.pop("indexer_url", UNSET)

        check_indexer_url_request = cls(
            indexer_url=indexer_url,
        )

        check_indexer_url_request.additional_properties = d
        return check_indexer_url_request

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
