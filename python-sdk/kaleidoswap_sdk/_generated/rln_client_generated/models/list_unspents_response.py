from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.unspent import Unspent


T = TypeVar("T", bound="ListUnspentsResponse")


@_attrs_define
class ListUnspentsResponse:
    """
    Attributes:
        unspents (Union[Unset, list['Unspent']]):
    """

    unspents: Unset | list["Unspent"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        unspents: Unset | list[dict[str, Any]] = UNSET
        if not isinstance(self.unspents, Unset):
            unspents = []
            for unspents_item_data in self.unspents:
                unspents_item = unspents_item_data.to_dict()
                unspents.append(unspents_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if unspents is not UNSET:
            field_dict["unspents"] = unspents

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.unspent import Unspent

        d = dict(src_dict)
        unspents = []
        _unspents = d.pop("unspents", UNSET)
        for unspents_item_data in _unspents or []:
            unspents_item = Unspent.from_dict(unspents_item_data)

            unspents.append(unspents_item)

        list_unspents_response = cls(
            unspents=unspents,
        )

        list_unspents_response.additional_properties = d
        return list_unspents_response

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
