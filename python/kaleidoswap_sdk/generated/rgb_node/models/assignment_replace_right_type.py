from enum import Enum


class AssignmentReplaceRightType(str, Enum):
    REPLACERIGHT = "ReplaceRight"

    def __str__(self) -> str:
        return str(self.value)
