from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union

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
        idx (Union[Unset, int]):
        created_at (Union[Unset, int]):
        updated_at (Union[Unset, int]):
        status (Union[Unset, TransferStatus]):
        requested_assignment (Union[Unset, AssignmentFungible]):
        assignments (Union[Unset, list['AssignmentFungible']]):
        kind (Union[Unset, TransferKind]):
        txid (Union[Unset, str]):
        recipient_id (Union[Unset, str]):
        receive_utxo (Union[Unset, str]):
        change_utxo (Union[Unset, str]):
        expiration (Union[Unset, int]):
        transport_endpoints (Union[Unset, list['TransferTransportEndpoint']]):
    """

    idx: Unset | int = UNSET
    created_at: Unset | int = UNSET
    updated_at: Unset | int = UNSET
    status: Unset | TransferStatus = UNSET
    requested_assignment: Union[Unset, "AssignmentFungible"] = UNSET
    assignments: Unset | list["AssignmentFungible"] = UNSET
    kind: Unset | TransferKind = UNSET
    txid: Unset | str = UNSET
    recipient_id: Unset | str = UNSET
    receive_utxo: Unset | str = UNSET
    change_utxo: Unset | str = UNSET
    expiration: Unset | int = UNSET
    transport_endpoints: Unset | list["TransferTransportEndpoint"] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        idx = self.idx

        created_at = self.created_at

        updated_at = self.updated_at

        status: Unset | str = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        requested_assignment: Unset | dict[str, Any] = UNSET
        if not isinstance(self.requested_assignment, Unset):
            requested_assignment = self.requested_assignment.to_dict()

        assignments: Unset | list[dict[str, Any]] = UNSET
        if not isinstance(self.assignments, Unset):
            assignments = []
            for assignments_item_data in self.assignments:
                assignments_item = assignments_item_data.to_dict()
                assignments.append(assignments_item)

        kind: Unset | str = UNSET
        if not isinstance(self.kind, Unset):
            kind = self.kind.value

        txid = self.txid

        recipient_id = self.recipient_id

        receive_utxo = self.receive_utxo

        change_utxo = self.change_utxo

        expiration = self.expiration

        transport_endpoints: Unset | list[dict[str, Any]] = UNSET
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
        status: Unset | TransferStatus
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = TransferStatus(_status)

        _requested_assignment = d.pop("requested_assignment", UNSET)
        requested_assignment: Unset | AssignmentFungible
        if isinstance(_requested_assignment, Unset):
            requested_assignment = UNSET
        else:
            requested_assignment = AssignmentFungible.from_dict(_requested_assignment)

        assignments = []
        _assignments = d.pop("assignments", UNSET)
        for assignments_item_data in _assignments or []:
            assignments_item = AssignmentFungible.from_dict(assignments_item_data)

            assignments.append(assignments_item)

        _kind = d.pop("kind", UNSET)
        kind: Unset | TransferKind
        if isinstance(_kind, Unset):
            kind = UNSET
        else:
            kind = TransferKind(_kind)

        txid = d.pop("txid", UNSET)

        recipient_id = d.pop("recipient_id", UNSET)

        receive_utxo = d.pop("receive_utxo", UNSET)

        change_utxo = d.pop("change_utxo", UNSET)

        expiration = d.pop("expiration", UNSET)

        transport_endpoints = []
        _transport_endpoints = d.pop("transport_endpoints", UNSET)
        for transport_endpoints_item_data in _transport_endpoints or []:
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
