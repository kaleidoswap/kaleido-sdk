from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.htlc_status import HTLCStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="KeysendResponse")


@_attrs_define
class KeysendResponse:
    """
    Attributes:
        payment_hash (str | Unset):  Example: 8ffd4c0642047bc51ea01a22e6b2ede0fc001aee0e9929b2e84e41cf6589d61e.
        payment_preimage (str | Unset):  Example: 89d28bd306aa9bb906fd0ac31092d04c37c919a171b343083167e2a3cdc60578.
        status (HTLCStatus | Unset):
    """

    payment_hash: str | Unset = UNSET
    payment_preimage: str | Unset = UNSET
    status: HTLCStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payment_hash = self.payment_hash

        payment_preimage = self.payment_preimage

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if payment_preimage is not UNSET:
            field_dict["payment_preimage"] = payment_preimage
        if status is not UNSET:
            field_dict["status"] = status

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        payment_hash = d.pop("payment_hash", UNSET)

        payment_preimage = d.pop("payment_preimage", UNSET)

        _status = d.pop("status", UNSET)
        status: HTLCStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = HTLCStatus(_status)

        keysend_response = cls(
            payment_hash=payment_hash,
            payment_preimage=payment_preimage,
            status=status,
        )

        keysend_response.additional_properties = d
        return keysend_response

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
