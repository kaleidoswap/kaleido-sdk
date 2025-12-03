from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.transaction_type import TransactionType
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.block_time import BlockTime


T = TypeVar("T", bound="Transaction")


@_attrs_define
class Transaction:
    """
    Attributes:
        transaction_type (TransactionType | Unset):
        txid (str | Unset):  Example: 7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664.
        received (int | Unset):  Example: 650.
        sent (int | Unset):  Example: 1050.
        fee (int | Unset):  Example: 100.
        confirmation_time (BlockTime | Unset):
    """

    transaction_type: TransactionType | Unset = UNSET
    txid: str | Unset = UNSET
    received: int | Unset = UNSET
    sent: int | Unset = UNSET
    fee: int | Unset = UNSET
    confirmation_time: BlockTime | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        transaction_type: str | Unset = UNSET
        if not isinstance(self.transaction_type, Unset):
            transaction_type = self.transaction_type.value

        txid = self.txid

        received = self.received

        sent = self.sent

        fee = self.fee

        confirmation_time: dict[str, Any] | Unset = UNSET
        if not isinstance(self.confirmation_time, Unset):
            confirmation_time = self.confirmation_time.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if transaction_type is not UNSET:
            field_dict["transaction_type"] = transaction_type
        if txid is not UNSET:
            field_dict["txid"] = txid
        if received is not UNSET:
            field_dict["received"] = received
        if sent is not UNSET:
            field_dict["sent"] = sent
        if fee is not UNSET:
            field_dict["fee"] = fee
        if confirmation_time is not UNSET:
            field_dict["confirmation_time"] = confirmation_time

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.block_time import BlockTime

        d = dict(src_dict)
        _transaction_type = d.pop("transaction_type", UNSET)
        transaction_type: TransactionType | Unset
        if isinstance(_transaction_type, Unset):
            transaction_type = UNSET
        else:
            transaction_type = TransactionType(_transaction_type)

        txid = d.pop("txid", UNSET)

        received = d.pop("received", UNSET)

        sent = d.pop("sent", UNSET)

        fee = d.pop("fee", UNSET)

        _confirmation_time = d.pop("confirmation_time", UNSET)
        confirmation_time: BlockTime | Unset
        if isinstance(_confirmation_time, Unset):
            confirmation_time = UNSET
        else:
            confirmation_time = BlockTime.from_dict(_confirmation_time)

        transaction = cls(
            transaction_type=transaction_type,
            txid=txid,
            received=received,
            sent=sent,
            fee=fee,
            confirmation_time=confirmation_time,
        )

        transaction.additional_properties = d
        return transaction

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
