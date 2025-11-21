from enum import Enum


class TransactionType(str, Enum):
    CREATEUTXOS = "CreateUtxos"
    DRAIN = "Drain"
    RGBSEND = "RgbSend"
    USER = "User"

    def __str__(self) -> str:
        return str(self.value)
