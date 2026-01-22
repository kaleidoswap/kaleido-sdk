from enum import Enum


class RecipientType(str, Enum):
    BLIND = "Blind"
    WITNESS = "Witness"

    def __str__(self) -> str:
        return str(self.value)
