from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.assignment_any import AssignmentAny
    from ..models.assignment_fungible import AssignmentFungible
    from ..models.assignment_inflation_right import AssignmentInflationRight
    from ..models.assignment_non_fungible import AssignmentNonFungible
    from ..models.assignment_replace_right import AssignmentReplaceRight


T = TypeVar("T", bound="RgbInvoiceRequest")


@_attrs_define
class RgbInvoiceRequest:
    """
    Attributes:
        min_confirmations (int | Unset):  Example: 1.
        asset_id (str | Unset):  Example: rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8.
        assignment (AssignmentAny | AssignmentFungible | AssignmentInflationRight | AssignmentNonFungible |
            AssignmentReplaceRight | Unset):
        duration_seconds (int | Unset):  Example: 86400.
        witness (bool | Unset):
    """

    min_confirmations: int | Unset = UNSET
    asset_id: str | Unset = UNSET
    assignment: (
        AssignmentAny
        | AssignmentFungible
        | AssignmentInflationRight
        | AssignmentNonFungible
        | AssignmentReplaceRight
        | Unset
    ) = UNSET
    duration_seconds: int | Unset = UNSET
    witness: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.assignment_fungible import AssignmentFungible
        from ..models.assignment_inflation_right import AssignmentInflationRight
        from ..models.assignment_non_fungible import AssignmentNonFungible
        from ..models.assignment_replace_right import AssignmentReplaceRight

        min_confirmations = self.min_confirmations

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

        duration_seconds = self.duration_seconds

        witness = self.witness

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if min_confirmations is not UNSET:
            field_dict["min_confirmations"] = min_confirmations
        if asset_id is not UNSET:
            field_dict["asset_id"] = asset_id
        if assignment is not UNSET:
            field_dict["assignment"] = assignment
        if duration_seconds is not UNSET:
            field_dict["duration_seconds"] = duration_seconds
        if witness is not UNSET:
            field_dict["witness"] = witness

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.assignment_any import AssignmentAny
        from ..models.assignment_fungible import AssignmentFungible
        from ..models.assignment_inflation_right import AssignmentInflationRight
        from ..models.assignment_non_fungible import AssignmentNonFungible
        from ..models.assignment_replace_right import AssignmentReplaceRight

        d = dict(src_dict)
        min_confirmations = d.pop("min_confirmations", UNSET)

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

        duration_seconds = d.pop("duration_seconds", UNSET)

        witness = d.pop("witness", UNSET)

        rgb_invoice_request = cls(
            min_confirmations=min_confirmations,
            asset_id=asset_id,
            assignment=assignment,
            duration_seconds=duration_seconds,
            witness=witness,
        )

        rgb_invoice_request.additional_properties = d
        return rgb_invoice_request

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
