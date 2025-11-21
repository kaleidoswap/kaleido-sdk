from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.client_asset import ClientAsset


T = TypeVar("T", bound="AssetsResponse")


@_attrs_define
class AssetsResponse:
    """
    Attributes:
        assets (list[ClientAsset]):
        network (str | Unset):  Default: 'regtest'.
        timestamp (int | None | Unset):
    """

    assets: list[ClientAsset]
    network: str | Unset = "regtest"
    timestamp: int | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        assets = []
        for assets_item_data in self.assets:
            assets_item = assets_item_data.to_dict()
            assets.append(assets_item)

        network = self.network

        timestamp: int | None | Unset
        if isinstance(self.timestamp, Unset):
            timestamp = UNSET
        else:
            timestamp = self.timestamp

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "assets": assets,
            }
        )
        if network is not UNSET:
            field_dict["network"] = network
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.client_asset import ClientAsset

        d = dict(src_dict)
        assets = []
        _assets = d.pop("assets")
        for assets_item_data in _assets:
            assets_item = ClientAsset.from_dict(assets_item_data)

            assets.append(assets_item)

        network = d.pop("network", UNSET)

        def _parse_timestamp(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        timestamp = _parse_timestamp(d.pop("timestamp", UNSET))

        assets_response = cls(
            assets=assets,
            network=network,
            timestamp=timestamp,
        )

        assets_response.additional_properties = d
        return assets_response

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
