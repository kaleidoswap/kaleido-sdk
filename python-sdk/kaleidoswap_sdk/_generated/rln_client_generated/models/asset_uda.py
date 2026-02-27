from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_balance_response import AssetBalanceResponse
    from ..models.token_light import TokenLight


T = TypeVar("T", bound="AssetUDA")


@_attrs_define
class AssetUDA:
    """
    Attributes:
        asset_id (Union[Unset, str]):
        ticker (Union[Unset, str]):
        name (Union[Unset, str]):
        details (Union[Unset, str]):
        precision (Union[Unset, int]):
        timestamp (Union[Unset, int]):
        added_at (Union[Unset, int]):
        balance (Union[Unset, AssetBalanceResponse]):
        token (Union[Unset, TokenLight]):
    """

    asset_id: Unset | str = UNSET
    ticker: Unset | str = UNSET
    name: Unset | str = UNSET
    details: Unset | str = UNSET
    precision: Unset | int = UNSET
    timestamp: Unset | int = UNSET
    added_at: Unset | int = UNSET
    balance: Union[Unset, "AssetBalanceResponse"] = UNSET
    token: Union[Unset, "TokenLight"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_id = self.asset_id

        ticker = self.ticker

        name = self.name

        details = self.details

        precision = self.precision

        timestamp = self.timestamp

        added_at = self.added_at

        balance: Unset | dict[str, Any] = UNSET
        if not isinstance(self.balance, Unset):
            balance = self.balance.to_dict()

        token: Unset | dict[str, Any] = UNSET
        if not isinstance(self.token, Unset):
            token = self.token.to_dict()

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
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp
        if added_at is not UNSET:
            field_dict["added_at"] = added_at
        if balance is not UNSET:
            field_dict["balance"] = balance
        if token is not UNSET:
            field_dict["token"] = token

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.asset_balance_response import AssetBalanceResponse
        from ..models.token_light import TokenLight

        d = dict(src_dict)
        asset_id = d.pop("asset_id", UNSET)

        ticker = d.pop("ticker", UNSET)

        name = d.pop("name", UNSET)

        details = d.pop("details", UNSET)

        precision = d.pop("precision", UNSET)

        timestamp = d.pop("timestamp", UNSET)

        added_at = d.pop("added_at", UNSET)

        _balance = d.pop("balance", UNSET)
        balance: Unset | AssetBalanceResponse
        if isinstance(_balance, Unset):
            balance = UNSET
        else:
            balance = AssetBalanceResponse.from_dict(_balance)

        _token = d.pop("token", UNSET)
        token: Unset | TokenLight
        if isinstance(_token, Unset):
            token = UNSET
        else:
            token = TokenLight.from_dict(_token)

        asset_uda = cls(
            asset_id=asset_id,
            ticker=ticker,
            name=name,
            details=details,
            precision=precision,
            timestamp=timestamp,
            added_at=added_at,
            balance=balance,
            token=token,
        )

        asset_uda.additional_properties = d
        return asset_uda

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
