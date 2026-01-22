from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.layer import Layer

T = TypeVar("T", bound="SwapLeg")


@_attrs_define
class SwapLeg:
    """Swap Leg: Complete asset specification for one side of a swap.

    Represents a specific asset on a specific settlement layer with an amount.
    This is the fundamental unit for swap orders - each side (leg) of a swap
    specifies an asset on a particular network with a specific amount.

        Attributes:
            asset_id (str): Unique identifier for the asset (e.g., 'BTC', RGB contract ID, etc.)
            name (str): Full name of the asset
            ticker (str): Asset ticker symbol for display (e.g., 'BTC', 'USDT', 'EURX')
            layer (Layer): Settlement layer combining protocol and network as a single string.

                Format: PROTOCOL/NETWORK

                Each layer represents a valid combination where assets can exist and be transacted.
                The layer encodes both WHAT protocol the asset uses and WHERE it settles.
            amount (int): Amount of the asset in smallest unit. Must be greater than or equal to zero.
            precision (int): Number of decimal places for this asset (e.g., 8 for BTC, 6 or 8 for stablecoins)
    """

    asset_id: str
    name: str
    ticker: str
    layer: Layer
    amount: int
    precision: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_id = self.asset_id

        name = self.name

        ticker = self.ticker

        layer = self.layer.value

        amount = self.amount

        precision = self.precision

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "asset_id": asset_id,
                "name": name,
                "ticker": ticker,
                "layer": layer,
                "amount": amount,
                "precision": precision,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        asset_id = d.pop("asset_id")

        name = d.pop("name")

        ticker = d.pop("ticker")

        layer = Layer(d.pop("layer"))

        amount = d.pop("amount")

        precision = d.pop("precision")

        swap_leg = cls(
            asset_id=asset_id,
            name=name,
            ticker=ticker,
            layer=layer,
            amount=amount,
            precision=precision,
        )

        swap_leg.additional_properties = d
        return swap_leg

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
