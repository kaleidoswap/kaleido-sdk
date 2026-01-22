from enum import Enum


class AssignmentAnyType(str, Enum):
    ANY = "Any"

    def __str__(self) -> str:
        return str(self.value)
