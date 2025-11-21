from enum import Enum


class RetryDeliveryStatus(str, Enum):
    ERROR = "error"
    NOT_FOUND = "not_found"
    NO_PENDING_DELIVERY = "no_pending_delivery"
    PROCESSING = "processing"

    def __str__(self) -> str:
        return str(self.value)
