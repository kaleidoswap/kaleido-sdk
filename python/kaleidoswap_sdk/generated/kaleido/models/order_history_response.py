from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.swap_order import SwapOrder


T = TypeVar("T", bound="OrderHistoryResponse")


@_attrs_define
class OrderHistoryResponse:
    """
    Attributes:
        orders (list[SwapOrder]): List of orders
        total_count (int): Total number of orders matching the filter
        has_more (bool): Whether there are more orders available
    """

    orders: list[SwapOrder]
    total_count: int
    has_more: bool
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        orders = []
        for orders_item_data in self.orders:
            orders_item = orders_item_data.to_dict()
            orders.append(orders_item)

        total_count = self.total_count

        has_more = self.has_more

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "orders": orders,
                "total_count": total_count,
                "has_more": has_more,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.swap_order import SwapOrder

        d = dict(src_dict)
        orders = []
        _orders = d.pop("orders")
        for orders_item_data in _orders:
            orders_item = SwapOrder.from_dict(orders_item_data)

            orders.append(orders_item)

        total_count = d.pop("total_count")

        has_more = d.pop("has_more")

        order_history_response = cls(
            orders=orders,
            total_count=total_count,
            has_more=has_more,
        )

        order_history_response.additional_properties = d
        return order_history_response

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
