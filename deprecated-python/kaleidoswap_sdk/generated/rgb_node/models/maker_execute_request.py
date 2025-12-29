from __future__ import annotations

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
        swapstring (str | Unset):  Example: 30/rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-
            wTfvRZ8/10/rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-
            brRJrzE/1715896416/9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2.
        payment_secret (str | Unset):  Example: 777a7756c620868199ed5fdc35bee4095b5709d543e5c2bf0494396bf27d2ea2.
        taker_pubkey (str | Unset):  Example: 02270dadcd6e7ba0ef707dac72acccae1a3607453a8dd2aef36ff3be4e0d31f043.
    """

    swapstring: str | Unset = UNSET
    payment_secret: str | Unset = UNSET
    taker_pubkey: str | Unset = UNSET
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
