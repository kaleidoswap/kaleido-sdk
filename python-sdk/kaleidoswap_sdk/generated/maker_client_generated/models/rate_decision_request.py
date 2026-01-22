from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="RateDecisionRequest")


@_attrs_define
class RateDecisionRequest:
    """Request for user to accept new rate or request refund

    Attributes:
        order_id (str):
        accept_new_rate (bool):
    """

    order_id: str
    accept_new_rate: bool
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        order_id = self.order_id

        accept_new_rate = self.accept_new_rate

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "order_id": order_id,
                "accept_new_rate": accept_new_rate,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        order_id = d.pop("order_id")

        accept_new_rate = d.pop("accept_new_rate")

        rate_decision_request = cls(
            order_id=order_id,
            accept_new_rate=accept_new_rate,
        )

        rate_decision_request.additional_properties = d
        return rate_decision_request

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
