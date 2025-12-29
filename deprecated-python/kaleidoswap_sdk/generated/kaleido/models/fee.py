from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Fee")


@_attrs_define
class Fee:
    """
    Attributes:
        base_fee (int):  Example: 1000000.
        variable_fee (int):  Example: 1000000.
        fee_rate (float):  Example: 0.0001.
        final_fee (int):  Example: 2000000.
        fee_asset (str):  Example: rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd.
        fee_asset_precision (int):  Example: 6.
    """

    base_fee: int
    variable_fee: int
    fee_rate: float
    final_fee: int
    fee_asset: str
    fee_asset_precision: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        base_fee = self.base_fee

        variable_fee = self.variable_fee

        fee_rate = self.fee_rate

        final_fee = self.final_fee

        fee_asset = self.fee_asset

        fee_asset_precision = self.fee_asset_precision

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "base_fee": base_fee,
                "variable_fee": variable_fee,
                "fee_rate": fee_rate,
                "final_fee": final_fee,
                "fee_asset": fee_asset,
                "fee_asset_precision": fee_asset_precision,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        base_fee = d.pop("base_fee")

        variable_fee = d.pop("variable_fee")

        fee_rate = d.pop("fee_rate")

        final_fee = d.pop("final_fee")

        fee_asset = d.pop("fee_asset")

        fee_asset_precision = d.pop("fee_asset_precision")

        fee = cls(
            base_fee=base_fee,
            variable_fee=variable_fee,
            fee_rate=fee_rate,
            final_fee=final_fee,
            fee_asset=fee_asset,
            fee_asset_precision=fee_asset_precision,
        )

        fee.additional_properties = d
        return fee

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
