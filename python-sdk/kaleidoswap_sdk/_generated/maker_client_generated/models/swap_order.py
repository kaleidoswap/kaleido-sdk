from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.payment_status import PaymentStatus
from ..models.swap_order_status import SwapOrderStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.fee import Fee
    from ..models.receiver_address import ReceiverAddress
    from ..models.swap_leg import SwapLeg


T = TypeVar("T", bound="SwapOrder")


@_attrs_define
class SwapOrder:
    """
    Attributes:
        id (str): Order identifier
        rfq_id (str): Quote identifier used to create the order
        from_asset (SwapLeg): Swap Leg: Complete asset specification for one side of a swap.

            Represents a specific asset on a specific settlement layer with an amount.
            This is the fundamental unit for swap orders - each side (leg) of a swap
            specifies an asset on a particular network with a specific amount.
        to_asset (SwapLeg): Swap Leg: Complete asset specification for one side of a swap.

            Represents a specific asset on a specific settlement layer with an amount.
            This is the fundamental unit for swap orders - each side (leg) of a swap
            specifies an asset on a particular network with a specific amount.
        price (int):
        fee (Fee):
        maker_pubkey (Union[None, Unset, str]): Maker node public key
        deposit_address (Union['ReceiverAddress', None, Unset]): Address/Invoice for the user to deposit funds into
        payout_address (Union['ReceiverAddress', None, Unset]): Destination address/invoice for receiving the to_asset
            payout
        refund_address (Union[None, Unset, str]): Onchain refund address if provided
        status (Union[Unset, SwapOrderStatus]):
        created_at (Union[Unset, int]): Creation timestamp (seconds since epoch)
        expires_at (Union[None, Unset, int]): Expiry timestamp (seconds since epoch)
        filled_at (Union[None, Unset, int]): Timestamp when the order was filled
        refund_txid (Union[None, Unset, str]): Transaction ID of any refund sent
        requires_manual_refund (Union[None, Unset, bool]): Whether the order requires manual refund handling Default:
            False.
        payment_status (Union[None, PaymentStatus, Unset]): Status of onchain payment verification
        payment_difference (Union[None, Unset, int]): Payment difference in satoshis (positive for overpayment, negative
            for underpayment)
        last_payment_check (Union[None, Unset, int]): Timestamp of the last payment verification
        email (Union[None, Unset, str]): Notification email address
        failure_reason (Union[None, Unset, str]): Reason the order failed, if applicable
    """

    id: str
    rfq_id: str
    from_asset: "SwapLeg"
    to_asset: "SwapLeg"
    price: int
    fee: "Fee"
    maker_pubkey: None | Unset | str = UNSET
    deposit_address: Union["ReceiverAddress", None, Unset] = UNSET
    payout_address: Union["ReceiverAddress", None, Unset] = UNSET
    refund_address: None | Unset | str = UNSET
    status: Unset | SwapOrderStatus = UNSET
    created_at: Unset | int = UNSET
    expires_at: None | Unset | int = UNSET
    filled_at: None | Unset | int = UNSET
    refund_txid: None | Unset | str = UNSET
    requires_manual_refund: None | Unset | bool = False
    payment_status: None | PaymentStatus | Unset = UNSET
    payment_difference: None | Unset | int = UNSET
    last_payment_check: None | Unset | int = UNSET
    email: None | Unset | str = UNSET
    failure_reason: None | Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.receiver_address import ReceiverAddress

        id = self.id

        rfq_id = self.rfq_id

        from_asset = self.from_asset.to_dict()

        to_asset = self.to_asset.to_dict()

        price = self.price

        fee = self.fee.to_dict()

        maker_pubkey: None | Unset | str
        if isinstance(self.maker_pubkey, Unset):
            maker_pubkey = UNSET
        else:
            maker_pubkey = self.maker_pubkey

        deposit_address: None | Unset | dict[str, Any]
        if isinstance(self.deposit_address, Unset):
            deposit_address = UNSET
        elif isinstance(self.deposit_address, ReceiverAddress):
            deposit_address = self.deposit_address.to_dict()
        else:
            deposit_address = self.deposit_address

        payout_address: None | Unset | dict[str, Any]
        if isinstance(self.payout_address, Unset):
            payout_address = UNSET
        elif isinstance(self.payout_address, ReceiverAddress):
            payout_address = self.payout_address.to_dict()
        else:
            payout_address = self.payout_address

        refund_address: None | Unset | str
        if isinstance(self.refund_address, Unset):
            refund_address = UNSET
        else:
            refund_address = self.refund_address

        status: Unset | str = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        created_at = self.created_at

        expires_at: None | Unset | int
        if isinstance(self.expires_at, Unset):
            expires_at = UNSET
        else:
            expires_at = self.expires_at

        filled_at: None | Unset | int
        if isinstance(self.filled_at, Unset):
            filled_at = UNSET
        else:
            filled_at = self.filled_at

        refund_txid: None | Unset | str
        if isinstance(self.refund_txid, Unset):
            refund_txid = UNSET
        else:
            refund_txid = self.refund_txid

        requires_manual_refund: None | Unset | bool
        if isinstance(self.requires_manual_refund, Unset):
            requires_manual_refund = UNSET
        else:
            requires_manual_refund = self.requires_manual_refund

        payment_status: None | Unset | str
        if isinstance(self.payment_status, Unset):
            payment_status = UNSET
        elif isinstance(self.payment_status, PaymentStatus):
            payment_status = self.payment_status.value
        else:
            payment_status = self.payment_status

        payment_difference: None | Unset | int
        if isinstance(self.payment_difference, Unset):
            payment_difference = UNSET
        else:
            payment_difference = self.payment_difference

        last_payment_check: None | Unset | int
        if isinstance(self.last_payment_check, Unset):
            last_payment_check = UNSET
        else:
            last_payment_check = self.last_payment_check

        email: None | Unset | str
        if isinstance(self.email, Unset):
            email = UNSET
        else:
            email = self.email

        failure_reason: None | Unset | str
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
                "from_asset": from_asset,
                "to_asset": to_asset,
                "price": price,
                "fee": fee,
            }
        )
        if maker_pubkey is not UNSET:
            field_dict["maker_pubkey"] = maker_pubkey
        if deposit_address is not UNSET:
            field_dict["deposit_address"] = deposit_address
        if payout_address is not UNSET:
            field_dict["payout_address"] = payout_address
        if refund_address is not UNSET:
            field_dict["refund_address"] = refund_address
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
        from ..models.fee import Fee
        from ..models.receiver_address import ReceiverAddress
        from ..models.swap_leg import SwapLeg

        d = dict(src_dict)
        id = d.pop("id")

        rfq_id = d.pop("rfq_id")

        from_asset = SwapLeg.from_dict(d.pop("from_asset"))

        to_asset = SwapLeg.from_dict(d.pop("to_asset"))

        price = d.pop("price")

        fee = Fee.from_dict(d.pop("fee"))

        def _parse_maker_pubkey(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        maker_pubkey = _parse_maker_pubkey(d.pop("maker_pubkey", UNSET))

        def _parse_deposit_address(data: object) -> Union["ReceiverAddress", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                deposit_address_type_1 = ReceiverAddress.from_dict(data)

                return deposit_address_type_1
            except:  # noqa: E722
                pass
            return cast(Union["ReceiverAddress", None, Unset], data)

        deposit_address = _parse_deposit_address(d.pop("deposit_address", UNSET))

        def _parse_payout_address(data: object) -> Union["ReceiverAddress", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                payout_address_type_1 = ReceiverAddress.from_dict(data)

                return payout_address_type_1
            except:  # noqa: E722
                pass
            return cast(Union["ReceiverAddress", None, Unset], data)

        payout_address = _parse_payout_address(d.pop("payout_address", UNSET))

        def _parse_refund_address(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        refund_address = _parse_refund_address(d.pop("refund_address", UNSET))

        _status = d.pop("status", UNSET)
        status: Unset | SwapOrderStatus
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = SwapOrderStatus(_status)

        created_at = d.pop("created_at", UNSET)

        def _parse_expires_at(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        expires_at = _parse_expires_at(d.pop("expires_at", UNSET))

        def _parse_filled_at(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        filled_at = _parse_filled_at(d.pop("filled_at", UNSET))

        def _parse_refund_txid(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        refund_txid = _parse_refund_txid(d.pop("refund_txid", UNSET))

        def _parse_requires_manual_refund(data: object) -> None | Unset | bool:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | bool, data)

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
                payment_status_type_1 = PaymentStatus(data)

                return payment_status_type_1
            except:  # noqa: E722
                pass
            return cast(None | PaymentStatus | Unset, data)

        payment_status = _parse_payment_status(d.pop("payment_status", UNSET))

        def _parse_payment_difference(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        payment_difference = _parse_payment_difference(d.pop("payment_difference", UNSET))

        def _parse_last_payment_check(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        last_payment_check = _parse_last_payment_check(d.pop("last_payment_check", UNSET))

        def _parse_email(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        email = _parse_email(d.pop("email", UNSET))

        def _parse_failure_reason(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        failure_reason = _parse_failure_reason(d.pop("failure_reason", UNSET))

        swap_order = cls(
            id=id,
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            price=price,
            fee=fee,
            maker_pubkey=maker_pubkey,
            deposit_address=deposit_address,
            payout_address=payout_address,
            refund_address=refund_address,
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
