from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="ReachabilityCell")


@_attrs_define
class ReachabilityCell:
    """Single cell in reachability matrix.

    Attributes:
        from_asset (str): Source asset ticker
        to_asset (str): Destination asset ticker
        layers (list[str]): Available layer combinations (e.g., 'RGB_LN->BTC_SPARK')
        min_hops (int): Minimum number of hops required
    """

    from_asset: str
    to_asset: str
    layers: list[str]
    min_hops: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from_asset = self.from_asset

        to_asset = self.to_asset

        layers = self.layers

        min_hops = self.min_hops

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "from_asset": from_asset,
                "to_asset": to_asset,
                "layers": layers,
                "min_hops": min_hops,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        from_asset = d.pop("from_asset")

        to_asset = d.pop("to_asset")

        layers = cast(list[str], d.pop("layers"))

        min_hops = d.pop("min_hops")

        reachability_cell = cls(
            from_asset=from_asset,
            to_asset=to_asset,
            layers=layers,
            min_hops=min_hops,
        )

        reachability_cell.additional_properties = d
        return reachability_cell

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
