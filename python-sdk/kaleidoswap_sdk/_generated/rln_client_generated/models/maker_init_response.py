from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="MakerInitResponse")


@_attrs_define
class MakerInitResponse:
    """
    Attributes:
        payment_hash (Union[Unset, str]):
        payment_secret (Union[Unset, str]):
        swapstring (Union[Unset, str]):
    """

    payment_hash: Unset | str = UNSET
    payment_secret: Unset | str = UNSET
    swapstring: Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payment_hash = self.payment_hash

        payment_secret = self.payment_secret

        swapstring = self.swapstring

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if payment_hash is not UNSET:
            field_dict["payment_hash"] = payment_hash
        if payment_secret is not UNSET:
            field_dict["payment_secret"] = payment_secret
        if swapstring is not UNSET:
            field_dict["swapstring"] = swapstring

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        payment_hash = d.pop("payment_hash", UNSET)

        payment_secret = d.pop("payment_secret", UNSET)

        swapstring = d.pop("swapstring", UNSET)

        maker_init_response = cls(
            payment_hash=payment_hash,
            payment_secret=payment_secret,
            swapstring=swapstring,
        )

        maker_init_response.additional_properties = d
        return maker_init_response

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
