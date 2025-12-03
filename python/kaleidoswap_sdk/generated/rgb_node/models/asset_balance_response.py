from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AssetBalanceResponse")


@_attrs_define
class AssetBalanceResponse:
    """
    Attributes:
        settled (int | Unset):  Example: 777.
        future (int | Unset):  Example: 777.
        spendable (int | Unset):  Example: 777.
        offchain_outbound (int | Unset):  Example: 444.
        offchain_inbound (int | Unset):
    """

    settled: int | Unset = UNSET
    future: int | Unset = UNSET
    spendable: int | Unset = UNSET
    offchain_outbound: int | Unset = UNSET
    offchain_inbound: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        settled = self.settled

        future = self.future

        spendable = self.spendable

        offchain_outbound = self.offchain_outbound

        offchain_inbound = self.offchain_inbound

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if settled is not UNSET:
            field_dict["settled"] = settled
        if future is not UNSET:
            field_dict["future"] = future
        if spendable is not UNSET:
            field_dict["spendable"] = spendable
        if offchain_outbound is not UNSET:
            field_dict["offchain_outbound"] = offchain_outbound
        if offchain_inbound is not UNSET:
            field_dict["offchain_inbound"] = offchain_inbound

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        settled = d.pop("settled", UNSET)

        future = d.pop("future", UNSET)

        spendable = d.pop("spendable", UNSET)

        offchain_outbound = d.pop("offchain_outbound", UNSET)

        offchain_inbound = d.pop("offchain_inbound", UNSET)

        asset_balance_response = cls(
            settled=settled,
            future=future,
            spendable=spendable,
            offchain_outbound=offchain_outbound,
            offchain_inbound=offchain_inbound,
        )

        asset_balance_response.additional_properties = d
        return asset_balance_response

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
