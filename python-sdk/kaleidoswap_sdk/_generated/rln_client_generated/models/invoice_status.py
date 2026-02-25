from enum import Enum


class InvoiceStatus(str, Enum):
    EXPIRED = "Expired"
    FAILED = "Failed"
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"

    def __str__(self) -> str:
        return str(self.value)
