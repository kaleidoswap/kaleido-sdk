from enum import Enum


class TransferStatus(str, Enum):
    FAILED = "Failed"
    SETTLED = "Settled"
    WAITINGCONFIRMATIONS = "WaitingConfirmations"
    WAITINGCOUNTERPARTY = "WaitingCounterparty"

    def __str__(self) -> str:
        return str(self.value)
