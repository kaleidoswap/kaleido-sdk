from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.bitcoin_network import BitcoinNetwork
from ..types import UNSET, Unset

T = TypeVar("T", bound="NetworkInfoResponse")


@_attrs_define
class NetworkInfoResponse:
    """
    Attributes:
        network (BitcoinNetwork | Unset):  Example: Regtest.
        height (int | Unset):  Example: 805434.
    """

    network: BitcoinNetwork | Unset = UNSET
    height: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        network: str | Unset = UNSET
        if not isinstance(self.network, Unset):
            network = self.network.value

        height = self.height

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if network is not UNSET:
            field_dict["network"] = network
        if height is not UNSET:
            field_dict["height"] = height

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _network = d.pop("network", UNSET)
        network: BitcoinNetwork | Unset
        if isinstance(_network, Unset):
            network = UNSET
        else:
            network = BitcoinNetwork(_network)

        height = d.pop("height", UNSET)

        network_info_response = cls(
            network=network,
            height=height,
        )

        network_info_response.additional_properties = d
        return network_info_response

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
