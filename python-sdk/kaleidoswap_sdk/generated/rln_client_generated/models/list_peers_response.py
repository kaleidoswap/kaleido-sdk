from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.peer import Peer


T = TypeVar("T", bound="ListPeersResponse")


@_attrs_define
class ListPeersResponse:
    """
    Attributes:
        peers (Union[Unset, list['Peer']]):
    """

    peers: Unset | list["Peer"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        peers: Unset | list[dict[str, Any]] = UNSET
        if not isinstance(self.peers, Unset):
            peers = []
            for peers_item_data in self.peers:
                peers_item = peers_item_data.to_dict()
                peers.append(peers_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if peers is not UNSET:
            field_dict["peers"] = peers

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.peer import Peer

        d = dict(src_dict)
        peers = []
        _peers = d.pop("peers", UNSET)
        for peers_item_data in _peers or []:
            peers_item = Peer.from_dict(peers_item_data)

            peers.append(peers_item)

        list_peers_response = cls(
            peers=peers,
        )

        list_peers_response.additional_properties = d
        return list_peers_response

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
