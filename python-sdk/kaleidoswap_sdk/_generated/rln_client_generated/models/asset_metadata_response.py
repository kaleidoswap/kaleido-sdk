from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

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
        asset_schema (Union[Unset, AssetSchema]):
        initial_supply (Union[Unset, int]):
        max_supply (Union[Unset, int]):
        known_circulating_supply (Union[Unset, int]):
        timestamp (Union[Unset, int]):
        name (Union[Unset, str]):
        precision (Union[Unset, int]):
        ticker (Union[Unset, str]):
        details (Union[Unset, str]):
        token (Union[Unset, Token]):
    """

    asset_schema: Unset | AssetSchema = UNSET
    initial_supply: Unset | int = UNSET
    max_supply: Unset | int = UNSET
    known_circulating_supply: Unset | int = UNSET
    timestamp: Unset | int = UNSET
    name: Unset | str = UNSET
    precision: Unset | int = UNSET
    ticker: Unset | str = UNSET
    details: Unset | str = UNSET
    token: Union[Unset, "Token"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_schema: Unset | str = UNSET
        if not isinstance(self.asset_schema, Unset):
            asset_schema = self.asset_schema.value

        initial_supply = self.initial_supply

        max_supply = self.max_supply

        known_circulating_supply = self.known_circulating_supply

        timestamp = self.timestamp

        name = self.name

        precision = self.precision

        ticker = self.ticker

        details = self.details

        token: Unset | dict[str, Any] = UNSET
        if not isinstance(self.token, Unset):
            token = self.token.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if asset_schema is not UNSET:
            field_dict["asset_schema"] = asset_schema
        if initial_supply is not UNSET:
            field_dict["initial_supply"] = initial_supply
        if max_supply is not UNSET:
            field_dict["max_supply"] = max_supply
        if known_circulating_supply is not UNSET:
            field_dict["known_circulating_supply"] = known_circulating_supply
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
        asset_schema: Unset | AssetSchema
        if isinstance(_asset_schema, Unset):
            asset_schema = UNSET
        else:
            asset_schema = AssetSchema(_asset_schema)

        initial_supply = d.pop("initial_supply", UNSET)

        max_supply = d.pop("max_supply", UNSET)

        known_circulating_supply = d.pop("known_circulating_supply", UNSET)

        timestamp = d.pop("timestamp", UNSET)

        name = d.pop("name", UNSET)

        precision = d.pop("precision", UNSET)

        ticker = d.pop("ticker", UNSET)

        details = d.pop("details", UNSET)

        _token = d.pop("token", UNSET)
        token: Unset | Token
        if isinstance(_token, Unset):
            token = UNSET
        else:
            token = Token.from_dict(_token)

        asset_metadata_response = cls(
            asset_schema=asset_schema,
            initial_supply=initial_supply,
            max_supply=max_supply,
            known_circulating_supply=known_circulating_supply,
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
