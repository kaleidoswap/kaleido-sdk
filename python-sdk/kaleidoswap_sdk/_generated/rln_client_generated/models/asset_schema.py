from enum import Enum


class AssetSchema(str, Enum):
    CFA = "Cfa"
    NIA = "Nia"
    UDA = "Uda"

    def __str__(self) -> str:
        return str(self.value)
