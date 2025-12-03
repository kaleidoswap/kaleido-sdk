from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.btc_balance import BtcBalance


T = TypeVar("T", bound="BtcBalanceResponse")


@_attrs_define
class BtcBalanceResponse:
    """
    Attributes:
        vanilla (BtcBalance | Unset):
        colored (BtcBalance | Unset):
    """

    vanilla: BtcBalance | Unset = UNSET
    colored: BtcBalance | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        vanilla: dict[str, Any] | Unset = UNSET
        if not isinstance(self.vanilla, Unset):
            vanilla = self.vanilla.to_dict()

        colored: dict[str, Any] | Unset = UNSET
        if not isinstance(self.colored, Unset):
            colored = self.colored.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if vanilla is not UNSET:
            field_dict["vanilla"] = vanilla
        if colored is not UNSET:
            field_dict["colored"] = colored

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.btc_balance import BtcBalance

        d = dict(src_dict)
        _vanilla = d.pop("vanilla", UNSET)
        vanilla: BtcBalance | Unset
        if isinstance(_vanilla, Unset):
            vanilla = UNSET
        else:
            vanilla = BtcBalance.from_dict(_vanilla)

        _colored = d.pop("colored", UNSET)
        colored: BtcBalance | Unset
        if isinstance(_colored, Unset):
            colored = UNSET
        else:
            colored = BtcBalance.from_dict(_colored)

        btc_balance_response = cls(
            vanilla=vanilla,
            colored=colored,
        )

        btc_balance_response.additional_properties = d
        return btc_balance_response

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
