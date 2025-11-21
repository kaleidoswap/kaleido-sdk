from __future__ import annotations

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
        amt_msat (int | Unset):  Example: 3000000.
        expiry_sec (int | Unset):  Example: 420.
        timestamp (int | Unset):  Example: 1691160659.
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        asset_amount (int | Unset):  Example: 42.
        payment_hash (str | Unset):  Example: 5ca5d81b482b4015e7b14df7a27fe0a38c226273604ffd3b008b752571811938.
        payment_secret (str | Unset):  Example: f9fa239a283a72fa351ec6d0d6fdb16f5e59a64cb10e64add0b57123855ff592.
        payee_pubkey (str | Unset):  Example: 0343851df9e0e8aff0c10b3498ce723ff4c9b4a855e6c8819adcafbbb3e24ea2af.
        network (BitcoinNetwork | Unset):  Example: Regtest.
    """

    amt_msat: int | Unset = UNSET
    expiry_sec: int | Unset = UNSET
    timestamp: int | Unset = UNSET
    asset_id: str | Unset = UNSET
    asset_amount: int | Unset = UNSET
    payment_hash: str | Unset = UNSET
    payment_secret: str | Unset = UNSET
    payee_pubkey: str | Unset = UNSET
    network: BitcoinNetwork | Unset = UNSET
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

        network: str | Unset = UNSET
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
        network: BitcoinNetwork | Unset
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
