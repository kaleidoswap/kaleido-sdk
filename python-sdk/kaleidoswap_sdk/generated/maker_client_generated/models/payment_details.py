from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.payment_bolt_11 import PaymentBolt11
    from ..models.payment_onchain import PaymentOnchain


T = TypeVar("T", bound="PaymentDetails")


@_attrs_define
class PaymentDetails:
    """
    Attributes:
        bolt11 (PaymentBolt11):
        onchain (PaymentOnchain):
    """

    bolt11: "PaymentBolt11"
    onchain: "PaymentOnchain"
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        bolt11 = self.bolt11.to_dict()

        onchain = self.onchain.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "bolt11": bolt11,
                "onchain": onchain,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.payment_bolt_11 import PaymentBolt11
        from ..models.payment_onchain import PaymentOnchain

        d = dict(src_dict)
        bolt11 = PaymentBolt11.from_dict(d.pop("bolt11"))

        onchain = PaymentOnchain.from_dict(d.pop("onchain"))

        payment_details = cls(
            bolt11=bolt11,
            onchain=onchain,
        )

        payment_details.additional_properties = d
        return payment_details

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
