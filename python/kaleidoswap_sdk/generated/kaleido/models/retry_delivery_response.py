from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.retry_delivery_status import RetryDeliveryStatus

T = TypeVar("T", bound="RetryDeliveryResponse")


@_attrs_define
class RetryDeliveryResponse:
    """Response model for /retry_delivery endpoint

    Attributes:
        status (RetryDeliveryStatus): Status codes for /retry_delivery endpoint responses
        message (str): Human-readable message about the result
    """

    status: RetryDeliveryStatus
    message: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        status = self.status.value

        message = self.message

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "status": status,
                "message": message,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        status = RetryDeliveryStatus(d.pop("status"))

        message = d.pop("message")

        retry_delivery_response = cls(
            status=status,
            message=message,
        )

        retry_delivery_response.additional_properties = d
        return retry_delivery_response

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
