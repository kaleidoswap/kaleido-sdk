from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ConnectPeerRequest")


@_attrs_define
class ConnectPeerRequest:
    """
    Attributes:
        peer_pubkey_and_addr (str | Unset):  Example:
            03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d@localhost:9736.
    """

    peer_pubkey_and_addr: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        peer_pubkey_and_addr = self.peer_pubkey_and_addr

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if peer_pubkey_and_addr is not UNSET:
            field_dict["peer_pubkey_and_addr"] = peer_pubkey_and_addr

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        peer_pubkey_and_addr = d.pop("peer_pubkey_and_addr", UNSET)

        connect_peer_request = cls(
            peer_pubkey_and_addr=peer_pubkey_and_addr,
        )

        connect_peer_request.additional_properties = d
        return connect_peer_request

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
