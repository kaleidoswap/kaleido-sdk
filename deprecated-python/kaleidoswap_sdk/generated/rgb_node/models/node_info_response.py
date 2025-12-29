from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NodeInfoResponse")


@_attrs_define
class NodeInfoResponse:
    """
    Attributes:
        pubkey (str | Unset):  Example: 02270dadcd6e7ba0ef707dac72acccae1a3607453a8dd2aef36ff3be4e0d31f043.
        num_channels (int | Unset):  Example: 1.
        num_usable_channels (int | Unset):
        local_balance_sat (int | Unset):  Example: 28616.
        eventual_close_fees_sat (int | Unset):  Example: 892.
        pending_outbound_payments_sat (int | Unset):  Example: 7852.
        num_peers (int | Unset):  Example: 1.
        account_xpub_vanilla (str | Unset):  Example:
            tpubDDfzqHEET3ksD81qshMHkw35yp6TuLP1kr5rWWeJcLAqDfMXKDJzmDwAnda6DCqw7kkkhPphuDZFE2a6Sw8h5ZA5NwmtTssEnjMqN7xMzSd.
        account_xpub_colored (str | Unset):  Example:
            tpubDDcdKhaxwVV2T6xwigti7dSY1a7LHFwZmKAaLWtNhzrvuTXqjjzo8U7YQkUuPah5yHvnk3cbXmb18ZRFwHEKTFUQmA9dij1nPVA2LCJCiEa.
        max_media_upload_size_mb (int | Unset):  Example: 5.
        rgb_htlc_min_msat (int | Unset):  Example: 3000000.
        rgb_channel_capacity_min_sat (int | Unset):  Example: 30010.
        channel_capacity_min_sat (int | Unset):  Example: 5506.
        channel_capacity_max_sat (int | Unset):  Example: 16777215.
        channel_asset_min_amount (int | Unset):  Example: 1.
        channel_asset_max_amount (int | Unset):  Example: 18446744073709551615.
        network_nodes (int | Unset):  Example: 987226.
        network_channels (int | Unset):  Example: 7812821.
    """

    pubkey: str | Unset = UNSET
    num_channels: int | Unset = UNSET
    num_usable_channels: int | Unset = UNSET
    local_balance_sat: int | Unset = UNSET
    eventual_close_fees_sat: int | Unset = UNSET
    pending_outbound_payments_sat: int | Unset = UNSET
    num_peers: int | Unset = UNSET
    account_xpub_vanilla: str | Unset = UNSET
    account_xpub_colored: str | Unset = UNSET
    max_media_upload_size_mb: int | Unset = UNSET
    rgb_htlc_min_msat: int | Unset = UNSET
    rgb_channel_capacity_min_sat: int | Unset = UNSET
    channel_capacity_min_sat: int | Unset = UNSET
    channel_capacity_max_sat: int | Unset = UNSET
    channel_asset_min_amount: int | Unset = UNSET
    channel_asset_max_amount: int | Unset = UNSET
    network_nodes: int | Unset = UNSET
    network_channels: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        pubkey = self.pubkey

        num_channels = self.num_channels

        num_usable_channels = self.num_usable_channels

        local_balance_sat = self.local_balance_sat

        eventual_close_fees_sat = self.eventual_close_fees_sat

        pending_outbound_payments_sat = self.pending_outbound_payments_sat

        num_peers = self.num_peers

        account_xpub_vanilla = self.account_xpub_vanilla

        account_xpub_colored = self.account_xpub_colored

        max_media_upload_size_mb = self.max_media_upload_size_mb

        rgb_htlc_min_msat = self.rgb_htlc_min_msat

        rgb_channel_capacity_min_sat = self.rgb_channel_capacity_min_sat

        channel_capacity_min_sat = self.channel_capacity_min_sat

        channel_capacity_max_sat = self.channel_capacity_max_sat

        channel_asset_min_amount = self.channel_asset_min_amount

        channel_asset_max_amount = self.channel_asset_max_amount

        network_nodes = self.network_nodes

        network_channels = self.network_channels

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if pubkey is not UNSET:
            field_dict["pubkey"] = pubkey
        if num_channels is not UNSET:
            field_dict["num_channels"] = num_channels
        if num_usable_channels is not UNSET:
            field_dict["num_usable_channels"] = num_usable_channels
        if local_balance_sat is not UNSET:
            field_dict["local_balance_sat"] = local_balance_sat
        if eventual_close_fees_sat is not UNSET:
            field_dict["eventual_close_fees_sat"] = eventual_close_fees_sat
        if pending_outbound_payments_sat is not UNSET:
            field_dict["pending_outbound_payments_sat"] = pending_outbound_payments_sat
        if num_peers is not UNSET:
            field_dict["num_peers"] = num_peers
        if account_xpub_vanilla is not UNSET:
            field_dict["account_xpub_vanilla"] = account_xpub_vanilla
        if account_xpub_colored is not UNSET:
            field_dict["account_xpub_colored"] = account_xpub_colored
        if max_media_upload_size_mb is not UNSET:
            field_dict["max_media_upload_size_mb"] = max_media_upload_size_mb
        if rgb_htlc_min_msat is not UNSET:
            field_dict["rgb_htlc_min_msat"] = rgb_htlc_min_msat
        if rgb_channel_capacity_min_sat is not UNSET:
            field_dict["rgb_channel_capacity_min_sat"] = rgb_channel_capacity_min_sat
        if channel_capacity_min_sat is not UNSET:
            field_dict["channel_capacity_min_sat"] = channel_capacity_min_sat
        if channel_capacity_max_sat is not UNSET:
            field_dict["channel_capacity_max_sat"] = channel_capacity_max_sat
        if channel_asset_min_amount is not UNSET:
            field_dict["channel_asset_min_amount"] = channel_asset_min_amount
        if channel_asset_max_amount is not UNSET:
            field_dict["channel_asset_max_amount"] = channel_asset_max_amount
        if network_nodes is not UNSET:
            field_dict["network_nodes"] = network_nodes
        if network_channels is not UNSET:
            field_dict["network_channels"] = network_channels

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        pubkey = d.pop("pubkey", UNSET)

        num_channels = d.pop("num_channels", UNSET)

        num_usable_channels = d.pop("num_usable_channels", UNSET)

        local_balance_sat = d.pop("local_balance_sat", UNSET)

        eventual_close_fees_sat = d.pop("eventual_close_fees_sat", UNSET)

        pending_outbound_payments_sat = d.pop("pending_outbound_payments_sat", UNSET)

        num_peers = d.pop("num_peers", UNSET)

        account_xpub_vanilla = d.pop("account_xpub_vanilla", UNSET)

        account_xpub_colored = d.pop("account_xpub_colored", UNSET)

        max_media_upload_size_mb = d.pop("max_media_upload_size_mb", UNSET)

        rgb_htlc_min_msat = d.pop("rgb_htlc_min_msat", UNSET)

        rgb_channel_capacity_min_sat = d.pop("rgb_channel_capacity_min_sat", UNSET)

        channel_capacity_min_sat = d.pop("channel_capacity_min_sat", UNSET)

        channel_capacity_max_sat = d.pop("channel_capacity_max_sat", UNSET)

        channel_asset_min_amount = d.pop("channel_asset_min_amount", UNSET)

        channel_asset_max_amount = d.pop("channel_asset_max_amount", UNSET)

        network_nodes = d.pop("network_nodes", UNSET)

        network_channels = d.pop("network_channels", UNSET)

        node_info_response = cls(
            pubkey=pubkey,
            num_channels=num_channels,
            num_usable_channels=num_usable_channels,
            local_balance_sat=local_balance_sat,
            eventual_close_fees_sat=eventual_close_fees_sat,
            pending_outbound_payments_sat=pending_outbound_payments_sat,
            num_peers=num_peers,
            account_xpub_vanilla=account_xpub_vanilla,
            account_xpub_colored=account_xpub_colored,
            max_media_upload_size_mb=max_media_upload_size_mb,
            rgb_htlc_min_msat=rgb_htlc_min_msat,
            rgb_channel_capacity_min_sat=rgb_channel_capacity_min_sat,
            channel_capacity_min_sat=channel_capacity_min_sat,
            channel_capacity_max_sat=channel_capacity_max_sat,
            channel_asset_min_amount=channel_asset_min_amount,
            channel_asset_max_amount=channel_asset_max_amount,
            network_nodes=network_nodes,
            network_channels=network_channels,
        )

        node_info_response.additional_properties = d
        return node_info_response

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
