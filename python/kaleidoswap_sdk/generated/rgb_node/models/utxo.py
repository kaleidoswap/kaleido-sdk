from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="Utxo")


@_attrs_define
class Utxo:
    """
    Attributes:
        outpoint (str | Unset):  Example: efed66f5309396ff43c8a09941c8103d9d5bbffd473ad9f13013ac89fb6b4671:0.
        btc_amount (int | Unset):  Example: 1000.
        colorable (bool | Unset):  Example: True.
    """

    outpoint: str | Unset = UNSET
    btc_amount: int | Unset = UNSET
    colorable: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        outpoint = self.outpoint

        btc_amount = self.btc_amount

        colorable = self.colorable

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if outpoint is not UNSET:
            field_dict["outpoint"] = outpoint
        if btc_amount is not UNSET:
            field_dict["btc_amount"] = btc_amount
        if colorable is not UNSET:
            field_dict["colorable"] = colorable

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        outpoint = d.pop("outpoint", UNSET)

        btc_amount = d.pop("btc_amount", UNSET)

        colorable = d.pop("colorable", UNSET)

        utxo = cls(
            outpoint=outpoint,
            btc_amount=btc_amount,
            colorable=colorable,
        )

        utxo.additional_properties = d
        return utxo

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
