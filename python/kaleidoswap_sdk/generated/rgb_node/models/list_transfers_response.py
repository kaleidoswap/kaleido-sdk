from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.transfer import Transfer


T = TypeVar("T", bound="ListTransfersResponse")


@_attrs_define
class ListTransfersResponse:
    """
    Attributes:
        transfers (list[Transfer] | Unset):
    """

    transfers: list[Transfer] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        transfers: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.transfers, Unset):
            transfers = []
            for transfers_item_data in self.transfers:
                transfers_item = transfers_item_data.to_dict()
                transfers.append(transfers_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if transfers is not UNSET:
            field_dict["transfers"] = transfers

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.transfer import Transfer

        d = dict(src_dict)
        _transfers = d.pop("transfers", UNSET)
        transfers: list[Transfer] | Unset = UNSET
        if _transfers is not UNSET:
            transfers = []
            for transfers_item_data in _transfers:
                transfers_item = Transfer.from_dict(transfers_item_data)

                transfers.append(transfers_item)

        list_transfers_response = cls(
            transfers=transfers,
        )

        list_transfers_response.additional_properties = d
        return list_transfers_response

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
