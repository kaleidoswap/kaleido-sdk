from enum import Enum


class PaymentStatus(str, Enum):
    NOT_PAID = "NOT_PAID"
    OVERPAID = "OVERPAID"
    PAID = "PAID"
    UNDERPAID = "UNDERPAID"

    def __str__(self) -> str:
        return str(self.value)
