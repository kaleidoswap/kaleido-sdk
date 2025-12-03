from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="FailTransfersRequest")


@_attrs_define
class FailTransfersRequest:
    """
    Attributes:
        batch_transfer_idx (int | Unset):
        no_asset_only (bool | Unset):
        skip_sync (bool | Unset):
    """

    batch_transfer_idx: int | Unset = UNSET
    no_asset_only: bool | Unset = UNSET
    skip_sync: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        batch_transfer_idx = self.batch_transfer_idx

        no_asset_only = self.no_asset_only

        skip_sync = self.skip_sync

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if batch_transfer_idx is not UNSET:
            field_dict["batch_transfer_idx"] = batch_transfer_idx
        if no_asset_only is not UNSET:
            field_dict["no_asset_only"] = no_asset_only
        if skip_sync is not UNSET:
            field_dict["skip_sync"] = skip_sync

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        batch_transfer_idx = d.pop("batch_transfer_idx", UNSET)

        no_asset_only = d.pop("no_asset_only", UNSET)

        skip_sync = d.pop("skip_sync", UNSET)

        fail_transfers_request = cls(
            batch_transfer_idx=batch_transfer_idx,
            no_asset_only=no_asset_only,
            skip_sync=skip_sync,
        )

        fail_transfers_request.additional_properties = d
        return fail_transfers_request

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
