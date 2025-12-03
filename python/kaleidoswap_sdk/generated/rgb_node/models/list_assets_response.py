from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_cfa import AssetCFA
    from ..models.asset_nia import AssetNIA
    from ..models.asset_uda import AssetUDA


T = TypeVar("T", bound="ListAssetsResponse")


@_attrs_define
class ListAssetsResponse:
    """
    Attributes:
        nia (list[AssetNIA] | Unset):
        uda (list[AssetUDA] | Unset):
        cfa (list[AssetCFA] | Unset):
    """

    nia: list[AssetNIA] | Unset = UNSET
    uda: list[AssetUDA] | Unset = UNSET
    cfa: list[AssetCFA] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        nia: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.nia, Unset):
            nia = []
            for nia_item_data in self.nia:
                nia_item = nia_item_data.to_dict()
                nia.append(nia_item)

        uda: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.uda, Unset):
            uda = []
            for uda_item_data in self.uda:
                uda_item = uda_item_data.to_dict()
                uda.append(uda_item)

        cfa: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.cfa, Unset):
            cfa = []
            for cfa_item_data in self.cfa:
                cfa_item = cfa_item_data.to_dict()
                cfa.append(cfa_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if nia is not UNSET:
            field_dict["nia"] = nia
        if uda is not UNSET:
            field_dict["uda"] = uda
        if cfa is not UNSET:
            field_dict["cfa"] = cfa

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.asset_cfa import AssetCFA
        from ..models.asset_nia import AssetNIA
        from ..models.asset_uda import AssetUDA

        d = dict(src_dict)
        _nia = d.pop("nia", UNSET)
        nia: list[AssetNIA] | Unset = UNSET
        if _nia is not UNSET:
            nia = []
            for nia_item_data in _nia:
                nia_item = AssetNIA.from_dict(nia_item_data)

                nia.append(nia_item)

        _uda = d.pop("uda", UNSET)
        uda: list[AssetUDA] | Unset = UNSET
        if _uda is not UNSET:
            uda = []
            for uda_item_data in _uda:
                uda_item = AssetUDA.from_dict(uda_item_data)

                uda.append(uda_item)

        _cfa = d.pop("cfa", UNSET)
        cfa: list[AssetCFA] | Unset = UNSET
        if _cfa is not UNSET:
            cfa = []
            for cfa_item_data in _cfa:
                cfa_item = AssetCFA.from_dict(cfa_item_data)

                cfa.append(cfa_item)

        list_assets_response = cls(
            nia=nia,
            uda=uda,
            cfa=cfa,
        )

        list_assets_response.additional_properties = d
        return list_assets_response

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
