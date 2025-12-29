from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="ConfirmSwapRequest")


@_attrs_define
class ConfirmSwapRequest:
    """
    Attributes:
        swapstring (str):  Example: 30/rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-
            ttx6CNou5-M98k8Zd/10/rgb:2eVw8uw-8G88LQ2tQ-kexM12SoD-nCX8DmQrw-yLMu6JDfK-
            xx1SCfc/1715896416/9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2.
        taker_pubkey (str):  Example: 034eedc97802d7e2766704bd06d6bfded8aa2d35a1a007e277fd7278f3dc962706.
        payment_hash (str):  Example: 9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2.
    """

    swapstring: str
    taker_pubkey: str
    payment_hash: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        swapstring = self.swapstring

        taker_pubkey = self.taker_pubkey

        payment_hash = self.payment_hash

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "swapstring": swapstring,
                "taker_pubkey": taker_pubkey,
                "payment_hash": payment_hash,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        swapstring = d.pop("swapstring")

        taker_pubkey = d.pop("taker_pubkey")

        payment_hash = d.pop("payment_hash")

        confirm_swap_request = cls(
            swapstring=swapstring,
            taker_pubkey=taker_pubkey,
            payment_hash=payment_hash,
        )

        confirm_swap_request.additional_properties = d
        return confirm_swap_request

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
