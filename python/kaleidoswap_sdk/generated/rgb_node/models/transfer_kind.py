from enum import Enum


class TransferKind(str, Enum):
    ISSUANCE = "Issuance"
    RECEIVEBLIND = "ReceiveBlind"
    RECEIVEWITNESS = "ReceiveWitness"
    SEND = "Send"

    def __str__(self) -> str:
        return str(self.value)
