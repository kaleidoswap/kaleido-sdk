from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define

from ..types import UNSET, Unset

T = TypeVar("T", bound="OrderOptions")


@_attrs_define
class OrderOptions:
    """
    Attributes:
        min_required_channel_confirmations (Union[Unset, int]):  Default: 0.
        min_funding_confirms_within_blocks (Union[Unset, int]):  Default: 0.
        min_onchain_payment_confirmations (Union[None, Unset, int]):
        supports_zero_channel_reserve (Union[Unset, bool]):  Default: True.
        min_onchain_payment_size_sat (Union[None, Unset, int]):
        max_channel_expiry_blocks (Union[Unset, int]):  Default: 20160.
        min_initial_client_balance_sat (Union[Unset, int]):  Default: 0.
        max_initial_client_balance_sat (Union[Unset, int]):  Default: 1000000.
        min_initial_lsp_balance_sat (Union[Unset, int]):  Default: 0.
        max_initial_lsp_balance_sat (Union[Unset, int]):  Default: 16777215.
        min_channel_balance_sat (Union[Unset, int]):  Default: 50000.
        max_channel_balance_sat (Union[Unset, int]):  Default: 16777215.
    """

    min_required_channel_confirmations: Unset | int = 0
    min_funding_confirms_within_blocks: Unset | int = 0
    min_onchain_payment_confirmations: None | Unset | int = UNSET
    supports_zero_channel_reserve: Unset | bool = True
    min_onchain_payment_size_sat: None | Unset | int = UNSET
    max_channel_expiry_blocks: Unset | int = 20160
    min_initial_client_balance_sat: Unset | int = 0
    max_initial_client_balance_sat: Unset | int = 1000000
    min_initial_lsp_balance_sat: Unset | int = 0
    max_initial_lsp_balance_sat: Unset | int = 16777215
    min_channel_balance_sat: Unset | int = 50000
    max_channel_balance_sat: Unset | int = 16777215

    def to_dict(self) -> dict[str, Any]:
        min_required_channel_confirmations = self.min_required_channel_confirmations

        min_funding_confirms_within_blocks = self.min_funding_confirms_within_blocks

        min_onchain_payment_confirmations: None | Unset | int
        if isinstance(self.min_onchain_payment_confirmations, Unset):
            min_onchain_payment_confirmations = UNSET
        else:
            min_onchain_payment_confirmations = self.min_onchain_payment_confirmations

        supports_zero_channel_reserve = self.supports_zero_channel_reserve

        min_onchain_payment_size_sat: None | Unset | int
        if isinstance(self.min_onchain_payment_size_sat, Unset):
            min_onchain_payment_size_sat = UNSET
        else:
            min_onchain_payment_size_sat = self.min_onchain_payment_size_sat

        max_channel_expiry_blocks = self.max_channel_expiry_blocks

        min_initial_client_balance_sat = self.min_initial_client_balance_sat

        max_initial_client_balance_sat = self.max_initial_client_balance_sat

        min_initial_lsp_balance_sat = self.min_initial_lsp_balance_sat

        max_initial_lsp_balance_sat = self.max_initial_lsp_balance_sat

        min_channel_balance_sat = self.min_channel_balance_sat

        max_channel_balance_sat = self.max_channel_balance_sat

        field_dict: dict[str, Any] = {}

        field_dict.update({})
        if min_required_channel_confirmations is not UNSET:
            field_dict["min_required_channel_confirmations"] = min_required_channel_confirmations
        if min_funding_confirms_within_blocks is not UNSET:
            field_dict["min_funding_confirms_within_blocks"] = min_funding_confirms_within_blocks
        if min_onchain_payment_confirmations is not UNSET:
            field_dict["min_onchain_payment_confirmations"] = min_onchain_payment_confirmations
        if supports_zero_channel_reserve is not UNSET:
            field_dict["supports_zero_channel_reserve"] = supports_zero_channel_reserve
        if min_onchain_payment_size_sat is not UNSET:
            field_dict["min_onchain_payment_size_sat"] = min_onchain_payment_size_sat
        if max_channel_expiry_blocks is not UNSET:
            field_dict["max_channel_expiry_blocks"] = max_channel_expiry_blocks
        if min_initial_client_balance_sat is not UNSET:
            field_dict["min_initial_client_balance_sat"] = min_initial_client_balance_sat
        if max_initial_client_balance_sat is not UNSET:
            field_dict["max_initial_client_balance_sat"] = max_initial_client_balance_sat
        if min_initial_lsp_balance_sat is not UNSET:
            field_dict["min_initial_lsp_balance_sat"] = min_initial_lsp_balance_sat
        if max_initial_lsp_balance_sat is not UNSET:
            field_dict["max_initial_lsp_balance_sat"] = max_initial_lsp_balance_sat
        if min_channel_balance_sat is not UNSET:
            field_dict["min_channel_balance_sat"] = min_channel_balance_sat
        if max_channel_balance_sat is not UNSET:
            field_dict["max_channel_balance_sat"] = max_channel_balance_sat

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        min_required_channel_confirmations = d.pop("min_required_channel_confirmations", UNSET)

        min_funding_confirms_within_blocks = d.pop("min_funding_confirms_within_blocks", UNSET)

        def _parse_min_onchain_payment_confirmations(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        min_onchain_payment_confirmations = _parse_min_onchain_payment_confirmations(
            d.pop("min_onchain_payment_confirmations", UNSET)
        )

        supports_zero_channel_reserve = d.pop("supports_zero_channel_reserve", UNSET)

        def _parse_min_onchain_payment_size_sat(data: object) -> None | Unset | int:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | Unset | int, data)

        min_onchain_payment_size_sat = _parse_min_onchain_payment_size_sat(
            d.pop("min_onchain_payment_size_sat", UNSET)
        )

        max_channel_expiry_blocks = d.pop("max_channel_expiry_blocks", UNSET)

        min_initial_client_balance_sat = d.pop("min_initial_client_balance_sat", UNSET)

        max_initial_client_balance_sat = d.pop("max_initial_client_balance_sat", UNSET)

        min_initial_lsp_balance_sat = d.pop("min_initial_lsp_balance_sat", UNSET)

        max_initial_lsp_balance_sat = d.pop("max_initial_lsp_balance_sat", UNSET)

        min_channel_balance_sat = d.pop("min_channel_balance_sat", UNSET)

        max_channel_balance_sat = d.pop("max_channel_balance_sat", UNSET)

        order_options = cls(
            min_required_channel_confirmations=min_required_channel_confirmations,
            min_funding_confirms_within_blocks=min_funding_confirms_within_blocks,
            min_onchain_payment_confirmations=min_onchain_payment_confirmations,
            supports_zero_channel_reserve=supports_zero_channel_reserve,
            min_onchain_payment_size_sat=min_onchain_payment_size_sat,
            max_channel_expiry_blocks=max_channel_expiry_blocks,
            min_initial_client_balance_sat=min_initial_client_balance_sat,
            max_initial_client_balance_sat=max_initial_client_balance_sat,
            min_initial_lsp_balance_sat=min_initial_lsp_balance_sat,
            max_initial_lsp_balance_sat=max_initial_lsp_balance_sat,
            min_channel_balance_sat=min_channel_balance_sat,
            max_channel_balance_sat=max_channel_balance_sat,
        )

        return order_options
