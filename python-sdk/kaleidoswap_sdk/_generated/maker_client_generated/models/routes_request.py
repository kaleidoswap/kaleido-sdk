from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.layer import Layer
from ..types import UNSET, Unset

T = TypeVar("T", bound="RoutesRequest")


@_attrs_define
class RoutesRequest:
    """Request for route discovery.

    Attributes:
        from_asset (str): Source asset ticker or ID
        from_layer (Union[Layer, None, Unset]): Filter by source layer (optional)
        to_asset (Union[None, Unset, str]): Destination asset (if None, returns all reachable assets)
        to_layer (Union[Layer, None, Unset]): Filter by destination layer (optional)
        max_hops (Union[Unset, int]): Maximum number of hops (1-5) Default: 2.
    """

    from_asset: str
    from_layer: Layer | None | Unset = UNSET
    to_asset: None | Unset | str = UNSET
    to_layer: Layer | None | Unset = UNSET
    max_hops: Unset | int = 2
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from_asset = self.from_asset

        from_layer: None | Unset | str
        if isinstance(self.from_layer, Unset):
            from_layer = UNSET
        elif isinstance(self.from_layer, Layer):
            from_layer = self.from_layer.value
        else:
            from_layer = self.from_layer

        to_asset: None | Unset | str
        if isinstance(self.to_asset, Unset):
            to_asset = UNSET
        else:
            to_asset = self.to_asset

        to_layer: None | Unset | str
        if isinstance(self.to_layer, Unset):
            to_layer = UNSET
        elif isinstance(self.to_layer, Layer):
            to_layer = self.to_layer.value
        else:
            to_layer = self.to_layer

        max_hops = self.max_hops

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "from_asset": from_asset,
            }
        )
        if from_layer is not UNSET:
            field_dict["from_layer"] = from_layer
        if to_asset is not UNSET:
            field_dict["to_asset"] = to_asset
        if to_layer is not UNSET:
            field_dict["to_layer"] = to_layer
        if max_hops is not UNSET:
            field_dict["max_hops"] = max_hops

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        from_asset = d.pop("from_asset")

        def _parse_from_layer(data: object) -> Layer | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                from_layer_type_1 = Layer(data)

                return from_layer_type_1
            except:  # noqa: E722
                pass
            return cast(Layer | None | Unset, data)

        from_layer = _parse_from_layer(d.pop("from_layer", UNSET))

        def _parse_to_asset(data: object) -> None | Unset | str:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | str, data)

        to_asset = _parse_to_asset(d.pop("to_asset", UNSET))

        def _parse_to_layer(data: object) -> Layer | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                to_layer_type_1 = Layer(data)

                return to_layer_type_1
            except:  # noqa: E722
                pass
            return cast(Layer | None | Unset, data)

        to_layer = _parse_to_layer(d.pop("to_layer", UNSET))

        max_hops = d.pop("max_hops", UNSET)

        routes_request = cls(
            from_asset=from_asset,
            from_layer=from_layer,
            to_asset=to_asset,
            to_layer=to_layer,
            max_hops=max_hops,
        )

        routes_request.additional_properties = d
        return routes_request

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
