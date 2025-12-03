from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_order_status import SwapOrderStatus

if TYPE_CHECKING:
    from ..models.swap_order import SwapOrder


T = TypeVar("T", bound="SwapOrderStatusResponse")


@_attrs_define
class SwapOrderStatusResponse:
    """
    Attributes:
        order_id (str):
        status (SwapOrderStatus):
        order (SwapOrder):
    """

    order_id: str
    status: SwapOrderStatus
    order: SwapOrder
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        order_id = self.order_id

        status = self.status.value

        order = self.order.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "order_id": order_id,
                "status": status,
                "order": order,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.swap_order import SwapOrder

        d = dict(src_dict)
        order_id = d.pop("order_id")

        status = SwapOrderStatus(d.pop("status"))

        order = SwapOrder.from_dict(d.pop("order"))

        swap_order_status_response = cls(
            order_id=order_id,
            status=status,
            order=order,
        )

        swap_order_status_response.additional_properties = d
        return swap_order_status_response

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
