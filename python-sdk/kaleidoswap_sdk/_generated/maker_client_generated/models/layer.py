from enum import Enum


class Layer(str, Enum):
    ARKADE_ARKADE = "ARKADE_ARKADE"
    BTC_ARKADE = "BTC_ARKADE"
    BTC_CASHU = "BTC_CASHU"
    BTC_L1 = "BTC_L1"
    BTC_LIQUID = "BTC_LIQUID"
    BTC_LN = "BTC_LN"
    BTC_SPARK = "BTC_SPARK"
    LIQUID_LIQUID = "LIQUID_LIQUID"
    RGB_L1 = "RGB_L1"
    RGB_LN = "RGB_LN"
    SPARK_SPARK = "SPARK_SPARK"
    TAPASS_L1 = "TAPASS_L1"
    TAPASS_LN = "TAPASS_LN"

    def __str__(self) -> str:
        return str(self.value)
