from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.asset_schema import AssetSchema
from ..models.bitcoin_network import BitcoinNetwork
from ..models.recipient_type import RecipientType
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.assignment_any import AssignmentAny
    from ..models.assignment_fungible import AssignmentFungible
    from ..models.assignment_inflation_right import AssignmentInflationRight
    from ..models.assignment_non_fungible import AssignmentNonFungible
    from ..models.assignment_replace_right import AssignmentReplaceRight


T = TypeVar("T", bound="DecodeRGBInvoiceResponse")


@_attrs_define
class DecodeRGBInvoiceResponse:
    """
    Attributes:
        recipient_id (str | Unset):  Example: bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-oI0gxZh-7fxQY2_-tFFUAZN-4CgpX.
        recipient_type (RecipientType | Unset):
        asset_schema (AssetSchema | Unset):
        asset_id (str | Unset):  Example: rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE.
        assignment (AssignmentAny | AssignmentFungible | AssignmentInflationRight | AssignmentNonFungible |
            AssignmentReplaceRight | Unset):
        network (BitcoinNetwork | Unset):  Example: Regtest.
        expiration_timestamp (int | Unset):  Example: 1698325849.
        transport_endpoints (list[str] | Unset):
    """

    recipient_id: str | Unset = UNSET
    recipient_type: RecipientType | Unset = UNSET
    asset_schema: AssetSchema | Unset = UNSET
    asset_id: str | Unset = UNSET
    assignment: (
        AssignmentAny
        | AssignmentFungible
        | AssignmentInflationRight
        | AssignmentNonFungible
        | AssignmentReplaceRight
        | Unset
    ) = UNSET
    network: BitcoinNetwork | Unset = UNSET
    expiration_timestamp: int | Unset = UNSET
    transport_endpoints: list[str] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.assignment_fungible import AssignmentFungible
        from ..models.assignment_inflation_right import AssignmentInflationRight
        from ..models.assignment_non_fungible import AssignmentNonFungible
        from ..models.assignment_replace_right import AssignmentReplaceRight

        recipient_id = self.recipient_id

        recipient_type: str | Unset = UNSET
        if not isinstance(self.recipient_type, Unset):
            recipient_type = self.recipient_type.value

        asset_schema: str | Unset = UNSET
        if not isinstance(self.asset_schema, Unset):
            asset_schema = self.asset_schema.value

        asset_id = self.asset_id

        assignment: dict[str, Any] | Unset
        if isinstance(self.assignment, Unset):
            assignment = UNSET
        elif isinstance(self.assignment, AssignmentFungible):
            assignment = self.assignment.to_dict()
        elif isinstance(self.assignment, AssignmentNonFungible):
            assignment = self.assignment.to_dict()
        elif isinstance(self.assignment, AssignmentInflationRight):
            assignment = self.assignment.to_dict()
        elif isinstance(self.assignment, AssignmentReplaceRight):
            assignment = self.assignment.to_dict()
        else:
            assignment = self.assignment.to_dict()

        network: str | Unset = UNSET
        if not isinstance(self.network, Unset):
            network = self.network.value

        expiration_timestamp = self.expiration_timestamp

        transport_endpoints: list[str] | Unset = UNSET
        if not isinstance(self.transport_endpoints, Unset):
            transport_endpoints = self.transport_endpoints

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if recipient_id is not UNSET:
            field_dict["recipient_id"] = recipient_id
        if recipient_type is not UNSET:
            field_dict["recipient_type"] = recipient_type
        if asset_schema is not UNSET:
            field_dict["asset_schema"] = asset_schema
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if assignment is not UNSET:
            field_dict["assignment"] = assignment
        if network is not UNSET:
            field_dict["network"] = network
        if expiration_timestamp is not UNSET:
            field_dict["expiration_timestamp"] = expiration_timestamp
        if transport_endpoints is not UNSET:
            field_dict["transport_endpoints"] = transport_endpoints

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.assignment_any import AssignmentAny
        from ..models.assignment_fungible import AssignmentFungible
        from ..models.assignment_inflation_right import AssignmentInflationRight
        from ..models.assignment_non_fungible import AssignmentNonFungible
        from ..models.assignment_replace_right import AssignmentReplaceRight

        d = dict(src_dict)
        recipient_id = d.pop("recipient_id", UNSET)

        _recipient_type = d.pop("recipient_type", UNSET)
        recipient_type: RecipientType | Unset
        if isinstance(_recipient_type, Unset):
            recipient_type = UNSET
        else:
            recipient_type = RecipientType(_recipient_type)

        _asset_schema = d.pop("asset_schema", UNSET)
        asset_schema: AssetSchema | Unset
        if isinstance(_asset_schema, Unset):
            asset_schema = UNSET
        else:
            asset_schema = AssetSchema(_asset_schema)

        asset_id = d.pop("asset_id", UNSET)

        def _parse_assignment(
            data: object,
        ) -> (
            AssignmentAny
            | AssignmentFungible
            | AssignmentInflationRight
            | AssignmentNonFungible
            | AssignmentReplaceRight
            | Unset
        ):
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemas_assignment_type_0 = AssignmentFungible.from_dict(data)

                return componentsschemas_assignment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemas_assignment_type_1 = AssignmentNonFungible.from_dict(
                    data
                )

                return componentsschemas_assignment_type_1
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemas_assignment_type_2 = (
                    AssignmentInflationRight.from_dict(data)
                )

                return componentsschemas_assignment_type_2
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemas_assignment_type_3 = AssignmentReplaceRight.from_dict(
                    data
                )

                return componentsschemas_assignment_type_3
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            if not isinstance(data, dict):
                raise TypeError()
            componentsschemas_assignment_type_4 = AssignmentAny.from_dict(data)

            return componentsschemas_assignment_type_4

        assignment = _parse_assignment(d.pop("assignment", UNSET))

        _network = d.pop("network", UNSET)
        network: BitcoinNetwork | Unset
        if isinstance(_network, Unset):
            network = UNSET
        else:
            network = BitcoinNetwork(_network)

        expiration_timestamp = d.pop("expiration_timestamp", UNSET)

        transport_endpoints = cast(list[str], d.pop("transport_endpoints", UNSET))

        decode_rgb_invoice_response = cls(
            recipient_id=recipient_id,
            recipient_type=recipient_type,
            asset_schema=asset_schema,
            asset_id=asset_id,
            assignment=assignment,
            network=network,
            expiration_timestamp=expiration_timestamp,
            transport_endpoints=transport_endpoints,
        )

        decode_rgb_invoice_response.additional_properties = d
        return decode_rgb_invoice_response

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
