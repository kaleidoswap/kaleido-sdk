from enum import Enum


class ChannelStatus(str, Enum):
    CLOSING = "Closing"
    OPENED = "Opened"
    OPENING = "Opening"

    def __str__(self) -> str:
        return str(self.value)
