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
        amt_msat (Union[Unset, int]):
        asset_amount (Union[Unset, int]):
        asset_id (Union[Unset, str]):
        payment_hash (Union[Unset, str]):
        inbound (Union[Unset, bool]):
        status (Union[Unset, HTLCStatus]):
        created_at (Union[Unset, int]):
        updated_at (Union[Unset, int]):
        payee_pubkey (Union[Unset, str]):
    """

    amt_msat: Unset | int = UNSET
    asset_amount: Unset | int = UNSET
    asset_id: Unset | str = UNSET
    payment_hash: Unset | str = UNSET
    inbound: Unset | bool = UNSET
    status: Unset | HTLCStatus = UNSET
    created_at: Unset | int = UNSET
    updated_at: Unset | int = UNSET
    payee_pubkey: Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        amt_msat = self.amt_msat

        asset_amount = self.asset_amount

        asset_id = self.asset_id

        payment_hash = self.payment_hash

        inbound = self.inbound

        status: Unset | str = UNSET
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
        status: Unset | HTLCStatus
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
