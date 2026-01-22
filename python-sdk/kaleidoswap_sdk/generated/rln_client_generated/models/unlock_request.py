from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="UnlockRequest")


@_attrs_define
class UnlockRequest:
    """
    Attributes:
        password (Union[Unset, str]):
        bitcoind_rpc_username (Union[Unset, str]):
        bitcoind_rpc_password (Union[Unset, str]):
        bitcoind_rpc_host (Union[Unset, str]):
        bitcoind_rpc_port (Union[Unset, int]):
        indexer_url (Union[Unset, str]):
        proxy_endpoint (Union[Unset, str]):
        announce_addresses (Union[Unset, list[str]]):
        announce_alias (Union[Unset, str]):
    """

    password: Unset | str = UNSET
    bitcoind_rpc_username: Unset | str = UNSET
    bitcoind_rpc_password: Unset | str = UNSET
    bitcoind_rpc_host: Unset | str = UNSET
    bitcoind_rpc_port: Unset | int = UNSET
    indexer_url: Unset | str = UNSET
    proxy_endpoint: Unset | str = UNSET
    announce_addresses: Unset | list[str] = UNSET
    announce_alias: Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        password = self.password

        bitcoind_rpc_username = self.bitcoind_rpc_username

        bitcoind_rpc_password = self.bitcoind_rpc_password

        bitcoind_rpc_host = self.bitcoind_rpc_host

        bitcoind_rpc_port = self.bitcoind_rpc_port

        indexer_url = self.indexer_url

        proxy_endpoint = self.proxy_endpoint

        announce_addresses: Unset | list[str] = UNSET
        if not isinstance(self.announce_addresses, Unset):
            announce_addresses = self.announce_addresses

        announce_alias = self.announce_alias

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if password is not UNSET:
            field_dict["password"] = password
        if bitcoind_rpc_username is not UNSET:
            field_dict["bitcoind_rpc_username"] = bitcoind_rpc_username
        if bitcoind_rpc_password is not UNSET:
            field_dict["bitcoind_rpc_password"] = bitcoind_rpc_password
        if bitcoind_rpc_host is not UNSET:
            field_dict["bitcoind_rpc_host"] = bitcoind_rpc_host
        if bitcoind_rpc_port is not UNSET:
            field_dict["bitcoind_rpc_port"] = bitcoind_rpc_port
        if indexer_url is not UNSET:
            field_dict["indexer_url"] = indexer_url
        if proxy_endpoint is not UNSET:
            field_dict["proxy_endpoint"] = proxy_endpoint
        if announce_addresses is not UNSET:
            field_dict["announce_addresses"] = announce_addresses
        if announce_alias is not UNSET:
            field_dict["announce_alias"] = announce_alias

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        password = d.pop("password", UNSET)

        bitcoind_rpc_username = d.pop("bitcoind_rpc_username", UNSET)

        bitcoind_rpc_password = d.pop("bitcoind_rpc_password", UNSET)

        bitcoind_rpc_host = d.pop("bitcoind_rpc_host", UNSET)

        bitcoind_rpc_port = d.pop("bitcoind_rpc_port", UNSET)

        indexer_url = d.pop("indexer_url", UNSET)

        proxy_endpoint = d.pop("proxy_endpoint", UNSET)

        announce_addresses = cast(list[str], d.pop("announce_addresses", UNSET))

        announce_alias = d.pop("announce_alias", UNSET)

        unlock_request = cls(
            password=password,
            bitcoind_rpc_username=bitcoind_rpc_username,
            bitcoind_rpc_password=bitcoind_rpc_password,
            bitcoind_rpc_host=bitcoind_rpc_host,
            bitcoind_rpc_port=bitcoind_rpc_port,
            indexer_url=indexer_url,
            proxy_endpoint=proxy_endpoint,
            announce_addresses=announce_addresses,
            announce_alias=announce_alias,
        )

        unlock_request.additional_properties = d
        return unlock_request

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
