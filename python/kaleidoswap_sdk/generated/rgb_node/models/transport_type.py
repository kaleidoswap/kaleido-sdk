from enum import Enum


class TransportType(str, Enum):
    JSONRPC = "JsonRpc"

    def __str__(self) -> str:
        return str(self.value)
