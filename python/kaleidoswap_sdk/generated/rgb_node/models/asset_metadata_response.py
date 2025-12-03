from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.asset_schema import AssetSchema
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.token import Token


T = TypeVar("T", bound="AssetMetadataResponse")


@_attrs_define
class AssetMetadataResponse:
    """
    Attributes:
        asset_schema (AssetSchema | Unset):
        issued_supply (int | Unset):  Example: 777.
        timestamp (int | Unset):  Example: 1691160565.
        name (str | Unset):  Example: Collectible.
        precision (int | Unset):
        ticker (str | Unset):  Example: USDT.
        details (str | Unset):  Example: asset details.
        token (Token | Unset):
    """

    asset_schema: AssetSchema | Unset = UNSET
    issued_supply: int | Unset = UNSET
    timestamp: int | Unset = UNSET
    name: str | Unset = UNSET
    precision: int | Unset = UNSET
    ticker: str | Unset = UNSET
    details: str | Unset = UNSET
    token: Token | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_schema: str | Unset = UNSET
        if not isinstance(self.asset_schema, Unset):
            asset_schema = self.asset_schema.value

        issued_supply = self.issued_supply

        timestamp = self.timestamp

        name = self.name

        precision = self.precision

        ticker = self.ticker

        details = self.details

        token: dict[str, Any] | Unset = UNSET
        if not isinstance(self.token, Unset):
            token = self.token.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if asset_schema is not UNSET:
            field_dict["asset_schema"] = asset_schema
        if issued_supply is not UNSET:
            field_dict["issued_supply"] = issued_supply
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp
        if name is not UNSET:
            field_dict["name"] = name
        if precision is not UNSET:
            field_dict["precision"] = precision
        if ticker is not UNSET:
            field_dict["ticker"] = ticker
        if details is not UNSET:
            field_dict["details"] = details
        if token is not UNSET:
            field_dict["token"] = token

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.token import Token

        d = dict(src_dict)
        _asset_schema = d.pop("asset_schema", UNSET)
        asset_schema: AssetSchema | Unset
        if isinstance(_asset_schema, Unset):
            asset_schema = UNSET
        else:
            asset_schema = AssetSchema(_asset_schema)

        issued_supply = d.pop("issued_supply", UNSET)

        timestamp = d.pop("timestamp", UNSET)

        name = d.pop("name", UNSET)

        precision = d.pop("precision", UNSET)

        ticker = d.pop("ticker", UNSET)

        details = d.pop("details", UNSET)

        _token = d.pop("token", UNSET)
        token: Token | Unset
        if isinstance(_token, Unset):
            token = UNSET
        elif _token is None:
            token = UNSET
        else:
            token = Token.from_dict(_token)

        asset_metadata_response = cls(
            asset_schema=asset_schema,
            issued_supply=issued_supply,
            timestamp=timestamp,
            name=name,
            precision=precision,
            ticker=ticker,
            details=details,
            token=token,
        )

        asset_metadata_response.additional_properties = d
        return asset_metadata_response

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
