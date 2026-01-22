from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.route_step import RouteStep


T = TypeVar("T", bound="MultiHopRoute")


@_attrs_define
class MultiHopRoute:
    """Complete route with one or more steps.

    Attributes:
        steps (list['RouteStep']): Ordered list of route steps
        total_hops (int): Number of hops in the route
    """

    steps: list["RouteStep"]
    total_hops: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        steps = []
        for steps_item_data in self.steps:
            steps_item = steps_item_data.to_dict()
            steps.append(steps_item)

        total_hops = self.total_hops

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "steps": steps,
                "total_hops": total_hops,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.route_step import RouteStep

        d = dict(src_dict)
        steps = []
        _steps = d.pop("steps")
        for steps_item_data in _steps:
            steps_item = RouteStep.from_dict(steps_item_data)

            steps.append(steps_item)

        total_hops = d.pop("total_hops")

        multi_hop_route = cls(
            steps=steps,
            total_hops=total_hops,
        )

        multi_hop_route.additional_properties = d
        return multi_hop_route

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
