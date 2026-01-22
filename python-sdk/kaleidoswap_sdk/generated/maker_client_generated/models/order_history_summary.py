from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_order_status import SwapOrderStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="OrderHistorySummary")


@_attrs_define
class OrderHistorySummary:
    """Simplified order information for history listing

    Attributes:
        id (str): Order ID
        status (SwapOrderStatus):
        from_asset (str): Asset being swapped from
        from_amount (int): Amount of from_asset
        to_asset (str): Asset being swapped to
        to_amount (int): Amount of to_asset
        created_at (int): Order creation timestamp
        filled_at (Union[None, Unset, int]): Order completion timestamp
    """

    id: str
    status: SwapOrderStatus
    from_asset: str
    from_amount: int
    to_asset: str
    to_amount: int
    created_at: int
    filled_at: None | Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        status = self.status.value

        from_asset = self.from_asset

        from_amount = self.from_amount

        to_asset = self.to_asset

        to_amount = self.to_amount

        created_at = self.created_at

        filled_at: None | Unset | int
        if isinstance(self.filled_at, Unset):
            filled_at = UNSET
        else:
            filled_at = self.filled_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "status": status,
                "from_asset": from_asset,
                "from_amount": from_amount,
                "to_asset": to_asset,
                "to_amount": to_amount,
                "created_at": created_at,
            }
        )
        if filled_at is not UNSET:
            field_dict["filled_at"] = filled_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        status = SwapOrderStatus(d.pop("status"))

        from_asset = d.pop("from_asset")

        from_amount = d.pop("from_amount")

        to_asset = d.pop("to_asset")

        to_amount = d.pop("to_amount")

        created_at = d.pop("created_at")

        def _parse_filled_at(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        filled_at = _parse_filled_at(d.pop("filled_at", UNSET))

        order_history_summary = cls(
            id=id,
            status=status,
            from_asset=from_asset,
            from_amount=from_amount,
            to_asset=to_asset,
            to_amount=to_amount,
            created_at=created_at,
            filled_at=filled_at,
        )

        order_history_summary.additional_properties = d
        return order_history_summary

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
