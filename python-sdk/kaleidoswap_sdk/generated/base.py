from pydantic import BaseModel, ConfigDict

class BaseNodeModel(BaseModel):
    """
    Base class for all generated Pydantic models in the SDK.
    Ensures consistent Pydantic v2 configuration.
    """
    model_config = ConfigDict(
        # Store enum members rather than their values (fixes SwapStatus comparison)
        use_enum_values=False,
        # Allow population by field name as well as alias
        populate_by_name=True,
        # Extra fields are allowed in API responses for forward compatibility
        extra="ignore",
    )
