from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="SwapResponse")


@_attrs_define
class SwapResponse:
    """
    Attributes:
        swapstring (str):  Example: 30/rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-
            ttx6CNou5-M98k8Zd/10/rgb:2eVw8uw-8G88LQ2tQ-kexM12SoD-nCX8DmQrw-yLMu6JDfK-
            xx1SCfc/1715896416/9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2.
        payment_hash (str):  Example: 9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2.
    """

    swapstring: str
    payment_hash: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        swapstring = self.swapstring

        payment_hash = self.payment_hash

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "swapstring": swapstring,
                "payment_hash": payment_hash,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        swapstring = d.pop("swapstring")

        payment_hash = d.pop("payment_hash")

        swap_response = cls(
            swapstring=swapstring,
            payment_hash=payment_hash,
        )

        swap_response.additional_properties = d
        return swap_response

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
