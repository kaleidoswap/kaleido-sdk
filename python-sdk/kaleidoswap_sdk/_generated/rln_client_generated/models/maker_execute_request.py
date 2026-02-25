from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="MakerExecuteRequest")


@_attrs_define
class MakerExecuteRequest:
    """
    Attributes:
        swapstring (Union[Unset, str]):
        payment_secret (Union[Unset, str]):
        taker_pubkey (Union[Unset, str]):
    """

    swapstring: Unset | str = UNSET
    payment_secret: Unset | str = UNSET
    taker_pubkey: Unset | str = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        swapstring = self.swapstring

        payment_secret = self.payment_secret

        taker_pubkey = self.taker_pubkey

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if swapstring is not UNSET:
            field_dict["swapstring"] = swapstring
        if payment_secret is not UNSET:
            field_dict["payment_secret"] = payment_secret
        if taker_pubkey is not UNSET:
            field_dict["taker_pubkey"] = taker_pubkey

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        swapstring = d.pop("swapstring", UNSET)

        payment_secret = d.pop("payment_secret", UNSET)

        taker_pubkey = d.pop("taker_pubkey", UNSET)

        maker_execute_request = cls(
            swapstring=swapstring,
            payment_secret=payment_secret,
            taker_pubkey=taker_pubkey,
        )

        maker_execute_request.additional_properties = d
        return maker_execute_request

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
