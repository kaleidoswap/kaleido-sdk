from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.asset_delivery_status import AssetDeliveryStatus
from ..models.order_state import OrderState
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.channel_details import ChannelDetails
    from ..models.payment_details import PaymentDetails


T = TypeVar("T", bound="OrderResponse")


@_attrs_define
class OrderResponse:
    """
    Attributes:
        order_id (str):
        client_pubkey (str):
        lsp_balance_sat (int):
        client_balance_sat (int):
        required_channel_confirmations (int):
        funding_confirms_within_blocks (int):
        channel_expiry_blocks (int):
        announce_channel (bool):
        order_state (OrderState):
        payment (PaymentDetails):
        token (None | str | Unset):  Default: ''.
        created_at (datetime.datetime | Unset):
        channel (ChannelDetails | None | Unset):
        asset_id (None | str | Unset):
        lsp_asset_amount (int | None | Unset):
        client_asset_amount (int | None | Unset):
        rfq_id (None | str | Unset):
        asset_price_sat (int | None | Unset):
        asset_delivery_status (AssetDeliveryStatus | None | Unset):
        asset_delivery_payment_hash (None | str | Unset):
        asset_delivery_completed_at (datetime.datetime | None | Unset):
        asset_delivery_error (None | str | Unset):
    """

    order_id: str
    client_pubkey: str
    lsp_balance_sat: int
    client_balance_sat: int
    required_channel_confirmations: int
    funding_confirms_within_blocks: int
    channel_expiry_blocks: int
    announce_channel: bool
    order_state: OrderState
    payment: PaymentDetails
    token: None | str | Unset = ""
    created_at: datetime.datetime | Unset = UNSET
    channel: ChannelDetails | None | Unset = UNSET
    asset_id: None | str | Unset = UNSET
    lsp_asset_amount: int | None | Unset = UNSET
    client_asset_amount: int | None | Unset = UNSET
    rfq_id: None | str | Unset = UNSET
    asset_price_sat: int | None | Unset = UNSET
    asset_delivery_status: AssetDeliveryStatus | None | Unset = UNSET
    asset_delivery_payment_hash: None | str | Unset = UNSET
    asset_delivery_completed_at: datetime.datetime | None | Unset = UNSET
    asset_delivery_error: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.channel_details import ChannelDetails

        order_id = self.order_id

        client_pubkey = self.client_pubkey

        lsp_balance_sat = self.lsp_balance_sat

        client_balance_sat = self.client_balance_sat

        required_channel_confirmations = self.required_channel_confirmations

        funding_confirms_within_blocks = self.funding_confirms_within_blocks

        channel_expiry_blocks = self.channel_expiry_blocks

        announce_channel = self.announce_channel

        order_state = self.order_state.value

        payment = self.payment.to_dict()

        token: None | str | Unset
        if isinstance(self.token, Unset):
            token = UNSET
        else:
            token = self.token

        created_at: str | Unset = UNSET
        if not isinstance(self.created_at, Unset):
            created_at = self.created_at.isoformat()

        channel: dict[str, Any] | None | Unset
        if isinstance(self.channel, Unset):
            channel = UNSET
        elif isinstance(self.channel, ChannelDetails):
            channel = self.channel.to_dict()
        else:
            channel = self.channel

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

        asset_price_sat: int | None | Unset
        if isinstance(self.asset_price_sat, Unset):
            asset_price_sat = UNSET
        else:
            asset_price_sat = self.asset_price_sat

        asset_delivery_status: None | str | Unset
        if isinstance(self.asset_delivery_status, Unset):
            asset_delivery_status = UNSET
        elif isinstance(self.asset_delivery_status, AssetDeliveryStatus):
            asset_delivery_status = self.asset_delivery_status.value
        else:
            asset_delivery_status = self.asset_delivery_status

        asset_delivery_payment_hash: None | str | Unset
        if isinstance(self.asset_delivery_payment_hash, Unset):
            asset_delivery_payment_hash = UNSET
        else:
            asset_delivery_payment_hash = self.asset_delivery_payment_hash

        asset_delivery_completed_at: None | str | Unset
        if isinstance(self.asset_delivery_completed_at, Unset):
            asset_delivery_completed_at = UNSET
        elif isinstance(self.asset_delivery_completed_at, datetime.datetime):
            asset_delivery_completed_at = self.asset_delivery_completed_at.isoformat()
        else:
            asset_delivery_completed_at = self.asset_delivery_completed_at

        asset_delivery_error: None | str | Unset
        if isinstance(self.asset_delivery_error, Unset):
            asset_delivery_error = UNSET
        else:
            asset_delivery_error = self.asset_delivery_error

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "order_id": order_id,
                "client_pubkey": client_pubkey,
                "lsp_balance_sat": lsp_balance_sat,
                "client_balance_sat": client_balance_sat,
                "required_channel_confirmations": required_channel_confirmations,
                "funding_confirms_within_blocks": funding_confirms_within_blocks,
                "channel_expiry_blocks": channel_expiry_blocks,
                "announce_channel": announce_channel,
                "order_state": order_state,
                "payment": payment,
            }
        )
        if token is not UNSET:
            field_dict["token"] = token
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if channel is not UNSET:
            field_dict["channel"] = channel
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if lsp_asset_amount is not UNSET:
            field_dict["lsp_asset_amount"] = lsp_asset_amount
        if client_asset_amount is not UNSET:
            field_dict["client_asset_amount"] = client_asset_amount
        if rfq_id is not UNSET:
            field_dict["rfq_id"] = rfq_id
        if asset_price_sat is not UNSET:
            field_dict["asset_price_sat"] = asset_price_sat
        if asset_delivery_status is not UNSET:
            field_dict["asset_delivery_status"] = asset_delivery_status
        if asset_delivery_payment_hash is not UNSET:
            field_dict["asset_delivery_payment_hash"] = asset_delivery_payment_hash
        if asset_delivery_completed_at is not UNSET:
            field_dict["asset_delivery_completed_at"] = asset_delivery_completed_at
        if asset_delivery_error is not UNSET:
            field_dict["asset_delivery_error"] = asset_delivery_error

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.channel_details import ChannelDetails
        from ..models.payment_details import PaymentDetails

        d = dict(src_dict)
        order_id = d.pop("order_id")

        client_pubkey = d.pop("client_pubkey")

        lsp_balance_sat = d.pop("lsp_balance_sat")

        client_balance_sat = d.pop("client_balance_sat")

        required_channel_confirmations = d.pop("required_channel_confirmations")

        funding_confirms_within_blocks = d.pop("funding_confirms_within_blocks")

        channel_expiry_blocks = d.pop("channel_expiry_blocks")

        announce_channel = d.pop("announce_channel")

        order_state = OrderState(d.pop("order_state"))

        payment = PaymentDetails.from_dict(d.pop("payment"))

        def _parse_token(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        token = _parse_token(d.pop("token", UNSET))

        _created_at = d.pop("created_at", UNSET)
        created_at: datetime.datetime | Unset
        if isinstance(_created_at, Unset):
            created_at = UNSET
        else:
            created_at = isoparse(_created_at)

        def _parse_channel(data: object) -> ChannelDetails | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                channel_type_0 = ChannelDetails.from_dict(data)

                return channel_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ChannelDetails | None | Unset, data)

        channel = _parse_channel(d.pop("channel", UNSET))

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

        def _parse_asset_price_sat(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        asset_price_sat = _parse_asset_price_sat(d.pop("asset_price_sat", UNSET))

        def _parse_asset_delivery_status(
            data: object,
        ) -> AssetDeliveryStatus | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                asset_delivery_status_type_0 = AssetDeliveryStatus(data)

                return asset_delivery_status_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AssetDeliveryStatus | None | Unset, data)

        asset_delivery_status = _parse_asset_delivery_status(
            d.pop("asset_delivery_status", UNSET)
        )

        def _parse_asset_delivery_payment_hash(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        asset_delivery_payment_hash = _parse_asset_delivery_payment_hash(
            d.pop("asset_delivery_payment_hash", UNSET)
        )

        def _parse_asset_delivery_completed_at(
            data: object,
        ) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                asset_delivery_completed_at_type_0 = isoparse(data)

                return asset_delivery_completed_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        asset_delivery_completed_at = _parse_asset_delivery_completed_at(
            d.pop("asset_delivery_completed_at", UNSET)
        )

        def _parse_asset_delivery_error(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        asset_delivery_error = _parse_asset_delivery_error(
            d.pop("asset_delivery_error", UNSET)
        )

        order_response = cls(
            order_id=order_id,
            client_pubkey=client_pubkey,
            lsp_balance_sat=lsp_balance_sat,
            client_balance_sat=client_balance_sat,
            required_channel_confirmations=required_channel_confirmations,
            funding_confirms_within_blocks=funding_confirms_within_blocks,
            channel_expiry_blocks=channel_expiry_blocks,
            announce_channel=announce_channel,
            order_state=order_state,
            payment=payment,
            token=token,
            created_at=created_at,
            channel=channel,
            asset_id=asset_id,
            lsp_asset_amount=lsp_asset_amount,
            client_asset_amount=client_asset_amount,
            rfq_id=rfq_id,
            asset_price_sat=asset_price_sat,
            asset_delivery_status=asset_delivery_status,
            asset_delivery_payment_hash=asset_delivery_payment_hash,
            asset_delivery_completed_at=asset_delivery_completed_at,
            asset_delivery_error=asset_delivery_error,
        )

        order_response.additional_properties = d
        return order_response

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
