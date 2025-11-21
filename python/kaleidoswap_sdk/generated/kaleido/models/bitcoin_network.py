from enum import Enum


class BitcoinNetwork(str, Enum):
    MAINNET = "Mainnet"
    REGTEST = "Regtest"
    SIGNET = "Signet"
    TESTNET = "Testnet"

    def __str__(self) -> str:
        return str(self.value)
