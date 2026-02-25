from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.bitcoin_network import BitcoinNetwork
from ..types import UNSET, Unset

T = TypeVar("T", bound="DecodeLNInvoiceResponse")


@_attrs_define
class DecodeLNInvoiceResponse:
    """
    Attributes:
        amt_msat (Union[Unset, int]):
        expiry_sec (Union[Unset, int]):
        timestamp (Union[Unset, int]):
        asset_id (Union[Unset, str]):
        asset_amount (Union[Unset, int]):
        payment_hash (Union[Unset, str]):
        payment_secret (Union[Unset, str]):
        payee_pubkey (Union[Unset, str]):
        network (Union[Unset, BitcoinNetwork]):
    """

    amt_msat: Unset | int = UNSET
    expiry_sec: Unset | int = UNSET
    timestamp: Unset | int = UNSET
    asset_id: Unset | str = UNSET
    asset_amount: Unset | int = UNSET
    payment_hash: Unset | str = UNSET
    payment_secret: Unset | str = UNSET
    payee_pubkey: Unset | str = UNSET
    network: Unset | BitcoinNetwork = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amt_msat = self.amt_msat

        expiry_sec = self.expiry_sec

        timestamp = self.timestamp

        asset_id = self.asset_id

        asset_amount = self.asset_amount

        payment_hash = self.payment_hash

        payment_secret = self.payment_secret

        payee_pubkey = self.payee_pubkey

        network: Unset | str = UNSET
        if not isinstance(self.network, Unset):
            network = self.network.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if amt_msat is not UNSET:
            field_dict["amt_msat"] = amt_msat
        if expiry_sec is not UNSET:
            field_dict["expiry_sec"] = expiry_sec
        if timestamp is not UNSET:
            field_dict["timestamp"] = timestamp
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if asset_amount is not UNSET:
            field_dict["asset_amount"] = asset_amount
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if payment_secret is not UNSET:
            field_dict["payment_secret"] = payment_secret
        if payee_pubkey is not UNSET:
            field_dict["payee_pubkey"] = payee_pubkey
        if network is not UNSET:
            field_dict["network"] = network

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        amt_msat = d.pop("amt_msat", UNSET)

        expiry_sec = d.pop("expiry_sec", UNSET)

        timestamp = d.pop("timestamp", UNSET)

        asset_id = d.pop("asset_id", UNSET)

        asset_amount = d.pop("asset_amount", UNSET)

        payment_hash = d.pop("payment_hash", UNSET)

        payment_secret = d.pop("payment_secret", UNSET)

        payee_pubkey = d.pop("payee_pubkey", UNSET)

        _network = d.pop("network", UNSET)
        network: Unset | BitcoinNetwork
        if isinstance(_network, Unset):
            network = UNSET
        else:
            network = BitcoinNetwork(_network)

        decode_ln_invoice_response = cls(
            amt_msat=amt_msat,
            expiry_sec=expiry_sec,
            timestamp=timestamp,
            asset_id=asset_id,
            asset_amount=asset_amount,
            payment_hash=payment_hash,
            payment_secret=payment_secret,
            payee_pubkey=payee_pubkey,
            network=network,
        )

        decode_ln_invoice_response.additional_properties = d
        return decode_ln_invoice_response

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
