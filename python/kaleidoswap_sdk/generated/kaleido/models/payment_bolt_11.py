from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.payment_state import PaymentState

T = TypeVar("T", bound="PaymentBolt11")


@_attrs_define
class PaymentBolt11:
    """
    Attributes:
        state (PaymentState):
        expires_at (datetime.datetime):
        fee_total_sat (int):
        order_total_sat (int):
        invoice (str):
    """

    state: PaymentState
    expires_at: datetime.datetime
    fee_total_sat: int
    order_total_sat: int
    invoice: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        state = self.state.value

        expires_at = self.expires_at.isoformat()

        fee_total_sat = self.fee_total_sat

        order_total_sat = self.order_total_sat

        invoice = self.invoice

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "state": state,
                "expires_at": expires_at,
                "fee_total_sat": fee_total_sat,
                "order_total_sat": order_total_sat,
                "invoice": invoice,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        state = PaymentState(d.pop("state"))

        expires_at = isoparse(d.pop("expires_at"))

        fee_total_sat = d.pop("fee_total_sat")

        order_total_sat = d.pop("order_total_sat")

        invoice = d.pop("invoice")

        payment_bolt_11 = cls(
            state=state,
            expires_at=expires_at,
            fee_total_sat=fee_total_sat,
            order_total_sat=order_total_sat,
            invoice=invoice,
        )

        payment_bolt_11.additional_properties = d
        return payment_bolt_11

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
