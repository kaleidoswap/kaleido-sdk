from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.status_counts import StatusCounts


T = TypeVar("T", bound="OrderStatsResponse")


@_attrs_define
class OrderStatsResponse:
    """
    Attributes:
        status_counts (StatusCounts): Count of orders by status
        filled_orders_volume (int): Total volume of filled orders
        filled_orders_count (int): Total count of filled orders
    """

    status_counts: "StatusCounts"
    filled_orders_volume: int
    filled_orders_count: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        status_counts = self.status_counts.to_dict()

        filled_orders_volume = self.filled_orders_volume

        filled_orders_count = self.filled_orders_count

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "status_counts": status_counts,
                "filled_orders_volume": filled_orders_volume,
                "filled_orders_count": filled_orders_count,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.status_counts import StatusCounts

        d = dict(src_dict)
        status_counts = StatusCounts.from_dict(d.pop("status_counts"))

        filled_orders_volume = d.pop("filled_orders_volume")

        filled_orders_count = d.pop("filled_orders_count")

        order_stats_response = cls(
            status_counts=status_counts,
            filled_orders_volume=filled_orders_volume,
            filled_orders_count=filled_orders_count,
        )

        order_stats_response.additional_properties = d
        return order_stats_response

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
