from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.layer import Layer
from ..types import UNSET, Unset

T = TypeVar("T", bound="RouteStep")


@_attrs_define
class RouteStep:
    """Single step in a route (one swap within a trading pair).

    Attributes:
        from_asset (str): Source asset ticker
        from_layer (Layer): Settlement layer combining protocol and network as a single string.

            Format: PROTOCOL/NETWORK

            Each layer represents a valid combination where assets can exist and be transacted.
            The layer encodes both WHAT protocol the asset uses and WHERE it settles.
        to_asset (str): Destination asset ticker
        to_layer (Layer): Settlement layer combining protocol and network as a single string.

            Format: PROTOCOL/NETWORK

            Each layer represents a valid combination where assets can exist and be transacted.
            The layer encodes both WHAT protocol the asset uses and WHERE it settles.
        pair_ticker (str): Trading pair ticker (e.g., 'USDT/BTC')
        indicative_price (Union[None, Unset, str]): Indicative price from cached pair data
    """

    from_asset: str
    from_layer: Layer
    to_asset: str
    to_layer: Layer
    pair_ticker: str
    indicative_price: None | Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from_asset = self.from_asset

        from_layer = self.from_layer.value

        to_asset = self.to_asset

        to_layer = self.to_layer.value

        pair_ticker = self.pair_ticker

        indicative_price: None | Unset | str
        if isinstance(self.indicative_price, Unset):
            indicative_price = UNSET
        else:
            indicative_price = self.indicative_price

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "from_asset": from_asset,
                "from_layer": from_layer,
                "to_asset": to_asset,
                "to_layer": to_layer,
                "pair_ticker": pair_ticker,
            }
        )
        if indicative_price is not UNSET:
            field_dict["indicative_price"] = indicative_price

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        from_asset = d.pop("from_asset")

        from_layer = Layer(d.pop("from_layer"))

        to_asset = d.pop("to_asset")

        to_layer = Layer(d.pop("to_layer"))

        pair_ticker = d.pop("pair_ticker")

        def _parse_indicative_price(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        indicative_price = _parse_indicative_price(d.pop("indicative_price", UNSET))

        route_step = cls(
            from_asset=from_asset,
            from_layer=from_layer,
            to_asset=to_asset,
            to_layer=to_layer,
            pair_ticker=pair_ticker,
            indicative_price=indicative_price,
        )

        route_step.additional_properties = d
        return route_step

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
