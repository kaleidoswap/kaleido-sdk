from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_order_status import SwapOrderStatus
from ..models.swap_settlement import SwapSettlement
from ..types import UNSET, Unset

T = TypeVar("T", bound="CreateSwapOrderResponse")


@_attrs_define
class CreateSwapOrderResponse:
    """
    Attributes:
        id (str):
        rfq_id (str):
        pay_in (SwapSettlement):
        status (SwapOrderStatus):
        ln_invoice (None | str | Unset):
        onchain_address (None | str | Unset):
        rgb_recipient_id (None | str | Unset):
        rgb_invoice (None | str | Unset):
    """

    id: str
    rfq_id: str
    pay_in: SwapSettlement
    status: SwapOrderStatus
    ln_invoice: None | str | Unset = UNSET
    onchain_address: None | str | Unset = UNSET
    rgb_recipient_id: None | str | Unset = UNSET
    rgb_invoice: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        rfq_id = self.rfq_id

        pay_in = self.pay_in.value

        status = self.status.value

        ln_invoice: None | str | Unset
        if isinstance(self.ln_invoice, Unset):
            ln_invoice = UNSET
        else:
            ln_invoice = self.ln_invoice

        onchain_address: None | str | Unset
        if isinstance(self.onchain_address, Unset):
            onchain_address = UNSET
        else:
            onchain_address = self.onchain_address

        rgb_recipient_id: None | str | Unset
        if isinstance(self.rgb_recipient_id, Unset):
            rgb_recipient_id = UNSET
        else:
            rgb_recipient_id = self.rgb_recipient_id

        rgb_invoice: None | str | Unset
        if isinstance(self.rgb_invoice, Unset):
            rgb_invoice = UNSET
        else:
            rgb_invoice = self.rgb_invoice

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "rfq_id": rfq_id,
                "pay_in": pay_in,
                "status": status,
            }
        )
        if ln_invoice is not UNSET:
            field_dict["ln_invoice"] = ln_invoice
        if onchain_address is not UNSET:
            field_dict["onchain_address"] = onchain_address
        if rgb_recipient_id is not UNSET:
            field_dict["rgb_recipient_id"] = rgb_recipient_id
        if rgb_invoice is not UNSET:
            field_dict["rgb_invoice"] = rgb_invoice

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        rfq_id = d.pop("rfq_id")

        pay_in = SwapSettlement(d.pop("pay_in"))

        status = SwapOrderStatus(d.pop("status"))

        def _parse_ln_invoice(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        ln_invoice = _parse_ln_invoice(d.pop("ln_invoice", UNSET))

        def _parse_onchain_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        onchain_address = _parse_onchain_address(d.pop("onchain_address", UNSET))

        def _parse_rgb_recipient_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        rgb_recipient_id = _parse_rgb_recipient_id(d.pop("rgb_recipient_id", UNSET))

        def _parse_rgb_invoice(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        rgb_invoice = _parse_rgb_invoice(d.pop("rgb_invoice", UNSET))

        create_swap_order_response = cls(
            id=id,
            rfq_id=rfq_id,
            pay_in=pay_in,
            status=status,
            ln_invoice=ln_invoice,
            onchain_address=onchain_address,
            rgb_recipient_id=rgb_recipient_id,
            rgb_invoice=rgb_invoice,
        )

        create_swap_order_response.additional_properties = d
        return create_swap_order_response

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
