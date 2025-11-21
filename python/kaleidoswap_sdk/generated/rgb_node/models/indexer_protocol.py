from enum import Enum


class IndexerProtocol(str, Enum):
    ELECTRUM = "Electrum"
    ESPLORA = "Esplora"

    def __str__(self) -> str:
        return str(self.value)
