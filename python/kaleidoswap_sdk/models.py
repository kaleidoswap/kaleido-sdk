from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CreateOrderRequest(BaseModel):
    """Model for creating an order request to the LSP."""
    
    model_config = ConfigDict(
        extra="forbid",  # Don't allow extra fields
        validate_assignment=True  # Validate on assignment
    )
    
    client_pubkey: str = Field(..., description="Client's public key")
    lsp_balance_sat: int = Field(0, description="LSP balance in satoshis", ge=0)
    client_balance_sat: int = Field(0, description="Client balance in satoshis", ge=0)
    required_channel_confirmations: int = Field(0, description="Required channel confirmations", ge=0)
    funding_confirms_within_blocks: int = Field(0, description="Funding confirms within blocks", ge=0)
    channel_expiry_blocks: int = Field(0, description="Channel expiry blocks", ge=0)
    token: Optional[str] = Field(None, description="Token for the order")
    refund_onchain_address: str = Field(..., description="Refund onchain address")
    announce_channel: bool = Field(True, description="Whether to announce the channel")
    asset_id: Optional[str] = Field(None, description="Asset ID")
    lsp_asset_amount: Optional[int] = Field(None, description="LSP asset amount", ge=0)
    client_asset_amount: Optional[int] = Field(None, description="Client asset amount", ge=0)
