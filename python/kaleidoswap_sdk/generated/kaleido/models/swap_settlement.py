from enum import Enum


class SwapSettlement(str, Enum):
    LIGHTNING = "LIGHTNING"
    ONCHAIN = "ONCHAIN"

    def __str__(self) -> str:
        return str(self.value)
