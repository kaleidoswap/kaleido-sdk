from enum import Enum


class SwapStatus(str, Enum):
    EXPIRED = "Expired"
    FAILED = "Failed"
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"
    WAITING = "Waiting"

    def __str__(self) -> str:
        return str(self.value)
