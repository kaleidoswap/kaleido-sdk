from enum import Enum


class OrderState(str, Enum):
    CHANNEL_OPENING = "CHANNEL_OPENING"
    COMPLETED = "COMPLETED"
    CREATED = "CREATED"
    FAILED = "FAILED"
    PENDING_RATE_DECISION = "PENDING_RATE_DECISION"

    def __str__(self) -> str:
        return str(self.value)
