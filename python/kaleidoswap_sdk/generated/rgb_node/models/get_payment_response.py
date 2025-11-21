from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.payment import Payment


T = TypeVar("T", bound="GetPaymentResponse")


@_attrs_define
class GetPaymentResponse:
    """
    Attributes:
        payment (Payment | Unset):
    """

    payment: Payment | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payment: dict[str, Any] | Unset = UNSET
        if not isinstance(self.payment, Unset):
            payment = self.payment.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if payment is not UNSET:
            field_dict["payment"] = payment

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.payment import Payment

        d = dict(src_dict)
        _payment = d.pop("payment", UNSET)
        payment: Payment | Unset
        if isinstance(_payment, Unset):
            payment = UNSET
        else:
            payment = Payment.from_dict(_payment)

        get_payment_response = cls(
            payment=payment,
        )

        get_payment_response.additional_properties = d
        return get_payment_response

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
