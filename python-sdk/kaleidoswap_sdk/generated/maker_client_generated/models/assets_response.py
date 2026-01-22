from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset import Asset


T = TypeVar("T", bound="AssetsResponse")


@_attrs_define
class AssetsResponse:
    """Response model for asset listing endpoints with pagination support.

    Attributes:
        assets (list['Asset']):
        total (int):
        limit (int):
        offset (int):
        network (Union[Unset, str]):  Default: 'regtest'.
        timestamp (Union[None, Unset, int]):
    """

    assets: list["Asset"]
    total: int
    limit: int
    offset: int
    network: Unset | str = "regtest"
    timestamp: None | Unset | int = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        assets = []
        for assets_item_data in self.assets:
            assets_item = assets_item_data.to_dict()
            assets.append(assets_item)

        total = self.total

        limit = self.limit

        offset = self.offset

        network = self.network

        timestamp: None | Unset | int
        if isinstance(self.timestamp, Unset):
            timestamp = UNSET
        else:
            timestamp = self.timestamp

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "assets": assets,
                "total": total,
                "limit": limit,
                "offset": offset,
            }
        )
        if network is not UNSET:
            field_dict["network"] = network
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.asset import Asset

        d = dict(src_dict)
        assets = []
        _assets = d.pop("assets")
        for assets_item_data in _assets:
            assets_item = Asset.from_dict(assets_item_data)

            assets.append(assets_item)

        total = d.pop("total")

        limit = d.pop("limit")

        offset = d.pop("offset")

        network = d.pop("network", UNSET)

        def _parse_timestamp(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        timestamp = _parse_timestamp(d.pop("timestamp", UNSET))

        assets_response = cls(
            assets=assets,
            total=total,
            limit=limit,
            offset=offset,
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
