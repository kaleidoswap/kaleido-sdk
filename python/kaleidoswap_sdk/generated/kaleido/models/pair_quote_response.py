from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.fee import Fee


T = TypeVar("T", bound="PairQuoteResponse")


@_attrs_define
class PairQuoteResponse:
    """
    Attributes:
        rfq_id (str):  Example: 1234567890.
        from_asset (str):  Example: BTC.
        from_amount (int): Amount of from_asset in its smallest unit (e.g., millisatoshis for BTC if precision is 11)
            Example: 100000000000.
        to_asset (str):  Example: rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd.
        to_amount (int): Amount of to_asset in its smallest unit, after applying price and fees. Example: 49900123.
        price (int): Price of 1 whole unit of from_asset (e.g., 1 BTC) in terms of the smallest unit of to_asset (e.g.,
            USDT with precision 6). Matches PriceData.price for the given rfq_id. Example: 50000123456.
        fee (Fee):
        timestamp (int):
        expires_at (int):
    """

    rfq_id: str
    from_asset: str
    from_amount: int
    to_asset: str
    to_amount: int
    price: int
    fee: Fee
    timestamp: int
    expires_at: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        rfq_id = self.rfq_id

        from_asset = self.from_asset

        from_amount = self.from_amount

        to_asset = self.to_asset

        to_amount = self.to_amount

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
                "from_amount": from_amount,
                "to_asset": to_asset,
                "to_amount": to_amount,
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

        d = dict(src_dict)
        rfq_id = d.pop("rfq_id")

        from_asset = d.pop("from_asset")

        from_amount = d.pop("from_amount")

        to_asset = d.pop("to_asset")

        to_amount = d.pop("to_amount")

        price = d.pop("price")

        fee = Fee.from_dict(d.pop("fee"))

        timestamp = d.pop("timestamp")

        expires_at = d.pop("expires_at")

        pair_quote_response = cls(
            rfq_id=rfq_id,
            from_asset=from_asset,
            from_amount=from_amount,
            to_asset=to_asset,
            to_amount=to_amount,
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
