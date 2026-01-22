from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.layer import Layer
from ..types import UNSET, Unset

T = TypeVar("T", bound="SwapLegInput")


@_attrs_define
class SwapLegInput:
    """Lightweight input model for specifying one leg of a swap request.

    Only contains the fields the client needs to provide. The service will
    look up additional details (name, ticker, precision) from the asset registry.

        Attributes:
            asset_id (str): Asset identifier (e.g., 'BTC', RGB contract ID)
            layer (Layer): Settlement layer combining protocol and network as a single string.

                Format: PROTOCOL/NETWORK

                Each layer represents a valid combination where assets can exist and be transacted.
                The layer encodes both WHAT protocol the asset uses and WHERE it settles.
            amount (Union[None, Unset, int]): Amount in smallest unit (optional - one side must have amount)
    """

    asset_id: str
    layer: Layer
    amount: None | Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_id = self.asset_id

        layer = self.layer.value

        amount: None | Unset | int
        if isinstance(self.amount, Unset):
            amount = UNSET
        else:
            amount = self.amount

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "asset_id": asset_id,
                "layer": layer,
            }
        )
        if amount is not UNSET:
            field_dict["amount"] = amount

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        asset_id = d.pop("asset_id")

        layer = Layer(d.pop("layer"))

        def _parse_amount(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        amount = _parse_amount(d.pop("amount", UNSET))

        swap_leg_input = cls(
            asset_id=asset_id,
            layer=layer,
            amount=amount,
        )

        swap_leg_input.additional_properties = d
        return swap_leg_input

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
