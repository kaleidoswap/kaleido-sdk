from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_status import SwapStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="Swap")


@_attrs_define
class Swap:
    """
    Attributes:
        qty_from (int):
        qty_to (int):
        payment_hash (str):
        status (SwapStatus):
        requested_at (int):
        expires_at (int):
        from_asset (Union[None, Unset, str]):
        to_asset (Union[None, Unset, str]):
        initiated_at (Union[None, Unset, int]):
        completed_at (Union[None, Unset, int]):
    """

    qty_from: int
    qty_to: int
    payment_hash: str
    status: SwapStatus
    requested_at: int
    expires_at: int
    from_asset: None | Unset | str = UNSET
    to_asset: None | Unset | str = UNSET
    initiated_at: None | Unset | int = UNSET
    completed_at: None | Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        qty_from = self.qty_from

        qty_to = self.qty_to

        payment_hash = self.payment_hash

        status = self.status.value

        requested_at = self.requested_at

        expires_at = self.expires_at

        from_asset: None | Unset | str
        if isinstance(self.from_asset, Unset):
            from_asset = UNSET
        else:
            from_asset = self.from_asset

        to_asset: None | Unset | str
        if isinstance(self.to_asset, Unset):
            to_asset = UNSET
        else:
            to_asset = self.to_asset

        initiated_at: None | Unset | int
        if isinstance(self.initiated_at, Unset):
            initiated_at = UNSET
        else:
            initiated_at = self.initiated_at

        completed_at: None | Unset | int
        if isinstance(self.completed_at, Unset):
            completed_at = UNSET
        else:
            completed_at = self.completed_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "qty_from": qty_from,
                "qty_to": qty_to,
                "payment_hash": payment_hash,
                "status": status,
                "requested_at": requested_at,
                "expires_at": expires_at,
            }
        )
        if from_asset is not UNSET:
            field_dict["from_asset"] = from_asset
        if to_asset is not UNSET:
            field_dict["to_asset"] = to_asset
        if initiated_at is not UNSET:
            field_dict["initiated_at"] = initiated_at
        if completed_at is not UNSET:
            field_dict["completed_at"] = completed_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        qty_from = d.pop("qty_from")

        qty_to = d.pop("qty_to")

        payment_hash = d.pop("payment_hash")

        status = SwapStatus(d.pop("status"))

        requested_at = d.pop("requested_at")

        expires_at = d.pop("expires_at")

        def _parse_from_asset(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        from_asset = _parse_from_asset(d.pop("from_asset", UNSET))

        def _parse_to_asset(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        to_asset = _parse_to_asset(d.pop("to_asset", UNSET))

        def _parse_initiated_at(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        initiated_at = _parse_initiated_at(d.pop("initiated_at", UNSET))

        def _parse_completed_at(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        completed_at = _parse_completed_at(d.pop("completed_at", UNSET))

        swap = cls(
            qty_from=qty_from,
            qty_to=qty_to,
            payment_hash=payment_hash,
            status=status,
            requested_at=requested_at,
            expires_at=expires_at,
            from_asset=from_asset,
            to_asset=to_asset,
            initiated_at=initiated_at,
            completed_at=completed_at,
        )

        swap.additional_properties = d
        return swap

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
