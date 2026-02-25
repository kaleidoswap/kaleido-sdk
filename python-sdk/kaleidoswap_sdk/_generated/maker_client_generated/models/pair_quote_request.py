from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.swap_leg_input import SwapLegInput


T = TypeVar("T", bound="PairQuoteRequest")


@_attrs_define
class PairQuoteRequest:
    """Request for a quote on a trading pair using SwapLegInput.

    Attributes:
        from_asset (SwapLegInput): Lightweight input model for specifying one leg of a swap request.

            Only contains the fields the client needs to provide. The service will
            look up additional details (name, ticker, precision) from the asset registry.
        to_asset (SwapLegInput): Lightweight input model for specifying one leg of a swap request.

            Only contains the fields the client needs to provide. The service will
            look up additional details (name, ticker, precision) from the asset registry.
    """

    from_asset: "SwapLegInput"
    to_asset: "SwapLegInput"
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from_asset = self.from_asset.to_dict()

        to_asset = self.to_asset.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "from_asset": from_asset,
                "to_asset": to_asset,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.swap_leg_input import SwapLegInput

        d = dict(src_dict)
        from_asset = SwapLegInput.from_dict(d.pop("from_asset"))

        to_asset = SwapLegInput.from_dict(d.pop("to_asset"))

        pair_quote_request = cls(
            from_asset=from_asset,
            to_asset=to_asset,
        )

        pair_quote_request.additional_properties = d
        return pair_quote_request

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
