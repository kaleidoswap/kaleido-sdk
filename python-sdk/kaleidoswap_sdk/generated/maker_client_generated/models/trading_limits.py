from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TradingLimits")


@_attrs_define
class TradingLimits:
    """Trading limits for a layer.

    Combines a Layer (protocol/network) with min/max amount limits for trading.

        Attributes:
            layer (str): Settlement layer (e.g., 'BTC_LN', 'RGB_LN')
            min_amount (int): Minimum amount for trading (in smallest unit)
            max_amount (int): Maximum amount for trading (in smallest unit)
            is_active (Union[Unset, bool]): Whether this layer is active for trading Default: True.
    """

    layer: str
    min_amount: int
    max_amount: int
    is_active: Unset | bool = True
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        layer = self.layer

        min_amount = self.min_amount

        max_amount = self.max_amount

        is_active = self.is_active

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "layer": layer,
                "min_amount": min_amount,
                "max_amount": max_amount,
            }
        )
        if is_active is not UNSET:
            field_dict["is_active"] = is_active

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        layer = d.pop("layer")

        min_amount = d.pop("min_amount")

        max_amount = d.pop("max_amount")

        is_active = d.pop("is_active", UNSET)

        trading_limits = cls(
            layer=layer,
            min_amount=min_amount,
            max_amount=max_amount,
            is_active=is_active,
        )

        trading_limits.additional_properties = d
        return trading_limits

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
