from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="CloseChannelRequest")


@_attrs_define
class CloseChannelRequest:
    """
    Attributes:
        channel_id (str | Unset):  Example: 8129afe1b1d7cf60d5e1bf4c04b09bec925ed4df5417ceee0484e24f816a105a.
        peer_pubkey (str | Unset):  Example: 03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d.
        force (bool | Unset):
    """

    channel_id: str | Unset = UNSET
    peer_pubkey: str | Unset = UNSET
    force: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        channel_id = self.channel_id

        peer_pubkey = self.peer_pubkey

        force = self.force

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if channel_id is not UNSET:
            field_dict["channel_id"] = channel_id
        if peer_pubkey is not UNSET:
            field_dict["peer_pubkey"] = peer_pubkey
        if force is not UNSET:
            field_dict["force"] = force

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        channel_id = d.pop("channel_id", UNSET)

        peer_pubkey = d.pop("peer_pubkey", UNSET)

        force = d.pop("force", UNSET)

        close_channel_request = cls(
            channel_id=channel_id,
            peer_pubkey=peer_pubkey,
            force=force,
        )

        close_channel_request.additional_properties = d
        return close_channel_request

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
