from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.htlc_status import HTLCStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="Payment")


@_attrs_define
class Payment:
    """
    Attributes:
        amt_msat (int | Unset):  Example: 3000000.
        asset_amount (int | Unset):  Example: 42.
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        payment_hash (str | Unset):  Example: 3febfae1e68b190c15461f4c2a3290f9af1dae63fd7d620d2bd61601869026cd.
        inbound (bool | Unset):  Example: True.
        status (HTLCStatus | Unset):
        created_at (int | Unset):  Example: 1691160765.
        updated_at (int | Unset):  Example: 1691162674.
        payee_pubkey (str | Unset):  Example: 03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d.
    """

    amt_msat: int | Unset = UNSET
    asset_amount: int | Unset = UNSET
    asset_id: str | Unset = UNSET
    payment_hash: str | Unset = UNSET
    inbound: bool | Unset = UNSET
    status: HTLCStatus | Unset = UNSET
    created_at: int | Unset = UNSET
    updated_at: int | Unset = UNSET
    payee_pubkey: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amt_msat = self.amt_msat

        asset_amount = self.asset_amount

        asset_id = self.asset_id

        payment_hash = self.payment_hash

        inbound = self.inbound

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        created_at = self.created_at

        updated_at = self.updated_at

        payee_pubkey = self.payee_pubkey

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if amt_msat is not UNSET:
            field_dict["amt_msat"] = amt_msat
        if asset_amount is not UNSET:
            field_dict["asset_amount"] = asset_amount
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if inbound is not UNSET:
            field_dict["inbound"] = inbound
        if status is not UNSET:
            field_dict["status"] = status
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if updated_at is not UNSET:
            field_dict["updated_at"] = updated_at
        if payee_pubkey is not UNSET:
            field_dict["payee_pubkey"] = payee_pubkey

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        amt_msat = d.pop("amt_msat", UNSET)

        asset_amount = d.pop("asset_amount", UNSET)

        asset_id = d.pop("asset_id", UNSET)

        payment_hash = d.pop("payment_hash", UNSET)

        inbound = d.pop("inbound", UNSET)

        _status = d.pop("status", UNSET)
        status: HTLCStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = HTLCStatus(_status)

        created_at = d.pop("created_at", UNSET)

        updated_at = d.pop("updated_at", UNSET)

        payee_pubkey = d.pop("payee_pubkey", UNSET)

        payment = cls(
            amt_msat=amt_msat,
            asset_amount=asset_amount,
            asset_id=asset_id,
            payment_hash=payment_hash,
            inbound=inbound,
            status=status,
            created_at=created_at,
            updated_at=updated_at,
            payee_pubkey=payee_pubkey,
        )

        payment.additional_properties = d
        return payment

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
