from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.transfer_kind import TransferKind
from ..models.transfer_status import TransferStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.assignment_fungible import AssignmentFungible
    from ..models.transfer_transport_endpoint import TransferTransportEndpoint


T = TypeVar("T", bound="Transfer")


@_attrs_define
class Transfer:
    """
    Attributes:
        idx (int | Unset):  Example: 1.
        created_at (int | Unset):  Example: 1691160765.
        updated_at (int | Unset):  Example: 1691162674.
        status (TransferStatus | Unset):
        requested_assignment (AssignmentFungible | Unset):  Example: {'type': 'Fungible', 'value': 42}.
        assignments (list[AssignmentFungible] | Unset):
        kind (TransferKind | Unset):  Example: ReceiveBlind.
        txid (str | Unset):  Example: 7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664.
        recipient_id (str | Unset):  Example: 61qsVbWtkNmU54F2i6qtB9uSmEGsPoaeypCi5uC5uctZ.
        receive_utxo (str | Unset):  Example: efed66f5309396ff43c8a09941c8103d9d5bbffd473ad9f13013ac89fb6b4671:0.
        change_utxo (str | Unset):
        expiration (int | Unset):  Example: 1691171612.
        transport_endpoints (list[TransferTransportEndpoint] | Unset):
    """

    idx: int | Unset = UNSET
    created_at: int | Unset = UNSET
    updated_at: int | Unset = UNSET
    status: TransferStatus | Unset = UNSET
    requested_assignment: AssignmentFungible | Unset = UNSET
    assignments: list[AssignmentFungible] | Unset = UNSET
    kind: TransferKind | Unset = UNSET
    txid: str | Unset = UNSET
    recipient_id: str | Unset = UNSET
    receive_utxo: str | Unset = UNSET
    change_utxo: str | Unset = UNSET
    expiration: int | Unset = UNSET
    transport_endpoints: list[TransferTransportEndpoint] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        idx = self.idx

        created_at = self.created_at

        updated_at = self.updated_at

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        requested_assignment: dict[str, Any] | Unset = UNSET
        if not isinstance(self.requested_assignment, Unset):
            requested_assignment = self.requested_assignment.to_dict()

        assignments: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.assignments, Unset):
            assignments = []
            for assignments_item_data in self.assignments:
                assignments_item = assignments_item_data.to_dict()
                assignments.append(assignments_item)

        kind: str | Unset = UNSET
        if not isinstance(self.kind, Unset):
            kind = self.kind.value

        txid = self.txid

        recipient_id = self.recipient_id

        receive_utxo = self.receive_utxo

        change_utxo = self.change_utxo

        expiration = self.expiration

        transport_endpoints: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.transport_endpoints, Unset):
            transport_endpoints = []
            for transport_endpoints_item_data in self.transport_endpoints:
                transport_endpoints_item = transport_endpoints_item_data.to_dict()
                transport_endpoints.append(transport_endpoints_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if idx is not UNSET:
            field_dict["idx"] = idx
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if updated_at is not UNSET:
            field_dict["updated_at"] = updated_at
        if status is not UNSET:
            field_dict["status"] = status
        if requested_assignment is not UNSET:
            field_dict["requested_assignment"] = requested_assignment
        if assignments is not UNSET:
            field_dict["assignments"] = assignments
        if kind is not UNSET:
            field_dict["kind"] = kind
        if txid is not UNSET:
            field_dict["txid"] = txid
        if recipient_id is not UNSET:
            field_dict["recipient_id"] = recipient_id
        if receive_utxo is not UNSET:
            field_dict["receive_utxo"] = receive_utxo
        if change_utxo is not UNSET:
            field_dict["change_utxo"] = change_utxo
        if expiration is not UNSET:
            field_dict["expiration"] = expiration
        if transport_endpoints is not UNSET:
            field_dict["transport_endpoints"] = transport_endpoints

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.assignment_fungible import AssignmentFungible
        from ..models.transfer_transport_endpoint import TransferTransportEndpoint

        d = dict(src_dict)
        idx = d.pop("idx", UNSET)

        created_at = d.pop("created_at", UNSET)

        updated_at = d.pop("updated_at", UNSET)

        _status = d.pop("status", UNSET)
        status: TransferStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = TransferStatus(_status)

        _requested_assignment = d.pop("requested_assignment", UNSET)
        requested_assignment: AssignmentFungible | Unset
        if isinstance(_requested_assignment, Unset):
            requested_assignment = UNSET
        else:
            requested_assignment = AssignmentFungible.from_dict(_requested_assignment)

        _assignments = d.pop("assignments", UNSET)
        assignments: list[AssignmentFungible] | Unset = UNSET
        if _assignments is not UNSET:
            assignments = []
            for assignments_item_data in _assignments:
                assignments_item = AssignmentFungible.from_dict(assignments_item_data)

                assignments.append(assignments_item)

        _kind = d.pop("kind", UNSET)
        kind: TransferKind | Unset
        if isinstance(_kind, Unset):
            kind = UNSET
        else:
            kind = TransferKind(_kind)

        txid = d.pop("txid", UNSET)

        recipient_id = d.pop("recipient_id", UNSET)

        receive_utxo = d.pop("receive_utxo", UNSET)

        change_utxo = d.pop("change_utxo", UNSET)

        expiration = d.pop("expiration", UNSET)

        _transport_endpoints = d.pop("transport_endpoints", UNSET)
        transport_endpoints: list[TransferTransportEndpoint] | Unset = UNSET
        if _transport_endpoints is not UNSET:
            transport_endpoints = []
            for transport_endpoints_item_data in _transport_endpoints:
                transport_endpoints_item = TransferTransportEndpoint.from_dict(
                    transport_endpoints_item_data
                )

                transport_endpoints.append(transport_endpoints_item)

        transfer = cls(
            idx=idx,
            created_at=created_at,
            updated_at=updated_at,
            status=status,
            requested_assignment=requested_assignment,
            assignments=assignments,
            kind=kind,
            txid=txid,
            recipient_id=recipient_id,
            receive_utxo=receive_utxo,
            change_utxo=change_utxo,
            expiration=expiration,
            transport_endpoints=transport_endpoints,
        )

        transfer.additional_properties = d
        return transfer

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
