from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="OpenChannelRequest")


@_attrs_define
class OpenChannelRequest:
    """
    Attributes:
        peer_pubkey_and_opt_addr (str | Unset):  Example:
            03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d@localhost:9736.
        capacity_sat (int | Unset):  Example: 30010.
        push_msat (int | Unset):  Example: 1394000.
        asset_amount (int | Unset):  Example: 333.
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        public (bool | Unset):  Example: True.
        with_anchors (bool | Unset):  Example: True.
        fee_base_msat (int | Unset):  Example: 1000.
        fee_proportional_millionths (int | Unset):
        temporary_channel_id (str | Unset):  Example: a8b60c8ce3067b5fc881d4831323e24751daec3b64353c8df3205ec5d838f1c5.
    """

    peer_pubkey_and_opt_addr: str | Unset = UNSET
    capacity_sat: int | Unset = UNSET
    push_msat: int | Unset = UNSET
    asset_amount: int | Unset = UNSET
    asset_id: str | Unset = UNSET
    public: bool | Unset = UNSET
    with_anchors: bool | Unset = UNSET
    fee_base_msat: int | Unset = UNSET
    fee_proportional_millionths: int | Unset = UNSET
    temporary_channel_id: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        peer_pubkey_and_opt_addr = self.peer_pubkey_and_opt_addr

        capacity_sat = self.capacity_sat

        push_msat = self.push_msat

        asset_amount = self.asset_amount

        asset_id = self.asset_id

        public = self.public

        with_anchors = self.with_anchors

        fee_base_msat = self.fee_base_msat

        fee_proportional_millionths = self.fee_proportional_millionths

        temporary_channel_id = self.temporary_channel_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if peer_pubkey_and_opt_addr is not UNSET:
            field_dict["peer_pubkey_and_opt_addr"] = peer_pubkey_and_opt_addr
        if capacity_sat is not UNSET:
            field_dict["capacity_sat"] = capacity_sat
        if push_msat is not UNSET:
            field_dict["push_msat"] = push_msat
        if asset_amount is not UNSET:
            field_dict["asset_amount"] = asset_amount
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if public is not UNSET:
            field_dict["public"] = public
        if with_anchors is not UNSET:
            field_dict["with_anchors"] = with_anchors
        if fee_base_msat is not UNSET:
            field_dict["fee_base_msat"] = fee_base_msat
        if fee_proportional_millionths is not UNSET:
            field_dict["fee_proportional_millionths"] = fee_proportional_millionths
        if temporary_channel_id is not UNSET:
            field_dict["temporary_channel_id"] = temporary_channel_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        peer_pubkey_and_opt_addr = d.pop("peer_pubkey_and_opt_addr", UNSET)

        capacity_sat = d.pop("capacity_sat", UNSET)

        push_msat = d.pop("push_msat", UNSET)

        asset_amount = d.pop("asset_amount", UNSET)

        asset_id = d.pop("asset_id", UNSET)

        public = d.pop("public", UNSET)

        with_anchors = d.pop("with_anchors", UNSET)

        fee_base_msat = d.pop("fee_base_msat", UNSET)

        fee_proportional_millionths = d.pop("fee_proportional_millionths", UNSET)

        temporary_channel_id = d.pop("temporary_channel_id", UNSET)

        open_channel_request = cls(
            peer_pubkey_and_opt_addr=peer_pubkey_and_opt_addr,
            capacity_sat=capacity_sat,
            push_msat=push_msat,
            asset_amount=asset_amount,
            asset_id=asset_id,
            public=public,
            with_anchors=with_anchors,
            fee_base_msat=fee_base_msat,
            fee_proportional_millionths=fee_proportional_millionths,
            temporary_channel_id=temporary_channel_id,
        )

        open_channel_request.additional_properties = d
        return open_channel_request

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
