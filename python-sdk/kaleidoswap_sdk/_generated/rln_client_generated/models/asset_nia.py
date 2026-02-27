from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_balance_response import AssetBalanceResponse
    from ..models.media import Media


T = TypeVar("T", bound="AssetNIA")


@_attrs_define
class AssetNIA:
    """
    Attributes:
        asset_id (Union[Unset, str]):
        ticker (Union[Unset, str]):
        name (Union[Unset, str]):
        details (Union[Unset, str]):
        precision (Union[Unset, int]):
        issued_supply (Union[Unset, int]):
        timestamp (Union[Unset, int]):
        added_at (Union[Unset, int]):
        balance (Union[Unset, AssetBalanceResponse]):
        media (Union[Unset, Media]):
    """

    asset_id: Unset | str = UNSET
    ticker: Unset | str = UNSET
    name: Unset | str = UNSET
    details: Unset | str = UNSET
    precision: Unset | int = UNSET
    issued_supply: Unset | int = UNSET
    timestamp: Unset | int = UNSET
    added_at: Unset | int = UNSET
    balance: Union[Unset, "AssetBalanceResponse"] = UNSET
    media: Union[Unset, "Media"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_id = self.asset_id

        ticker = self.ticker

        name = self.name

        details = self.details

        precision = self.precision

        issued_supply = self.issued_supply

        timestamp = self.timestamp

        added_at = self.added_at

        balance: Unset | dict[str, Any] = UNSET
        if not isinstance(self.balance, Unset):
            balance = self.balance.to_dict()

        media: Unset | dict[str, Any] = UNSET
        if not isinstance(self.media, Unset):
            media = self.media.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if ticker is not UNSET:
            field_dict["ticker"] = ticker
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details
        if precision is not UNSET:
            field_dict["precision"] = precision
        if issued_supply is not UNSET:
            field_dict["issued_supply"] = issued_supply
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp
        if added_at is not UNSET:
            field_dict["added_at"] = added_at
        if balance is not UNSET:
            field_dict["balance"] = balance
        if media is not UNSET:
            field_dict["media"] = media

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.asset_balance_response import AssetBalanceResponse
        from ..models.media import Media

        d = dict(src_dict)
        asset_id = d.pop("asset_id", UNSET)

        ticker = d.pop("ticker", UNSET)

        name = d.pop("name", UNSET)

        details = d.pop("details", UNSET)

        precision = d.pop("precision", UNSET)

        issued_supply = d.pop("issued_supply", UNSET)

        timestamp = d.pop("timestamp", UNSET)

        added_at = d.pop("added_at", UNSET)

        _balance = d.pop("balance", UNSET)
        balance: Unset | AssetBalanceResponse
        if isinstance(_balance, Unset):
            balance = UNSET
        else:
            balance = AssetBalanceResponse.from_dict(_balance)

        _media = d.pop("media", UNSET)
        media: Unset | Media
        if isinstance(_media, Unset):
            media = UNSET
        else:
            media = Media.from_dict(_media)

        asset_nia = cls(
            asset_id=asset_id,
            ticker=ticker,
            name=name,
            details=details,
            precision=precision,
            issued_supply=issued_supply,
            timestamp=timestamp,
            added_at=added_at,
            balance=balance,
            media=media,
        )

        asset_nia.additional_properties = d
        return asset_nia

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
