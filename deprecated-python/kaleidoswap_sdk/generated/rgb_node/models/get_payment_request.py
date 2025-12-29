from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="GetPaymentRequest")


@_attrs_define
class GetPaymentRequest:
    """
    Attributes:
        payment_hash (str | Unset):  Example: 5ca5d81b482b4015e7b14df7a27fe0a38c226273604ffd3b008b752571811938.
    """

    payment_hash: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payment_hash = self.payment_hash

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        payment_hash = d.pop("payment_hash", UNSET)

        get_payment_request = cls(
            payment_hash=payment_hash,
        )

        get_payment_request.additional_properties = d
        return get_payment_request

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
