from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.asset_iface import AssetIface
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_balance_response import AssetBalanceResponse
    from ..models.media import Media


T = TypeVar("T", bound="ClientAsset")


@_attrs_define
class ClientAsset:
    """
    Attributes:
        asset_id (str):  Example: rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd.
        ticker (str):  Example: USDT.
        name (str):  Example: Tether.
        precision (int):
        issued_supply (int):  Example: 777.
        timestamp (int):  Example: 1691160565.
        added_at (int):  Example: 1691161979.
        balance (AssetBalanceResponse):
        details (None | str | Unset):  Example: asset details.
        media (Media | None | Unset):
        asset_iface (AssetIface | None | Unset):
        is_active (bool | Unset):  Default: True.
    """

    asset_id: str
    ticker: str
    name: str
    precision: int
    issued_supply: int
    timestamp: int
    added_at: int
    balance: AssetBalanceResponse
    details: None | str | Unset = UNSET
    media: Media | None | Unset = UNSET
    asset_iface: AssetIface | None | Unset = UNSET
    is_active: bool | Unset = True
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.media import Media

        asset_id = self.asset_id

        ticker = self.ticker

        name = self.name

        precision = self.precision

        issued_supply = self.issued_supply

        timestamp = self.timestamp

        added_at = self.added_at

        balance = self.balance.to_dict()

        details: None | str | Unset
        if isinstance(self.details, Unset):
            details = UNSET
        else:
            details = self.details

        media: dict[str, Any] | None | Unset
        if isinstance(self.media, Unset):
            media = UNSET
        elif isinstance(self.media, Media):
            media = self.media.to_dict()
        else:
            media = self.media

        asset_iface: None | str | Unset
        if isinstance(self.asset_iface, Unset):
            asset_iface = UNSET
        elif isinstance(self.asset_iface, AssetIface):
            asset_iface = self.asset_iface.value
        else:
            asset_iface = self.asset_iface

        is_active = self.is_active

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "asset_id": asset_id,
                "ticker": ticker,
                "name": name,
                "precision": precision,
                "issued_supply": issued_supply,
                "timestamp": timestamp,
                "added_at": added_at,
                "balance": balance,
            }
        )
        if details is not UNSET:
            field_dict["details"] = details
        if media is not UNSET:
            field_dict["media"] = media
        if asset_iface is not UNSET:
            field_dict["asset_iface"] = asset_iface
        if is_active is not UNSET:
            field_dict["is_active"] = is_active

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.asset_balance_response import AssetBalanceResponse
        from ..models.media import Media

        d = dict(src_dict)
        asset_id = d.pop("asset_id")

        ticker = d.pop("ticker")

        name = d.pop("name")

        precision = d.pop("precision")

        issued_supply = d.pop("issued_supply")

        timestamp = d.pop("timestamp")

        added_at = d.pop("added_at")

        balance = AssetBalanceResponse.from_dict(d.pop("balance"))

        def _parse_details(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        details = _parse_details(d.pop("details", UNSET))

        def _parse_media(data: object) -> Media | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                media_type_0 = Media.from_dict(data)

                return media_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(Media | None | Unset, data)

        media = _parse_media(d.pop("media", UNSET))

        def _parse_asset_iface(data: object) -> AssetIface | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                asset_iface_type_0 = AssetIface(data)

                return asset_iface_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AssetIface | None | Unset, data)

        asset_iface = _parse_asset_iface(d.pop("asset_iface", UNSET))

        is_active = d.pop("is_active", UNSET)

        client_asset = cls(
            asset_id=asset_id,
            ticker=ticker,
            name=name,
            precision=precision,
            issued_supply=issued_supply,
            timestamp=timestamp,
            added_at=added_at,
            balance=balance,
            details=details,
            media=media,
            asset_iface=asset_iface,
            is_active=is_active,
        )

        client_asset.additional_properties = d
        return client_asset

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
