from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ChannelFees")


@_attrs_define
class ChannelFees:
    """
    Attributes:
        setup_fee (int):
        capacity_fee (int):
        duration_fee (int):
        total_fee (int):
        applied_discount (Union[None, Unset, float]):
        discount_code (Union[None, Unset, str]):
    """

    setup_fee: int
    capacity_fee: int
    duration_fee: int
    total_fee: int
    applied_discount: None | Unset | float = UNSET
    discount_code: None | Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        setup_fee = self.setup_fee

        capacity_fee = self.capacity_fee

        duration_fee = self.duration_fee

        total_fee = self.total_fee

        applied_discount: None | Unset | float
        if isinstance(self.applied_discount, Unset):
            applied_discount = UNSET
        else:
            applied_discount = self.applied_discount

        discount_code: None | Unset | str
        if isinstance(self.discount_code, Unset):
            discount_code = UNSET
        else:
            discount_code = self.discount_code

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "setup_fee": setup_fee,
                "capacity_fee": capacity_fee,
                "duration_fee": duration_fee,
                "total_fee": total_fee,
            }
        )
        if applied_discount is not UNSET:
            field_dict["applied_discount"] = applied_discount
        if discount_code is not UNSET:
            field_dict["discount_code"] = discount_code

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        setup_fee = d.pop("setup_fee")

        capacity_fee = d.pop("capacity_fee")

        duration_fee = d.pop("duration_fee")

        total_fee = d.pop("total_fee")

        def _parse_applied_discount(data: object) -> None | Unset | float:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | float, data)

        applied_discount = _parse_applied_discount(d.pop("applied_discount", UNSET))

        def _parse_discount_code(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        discount_code = _parse_discount_code(d.pop("discount_code", UNSET))

        channel_fees = cls(
            setup_fee=setup_fee,
            capacity_fee=capacity_fee,
            duration_fee=duration_fee,
            total_fee=total_fee,
            applied_discount=applied_discount,
            discount_code=discount_code,
        )

        channel_fees.additional_properties = d
        return channel_fees

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
