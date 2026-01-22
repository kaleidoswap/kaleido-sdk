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
        pubkey (Union[Unset, str]):
        num_channels (Union[Unset, int]):
        num_usable_channels (Union[Unset, int]):
        local_balance_sat (Union[Unset, int]):
        eventual_close_fees_sat (Union[Unset, int]):
        pending_outbound_payments_sat (Union[Unset, int]):
        num_peers (Union[Unset, int]):
        account_xpub_vanilla (Union[Unset, str]):
        account_xpub_colored (Union[Unset, str]):
        max_media_upload_size_mb (Union[Unset, int]):
        rgb_htlc_min_msat (Union[Unset, int]):
        rgb_channel_capacity_min_sat (Union[Unset, int]):
        channel_capacity_min_sat (Union[Unset, int]):
        channel_capacity_max_sat (Union[Unset, int]):
        channel_asset_min_amount (Union[Unset, int]):
        channel_asset_max_amount (Union[Unset, int]):
        network_nodes (Union[Unset, int]):
        network_channels (Union[Unset, int]):
    """

    pubkey: Unset | str = UNSET
    num_channels: Unset | int = UNSET
    num_usable_channels: Unset | int = UNSET
    local_balance_sat: Unset | int = UNSET
    eventual_close_fees_sat: Unset | int = UNSET
    pending_outbound_payments_sat: Unset | int = UNSET
    num_peers: Unset | int = UNSET
    account_xpub_vanilla: Unset | str = UNSET
    account_xpub_colored: Unset | str = UNSET
    max_media_upload_size_mb: Unset | int = UNSET
    rgb_htlc_min_msat: Unset | int = UNSET
    rgb_channel_capacity_min_sat: Unset | int = UNSET
    channel_capacity_min_sat: Unset | int = UNSET
    channel_capacity_max_sat: Unset | int = UNSET
    channel_asset_min_amount: Unset | int = UNSET
    channel_asset_max_amount: Unset | int = UNSET
    network_nodes: Unset | int = UNSET
    network_channels: Unset | int = UNSET
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
