from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="SwapRequest")


@_attrs_define
class SwapRequest:
    """
    Attributes:
        rfq_id (str):  Example: 1234567890.
        from_asset (str):  Example: BTC.
        from_amount (int):  Example: 1000000.
        to_asset (str):  Example: rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd.
        to_amount (int):  Example: 1000000.
    """

    rfq_id: str
    from_asset: str
    from_amount: int
    to_asset: str
    to_amount: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        rfq_id = self.rfq_id

        from_asset = self.from_asset

        from_amount = self.from_amount

        to_asset = self.to_asset

        to_amount = self.to_amount

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "rfq_id": rfq_id,
                "from_asset": from_asset,
                "from_amount": from_amount,
                "to_asset": to_asset,
                "to_amount": to_amount,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        rfq_id = d.pop("rfq_id")

        from_asset = d.pop("from_asset")

        from_amount = d.pop("from_amount")

        to_asset = d.pop("to_asset")

        to_amount = d.pop("to_amount")

        swap_request = cls(
            rfq_id=rfq_id,
            from_asset=from_asset,
            from_amount=from_amount,
            to_asset=to_asset,
            to_amount=to_amount,
        )

        swap_request.additional_properties = d
        return swap_request

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
