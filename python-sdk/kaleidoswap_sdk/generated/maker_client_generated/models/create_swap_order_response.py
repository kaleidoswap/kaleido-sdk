from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.swap_order_status import SwapOrderStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.receiver_address import ReceiverAddress


T = TypeVar("T", bound="CreateSwapOrderResponse")


@_attrs_define
class CreateSwapOrderResponse:
    """
    Attributes:
        id (str):
        rfq_id (str):
        status (SwapOrderStatus):
        deposit_address (Union['ReceiverAddress', None, Unset]):
    """

    id: str
    rfq_id: str
    status: SwapOrderStatus
    deposit_address: Union["ReceiverAddress", None, Unset] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.receiver_address import ReceiverAddress

        id = self.id

        rfq_id = self.rfq_id

        status = self.status.value

        deposit_address: None | Unset | dict[str, Any]
        if isinstance(self.deposit_address, Unset):
            deposit_address = UNSET
        elif isinstance(self.deposit_address, ReceiverAddress):
            deposit_address = self.deposit_address.to_dict()
        else:
            deposit_address = self.deposit_address

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "rfq_id": rfq_id,
                "status": status,
            }
        )
        if deposit_address is not UNSET:
            field_dict["deposit_address"] = deposit_address

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.receiver_address import ReceiverAddress

        d = dict(src_dict)
        id = d.pop("id")

        rfq_id = d.pop("rfq_id")

        status = SwapOrderStatus(d.pop("status"))

        def _parse_deposit_address(data: object) -> Union["ReceiverAddress", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                deposit_address_type_1 = ReceiverAddress.from_dict(data)

                return deposit_address_type_1
            except:  # noqa: E722
                pass
            return cast(Union["ReceiverAddress", None, Unset], data)

        deposit_address = _parse_deposit_address(d.pop("deposit_address", UNSET))

        create_swap_order_response = cls(
            id=id,
            rfq_id=rfq_id,
            status=status,
            deposit_address=deposit_address,
        )

        create_swap_order_response.additional_properties = d
        return create_swap_order_response

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
