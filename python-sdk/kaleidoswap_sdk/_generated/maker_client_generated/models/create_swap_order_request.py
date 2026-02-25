from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.receiver_address import ReceiverAddress
    from ..models.swap_leg import SwapLeg


T = TypeVar("T", bound="CreateSwapOrderRequest")


@_attrs_define
class CreateSwapOrderRequest:
    """
    Attributes:
        rfq_id (str): RFQ ID cannot be empty
        from_asset (SwapLeg): Swap Leg: Complete asset specification for one side of a swap.

            Represents a specific asset on a specific settlement layer with an amount.
            This is the fundamental unit for swap orders - each side (leg) of a swap
            specifies an asset on a particular network with a specific amount.
        to_asset (SwapLeg): Swap Leg: Complete asset specification for one side of a swap.

            Represents a specific asset on a specific settlement layer with an amount.
            This is the fundamental unit for swap orders - each side (leg) of a swap
            specifies an asset on a particular network with a specific amount.
        receiver_address (ReceiverAddress): Receiver address or invoice with its format.

            Encapsulates the destination for receiving funds along with
            metadata about what format it uses.
        min_onchain_conf (Union[None, Unset, int]):  Default: 1.
        refund_address (Union[None, Unset, str]):
        email (Union[None, Unset, str]): Optional email for notifications
    """

    rfq_id: str
    from_asset: "SwapLeg"
    to_asset: "SwapLeg"
    receiver_address: "ReceiverAddress"
    min_onchain_conf: None | Unset | int = 1
    refund_address: None | Unset | str = UNSET
    email: None | Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        rfq_id = self.rfq_id

        from_asset = self.from_asset.to_dict()

        to_asset = self.to_asset.to_dict()

        receiver_address = self.receiver_address.to_dict()

        min_onchain_conf: None | Unset | int
        if isinstance(self.min_onchain_conf, Unset):
            min_onchain_conf = UNSET
        else:
            min_onchain_conf = self.min_onchain_conf

        refund_address: None | Unset | str
        if isinstance(self.refund_address, Unset):
            refund_address = UNSET
        else:
            refund_address = self.refund_address

        email: None | Unset | str
        if isinstance(self.email, Unset):
            email = UNSET
        else:
            email = self.email

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "rfq_id": rfq_id,
                "from_asset": from_asset,
                "to_asset": to_asset,
                "receiver_address": receiver_address,
            }
        )
        if min_onchain_conf is not UNSET:
            field_dict["min_onchain_conf"] = min_onchain_conf
        if refund_address is not UNSET:
            field_dict["refund_address"] = refund_address
        if email is not UNSET:
            field_dict["email"] = email

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.receiver_address import ReceiverAddress
        from ..models.swap_leg import SwapLeg

        d = dict(src_dict)
        rfq_id = d.pop("rfq_id")

        from_asset = SwapLeg.from_dict(d.pop("from_asset"))

        to_asset = SwapLeg.from_dict(d.pop("to_asset"))

        receiver_address = ReceiverAddress.from_dict(d.pop("receiver_address"))

        def _parse_min_onchain_conf(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        min_onchain_conf = _parse_min_onchain_conf(d.pop("min_onchain_conf", UNSET))

        def _parse_refund_address(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        refund_address = _parse_refund_address(d.pop("refund_address", UNSET))

        def _parse_email(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        email = _parse_email(d.pop("email", UNSET))

        create_swap_order_request = cls(
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            receiver_address=receiver_address,
            min_onchain_conf=min_onchain_conf,
            refund_address=refund_address,
            email=email,
        )

        create_swap_order_request.additional_properties = d
        return create_swap_order_request

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
