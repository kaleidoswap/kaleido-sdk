from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="SwapOrderRateDecisionResponse")


@_attrs_define
class SwapOrderRateDecisionResponse:
    """Response after user makes rate decision for a swap order

    Attributes:
        order_id (str):
        decision_accepted (bool):
        message (str):
        refund_txid (None | str | Unset): Present if refund was requested and processed
    """

    order_id: str
    decision_accepted: bool
    message: str
    refund_txid: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        order_id = self.order_id

        decision_accepted = self.decision_accepted

        message = self.message

        refund_txid: None | str | Unset
        if isinstance(self.refund_txid, Unset):
            refund_txid = UNSET
        else:
            refund_txid = self.refund_txid

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "order_id": order_id,
                "decision_accepted": decision_accepted,
                "message": message,
            }
        )
        if refund_txid is not UNSET:
            field_dict["refund_txid"] = refund_txid

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        order_id = d.pop("order_id")

        decision_accepted = d.pop("decision_accepted")

        message = d.pop("message")

        def _parse_refund_txid(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        refund_txid = _parse_refund_txid(d.pop("refund_txid", UNSET))

        swap_order_rate_decision_response = cls(
            order_id=order_id,
            decision_accepted=decision_accepted,
            message=message,
            refund_txid=refund_txid,
        )

        swap_order_rate_decision_response.additional_properties = d
        return swap_order_rate_decision_response

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
