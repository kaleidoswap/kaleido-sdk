from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.pair import Pair


T = TypeVar("T", bound="PairResponse")


@_attrs_define
class PairResponse:
    """
    Attributes:
        pairs (list[Pair]):
    """

    pairs: list[Pair]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        pairs = []
        for pairs_item_data in self.pairs:
            pairs_item = pairs_item_data.to_dict()
            pairs.append(pairs_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "pairs": pairs,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.pair import Pair

        d = dict(src_dict)
        pairs = []
        _pairs = d.pop("pairs")
        for pairs_item_data in _pairs:
            pairs_item = Pair.from_dict(pairs_item_data)

            pairs.append(pairs_item)

        pair_response = cls(
            pairs=pairs,
        )

        pair_response.additional_properties = d
        return pair_response

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
