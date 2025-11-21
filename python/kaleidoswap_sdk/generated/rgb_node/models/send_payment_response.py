from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.htlc_status import HTLCStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="SendPaymentResponse")


@_attrs_define
class SendPaymentResponse:
    """
    Attributes:
        payment_hash (str | Unset):  Example: 3febfae1e68b190c15461f4c2a3290f9af1dae63fd7d620d2bd61601869026cd.
        payment_secret (str | Unset):  Example: 777a7756c620868199ed5fdc35bee4095b5709d543e5c2bf0494396bf27d2ea2.
        status (HTLCStatus | Unset):
    """

    payment_hash: str | Unset = UNSET
    payment_secret: str | Unset = UNSET
    status: HTLCStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payment_hash = self.payment_hash

        payment_secret = self.payment_secret

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if payment_secret is not UNSET:
            field_dict["payment_secret"] = payment_secret
        if status is not UNSET:
            field_dict["status"] = status

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        payment_hash = d.pop("payment_hash", UNSET)

        payment_secret = d.pop("payment_secret", UNSET)

        _status = d.pop("status", UNSET)
        status: HTLCStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = HTLCStatus(_status)

        send_payment_response = cls(
            payment_hash=payment_hash,
            payment_secret=payment_secret,
            status=status,
        )

        send_payment_response.additional_properties = d
        return send_payment_response

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
