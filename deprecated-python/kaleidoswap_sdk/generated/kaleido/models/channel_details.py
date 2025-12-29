from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

T = TypeVar("T", bound="ChannelDetails")


@_attrs_define
class ChannelDetails:
    """
    Attributes:
        channel_id (None | str | Unset):
        temporary_channel_id (None | str | Unset):
        funded_at (datetime.datetime | None | Unset):
        funding_outpoint (None | str | Unset):
        expires_at (datetime.datetime | None | Unset):
    """

    channel_id: None | str | Unset = UNSET
    temporary_channel_id: None | str | Unset = UNSET
    funded_at: datetime.datetime | None | Unset = UNSET
    funding_outpoint: None | str | Unset = UNSET
    expires_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        channel_id: None | str | Unset
        if isinstance(self.channel_id, Unset):
            channel_id = UNSET
        else:
            channel_id = self.channel_id

        temporary_channel_id: None | str | Unset
        if isinstance(self.temporary_channel_id, Unset):
            temporary_channel_id = UNSET
        else:
            temporary_channel_id = self.temporary_channel_id

        funded_at: None | str | Unset
        if isinstance(self.funded_at, Unset):
            funded_at = UNSET
        elif isinstance(self.funded_at, datetime.datetime):
            funded_at = self.funded_at.isoformat()
        else:
            funded_at = self.funded_at

        funding_outpoint: None | str | Unset
        if isinstance(self.funding_outpoint, Unset):
            funding_outpoint = UNSET
        else:
            funding_outpoint = self.funding_outpoint

        expires_at: None | str | Unset
        if isinstance(self.expires_at, Unset):
            expires_at = UNSET
        elif isinstance(self.expires_at, datetime.datetime):
            expires_at = self.expires_at.isoformat()
        else:
            expires_at = self.expires_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if channel_id is not UNSET:
            field_dict["channel_id"] = channel_id
        if temporary_channel_id is not UNSET:
            field_dict["temporary_channel_id"] = temporary_channel_id
        if funded_at is not UNSET:
            field_dict["funded_at"] = funded_at
        if funding_outpoint is not UNSET:
            field_dict["funding_outpoint"] = funding_outpoint
        if expires_at is not UNSET:
            field_dict["expires_at"] = expires_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)

        def _parse_channel_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        channel_id = _parse_channel_id(d.pop("channel_id", UNSET))

        def _parse_temporary_channel_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        temporary_channel_id = _parse_temporary_channel_id(
            d.pop("temporary_channel_id", UNSET)
        )

        def _parse_funded_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                funded_at_type_0 = isoparse(data)

                return funded_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        funded_at = _parse_funded_at(d.pop("funded_at", UNSET))

        def _parse_funding_outpoint(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        funding_outpoint = _parse_funding_outpoint(d.pop("funding_outpoint", UNSET))

        def _parse_expires_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                expires_at_type_0 = isoparse(data)

                return expires_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        expires_at = _parse_expires_at(d.pop("expires_at", UNSET))

        channel_details = cls(
            channel_id=channel_id,
            temporary_channel_id=temporary_channel_id,
            funded_at=funded_at,
            funding_outpoint=funding_outpoint,
            expires_at=expires_at,
        )

        channel_details.additional_properties = d
        return channel_details

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
