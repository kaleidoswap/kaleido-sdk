from enum import Enum


class AssignmentNonFungibleType(str, Enum):
    NONFUNGIBLE = "NonFungible"

    def __str__(self) -> str:
        return str(self.value)
