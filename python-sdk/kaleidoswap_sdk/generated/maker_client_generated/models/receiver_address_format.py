from enum import Enum


class ReceiverAddressFormat(str, Enum):
    ARKADE_ADDRESS = "ARKADE_ADDRESS"
    ARKADE_INVOICE = "ARKADE_INVOICE"
    BOLT11 = "BOLT11"
    BOLT12 = "BOLT12"
    BTC_ADDRESS = "BTC_ADDRESS"
    CASHU_TOKEN = "CASHU_TOKEN"
    LIQUID_ADDRESS = "LIQUID_ADDRESS"
    LIQUID_INVOICE = "LIQUID_INVOICE"
    LN_ADDRESS = "LN_ADDRESS"
    RGB_INVOICE = "RGB_INVOICE"
    SPARK_ADDRESS = "SPARK_ADDRESS"
    SPARK_INVOICE = "SPARK_INVOICE"

    def __str__(self) -> str:
        return str(self.value)
