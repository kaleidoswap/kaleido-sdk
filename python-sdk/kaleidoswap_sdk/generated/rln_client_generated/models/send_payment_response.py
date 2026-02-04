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
        payment_hash (Union[Unset, str]):
        payment_secret (Union[Unset, str]):
        status (Union[Unset, HTLCStatus]):
    """

    payment_hash: Unset | str = UNSET
    payment_secret: Unset | str = UNSET
    status: Unset | HTLCStatus = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payment_hash = self.payment_hash

        payment_secret = self.payment_secret

        status: Unset | str = UNSET
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
        status: Unset | HTLCStatus
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
