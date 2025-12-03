from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_settlement import SwapSettlement
from ..types import UNSET, Unset

T = TypeVar("T", bound="CreateSwapOrderRequest")


@_attrs_define
class CreateSwapOrderRequest:
    """
    Attributes:
        rfq_id (str): RFQ ID cannot be empty
        from_type (SwapSettlement):
        to_type (SwapSettlement):
        min_onchain_conf (int | None | Unset):  Default: 1.
        dest_bolt11 (None | str | Unset):
        dest_onchain_address (None | str | Unset):
        dest_rgb_invoice (None | str | Unset):
        refund_address (None | str | Unset):
        email (None | str | Unset): Optional email for notifications
    """

    rfq_id: str
    from_type: SwapSettlement
    to_type: SwapSettlement
    min_onchain_conf: int | None | Unset = 1
    dest_bolt11: None | str | Unset = UNSET
    dest_onchain_address: None | str | Unset = UNSET
    dest_rgb_invoice: None | str | Unset = UNSET
    refund_address: None | str | Unset = UNSET
    email: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        rfq_id = self.rfq_id

        from_type = self.from_type.value

        to_type = self.to_type.value

        min_onchain_conf: int | None | Unset
        if isinstance(self.min_onchain_conf, Unset):
            min_onchain_conf = UNSET
        else:
            min_onchain_conf = self.min_onchain_conf

        dest_bolt11: None | str | Unset
        if isinstance(self.dest_bolt11, Unset):
            dest_bolt11 = UNSET
        else:
            dest_bolt11 = self.dest_bolt11

        dest_onchain_address: None | str | Unset
        if isinstance(self.dest_onchain_address, Unset):
            dest_onchain_address = UNSET
        else:
            dest_onchain_address = self.dest_onchain_address

        dest_rgb_invoice: None | str | Unset
        if isinstance(self.dest_rgb_invoice, Unset):
            dest_rgb_invoice = UNSET
        else:
            dest_rgb_invoice = self.dest_rgb_invoice

        refund_address: None | str | Unset
        if isinstance(self.refund_address, Unset):
            refund_address = UNSET
        else:
            refund_address = self.refund_address

        email: None | str | Unset
        if isinstance(self.email, Unset):
            email = UNSET
        else:
            email = self.email

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "rfq_id": rfq_id,
                "from_type": from_type,
                "to_type": to_type,
            }
        )
        if min_onchain_conf is not UNSET:
            field_dict["min_onchain_conf"] = min_onchain_conf
        if dest_bolt11 is not UNSET:
            field_dict["dest_bolt11"] = dest_bolt11
        if dest_onchain_address is not UNSET:
            field_dict["dest_onchain_address"] = dest_onchain_address
        if dest_rgb_invoice is not UNSET:
            field_dict["dest_rgb_invoice"] = dest_rgb_invoice
        if refund_address is not UNSET:
            field_dict["refund_address"] = refund_address
        if email is not UNSET:
            field_dict["email"] = email

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        rfq_id = d.pop("rfq_id")

        from_type = SwapSettlement(d.pop("from_type"))

        to_type = SwapSettlement(d.pop("to_type"))

        def _parse_min_onchain_conf(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        min_onchain_conf = _parse_min_onchain_conf(d.pop("min_onchain_conf", UNSET))

        def _parse_dest_bolt11(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        dest_bolt11 = _parse_dest_bolt11(d.pop("dest_bolt11", UNSET))

        def _parse_dest_onchain_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        dest_onchain_address = _parse_dest_onchain_address(
            d.pop("dest_onchain_address", UNSET)
        )

        def _parse_dest_rgb_invoice(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        dest_rgb_invoice = _parse_dest_rgb_invoice(d.pop("dest_rgb_invoice", UNSET))

        def _parse_refund_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        refund_address = _parse_refund_address(d.pop("refund_address", UNSET))

        def _parse_email(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        email = _parse_email(d.pop("email", UNSET))

        create_swap_order_request = cls(
            rfq_id=rfq_id,
            from_type=from_type,
            to_type=to_type,
            min_onchain_conf=min_onchain_conf,
            dest_bolt11=dest_bolt11,
            dest_onchain_address=dest_onchain_address,
            dest_rgb_invoice=dest_rgb_invoice,
            refund_address=refund_address,
            email=email,
        )

        create_swap_order_request.additional_properties = d
        return create_swap_order_request

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
