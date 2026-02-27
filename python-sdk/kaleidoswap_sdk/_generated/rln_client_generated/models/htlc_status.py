from enum import Enum


class HTLCStatus(str, Enum):
    FAILED = "Failed"
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"

    def __str__(self) -> str:
        return str(self.value)
