from enum import Enum


class AssignmentInflationRightType(str, Enum):
    INFLATIONRIGHT = "InflationRight"

    def __str__(self) -> str:
        return str(self.value)
