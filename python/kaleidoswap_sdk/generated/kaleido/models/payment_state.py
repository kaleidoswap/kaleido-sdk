from enum import Enum


class PaymentState(str, Enum):
    EXPECT_PAYMENT = "EXPECT_PAYMENT"
    HOLD = "HOLD"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    TO_REFUND = "TO_REFUND"

    def __str__(self) -> str:
        return str(self.value)
