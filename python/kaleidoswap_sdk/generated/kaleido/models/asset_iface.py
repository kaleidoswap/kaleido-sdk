from enum import Enum


class AssetIface(str, Enum):
    RGB20 = "RGB20"
    RGB21 = "RGB21"
    RGB25 = "RGB25"

    def __str__(self) -> str:
        return str(self.value)
