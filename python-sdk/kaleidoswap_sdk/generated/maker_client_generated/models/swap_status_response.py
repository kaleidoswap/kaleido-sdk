from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.swap import Swap


T = TypeVar("T", bound="SwapStatusResponse")


@_attrs_define
class SwapStatusResponse:
    """
    Attributes:
        swap (Union['Swap', None, Unset]):
    """

    swap: Union["Swap", None, Unset] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.swap import Swap

        swap: None | Unset | dict[str, Any]
        if isinstance(self.swap, Unset):
            swap = UNSET
        elif isinstance(self.swap, Swap):
            swap = self.swap.to_dict()
        else:
            swap = self.swap

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

        def _parse_swap(data: object) -> Union["Swap", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                swap_type_1 = Swap.from_dict(data)

                return swap_type_1
            except:  # noqa: E722
                pass
            return cast(Union["Swap", None, Unset], data)

        swap = _parse_swap(d.pop("swap", UNSET))

        swap_status_response = cls(
            swap=swap,
        )

        swap_status_response.additional_properties = d
        return swap_status_response

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
