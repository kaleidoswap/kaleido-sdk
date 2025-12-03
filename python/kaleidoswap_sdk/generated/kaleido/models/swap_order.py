from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.payment_status import PaymentStatus
from ..models.swap_order_side import SwapOrderSide
from ..models.swap_order_status import SwapOrderStatus
from ..models.swap_settlement import SwapSettlement
from ..types import UNSET, Unset

T = TypeVar("T", bound="SwapOrder")


@_attrs_define
class SwapOrder:
    """
    Attributes:
        id (str): Order ID
        rfq_id (str): RFQ that produced the quote
        side (SwapOrderSide):
        from_type (SwapSettlement):
        from_asset (str):
        from_amount (int): Amount of the asset to swap from. Must be greater than zero. Example: 100000.
        to_type (SwapSettlement):
        to_asset (str):
        to_amount (int): Amount of the asset to swap to. Must be greater than zero. Example: 100000.
        price (int):
        pay_in (SwapSettlement):
        pay_out (SwapSettlement):
        maker_pubkey (None | str | Unset):
        ln_invoice (None | str | Unset):
        onchain_address (None | str | Unset):
        min_onchain_conf (int | None | Unset):
        rgb_recipient_id (None | str | Unset):
        rgb_invoice (None | str | Unset):
        dest_bolt11 (None | str | Unset):
        dest_onchain_address (None | str | Unset):
        dest_rgb_invoice (None | str | Unset):
        refund_address (None | str | Unset):
        payment_hash (None | str | Unset):
        payment_secret (None | str | Unset):
        swapstring (None | str | Unset):
        status (SwapOrderStatus | Unset):
        created_at (int | Unset):
        expires_at (int | None | Unset):
        filled_at (int | None | Unset):
        refund_txid (None | str | Unset):
        requires_manual_refund (bool | None | Unset):  Default: False.
        payment_status (None | PaymentStatus | Unset):
        payment_difference (int | None | Unset): Payment difference in satoshis. Positive for overpayment, negative for
            underpayment, zero for exact payment
        last_payment_check (int | None | Unset):
        email (None | str | Unset):
        failure_reason (None | str | Unset):
    """

    id: str
    rfq_id: str
    side: SwapOrderSide
    from_type: SwapSettlement
    from_asset: str
    from_amount: int
    to_type: SwapSettlement
    to_asset: str
    to_amount: int
    price: int
    pay_in: SwapSettlement
    pay_out: SwapSettlement
    maker_pubkey: None | str | Unset = UNSET
    ln_invoice: None | str | Unset = UNSET
    onchain_address: None | str | Unset = UNSET
    min_onchain_conf: int | None | Unset = UNSET
    rgb_recipient_id: None | str | Unset = UNSET
    rgb_invoice: None | str | Unset = UNSET
    dest_bolt11: None | str | Unset = UNSET
    dest_onchain_address: None | str | Unset = UNSET
    dest_rgb_invoice: None | str | Unset = UNSET
    refund_address: None | str | Unset = UNSET
    payment_hash: None | str | Unset = UNSET
    payment_secret: None | str | Unset = UNSET
    swapstring: None | str | Unset = UNSET
    status: SwapOrderStatus | Unset = UNSET
    created_at: int | Unset = UNSET
    expires_at: int | None | Unset = UNSET
    filled_at: int | None | Unset = UNSET
    refund_txid: None | str | Unset = UNSET
    requires_manual_refund: bool | None | Unset = False
    payment_status: None | PaymentStatus | Unset = UNSET
    payment_difference: int | None | Unset = UNSET
    last_payment_check: int | None | Unset = UNSET
    email: None | str | Unset = UNSET
    failure_reason: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        rfq_id = self.rfq_id

        side = self.side.value

        from_type = self.from_type.value

        from_asset = self.from_asset

        from_amount = self.from_amount

        to_type = self.to_type.value

        to_asset = self.to_asset

        to_amount = self.to_amount

        price = self.price

        pay_in = self.pay_in.value

        pay_out = self.pay_out.value

        maker_pubkey: None | str | Unset
        if isinstance(self.maker_pubkey, Unset):
            maker_pubkey = UNSET
        else:
            maker_pubkey = self.maker_pubkey

        ln_invoice: None | str | Unset
        if isinstance(self.ln_invoice, Unset):
            ln_invoice = UNSET
        else:
            ln_invoice = self.ln_invoice

        onchain_address: None | str | Unset
        if isinstance(self.onchain_address, Unset):
            onchain_address = UNSET
        else:
            onchain_address = self.onchain_address

        min_onchain_conf: int | None | Unset
        if isinstance(self.min_onchain_conf, Unset):
            min_onchain_conf = UNSET
        else:
            min_onchain_conf = self.min_onchain_conf

        rgb_recipient_id: None | str | Unset
        if isinstance(self.rgb_recipient_id, Unset):
            rgb_recipient_id = UNSET
        else:
            rgb_recipient_id = self.rgb_recipient_id

        rgb_invoice: None | str | Unset
        if isinstance(self.rgb_invoice, Unset):
            rgb_invoice = UNSET
        else:
            rgb_invoice = self.rgb_invoice

        dest_bolt11: None | str | Unset
        if isinstance(self.dest_bolt11, Unset):
            dest_bolt11 = UNSET
        else:
            dest_bolt11 = self.dest_bolt11

        dest_onchain_address: None | str | Unset
        if isinstance(self.dest_onchain_address, Unset):
            dest_onchain_address = UNSET
        else:
            dest_onchain_address = self.dest_onchain_address

        dest_rgb_invoice: None | str | Unset
        if isinstance(self.dest_rgb_invoice, Unset):
            dest_rgb_invoice = UNSET
        else:
            dest_rgb_invoice = self.dest_rgb_invoice

        refund_address: None | str | Unset
        if isinstance(self.refund_address, Unset):
            refund_address = UNSET
        else:
            refund_address = self.refund_address

        payment_hash: None | str | Unset
        if isinstance(self.payment_hash, Unset):
            payment_hash = UNSET
        else:
            payment_hash = self.payment_hash

        payment_secret: None | str | Unset
        if isinstance(self.payment_secret, Unset):
            payment_secret = UNSET
        else:
            payment_secret = self.payment_secret

        swapstring: None | str | Unset
        if isinstance(self.swapstring, Unset):
            swapstring = UNSET
        else:
            swapstring = self.swapstring

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        created_at = self.created_at

        expires_at: int | None | Unset
        if isinstance(self.expires_at, Unset):
            expires_at = UNSET
        else:
            expires_at = self.expires_at

        filled_at: int | None | Unset
        if isinstance(self.filled_at, Unset):
            filled_at = UNSET
        else:
            filled_at = self.filled_at

        refund_txid: None | str | Unset
        if isinstance(self.refund_txid, Unset):
            refund_txid = UNSET
        else:
            refund_txid = self.refund_txid

        requires_manual_refund: bool | None | Unset
        if isinstance(self.requires_manual_refund, Unset):
            requires_manual_refund = UNSET
        else:
            requires_manual_refund = self.requires_manual_refund

        payment_status: None | str | Unset
        if isinstance(self.payment_status, Unset):
            payment_status = UNSET
        elif isinstance(self.payment_status, PaymentStatus):
            payment_status = self.payment_status.value
        else:
            payment_status = self.payment_status

        payment_difference: int | None | Unset
        if isinstance(self.payment_difference, Unset):
            payment_difference = UNSET
        else:
            payment_difference = self.payment_difference

        last_payment_check: int | None | Unset
        if isinstance(self.last_payment_check, Unset):
            last_payment_check = UNSET
        else:
            last_payment_check = self.last_payment_check

        email: None | str | Unset
        if isinstance(self.email, Unset):
            email = UNSET
        else:
            email = self.email

        failure_reason: None | str | Unset
        if isinstance(self.failure_reason, Unset):
            failure_reason = UNSET
        else:
            failure_reason = self.failure_reason

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "rfq_id": rfq_id,
                "side": side,
                "from_type": from_type,
                "from_asset": from_asset,
                "from_amount": from_amount,
                "to_type": to_type,
                "to_asset": to_asset,
                "to_amount": to_amount,
                "price": price,
                "pay_in": pay_in,
                "pay_out": pay_out,
            }
        )
        if maker_pubkey is not UNSET:
            field_dict["maker_pubkey"] = maker_pubkey
        if ln_invoice is not UNSET:
            field_dict["ln_invoice"] = ln_invoice
        if onchain_address is not UNSET:
            field_dict["onchain_address"] = onchain_address
        if min_onchain_conf is not UNSET:
            field_dict["min_onchain_conf"] = min_onchain_conf
        if rgb_recipient_id is not UNSET:
            field_dict["rgb_recipient_id"] = rgb_recipient_id
        if rgb_invoice is not UNSET:
            field_dict["rgb_invoice"] = rgb_invoice
        if dest_bolt11 is not UNSET:
            field_dict["dest_bolt11"] = dest_bolt11
        if dest_onchain_address is not UNSET:
            field_dict["dest_onchain_address"] = dest_onchain_address
        if dest_rgb_invoice is not UNSET:
            field_dict["dest_rgb_invoice"] = dest_rgb_invoice
        if refund_address is not UNSET:
            field_dict["refund_address"] = refund_address
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if payment_secret is not UNSET:
            field_dict["payment_secret"] = payment_secret
        if swapstring is not UNSET:
            field_dict["swapstring"] = swapstring
        if status is not UNSET:
            field_dict["status"] = status
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if expires_at is not UNSET:
            field_dict["expires_at"] = expires_at
        if filled_at is not UNSET:
            field_dict["filled_at"] = filled_at
        if refund_txid is not UNSET:
            field_dict["refund_txid"] = refund_txid
        if requires_manual_refund is not UNSET:
            field_dict["requires_manual_refund"] = requires_manual_refund
        if payment_status is not UNSET:
            field_dict["payment_status"] = payment_status
        if payment_difference is not UNSET:
            field_dict["payment_difference"] = payment_difference
        if last_payment_check is not UNSET:
            field_dict["last_payment_check"] = last_payment_check
        if email is not UNSET:
            field_dict["email"] = email
        if failure_reason is not UNSET:
            field_dict["failure_reason"] = failure_reason

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        rfq_id = d.pop("rfq_id")

        side = SwapOrderSide(d.pop("side"))

        from_type = SwapSettlement(d.pop("from_type"))

        from_asset = d.pop("from_asset")

        from_amount = d.pop("from_amount")

        to_type = SwapSettlement(d.pop("to_type"))

        to_asset = d.pop("to_asset")

        to_amount = d.pop("to_amount")

        price = d.pop("price")

        pay_in = SwapSettlement(d.pop("pay_in"))

        pay_out = SwapSettlement(d.pop("pay_out"))

        def _parse_maker_pubkey(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        maker_pubkey = _parse_maker_pubkey(d.pop("maker_pubkey", UNSET))

        def _parse_ln_invoice(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        ln_invoice = _parse_ln_invoice(d.pop("ln_invoice", UNSET))

        def _parse_onchain_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        onchain_address = _parse_onchain_address(d.pop("onchain_address", UNSET))

        def _parse_min_onchain_conf(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        min_onchain_conf = _parse_min_onchain_conf(d.pop("min_onchain_conf", UNSET))

        def _parse_rgb_recipient_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        rgb_recipient_id = _parse_rgb_recipient_id(d.pop("rgb_recipient_id", UNSET))

        def _parse_rgb_invoice(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        rgb_invoice = _parse_rgb_invoice(d.pop("rgb_invoice", UNSET))

        def _parse_dest_bolt11(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        dest_bolt11 = _parse_dest_bolt11(d.pop("dest_bolt11", UNSET))

        def _parse_dest_onchain_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        dest_onchain_address = _parse_dest_onchain_address(
            d.pop("dest_onchain_address", UNSET)
        )

        def _parse_dest_rgb_invoice(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        dest_rgb_invoice = _parse_dest_rgb_invoice(d.pop("dest_rgb_invoice", UNSET))

        def _parse_refund_address(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        refund_address = _parse_refund_address(d.pop("refund_address", UNSET))

        def _parse_payment_hash(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        payment_hash = _parse_payment_hash(d.pop("payment_hash", UNSET))

        def _parse_payment_secret(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        payment_secret = _parse_payment_secret(d.pop("payment_secret", UNSET))

        def _parse_swapstring(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        swapstring = _parse_swapstring(d.pop("swapstring", UNSET))

        _status = d.pop("status", UNSET)
        status: SwapOrderStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = SwapOrderStatus(_status)

        created_at = d.pop("created_at", UNSET)

        def _parse_expires_at(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        expires_at = _parse_expires_at(d.pop("expires_at", UNSET))

        def _parse_filled_at(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        filled_at = _parse_filled_at(d.pop("filled_at", UNSET))

        def _parse_refund_txid(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        refund_txid = _parse_refund_txid(d.pop("refund_txid", UNSET))

        def _parse_requires_manual_refund(data: object) -> bool | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(bool | None | Unset, data)

        requires_manual_refund = _parse_requires_manual_refund(
            d.pop("requires_manual_refund", UNSET)
        )

        def _parse_payment_status(data: object) -> None | PaymentStatus | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                payment_status_type_0 = PaymentStatus(data)

                return payment_status_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PaymentStatus | Unset, data)

        payment_status = _parse_payment_status(d.pop("payment_status", UNSET))

        def _parse_payment_difference(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        payment_difference = _parse_payment_difference(
            d.pop("payment_difference", UNSET)
        )

        def _parse_last_payment_check(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        last_payment_check = _parse_last_payment_check(
            d.pop("last_payment_check", UNSET)
        )

        def _parse_email(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        email = _parse_email(d.pop("email", UNSET))

        def _parse_failure_reason(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        failure_reason = _parse_failure_reason(d.pop("failure_reason", UNSET))

        swap_order = cls(
            id=id,
            rfq_id=rfq_id,
            side=side,
            from_type=from_type,
            from_asset=from_asset,
            from_amount=from_amount,
            to_type=to_type,
            to_asset=to_asset,
            to_amount=to_amount,
            price=price,
            pay_in=pay_in,
            pay_out=pay_out,
            maker_pubkey=maker_pubkey,
            ln_invoice=ln_invoice,
            onchain_address=onchain_address,
            min_onchain_conf=min_onchain_conf,
            rgb_recipient_id=rgb_recipient_id,
            rgb_invoice=rgb_invoice,
            dest_bolt11=dest_bolt11,
            dest_onchain_address=dest_onchain_address,
            dest_rgb_invoice=dest_rgb_invoice,
            refund_address=refund_address,
            payment_hash=payment_hash,
            payment_secret=payment_secret,
            swapstring=swapstring,
            status=status,
            created_at=created_at,
            expires_at=expires_at,
            filled_at=filled_at,
            refund_txid=refund_txid,
            requires_manual_refund=requires_manual_refund,
            payment_status=payment_status,
            payment_difference=payment_difference,
            last_payment_check=last_payment_check,
            email=email,
            failure_reason=failure_reason,
        )

        swap_order.additional_properties = d
        return swap_order

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
