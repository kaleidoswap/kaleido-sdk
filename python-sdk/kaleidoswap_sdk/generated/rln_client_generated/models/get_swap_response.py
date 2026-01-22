from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.swap import Swap


T = TypeVar("T", bound="GetSwapResponse")


@_attrs_define
class GetSwapResponse:
    """
    Attributes:
        swap (Union[Unset, Swap]):
    """

    swap: Union[Unset, "Swap"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        swap: Unset | dict[str, Any] = UNSET
        if not isinstance(self.swap, Unset):
            swap = self.swap.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if swap is not UNSET:
            field_dict["swap"] = swap

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.swap import Swap

        d = dict(src_dict)
        _swap = d.pop("swap", UNSET)
        swap: Unset | Swap
        if isinstance(_swap, Unset):
            swap = UNSET
        else:
            swap = Swap.from_dict(_swap)

        get_swap_response = cls(
            swap=swap,
        )

        get_swap_response.additional_properties = d
        return get_swap_response

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
