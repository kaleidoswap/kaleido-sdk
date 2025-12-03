from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="IssueAssetUDARequest")


@_attrs_define
class IssueAssetUDARequest:
    """
    Attributes:
        ticker (str | Unset):  Example: UNI.
        name (str | Unset):  Example: Unique.
        details (str | Unset):  Example: asset details.
        precision (int | Unset):
        media_file_digest (str | Unset):  Example: /path/to/media.
        attachments_file_digests (list[str] | Unset):  Example:
            ['5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03',
            'd7516e3a27cdf35aa9dcb323b5f556344ef7f57570be30b88de2bfd4ba339b1a'].
    """

    ticker: str | Unset = UNSET
    name: str | Unset = UNSET
    details: str | Unset = UNSET
    precision: int | Unset = UNSET
    media_file_digest: str | Unset = UNSET
    attachments_file_digests: list[str] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        ticker = self.ticker

        name = self.name

        details = self.details

        precision = self.precision

        media_file_digest = self.media_file_digest

        attachments_file_digests: list[str] | Unset = UNSET
        if not isinstance(self.attachments_file_digests, Unset):
            attachments_file_digests = self.attachments_file_digests

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if ticker is not UNSET:
            field_dict["ticker"] = ticker
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details
        if precision is not UNSET:
            field_dict["precision"] = precision
        if media_file_digest is not UNSET:
            field_dict["media_file_digest"] = media_file_digest
        if attachments_file_digests is not UNSET:
            field_dict["attachments_file_digests"] = attachments_file_digests

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        ticker = d.pop("ticker", UNSET)

        name = d.pop("name", UNSET)

        details = d.pop("details", UNSET)

        precision = d.pop("precision", UNSET)

        media_file_digest = d.pop("media_file_digest", UNSET)

        attachments_file_digests = cast(
            list[str], d.pop("attachments_file_digests", UNSET)
        )

        issue_asset_uda_request = cls(
            ticker=ticker,
            name=name,
            details=details,
            precision=precision,
            media_file_digest=media_file_digest,
            attachments_file_digests=attachments_file_digests,
        )

        issue_asset_uda_request.additional_properties = d
        return issue_asset_uda_request

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
