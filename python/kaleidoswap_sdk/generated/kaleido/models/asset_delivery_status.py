from enum import Enum


class AssetDeliveryStatus(str, Enum):
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    IN_PROGRESS = "IN_PROGRESS"
    NOT_REQUIRED = "NOT_REQUIRED"
    PENDING = "PENDING"
    RATE_CHANGED = "RATE_CHANGED"

    def __str__(self) -> str:
        return str(self.value)
