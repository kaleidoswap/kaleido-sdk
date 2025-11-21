from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="DecodeRGBInvoiceRequest")


@_attrs_define
class DecodeRGBInvoiceRequest:
    """
    Attributes:
        invoice (str | Unset):  Example: rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-
            brRJrzE/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/~/bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-
            oI0gxZh-7fxQY2_-tFFUAZN-4CgpX?expiry=1749906951&endpoints=rpcs://proxy.iriswallet.com/0.2/json-rpc.
    """

    invoice: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        invoice = self.invoice

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if invoice is not UNSET:
            field_dict["invoice"] = invoice

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        invoice = d.pop("invoice", UNSET)

        decode_rgb_invoice_request = cls(
            invoice=invoice,
        )

        decode_rgb_invoice_request.additional_properties = d
        return decode_rgb_invoice_request

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
