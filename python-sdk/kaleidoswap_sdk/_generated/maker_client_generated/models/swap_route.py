from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="SwapRoute")


@_attrs_define
class SwapRoute:
    """Pre-computed valid swap route between two layers.

    Represents a specific path for swapping: from_layer -> to_layer.
    Frozen for immutability and hashability (enables use in sets, dict keys).

        Attributes:
            from_layer (str):
            to_layer (str):
    """

    from_layer: str
    to_layer: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from_layer = self.from_layer

        to_layer = self.to_layer

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "from_layer": from_layer,
                "to_layer": to_layer,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        from_layer = d.pop("from_layer")

        to_layer = d.pop("to_layer")

        swap_route = cls(
            from_layer=from_layer,
            to_layer=to_layer,
        )

        swap_route.additional_properties = d
        return swap_route

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
