from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.indexer_protocol import IndexerProtocol
from ..types import UNSET, Unset

T = TypeVar("T", bound="CheckIndexerUrlResponse")


@_attrs_define
class CheckIndexerUrlResponse:
    """
    Attributes:
        indexer_protocol (Union[Unset, IndexerProtocol]):
    """

    indexer_protocol: Unset | IndexerProtocol = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        indexer_protocol: Unset | str = UNSET
        if not isinstance(self.indexer_protocol, Unset):
            indexer_protocol = self.indexer_protocol.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if indexer_protocol is not UNSET:
            field_dict["indexer_protocol"] = indexer_protocol

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _indexer_protocol = d.pop("indexer_protocol", UNSET)
        indexer_protocol: Unset | IndexerProtocol
        if isinstance(_indexer_protocol, Unset):
            indexer_protocol = UNSET
        else:
            indexer_protocol = IndexerProtocol(_indexer_protocol)

        check_indexer_url_response = cls(
            indexer_protocol=indexer_protocol,
        )

        check_indexer_url_response.additional_properties = d
        return check_indexer_url_response

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
