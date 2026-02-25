from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_status import SwapStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="Swap")


@_attrs_define
class Swap:
    """
    Attributes:
        qty_from (Union[Unset, int]):
        qty_to (Union[Unset, int]):
        from_asset (Union[Unset, str]):
        to_asset (Union[Unset, str]):
        payment_hash (Union[Unset, str]):
        status (Union[Unset, SwapStatus]):
        requested_at (Union[Unset, int]):
        initiated_at (Union[Unset, int]):
        expires_at (Union[Unset, int]):
        completed_at (Union[Unset, int]):
    """

    qty_from: Unset | int = UNSET
    qty_to: Unset | int = UNSET
    from_asset: Unset | str = UNSET
    to_asset: Unset | str = UNSET
    payment_hash: Unset | str = UNSET
    status: Unset | SwapStatus = UNSET
    requested_at: Unset | int = UNSET
    initiated_at: Unset | int = UNSET
    expires_at: Unset | int = UNSET
    completed_at: Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        qty_from = self.qty_from

        qty_to = self.qty_to

        from_asset = self.from_asset

        to_asset = self.to_asset

        payment_hash = self.payment_hash

        status: Unset | str = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        requested_at = self.requested_at

        initiated_at = self.initiated_at

        expires_at = self.expires_at

        completed_at = self.completed_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if qty_from is not UNSET:
            field_dict["qty_from"] = qty_from
        if qty_to is not UNSET:
            field_dict["qty_to"] = qty_to
        if from_asset is not UNSET:
            field_dict["from_asset"] = from_asset
        if to_asset is not UNSET:
            field_dict["to_asset"] = to_asset
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if status is not UNSET:
            field_dict["status"] = status
        if requested_at is not UNSET:
            field_dict["requested_at"] = requested_at
        if initiated_at is not UNSET:
            field_dict["initiated_at"] = initiated_at
        if expires_at is not UNSET:
            field_dict["expires_at"] = expires_at
        if completed_at is not UNSET:
            field_dict["completed_at"] = completed_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        qty_from = d.pop("qty_from", UNSET)

        qty_to = d.pop("qty_to", UNSET)

        from_asset = d.pop("from_asset", UNSET)

        to_asset = d.pop("to_asset", UNSET)

        payment_hash = d.pop("payment_hash", UNSET)

        _status = d.pop("status", UNSET)
        status: Unset | SwapStatus
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = SwapStatus(_status)

        requested_at = d.pop("requested_at", UNSET)

        initiated_at = d.pop("initiated_at", UNSET)

        expires_at = d.pop("expires_at", UNSET)

        completed_at = d.pop("completed_at", UNSET)

        swap = cls(
            qty_from=qty_from,
            qty_to=qty_to,
            from_asset=from_asset,
            to_asset=to_asset,
            payment_hash=payment_hash,
            status=status,
            requested_at=requested_at,
            initiated_at=initiated_at,
            expires_at=expires_at,
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
