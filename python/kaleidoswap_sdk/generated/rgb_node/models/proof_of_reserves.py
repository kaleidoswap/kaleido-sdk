from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ProofOfReserves")


@_attrs_define
class ProofOfReserves:
    """
    Attributes:
        utxo (str | Unset):  Example: efed66f5309396ff43c8a09941c8103d9d5bbffd473ad9f13013ac89fb6b4671:0.
        proof (list[int] | Unset):  Example: [6, 36, 87, 13, 5, 17].
    """

    utxo: str | Unset = UNSET
    proof: list[int] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        utxo = self.utxo

        proof: list[int] | Unset = UNSET
        if not isinstance(self.proof, Unset):
            proof = self.proof

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if utxo is not UNSET:
            field_dict["utxo"] = utxo
        if proof is not UNSET:
            field_dict["proof"] = proof

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        utxo = d.pop("utxo", UNSET)

        proof = cast(list[int], d.pop("proof", UNSET))

        proof_of_reserves = cls(
            utxo=utxo,
            proof=proof,
        )

        proof_of_reserves.additional_properties = d
        return proof_of_reserves

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
