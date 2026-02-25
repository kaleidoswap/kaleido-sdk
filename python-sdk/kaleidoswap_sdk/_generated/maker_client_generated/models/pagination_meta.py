from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="PaginationMeta")


@_attrs_define
class PaginationMeta:
    """Pagination metadata

    Attributes:
        total (int): Total number of items matching the filter
        limit (int): Number of items per page
        skip (int): Number of items skipped
        current_page (int): Current page number (1-indexed)
        total_pages (int): Total number of pages
        has_next (bool): Whether there is a next page
        has_previous (bool): Whether there is a previous page
    """

    total: int
    limit: int
    skip: int
    current_page: int
    total_pages: int
    has_next: bool
    has_previous: bool
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        total = self.total

        limit = self.limit

        skip = self.skip

        current_page = self.current_page

        total_pages = self.total_pages

        has_next = self.has_next

        has_previous = self.has_previous

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "total": total,
                "limit": limit,
                "skip": skip,
                "current_page": current_page,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_previous": has_previous,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        total = d.pop("total")

        limit = d.pop("limit")

        skip = d.pop("skip")

        current_page = d.pop("current_page")

        total_pages = d.pop("total_pages")

        has_next = d.pop("has_next")

        has_previous = d.pop("has_previous")

        pagination_meta = cls(
            total=total,
            limit=limit,
            skip=skip,
            current_page=current_page,
            total_pages=total_pages,
            has_next=has_next,
            has_previous=has_previous,
        )

        pagination_meta.additional_properties = d
        return pagination_meta

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
