from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="CreateOrderRequest")


@_attrs_define
class CreateOrderRequest:
    """
    Attributes:
        client_pubkey (str):
        lsp_balance_sat (int):
        client_balance_sat (int):
        required_channel_confirmations (int):
        funding_confirms_within_blocks (int):
        channel_expiry_blocks (int):
        token (None | str | Unset):
        refund_onchain_address (None | str | Unset):
        announce_channel (bool | Unset):  Default: True.
        asset_id (None | str | Unset):
        lsp_asset_amount (int | None | Unset):
        client_asset_amount (int | None | Unset):
        rfq_id (None | str | Unset):
        email (None | str | Unset): Optional email for notifications
    """

    client_pubkey: str
    lsp_balance_sat: int
    client_balance_sat: int
    required_channel_confirmations: int
    funding_confirms_within_blocks: int
    channel_expiry_blocks: int
    token: None | str | Unset = UNSET
    refund_onchain_address: None | str | Unset = UNSET
    announce_channel: bool | Unset = True
    asset_id: None | str | Unset = UNSET
    lsp_asset_amount: int | None | Unset = UNSET
    client_asset_amount: int | None | Unset = UNSET
    rfq_id: None | str | Unset = UNSET
    email: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        client_pubkey = self.client_pubkey

        lsp_balance_sat = self.lsp_balance_sat

        client_balance_sat = self.client_balance_sat

        required_channel_confirmations = self.required_channel_confirmations

        funding_confirms_within_blocks = self.funding_confirms_within_blocks

        channel_expiry_blocks = self.channel_expiry_blocks

        token: None | str | Unset
        if isinstance(self.token, Unset):
            token = UNSET
        else:
            token = self.token

        refund_onchain_address: None | str | Unset
        if isinstance(self.refund_onchain_address, Unset):
            refund_onchain_address = UNSET
        else:
            refund_onchain_address = self.refund_onchain_address

        announce_channel = self.announce_channel

        asset_id: None | str | Unset
        if isinstance(self.asset_id, Unset):
            asset_id = UNSET
        else:
            asset_id = self.asset_id

        lsp_asset_amount: int | None | Unset
        if isinstance(self.lsp_asset_amount, Unset):
            lsp_asset_amount = UNSET
        else:
            lsp_asset_amount = self.lsp_asset_amount

        client_asset_amount: int | None | Unset
        if isinstance(self.client_asset_amount, Unset):
            client_asset_amount = UNSET
        else:
            client_asset_amount = self.client_asset_amount

        rfq_id: None | str | Unset
        if isinstance(self.rfq_id, Unset):
            rfq_id = UNSET
        else:
            rfq_id = self.rfq_id

        email: None | str | Unset
        if isinstance(self.email, Unset):
            email = UNSET
        else:
            email = self.email

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "client_pubkey": client_pubkey,
                "lsp_balance_sat": lsp_balance_sat,
                "client_balance_sat": client_balance_sat,
                "required_channel_confirmations": required_channel_confirmations,
                "funding_confirms_within_blocks": funding_confirms_within_blocks,
                "channel_expiry_blocks": channel_expiry_blocks,
            }
        )
        if token is not UNSET:
            field_dict["token"] = token
        if refund_onchain_address is not UNSET:
            field_dict["refund_onchain_address"] = refund_onchain_address
        if announce_channel is not UNSET:
            field_dict["announce_channel"] = announce_channel
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if lsp_asset_amount is not UNSET:
            field_dict["lsp_asset_amount"] = lsp_asset_amount
        if client_asset_amount is not UNSET:
            field_dict["client_asset_amount"] = client_asset_amount
        if rfq_id is not UNSET:
            field_dict["rfq_id"] = rfq_id
        if email is not UNSET:
            field_dict["email"] = email

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        client_pubkey = d.pop("client_pubkey")

        lsp_balance_sat = d.pop("lsp_balance_sat")

        client_balance_sat = d.pop("client_balance_sat")

        required_channel_confirmations = d.pop("required_channel_confirmations")

        funding_confirms_within_blocks = d.pop("funding_confirms_within_blocks")

        channel_expiry_blocks = d.pop("channel_expiry_blocks")

        def _parse_token(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        token = _parse_token(d.pop("token", UNSET))

        def _parse_refund_onchain_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        refund_onchain_address = _parse_refund_onchain_address(
            d.pop("refund_onchain_address", UNSET)
        )

        announce_channel = d.pop("announce_channel", UNSET)

        def _parse_asset_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        asset_id = _parse_asset_id(d.pop("asset_id", UNSET))

        def _parse_lsp_asset_amount(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        lsp_asset_amount = _parse_lsp_asset_amount(d.pop("lsp_asset_amount", UNSET))

        def _parse_client_asset_amount(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        client_asset_amount = _parse_client_asset_amount(
            d.pop("client_asset_amount", UNSET)
        )

        def _parse_rfq_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        rfq_id = _parse_rfq_id(d.pop("rfq_id", UNSET))

        def _parse_email(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        email = _parse_email(d.pop("email", UNSET))

        create_order_request = cls(
            client_pubkey=client_pubkey,
            lsp_balance_sat=lsp_balance_sat,
            client_balance_sat=client_balance_sat,
            required_channel_confirmations=required_channel_confirmations,
            funding_confirms_within_blocks=funding_confirms_within_blocks,
            channel_expiry_blocks=channel_expiry_blocks,
            token=token,
            refund_onchain_address=refund_onchain_address,
            announce_channel=announce_channel,
            asset_id=asset_id,
            lsp_asset_amount=lsp_asset_amount,
            client_asset_amount=client_asset_amount,
            rfq_id=rfq_id,
            email=email,
        )

        create_order_request.additional_properties = d
        return create_order_request

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
