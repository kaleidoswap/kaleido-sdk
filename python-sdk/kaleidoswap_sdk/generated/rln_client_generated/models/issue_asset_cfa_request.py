from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="IssueAssetCFARequest")


@_attrs_define
class IssueAssetCFARequest:
    """
    Attributes:
        amounts (Union[Unset, list[int]]):
        name (Union[Unset, str]):
        details (Union[Unset, str]):
        precision (Union[Unset, int]):
        file_digest (Union[Unset, str]):
    """

    amounts: Unset | list[int] = UNSET
    name: Unset | str = UNSET
    details: Unset | str = UNSET
    precision: Unset | int = UNSET
    file_digest: Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amounts: Unset | list[int] = UNSET
        if not isinstance(self.amounts, Unset):
            amounts = self.amounts

        name = self.name

        details = self.details

        precision = self.precision

        file_digest = self.file_digest

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if amounts is not UNSET:
            field_dict["amounts"] = amounts
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details
        if precision is not UNSET:
            field_dict["precision"] = precision
        if file_digest is not UNSET:
            field_dict["file_digest"] = file_digest

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        amounts = cast(list[int], d.pop("amounts", UNSET))

        name = d.pop("name", UNSET)

        details = d.pop("details", UNSET)

        precision = d.pop("precision", UNSET)

        file_digest = d.pop("file_digest", UNSET)

        issue_asset_cfa_request = cls(
            amounts=amounts,
            name=name,
            details=details,
            precision=precision,
            file_digest=file_digest,
        )

        issue_asset_cfa_request.additional_properties = d
        return issue_asset_cfa_request

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
