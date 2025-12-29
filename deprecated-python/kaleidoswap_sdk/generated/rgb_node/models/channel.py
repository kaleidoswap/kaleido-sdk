from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.channel_status import ChannelStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="Channel")


@_attrs_define
class Channel:
    """
    Attributes:
        channel_id (str | Unset):  Example: 8129afe1b1d7cf60d5e1bf4c04b09bec925ed4df5417ceee0484e24f816a105a.
        funding_txid (str | Unset):  Example: 5a106a814fe28404eece1754dfd45e92ec9bb0044cbfe1d560cfd7b1e1af2981.
        peer_pubkey (str | Unset):  Example: 03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d.
        peer_alias (str | Unset):
        short_channel_id (int | Unset):  Example: 120946279120896.
        status (ChannelStatus | Unset):
        ready (bool | Unset):
        capacity_sat (int | Unset):  Example: 30010.
        local_balance_sat (int | Unset):  Example: 28616.
        outbound_balance_msat (int | Unset):  Example: 21616000.
        inbound_balance_msat (int | Unset):  Example: 6394000.
        next_outbound_htlc_limit_msat (int | Unset):  Example: 3001000.
        next_outbound_htlc_minimum_msat (int | Unset):  Example: 1.
        is_usable (bool | Unset):
        public (bool | Unset):  Example: True.
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        asset_local_amount (int | Unset):  Example: 777.
        asset_remote_amount (int | Unset):
    """

    channel_id: str | Unset = UNSET
    funding_txid: str | Unset = UNSET
    peer_pubkey: str | Unset = UNSET
    peer_alias: str | Unset = UNSET
    short_channel_id: int | Unset = UNSET
    status: ChannelStatus | Unset = UNSET
    ready: bool | Unset = UNSET
    capacity_sat: int | Unset = UNSET
    local_balance_sat: int | Unset = UNSET
    outbound_balance_msat: int | Unset = UNSET
    inbound_balance_msat: int | Unset = UNSET
    next_outbound_htlc_limit_msat: int | Unset = UNSET
    next_outbound_htlc_minimum_msat: int | Unset = UNSET
    is_usable: bool | Unset = UNSET
    public: bool | Unset = UNSET
    asset_id: str | Unset = UNSET
    asset_local_amount: int | Unset = UNSET
    asset_remote_amount: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        channel_id = self.channel_id

        funding_txid = self.funding_txid

        peer_pubkey = self.peer_pubkey

        peer_alias = self.peer_alias

        short_channel_id = self.short_channel_id

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        ready = self.ready

        capacity_sat = self.capacity_sat

        local_balance_sat = self.local_balance_sat

        outbound_balance_msat = self.outbound_balance_msat

        inbound_balance_msat = self.inbound_balance_msat

        next_outbound_htlc_limit_msat = self.next_outbound_htlc_limit_msat

        next_outbound_htlc_minimum_msat = self.next_outbound_htlc_minimum_msat

        is_usable = self.is_usable

        public = self.public

        asset_id = self.asset_id

        asset_local_amount = self.asset_local_amount

        asset_remote_amount = self.asset_remote_amount

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if channel_id is not UNSET:
            field_dict["channel_id"] = channel_id
        if funding_txid is not UNSET:
            field_dict["funding_txid"] = funding_txid
        if peer_pubkey is not UNSET:
            field_dict["peer_pubkey"] = peer_pubkey
        if peer_alias is not UNSET:
            field_dict["peer_alias"] = peer_alias
        if short_channel_id is not UNSET:
            field_dict["short_channel_id"] = short_channel_id
        if status is not UNSET:
            field_dict["status"] = status
        if ready is not UNSET:
            field_dict["ready"] = ready
        if capacity_sat is not UNSET:
            field_dict["capacity_sat"] = capacity_sat
        if local_balance_sat is not UNSET:
            field_dict["local_balance_sat"] = local_balance_sat
        if outbound_balance_msat is not UNSET:
            field_dict["outbound_balance_msat"] = outbound_balance_msat
        if inbound_balance_msat is not UNSET:
            field_dict["inbound_balance_msat"] = inbound_balance_msat
        if next_outbound_htlc_limit_msat is not UNSET:
            field_dict["next_outbound_htlc_limit_msat"] = next_outbound_htlc_limit_msat
        if next_outbound_htlc_minimum_msat is not UNSET:
            field_dict["next_outbound_htlc_minimum_msat"] = (
                next_outbound_htlc_minimum_msat
            )
        if is_usable is not UNSET:
            field_dict["is_usable"] = is_usable
        if public is not UNSET:
            field_dict["public"] = public
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if asset_local_amount is not UNSET:
            field_dict["asset_local_amount"] = asset_local_amount
        if asset_remote_amount is not UNSET:
            field_dict["asset_remote_amount"] = asset_remote_amount

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        channel_id = d.pop("channel_id", UNSET)

        funding_txid = d.pop("funding_txid", UNSET)

        peer_pubkey = d.pop("peer_pubkey", UNSET)

        peer_alias = d.pop("peer_alias", UNSET)

        short_channel_id = d.pop("short_channel_id", UNSET)

        _status = d.pop("status", UNSET)
        status: ChannelStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ChannelStatus(_status)

        ready = d.pop("ready", UNSET)

        capacity_sat = d.pop("capacity_sat", UNSET)

        local_balance_sat = d.pop("local_balance_sat", UNSET)

        outbound_balance_msat = d.pop("outbound_balance_msat", UNSET)

        inbound_balance_msat = d.pop("inbound_balance_msat", UNSET)

        next_outbound_htlc_limit_msat = d.pop("next_outbound_htlc_limit_msat", UNSET)

        next_outbound_htlc_minimum_msat = d.pop(
            "next_outbound_htlc_minimum_msat", UNSET
        )

        is_usable = d.pop("is_usable", UNSET)

        public = d.pop("public", UNSET)

        asset_id = d.pop("asset_id", UNSET)

        asset_local_amount = d.pop("asset_local_amount", UNSET)

        asset_remote_amount = d.pop("asset_remote_amount", UNSET)

        channel = cls(
            channel_id=channel_id,
            funding_txid=funding_txid,
            peer_pubkey=peer_pubkey,
            peer_alias=peer_alias,
            short_channel_id=short_channel_id,
            status=status,
            ready=ready,
            capacity_sat=capacity_sat,
            local_balance_sat=local_balance_sat,
            outbound_balance_msat=outbound_balance_msat,
            inbound_balance_msat=inbound_balance_msat,
            next_outbound_htlc_limit_msat=next_outbound_htlc_limit_msat,
            next_outbound_htlc_minimum_msat=next_outbound_htlc_minimum_msat,
            is_usable=is_usable,
            public=public,
            asset_id=asset_id,
            asset_local_amount=asset_local_amount,
            asset_remote_amount=asset_remote_amount,
        )

        channel.additional_properties = d
        return channel

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
