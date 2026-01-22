from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="KeysendRequest")


@_attrs_define
class KeysendRequest:
    """
    Attributes:
        dest_pubkey (Union[Unset, str]):
        amt_msat (Union[Unset, int]):
        asset_id (Union[Unset, str]):
        asset_amount (Union[Unset, int]):
    """

    dest_pubkey: Unset | str = UNSET
    amt_msat: Unset | int = UNSET
    asset_id: Unset | str = UNSET
    asset_amount: Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        dest_pubkey = self.dest_pubkey

        amt_msat = self.amt_msat

        asset_id = self.asset_id

        asset_amount = self.asset_amount

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if dest_pubkey is not UNSET:
            field_dict["dest_pubkey"] = dest_pubkey
        if amt_msat is not UNSET:
            field_dict["amt_msat"] = amt_msat
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if asset_amount is not UNSET:
            field_dict["asset_amount"] = asset_amount

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        dest_pubkey = d.pop("dest_pubkey", UNSET)

        amt_msat = d.pop("amt_msat", UNSET)

        asset_id = d.pop("asset_id", UNSET)

        asset_amount = d.pop("asset_amount", UNSET)

        keysend_request = cls(
            dest_pubkey=dest_pubkey,
            amt_msat=amt_msat,
            asset_id=asset_id,
            asset_amount=asset_amount,
        )

        keysend_request.additional_properties = d
        return keysend_request

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
