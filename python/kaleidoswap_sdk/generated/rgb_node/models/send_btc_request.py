from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="SendBtcRequest")


@_attrs_define
class SendBtcRequest:
    """
    Attributes:
        amount (int | Unset):  Example: 16900.
        address (str | Unset):  Example: bcrt1qwxht5tut39dws8tjcf649tp908r8fr2j75c94k.
        fee_rate (float | Unset):  Example: 5.
        skip_sync (bool | Unset):
    """

    amount: int | Unset = UNSET
    address: str | Unset = UNSET
    fee_rate: float | Unset = UNSET
    skip_sync: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amount = self.amount

        address = self.address

        fee_rate = self.fee_rate

        skip_sync = self.skip_sync

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if amount is not UNSET:
            field_dict["amount"] = amount
        if address is not UNSET:
            field_dict["address"] = address
        if fee_rate is not UNSET:
            field_dict["fee_rate"] = fee_rate
        if skip_sync is not UNSET:
            field_dict["skip_sync"] = skip_sync

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        amount = d.pop("amount", UNSET)

        address = d.pop("address", UNSET)

        fee_rate = d.pop("fee_rate", UNSET)

        skip_sync = d.pop("skip_sync", UNSET)

        send_btc_request = cls(
            amount=amount,
            address=address,
            fee_rate=fee_rate,
            skip_sync=skip_sync,
        )

        send_btc_request.additional_properties = d
        return send_btc_request

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
