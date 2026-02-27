from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_cfa import AssetCFA


T = TypeVar("T", bound="IssueAssetCFAResponse")


@_attrs_define
class IssueAssetCFAResponse:
    """
    Attributes:
        asset (Union[Unset, AssetCFA]):
    """

    asset: Union[Unset, "AssetCFA"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset: Unset | dict[str, Any] = UNSET
        if not isinstance(self.asset, Unset):
            asset = self.asset.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if asset is not UNSET:
            field_dict["asset"] = asset

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.asset_cfa import AssetCFA

        d = dict(src_dict)
        _asset = d.pop("asset", UNSET)
        asset: Unset | AssetCFA
        if isinstance(_asset, Unset):
            asset = UNSET
        else:
            asset = AssetCFA.from_dict(_asset)

        issue_asset_cfa_response = cls(
            asset=asset,
        )

        issue_asset_cfa_response.additional_properties = d
        return issue_asset_cfa_response

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
