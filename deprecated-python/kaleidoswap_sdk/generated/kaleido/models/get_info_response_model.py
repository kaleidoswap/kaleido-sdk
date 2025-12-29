from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.assets_options import AssetsOptions
    from ..models.order_options import OrderOptions


T = TypeVar("T", bound="GetInfoResponseModel")


@_attrs_define
class GetInfoResponseModel:
    """
    Attributes:
        lsp_connection_url (str):
        options (OrderOptions):
        assets (list[AssetsOptions]):
    """

    lsp_connection_url: str
    options: OrderOptions
    assets: list[AssetsOptions]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        lsp_connection_url = self.lsp_connection_url

        options = self.options.to_dict()

        assets = []
        for assets_item_data in self.assets:
            assets_item = assets_item_data.to_dict()
            assets.append(assets_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "lsp_connection_url": lsp_connection_url,
                "options": options,
                "assets": assets,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.assets_options import AssetsOptions
        from ..models.order_options import OrderOptions

        d = dict(src_dict)
        lsp_connection_url = d.pop("lsp_connection_url")

        options = OrderOptions.from_dict(d.pop("options"))

        assets = []
        _assets = d.pop("assets")
        for assets_item_data in _assets:
            assets_item = AssetsOptions.from_dict(assets_item_data)

            assets.append(assets_item)

        get_info_response_model = cls(
            lsp_connection_url=lsp_connection_url,
            options=options,
            assets=assets,
        )

        get_info_response_model.additional_properties = d
        return get_info_response_model

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
