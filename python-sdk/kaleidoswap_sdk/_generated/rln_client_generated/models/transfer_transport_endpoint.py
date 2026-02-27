from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.transport_type import TransportType
from ..types import UNSET, Unset

T = TypeVar("T", bound="TransferTransportEndpoint")


@_attrs_define
class TransferTransportEndpoint:
    """
    Attributes:
        endpoint (Union[Unset, str]):
        transport_type (Union[Unset, TransportType]):
        used (Union[Unset, bool]):
    """

    endpoint: Unset | str = UNSET
    transport_type: Unset | TransportType = UNSET
    used: Unset | bool = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        endpoint = self.endpoint

        transport_type: Unset | str = UNSET
        if not isinstance(self.transport_type, Unset):
            transport_type = self.transport_type.value

        used = self.used

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if endpoint is not UNSET:
            field_dict["endpoint"] = endpoint
        if transport_type is not UNSET:
            field_dict["transport_type"] = transport_type
        if used is not UNSET:
            field_dict["used"] = used

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        endpoint = d.pop("endpoint", UNSET)

        _transport_type = d.pop("transport_type", UNSET)
        transport_type: Unset | TransportType
        if isinstance(_transport_type, Unset):
            transport_type = UNSET
        else:
            transport_type = TransportType(_transport_type)

        used = d.pop("used", UNSET)

        transfer_transport_endpoint = cls(
            endpoint=endpoint,
            transport_type=transport_type,
            used=used,
        )

        transfer_transport_endpoint.additional_properties = d
        return transfer_transport_endpoint

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
