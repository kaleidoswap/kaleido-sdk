from enum import Enum


class AssignmentFungibleType(str, Enum):
    FUNGIBLE = "Fungible"

    def __str__(self) -> str:
        return str(self.value)
