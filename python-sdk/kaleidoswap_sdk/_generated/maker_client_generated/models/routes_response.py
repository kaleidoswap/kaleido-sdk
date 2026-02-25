from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.multi_hop_route import MultiHopRoute


T = TypeVar("T", bound="RoutesResponse")


@_attrs_define
class RoutesResponse:
    """Response with discovered routes.

    Attributes:
        routes (list['MultiHopRoute']): List of discovered routes
        timestamp (int): Response timestamp
    """

    routes: list["MultiHopRoute"]
    timestamp: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        routes = []
        for routes_item_data in self.routes:
            routes_item = routes_item_data.to_dict()
            routes.append(routes_item)

        timestamp = self.timestamp

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "routes": routes,
                "timestamp": timestamp,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.multi_hop_route import MultiHopRoute

        d = dict(src_dict)
        routes = []
        _routes = d.pop("routes")
        for routes_item_data in _routes:
            routes_item = MultiHopRoute.from_dict(routes_item_data)

            routes.append(routes_item)

        timestamp = d.pop("timestamp")

        routes_response = cls(
            routes=routes,
            timestamp=timestamp,
        )

        routes_response.additional_properties = d
        return routes_response

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
