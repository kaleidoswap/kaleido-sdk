from enum import Enum


class SwapOrderStatus(str, Enum):
    CANCELLED = "CANCELLED"
    EXECUTING = "EXECUTING"
    EXPIRED = "EXPIRED"
    FAILED = "FAILED"
    FILLED = "FILLED"
    OPEN = "OPEN"
    PAID = "PAID"
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PENDING_RATE_DECISION = "PENDING_RATE_DECISION"

    def __str__(self) -> str:
        return str(self.value)
