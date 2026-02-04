from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="CreateUtxosRequest")


@_attrs_define
class CreateUtxosRequest:
    """
    Attributes:
        up_to (Union[Unset, bool]):
        num (Union[Unset, int]):
        size (Union[Unset, int]):
        fee_rate (Union[Unset, float]):
        skip_sync (Union[Unset, bool]):
    """

    up_to: Unset | bool = UNSET
    num: Unset | int = UNSET
    size: Unset | int = UNSET
    fee_rate: Unset | float = UNSET
    skip_sync: Unset | bool = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        up_to = self.up_to

        num = self.num

        size = self.size

        fee_rate = self.fee_rate

        skip_sync = self.skip_sync

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if up_to is not UNSET:
            field_dict["up_to"] = up_to
        if num is not UNSET:
            field_dict["num"] = num
        if size is not UNSET:
            field_dict["size"] = size
        if fee_rate is not UNSET:
            field_dict["fee_rate"] = fee_rate
        if skip_sync is not UNSET:
            field_dict["skip_sync"] = skip_sync

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        up_to = d.pop("up_to", UNSET)

        num = d.pop("num", UNSET)

        size = d.pop("size", UNSET)

        fee_rate = d.pop("fee_rate", UNSET)

        skip_sync = d.pop("skip_sync", UNSET)

        create_utxos_request = cls(
            up_to=up_to,
            num=num,
            size=size,
            fee_rate=fee_rate,
            skip_sync=skip_sync,
        )

        create_utxos_request.additional_properties = d
        return create_utxos_request

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
