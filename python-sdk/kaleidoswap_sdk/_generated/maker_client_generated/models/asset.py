from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.media import Media
    from ..models.protocol_ids import ProtocolIds
    from ..models.trading_limits import TradingLimits


T = TypeVar("T", bound="Asset")


@_attrs_define
class Asset:
    """Extended asset definition for the trading system.

    Extends TradableAsset with:
    - Trading status (is_active)
    - Supported layers (protocol/network combinations as strings)
    - RGB-specific fields for node API compatibility
    - Methods to convert to TradableAsset for specific settlements

    Supported Layers Format: PROTOCOL/NETWORK
    - BTC_L1, BTC_LN, BTC_SPARK, BTC_ARKADE, BTC_LIQUID, BTC_CASHU
    - RGB_L1, RGB_LN
    - TAPASS_L1, TAPASS_LN
    - LIQUID_LIQUID, ARKADE_ARKADE, SPARK_SPARK

        Attributes:
            ticker (str): Display ticker (e.g., 'BTC', 'USDT')
            name (str): Full name
            precision (int): Decimal places (e.g., 8 for BTC, 6 for USDT)
            protocol_ids (Union[Unset, ProtocolIds]): Asset IDs per protocol (e.g., {'RGB': 'rgb:xxx', 'TAPASS': 'tap:xxx'})
            media (Union['Media', None, Unset]): Logo/media
            issued_supply (Union[None, Unset, int]): Total issued supply
            timestamp (Union[None, Unset, int]): Creation timestamp
            endpoints (Union[Unset, list['TradingLimits']]): Layer endpoints with trading limits
            is_active (Union[Unset, bool]): Active for trading Default: True.
            added_at (Union[None, Unset, int]): When added to wallet
            supported_layers (Union[None, Unset, list[str]]): Supported settlement layers (e.g., 'BTC_LN', 'RGB_L1')
    """

    ticker: str
    name: str
    precision: int
    protocol_ids: Union[Unset, "ProtocolIds"] = UNSET
    media: Union["Media", None, Unset] = UNSET
    issued_supply: None | Unset | int = UNSET
    timestamp: None | Unset | int = UNSET
    endpoints: Unset | list["TradingLimits"] = UNSET
    is_active: Unset | bool = True
    added_at: None | Unset | int = UNSET
    supported_layers: None | Unset | list[str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.media import Media

        ticker = self.ticker

        name = self.name

        precision = self.precision

        protocol_ids: Unset | dict[str, Any] = UNSET
        if not isinstance(self.protocol_ids, Unset):
            protocol_ids = self.protocol_ids.to_dict()

        media: None | Unset | dict[str, Any]
        if isinstance(self.media, Unset):
            media = UNSET
        elif isinstance(self.media, Media):
            media = self.media.to_dict()
        else:
            media = self.media

        issued_supply: None | Unset | int
        if isinstance(self.issued_supply, Unset):
            issued_supply = UNSET
        else:
            issued_supply = self.issued_supply

        timestamp: None | Unset | int
        if isinstance(self.timestamp, Unset):
            timestamp = UNSET
        else:
            timestamp = self.timestamp

        endpoints: Unset | list[dict[str, Any]] = UNSET
        if not isinstance(self.endpoints, Unset):
            endpoints = []
            for endpoints_item_data in self.endpoints:
                endpoints_item = endpoints_item_data.to_dict()
                endpoints.append(endpoints_item)

        is_active = self.is_active

        added_at: None | Unset | int
        if isinstance(self.added_at, Unset):
            added_at = UNSET
        else:
            added_at = self.added_at

        supported_layers: None | Unset | list[str]
        if isinstance(self.supported_layers, Unset):
            supported_layers = UNSET
        elif isinstance(self.supported_layers, list):
            supported_layers = self.supported_layers

        else:
            supported_layers = self.supported_layers

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "ticker": ticker,
                "name": name,
                "precision": precision,
            }
        )
        if protocol_ids is not UNSET:
            field_dict["protocol_ids"] = protocol_ids
        if media is not UNSET:
            field_dict["media"] = media
        if issued_supply is not UNSET:
            field_dict["issued_supply"] = issued_supply
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp
        if endpoints is not UNSET:
            field_dict["endpoints"] = endpoints
        if is_active is not UNSET:
            field_dict["is_active"] = is_active
        if added_at is not UNSET:
            field_dict["added_at"] = added_at
        if supported_layers is not UNSET:
            field_dict["supported_layers"] = supported_layers

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.media import Media
        from ..models.protocol_ids import ProtocolIds
        from ..models.trading_limits import TradingLimits

        d = dict(src_dict)
        ticker = d.pop("ticker")

        name = d.pop("name")

        precision = d.pop("precision")

        _protocol_ids = d.pop("protocol_ids", UNSET)
        protocol_ids: Unset | ProtocolIds
        if isinstance(_protocol_ids, Unset):
            protocol_ids = UNSET
        else:
            protocol_ids = ProtocolIds.from_dict(_protocol_ids)

        def _parse_media(data: object) -> Union["Media", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                media_type_1 = Media.from_dict(data)

                return media_type_1
            except:  # noqa: E722
                pass
            return cast(Union["Media", None, Unset], data)

        media = _parse_media(d.pop("media", UNSET))

        def _parse_issued_supply(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        issued_supply = _parse_issued_supply(d.pop("issued_supply", UNSET))

        def _parse_timestamp(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        timestamp = _parse_timestamp(d.pop("timestamp", UNSET))

        endpoints = []
        _endpoints = d.pop("endpoints", UNSET)
        for endpoints_item_data in _endpoints or []:
            endpoints_item = TradingLimits.from_dict(endpoints_item_data)

            endpoints.append(endpoints_item)

        is_active = d.pop("is_active", UNSET)

        def _parse_added_at(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        added_at = _parse_added_at(d.pop("added_at", UNSET))

        def _parse_supported_layers(data: object) -> None | Unset | list[str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                supported_layers_type_0 = cast(list[str], data)

                return supported_layers_type_0
            except:  # noqa: E722
                pass
            return cast(None | Unset | list[str], data)

        supported_layers = _parse_supported_layers(d.pop("supported_layers", UNSET))

        asset = cls(
            ticker=ticker,
            name=name,
            precision=precision,
            protocol_ids=protocol_ids,
            media=media,
            issued_supply=issued_supply,
            timestamp=timestamp,
            endpoints=endpoints,
            is_active=is_active,
            added_at=added_at,
            supported_layers=supported_layers,
        )

        asset.additional_properties = d
        return asset

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
