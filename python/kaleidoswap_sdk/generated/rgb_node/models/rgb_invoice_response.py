from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="RgbInvoiceResponse")


@_attrs_define
class RgbInvoiceResponse:
    """
    Attributes:
        recipient_id (str | Unset):  Example: bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-oI0gxZh-7fxQY2_-tFFUAZN-4CgpX.
        invoice (str | Unset):  Example: rgb:~/~/~/bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-
            oI0gxZh-7fxQY2_-tFFUAZN-4CgpX?expiry=1695811760&endpoints=rpc://127.0.0.1:3000/json-rpc.
        expiration_timestamp (int | Unset):  Example: 1695811760.
        batch_transfer_idx (int | Unset):  Example: 1.
    """

    recipient_id: str | Unset = UNSET
    invoice: str | Unset = UNSET
    expiration_timestamp: int | Unset = UNSET
    batch_transfer_idx: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        recipient_id = self.recipient_id

        invoice = self.invoice

        expiration_timestamp = self.expiration_timestamp

        batch_transfer_idx = self.batch_transfer_idx

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if recipient_id is not UNSET:
            field_dict["recipient_id"] = recipient_id
        if invoice is not UNSET:
            field_dict["invoice"] = invoice
        if expiration_timestamp is not UNSET:
            field_dict["expiration_timestamp"] = expiration_timestamp
        if batch_transfer_idx is not UNSET:
            field_dict["batch_transfer_idx"] = batch_transfer_idx

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        recipient_id = d.pop("recipient_id", UNSET)

        invoice = d.pop("invoice", UNSET)

        expiration_timestamp = d.pop("expiration_timestamp", UNSET)

        batch_transfer_idx = d.pop("batch_transfer_idx", UNSET)

        rgb_invoice_response = cls(
            recipient_id=recipient_id,
            invoice=invoice,
            expiration_timestamp=expiration_timestamp,
            batch_transfer_idx=batch_transfer_idx,
        )

        rgb_invoice_response.additional_properties = d
        return rgb_invoice_response

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
