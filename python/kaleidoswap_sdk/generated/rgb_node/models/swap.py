from __future__ import annotations

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
        qty_from (int | Unset):  Example: 30.
        qty_to (int | Unset):  Example: 10.
        from_asset (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        to_asset (str | Unset):  Example: rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE.
        payment_hash (str | Unset):  Example: 7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664.
        status (SwapStatus | Unset):
        requested_at (int | Unset):  Example: 1691160765.
        initiated_at (int | Unset):  Example: 1691168512.
        expires_at (int | Unset):  Example: 1691172703.
        completed_at (int | Unset):  Example: 1691171075.
    """

    qty_from: int | Unset = UNSET
    qty_to: int | Unset = UNSET
    from_asset: str | Unset = UNSET
    to_asset: str | Unset = UNSET
    payment_hash: str | Unset = UNSET
    status: SwapStatus | Unset = UNSET
    requested_at: int | Unset = UNSET
    initiated_at: int | Unset = UNSET
    expires_at: int | Unset = UNSET
    completed_at: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        qty_from = self.qty_from

        qty_to = self.qty_to

        from_asset = self.from_asset

        to_asset = self.to_asset

        payment_hash = self.payment_hash

        status: str | Unset = UNSET
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
        status: SwapStatus | Unset
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
