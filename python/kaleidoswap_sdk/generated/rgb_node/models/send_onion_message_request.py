from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="SendOnionMessageRequest")


@_attrs_define
class SendOnionMessageRequest:
    """
    Attributes:
        node_ids (list[str] | Unset):
        tlv_type (int | Unset):  Example: 77.
        data (str | Unset):  Example: message to send.
    """

    node_ids: list[str] | Unset = UNSET
    tlv_type: int | Unset = UNSET
    data: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        node_ids: list[str] | Unset = UNSET
        if not isinstance(self.node_ids, Unset):
            node_ids = self.node_ids

        tlv_type = self.tlv_type

        data = self.data

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if node_ids is not UNSET:
            field_dict["node_ids"] = node_ids
        if tlv_type is not UNSET:
            field_dict["tlv_type"] = tlv_type
        if data is not UNSET:
            field_dict["data"] = data

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        node_ids = cast(list[str], d.pop("node_ids", UNSET))

        tlv_type = d.pop("tlv_type", UNSET)

        data = d.pop("data", UNSET)

        send_onion_message_request = cls(
            node_ids=node_ids,
            tlv_type=tlv_type,
            data=data,
        )

        send_onion_message_request.additional_properties = d
        return send_onion_message_request

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
