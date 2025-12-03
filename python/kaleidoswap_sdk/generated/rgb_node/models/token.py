from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.embedded_media import EmbeddedMedia
    from ..models.media import Media
    from ..models.proof_of_reserves import ProofOfReserves
    from ..models.token_attachments import TokenAttachments


T = TypeVar("T", bound="Token")


@_attrs_define
class Token:
    """
    Attributes:
        index (int | Unset):
        ticker (str | Unset):  Example: TKN.
        name (str | Unset):  Example: Token.
        details (str | Unset):  Example: token details.
        embedded_media (EmbeddedMedia | Unset):
        media (Media | Unset):
        attachments (TokenAttachments | Unset):  Example: {0: {'file_path': 'path/to/attachment0', 'digest':
            '5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03', 'mime': 'text/plain'}, 1: {'file_path':
            'path/to/attachment1', 'digest': 'd7516e3a27cdf35aa9dcb323b5f556344ef7f57570be30b88de2bfd4ba339b1a', 'mime':
            'image/png'}}.
        reserves (ProofOfReserves | Unset):
    """

    index: int | Unset = UNSET
    ticker: str | Unset = UNSET
    name: str | Unset = UNSET
    details: str | Unset = UNSET
    embedded_media: EmbeddedMedia | Unset = UNSET
    media: Media | Unset = UNSET
    attachments: TokenAttachments | Unset = UNSET
    reserves: ProofOfReserves | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        index = self.index

        ticker = self.ticker

        name = self.name

        details = self.details

        embedded_media: dict[str, Any] | Unset = UNSET
        if not isinstance(self.embedded_media, Unset):
            embedded_media = self.embedded_media.to_dict()

        media: dict[str, Any] | Unset = UNSET
        if not isinstance(self.media, Unset):
            media = self.media.to_dict()

        attachments: dict[str, Any] | Unset = UNSET
        if not isinstance(self.attachments, Unset):
            attachments = self.attachments.to_dict()

        reserves: dict[str, Any] | Unset = UNSET
        if not isinstance(self.reserves, Unset):
            reserves = self.reserves.to_dict()

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
        from ..models.embedded_media import EmbeddedMedia
        from ..models.media import Media
        from ..models.proof_of_reserves import ProofOfReserves
        from ..models.token_attachments import TokenAttachments

        d = dict(src_dict)
        index = d.pop("index", UNSET)

        ticker = d.pop("ticker", UNSET)

        name = d.pop("name", UNSET)

        details = d.pop("details", UNSET)

        _embedded_media = d.pop("embedded_media", UNSET)
        embedded_media: EmbeddedMedia | Unset
        if isinstance(_embedded_media, Unset):
            embedded_media = UNSET
        else:
            embedded_media = EmbeddedMedia.from_dict(_embedded_media)

        _media = d.pop("media", UNSET)
        media: Media | Unset
        if isinstance(_media, Unset):
            media = UNSET
        else:
            media = Media.from_dict(_media)

        _attachments = d.pop("attachments", UNSET)
        attachments: TokenAttachments | Unset
        if isinstance(_attachments, Unset):
            attachments = UNSET
        else:
            attachments = TokenAttachments.from_dict(_attachments)

        _reserves = d.pop("reserves", UNSET)
        reserves: ProofOfReserves | Unset
        if isinstance(_reserves, Unset):
            reserves = UNSET
        else:
            reserves = ProofOfReserves.from_dict(_reserves)

        token = cls(
            index=index,
            ticker=ticker,
            name=name,
            details=details,
            embedded_media=embedded_media,
            media=media,
            attachments=attachments,
            reserves=reserves,
        )

        token.additional_properties = d
        return token

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
