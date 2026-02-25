from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.bitcoin_network import BitcoinNetwork

T = TypeVar("T", bound="NetworkInfoResponse")


@_attrs_define
class NetworkInfoResponse:
    """
    Attributes:
        network (BitcoinNetwork):
        height (int):
    """

    network: BitcoinNetwork
    height: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        network = self.network.value

        height = self.height

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "network": network,
                "height": height,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        network = BitcoinNetwork(d.pop("network"))

        height = d.pop("height")

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
