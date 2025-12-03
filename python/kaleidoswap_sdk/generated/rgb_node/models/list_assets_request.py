from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.asset_schema import AssetSchema
from ..types import UNSET, Unset

T = TypeVar("T", bound="ListAssetsRequest")


@_attrs_define
class ListAssetsRequest:
    """
    Attributes:
        filter_asset_schemas (list[AssetSchema] | Unset):  Example: ['Nia', 'Uda', 'Cfa'].
    """

    filter_asset_schemas: list[AssetSchema] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        filter_asset_schemas: list[str] | Unset = UNSET
        if not isinstance(self.filter_asset_schemas, Unset):
            filter_asset_schemas = []
            for filter_asset_schemas_item_data in self.filter_asset_schemas:
                filter_asset_schemas_item = filter_asset_schemas_item_data.value
                filter_asset_schemas.append(filter_asset_schemas_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if filter_asset_schemas is not UNSET:
            field_dict["filter_asset_schemas"] = filter_asset_schemas

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _filter_asset_schemas = d.pop("filter_asset_schemas", UNSET)
        filter_asset_schemas: list[AssetSchema] | Unset = UNSET
        if _filter_asset_schemas is not UNSET:
            filter_asset_schemas = []
            for filter_asset_schemas_item_data in _filter_asset_schemas:
                filter_asset_schemas_item = AssetSchema(filter_asset_schemas_item_data)

                filter_asset_schemas.append(filter_asset_schemas_item)

        list_assets_request = cls(
            filter_asset_schemas=filter_asset_schemas,
        )

        list_assets_request.additional_properties = d
        return list_assets_request

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
