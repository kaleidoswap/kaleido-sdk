from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.fee import Fee
    from ..models.swap_leg import SwapLeg


T = TypeVar("T", bound="PairQuoteResponse")


@_attrs_define
class PairQuoteResponse:
    """Response containing a quote for a trading pair.

    Uses full SwapLeg for both sides, providing complete asset details
    including ticker, name, precision, layer, and amount.

        Attributes:
            rfq_id (str):
            from_asset (SwapLeg): Swap Leg: Complete asset specification for one side of a swap.

                Represents a specific asset on a specific settlement layer with an amount.
                This is the fundamental unit for swap orders - each side (leg) of a swap
                specifies an asset on a particular network with a specific amount.
            to_asset (SwapLeg): Swap Leg: Complete asset specification for one side of a swap.

                Represents a specific asset on a specific settlement layer with an amount.
                This is the fundamental unit for swap orders - each side (leg) of a swap
                specifies an asset on a particular network with a specific amount.
            price (int): Price of 1 whole unit of from_asset (e.g., 1 BTC) in terms of the smallest unit of to_asset (e.g.,
                USDT with precision 6). Matches PriceData.price for the given rfq_id.
            fee (Fee):
            timestamp (int): Quote creation timestamp (seconds since epoch)
            expires_at (int): Quote expiry timestamp (seconds since epoch)
    """

    rfq_id: str
    from_asset: "SwapLeg"
    to_asset: "SwapLeg"
    price: int
    fee: "Fee"
    timestamp: int
    expires_at: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        rfq_id = self.rfq_id

        from_asset = self.from_asset.to_dict()

        to_asset = self.to_asset.to_dict()

        price = self.price

        fee = self.fee.to_dict()

        timestamp = self.timestamp

        expires_at = self.expires_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "rfq_id": rfq_id,
                "from_asset": from_asset,
                "to_asset": to_asset,
                "price": price,
                "fee": fee,
                "timestamp": timestamp,
                "expires_at": expires_at,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.fee import Fee
        from ..models.swap_leg import SwapLeg

        d = dict(src_dict)
        rfq_id = d.pop("rfq_id")

        from_asset = SwapLeg.from_dict(d.pop("from_asset"))

        to_asset = SwapLeg.from_dict(d.pop("to_asset"))

        price = d.pop("price")

        fee = Fee.from_dict(d.pop("fee"))

        timestamp = d.pop("timestamp")

        expires_at = d.pop("expires_at")

        pair_quote_response = cls(
            rfq_id=rfq_id,
            from_asset=from_asset,
            to_asset=to_asset,
            price=price,
            fee=fee,
            timestamp=timestamp,
            expires_at=expires_at,
        )

        pair_quote_response.additional_properties = d
        return pair_quote_response

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
