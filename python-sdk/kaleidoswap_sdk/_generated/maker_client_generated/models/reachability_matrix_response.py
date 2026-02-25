from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.reachability_cell import ReachabilityCell


T = TypeVar("T", bound="ReachabilityMatrixResponse")


@_attrs_define
class ReachabilityMatrixResponse:
    """Full reachability matrix response.

    Attributes:
        matrix (list['ReachabilityCell']): Reachability cells
        assets (list[str]): All assets in the matrix
        timestamp (int): Response timestamp
    """

    matrix: list["ReachabilityCell"]
    assets: list[str]
    timestamp: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        matrix = []
        for matrix_item_data in self.matrix:
            matrix_item = matrix_item_data.to_dict()
            matrix.append(matrix_item)

        assets = self.assets

        timestamp = self.timestamp

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "matrix": matrix,
                "assets": assets,
                "timestamp": timestamp,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.reachability_cell import ReachabilityCell

        d = dict(src_dict)
        matrix = []
        _matrix = d.pop("matrix")
        for matrix_item_data in _matrix:
            matrix_item = ReachabilityCell.from_dict(matrix_item_data)

            matrix.append(matrix_item)

        assets = cast(list[str], d.pop("assets"))

        timestamp = d.pop("timestamp")

        reachability_matrix_response = cls(
            matrix=matrix,
            assets=assets,
            timestamp=timestamp,
        )

        reachability_matrix_response.additional_properties = d
        return reachability_matrix_response

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
