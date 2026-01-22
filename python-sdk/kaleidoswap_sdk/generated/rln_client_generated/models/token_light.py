from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.media import Media
    from ..models.token_light_attachments import TokenLightAttachments


T = TypeVar("T", bound="TokenLight")


@_attrs_define
class TokenLight:
    """
    Attributes:
        index (Union[Unset, int]):
        ticker (Union[Unset, str]):
        name (Union[Unset, str]):
        details (Union[Unset, str]):
        embedded_media (Union[Unset, bool]):
        media (Union[Unset, Media]):
        attachments (Union[Unset, TokenLightAttachments]):
        reserves (Union[Unset, bool]):
    """

    index: Unset | int = UNSET
    ticker: Unset | str = UNSET
    name: Unset | str = UNSET
    details: Unset | str = UNSET
    embedded_media: Unset | bool = UNSET
    media: Union[Unset, "Media"] = UNSET
    attachments: Union[Unset, "TokenLightAttachments"] = UNSET
    reserves: Unset | bool = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        index = self.index

        ticker = self.ticker

        name = self.name

        details = self.details

        embedded_media = self.embedded_media

        media: Unset | dict[str, Any] = UNSET
        if not isinstance(self.media, Unset):
            media = self.media.to_dict()

        attachments: Unset | dict[str, Any] = UNSET
        if not isinstance(self.attachments, Unset):
            attachments = self.attachments.to_dict()

        reserves = self.reserves

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if index is not UNSET:
            field_dict["index"] = index
        if ticker is not UNSET:
            field_dict["ticker"] = ticker
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details
        if embedded_media is not UNSET:
            field_dict["embedded_media"] = embedded_media
        if media is not UNSET:
            field_dict["media"] = media
        if attachments is not UNSET:
            field_dict["attachments"] = attachments
        if reserves is not UNSET:
            field_dict["reserves"] = reserves

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.media import Media
        from ..models.token_light_attachments import TokenLightAttachments

        d = dict(src_dict)
        index = d.pop("index", UNSET)

        ticker = d.pop("ticker", UNSET)

        name = d.pop("name", UNSET)

        details = d.pop("details", UNSET)

        embedded_media = d.pop("embedded_media", UNSET)

        _media = d.pop("media", UNSET)
        media: Unset | Media
        if isinstance(_media, Unset):
            media = UNSET
        else:
            media = Media.from_dict(_media)

        _attachments = d.pop("attachments", UNSET)
        attachments: Unset | TokenLightAttachments
        if isinstance(_attachments, Unset):
            attachments = UNSET
        else:
            attachments = TokenLightAttachments.from_dict(_attachments)

        reserves = d.pop("reserves", UNSET)

        token_light = cls(
            index=index,
            ticker=ticker,
            name=name,
            details=details,
            embedded_media=embedded_media,
            media=media,
            attachments=attachments,
            reserves=reserves,
        )

        token_light.additional_properties = d
        return token_light

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
