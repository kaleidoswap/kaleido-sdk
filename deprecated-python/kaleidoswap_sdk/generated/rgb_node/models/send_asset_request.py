from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.assignment_fungible import AssignmentFungible
    from ..models.witness_data import WitnessData


T = TypeVar("T", bound="SendAssetRequest")


@_attrs_define
class SendAssetRequest:
    """
    Attributes:
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        assignment (AssignmentFungible | Unset):  Example: {'type': 'Fungible', 'value': 42}.
        recipient_id (str | Unset):  Example: bcrt:utxob:2FZsSuk-iyVQLVuU4-Gc6J4qkE8-mLS17N4jd-MEx6cWz9F-MFkyE1n.
        witness_data (WitnessData | Unset):
        donation (bool | Unset):
        fee_rate (float | Unset):  Example: 5.
        min_confirmations (int | Unset):  Example: 1.
        transport_endpoints (list[str] | Unset):
        skip_sync (bool | Unset):
    """

    asset_id: str | Unset = UNSET
    assignment: AssignmentFungible | Unset = UNSET
    recipient_id: str | Unset = UNSET
    witness_data: WitnessData | Unset = UNSET
    donation: bool | Unset = UNSET
    fee_rate: float | Unset = UNSET
    min_confirmations: int | Unset = UNSET
    transport_endpoints: list[str] | Unset = UNSET
    skip_sync: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        asset_id = self.asset_id

        assignment: dict[str, Any] | Unset = UNSET
        if not isinstance(self.assignment, Unset):
            assignment = self.assignment.to_dict()

        recipient_id = self.recipient_id

        witness_data: dict[str, Any] | Unset = UNSET
        if not isinstance(self.witness_data, Unset):
            witness_data = self.witness_data.to_dict()

        donation = self.donation

        fee_rate = self.fee_rate

        min_confirmations = self.min_confirmations

        transport_endpoints: list[str] | Unset = UNSET
        if not isinstance(self.transport_endpoints, Unset):
            transport_endpoints = self.transport_endpoints

        skip_sync = self.skip_sync

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if assignment is not UNSET:
            field_dict["assignment"] = assignment
        if recipient_id is not UNSET:
            field_dict["recipient_id"] = recipient_id
        if witness_data is not UNSET:
            field_dict["witness_data"] = witness_data
        if donation is not UNSET:
            field_dict["donation"] = donation
        if fee_rate is not UNSET:
            field_dict["fee_rate"] = fee_rate
        if min_confirmations is not UNSET:
            field_dict["min_confirmations"] = min_confirmations
        if transport_endpoints is not UNSET:
            field_dict["transport_endpoints"] = transport_endpoints
        if skip_sync is not UNSET:
            field_dict["skip_sync"] = skip_sync

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.assignment_fungible import AssignmentFungible
        from ..models.witness_data import WitnessData

        d = dict(src_dict)
        asset_id = d.pop("asset_id", UNSET)

        _assignment = d.pop("assignment", UNSET)
        assignment: AssignmentFungible | Unset
        if isinstance(_assignment, Unset):
            assignment = UNSET
        else:
            assignment = AssignmentFungible.from_dict(_assignment)

        recipient_id = d.pop("recipient_id", UNSET)

        _witness_data = d.pop("witness_data", UNSET)
        witness_data: WitnessData | Unset
        if isinstance(_witness_data, Unset):
            witness_data = UNSET
        else:
            witness_data = WitnessData.from_dict(_witness_data)

        donation = d.pop("donation", UNSET)

        fee_rate = d.pop("fee_rate", UNSET)

        min_confirmations = d.pop("min_confirmations", UNSET)

        transport_endpoints = cast(list[str], d.pop("transport_endpoints", UNSET))

        skip_sync = d.pop("skip_sync", UNSET)

        send_asset_request = cls(
            asset_id=asset_id,
            assignment=assignment,
            recipient_id=recipient_id,
            witness_data=witness_data,
            donation=donation,
            fee_rate=fee_rate,
            min_confirmations=min_confirmations,
            transport_endpoints=transport_endpoints,
            skip_sync=skip_sync,
        )

        send_asset_request.additional_properties = d
        return send_asset_request

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
