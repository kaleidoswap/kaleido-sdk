from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="NodeInfoResponse")


@_attrs_define
class NodeInfoResponse:
    """
    Attributes:
        pubkey (None | str):  Example: 034eedc97802d7e2766704bd06d6bfded8aa2d35a1a007e277fd7278f3dc962706.
        network (None | str):  Example: Signet.
        block_height (int | None):  Example: 805434.
    """

    pubkey: None | str
    network: None | str
    block_height: int | None
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        pubkey: None | str
        pubkey = self.pubkey

        network: None | str
        network = self.network

        block_height: int | None
        block_height = self.block_height

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "pubkey": pubkey,
                "network": network,
                "block_height": block_height,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)

        def _parse_pubkey(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        pubkey = _parse_pubkey(d.pop("pubkey"))

        def _parse_network(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        network = _parse_network(d.pop("network"))

        def _parse_block_height(data: object) -> int | None:
            if data is None:
                return data
            return cast(int | None, data)

        block_height = _parse_block_height(d.pop("block_height"))

        node_info_response = cls(
            pubkey=pubkey,
            network=network,
            block_height=block_height,
        )

        node_info_response.additional_properties = d
        return node_info_response

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
