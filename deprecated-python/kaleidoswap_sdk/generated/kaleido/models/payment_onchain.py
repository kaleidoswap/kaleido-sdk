from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.payment_state import PaymentState
from ..types import UNSET, Unset

T = TypeVar("T", bound="PaymentOnchain")


@_attrs_define
class PaymentOnchain:
    """
    Attributes:
        state (PaymentState):
        expires_at (datetime.datetime):
        fee_total_sat (int):
        order_total_sat (int):
        address (str):
        min_fee_for_0conf (int):
        min_onchain_payment_confirmations (int):
        refund_onchain_address (None | str):
        payment_status (None | str | Unset):
        payment_difference (int | None | Unset): Payment difference in satoshis. Positive for overpayment, negative for
            underpayment, zero for exact payment
        last_payment_check (int | None | Unset):
    """

    state: PaymentState
    expires_at: datetime.datetime
    fee_total_sat: int
    order_total_sat: int
    address: str
    min_fee_for_0conf: int
    min_onchain_payment_confirmations: int
    refund_onchain_address: None | str
    payment_status: None | str | Unset = UNSET
    payment_difference: int | None | Unset = UNSET
    last_payment_check: int | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        state = self.state.value

        expires_at = self.expires_at.isoformat()

        fee_total_sat = self.fee_total_sat

        order_total_sat = self.order_total_sat

        address = self.address

        min_fee_for_0conf = self.min_fee_for_0conf

        min_onchain_payment_confirmations = self.min_onchain_payment_confirmations

        refund_onchain_address: None | str
        refund_onchain_address = self.refund_onchain_address

        payment_status: None | str | Unset
        if isinstance(self.payment_status, Unset):
            payment_status = UNSET
        else:
            payment_status = self.payment_status

        payment_difference: int | None | Unset
        if isinstance(self.payment_difference, Unset):
            payment_difference = UNSET
        else:
            payment_difference = self.payment_difference

        last_payment_check: int | None | Unset
        if isinstance(self.last_payment_check, Unset):
            last_payment_check = UNSET
        else:
            last_payment_check = self.last_payment_check

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "state": state,
                "expires_at": expires_at,
                "fee_total_sat": fee_total_sat,
                "order_total_sat": order_total_sat,
                "address": address,
                "min_fee_for_0conf": min_fee_for_0conf,
                "min_onchain_payment_confirmations": min_onchain_payment_confirmations,
                "refund_onchain_address": refund_onchain_address,
            }
        )
        if payment_status is not UNSET:
            field_dict["payment_status"] = payment_status
        if payment_difference is not UNSET:
            field_dict["payment_difference"] = payment_difference
        if last_payment_check is not UNSET:
            field_dict["last_payment_check"] = last_payment_check

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        state = PaymentState(d.pop("state"))

        expires_at = isoparse(d.pop("expires_at"))

        fee_total_sat = d.pop("fee_total_sat")

        order_total_sat = d.pop("order_total_sat")

        address = d.pop("address")

        min_fee_for_0conf = d.pop("min_fee_for_0conf")

        min_onchain_payment_confirmations = d.pop("min_onchain_payment_confirmations")

        def _parse_refund_onchain_address(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        refund_onchain_address = _parse_refund_onchain_address(
            d.pop("refund_onchain_address")
        )

        def _parse_payment_status(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        payment_status = _parse_payment_status(d.pop("payment_status", UNSET))

        def _parse_payment_difference(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        payment_difference = _parse_payment_difference(
            d.pop("payment_difference", UNSET)
        )

        def _parse_last_payment_check(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        last_payment_check = _parse_last_payment_check(
            d.pop("last_payment_check", UNSET)
        )

        payment_onchain = cls(
            state=state,
            expires_at=expires_at,
            fee_total_sat=fee_total_sat,
            order_total_sat=order_total_sat,
            address=address,
            min_fee_for_0conf=min_fee_for_0conf,
            min_onchain_payment_confirmations=min_onchain_payment_confirmations,
            refund_onchain_address=refund_onchain_address,
            payment_status=payment_status,
            payment_difference=payment_difference,
            last_payment_check=last_payment_check,
        )

        payment_onchain.additional_properties = d
        return payment_onchain

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
