from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="BtcBalance")


@_attrs_define
class BtcBalance:
    """
    Attributes:
        settled (Union[Unset, int]):
        future (Union[Unset, int]):
        spendable (Union[Unset, int]):
    """

    settled: Unset | int = UNSET
    future: Unset | int = UNSET
    spendable: Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        settled = self.settled

        future = self.future

        spendable = self.spendable

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if settled is not UNSET:
            field_dict["settled"] = settled
        if future is not UNSET:
            field_dict["future"] = future
        if spendable is not UNSET:
            field_dict["spendable"] = spendable

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        settled = d.pop("settled", UNSET)

        future = d.pop("future", UNSET)

        spendable = d.pop("spendable", UNSET)

        btc_balance = cls(
            settled=settled,
            future=future,
            spendable=spendable,
        )

        btc_balance.additional_properties = d
        return btc_balance

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
