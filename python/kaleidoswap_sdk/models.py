from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, UTC
from enum import Enum


class OrderOptions(BaseModel):
    min_required_channel_confirmations: int = Field(..., ge=0, description="Minimum number of confirmations required for channel opening")
    min_funding_confirms_within_blocks: int = Field(..., ge=0, description="Minimum number of confirmations required for funding within specified blocks")
    min_onchain_payment_confirmations: Optional[int] = Field(default=None, ge=0, description="Minimum number of confirmations required for onchain payments")
    supports_zero_channel_reserve: bool = Field(..., description="Whether the LSP supports zero channel reserve")
    min_onchain_payment_size_sat: Optional[int] = Field(default=None, ge=0, description="Minimum onchain payment size in satoshis")
    max_channel_expiry_blocks: int = Field(..., ge=1, description="Maximum channel expiry time in blocks")
    min_initial_client_balance_sat: int = Field(..., ge=0, description="Minimum initial client balance in satoshis")
    max_initial_client_balance_sat: int = Field(..., ge=0, description="Maximum initial client balance in satoshis")
    min_initial_lsp_balance_sat: int = Field(..., ge=0, description="Minimum initial LSP balance in satoshis")
    max_initial_lsp_balance_sat: int = Field(..., ge=0, description="Maximum initial LSP balance in satoshis")
    min_channel_balance_sat: int = Field(..., ge=0, description="Minimum channel balance in satoshis")
    max_channel_balance_sat: int = Field(..., ge=0, description="Maximum channel balance in satoshis")

class AssetsOptions(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    name: str = Field(..., description="Display name of the asset")
    asset_id: Optional[str] = Field(default=None, description="Unique RGB asset identifier")
    ticker: str = Field(..., description="Trading symbol/ticker of the asset")
    precision: int = Field(..., description="Number of decimal places for the asset")
    issued_supply: int = Field(..., description="Total issued supply of the asset")
    min_initial_client_amount: int = Field(..., ge=0, description="Minimum initial client amount for this asset")
    max_initial_client_amount: int = Field(..., ge=0, description="Maximum initial client amount for this asset")
    min_initial_lsp_amount: int = Field(..., ge=0, description="Minimum initial LSP amount for this asset")
    max_initial_lsp_amount: int = Field(..., ge=0, description="Maximum initial LSP amount for this asset")
    min_channel_amount: int = Field(..., ge=0, description="Minimum channel amount for this asset")
    max_channel_amount: int = Field(..., ge=0, description="Maximum channel amount for this asset")

class GetLspInfoResponse(BaseModel):
    """Model for getting LSP information."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    lsp_connection_url: str
    options: OrderOptions
    assets: List[AssetsOptions]

class CreateOrderRequest(BaseModel):
    """Model for creating an order request to the LSP."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    client_pubkey: str = Field(..., description="Client's public key")
    lsp_balance_sat: int = Field(0, description="LSP balance in satoshis", ge=0)
    client_balance_sat: int = Field(0, description="Client balance in satoshis", ge=0)
    required_channel_confirmations: int = Field(0, description="Required channel confirmations", ge=0)
    funding_confirms_within_blocks: int = Field(0, description="Funding confirms within blocks", ge=0)
    channel_expiry_blocks: int = Field(0, description="Channel expiry blocks", ge=0)
    token: Optional[str] = Field(default=None, description="Token for the order")
    refund_onchain_address: str = Field(..., description="Refund onchain address")
    announce_channel: bool = Field(True, description="Whether to announce the channel")
    asset_id: Optional[str] = Field(default=None, description="Asset ID")
    lsp_asset_amount: Optional[int] = Field(default=None, description="LSP asset amount", ge=0)
    client_asset_amount: Optional[int] = Field(default=None, description="Client asset amount", ge=0)

# Market Models
class Asset(BaseModel):
    """Model for an asset in the market."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    asset_id: str = Field(..., description="Unique asset identifier")
    ticker: str = Field(..., description="Trading symbol/ticker")
    name: str = Field(..., description="Display name of the asset")
    precision: int = Field(..., description="Number of decimal places")
    issued_supply: int = Field(..., description="Total issued supply")
    is_active: bool = Field(..., description="Whether the asset is active for trading")
    timestamp_added: Optional[int] = Field(default=None, description="Timestamp when asset was added")
    asset_iface: Optional[str] = Field(default=None, description="Asset interface")
    details: Optional[str] = Field(default=None, description="Asset details")
    timestamp: Optional[int] = Field(default=None, description="Asset timestamp")
    added_at: Optional[int] = Field(default=None, description="Asset added timestamp")
    balance: Optional[Dict[str, int]] = Field(default=None, description="Asset balance information")
    media: Optional[Dict[str, str]] = Field(default=None, description="Asset media information")

class ListAssetsResponse(BaseModel):
    """Model for listing assets response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    assets: List[Asset] = Field(..., description="List of available assets")
    network: str = Field(..., description="Network identifier")
    response_timestamp: Optional[int] = Field(default=None, description="Timestamp of response generation")
    timestamp: Optional[int] = Field(default=None, description="Response timestamp")

class TradingPair(BaseModel):
    """Model for a trading pair."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    id: str = Field(..., description="Unique pair identifier")
    base_asset: str = Field(..., description="Base asset ticker")
    base_asset_id: str = Field(..., description="Base asset ID")
    quote_asset: str = Field(..., description="Quote asset ticker")
    quote_asset_id: str = Field(..., description="Quote asset ID")
    is_active: bool = Field(..., description="Whether the pair is active for trading")
    min_base_order_size: int = Field(..., description="Minimum base order size")
    max_base_order_size: int = Field(..., description="Maximum base order size")
    min_quote_order_size: int = Field(..., description="Minimum quote order size")
    max_quote_order_size: int = Field(..., description="Maximum quote order size")
    base_precision: int = Field(..., description="Base asset precision")
    quote_precision: int = Field(..., description="Quote asset precision")

class ListPairsResponse(BaseModel):
    """Model for listing pairs response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    pairs: List[TradingPair] = Field(..., description="List of available trading pairs")

class QuoteRequest(BaseModel):
    """Model for requesting a quote."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    from_asset: str = Field(..., description="Source asset ID")
    to_asset: str = Field(..., description="Destination asset ID")
    from_amount: int = Field(..., description="Amount in atomic units", ge=0)

class QuoteResponse(BaseModel):
    """Model for quote response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    rfq_id: str = Field(..., description="Request for Quote ID")
    from_asset: str = Field(..., description="Source asset ID")
    to_asset: str = Field(..., description="Destination asset ID")
    from_amount: int = Field(..., description="Source amount in atomic units")
    to_amount: int = Field(..., description="Destination amount in atomic units")
    price: float = Field(..., description="Human-readable price")
    fee: Dict[str, Any] = Field(..., description="Fee information")
    timestamp: int = Field(..., description="Quote generation timestamp")
    expires_at: int = Field(..., description="Quote expiration timestamp")
    
# Swap Models
class InitMakerSwapRequest(BaseModel):
    """Model for initializing a maker swap."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    rfq_id: str = Field(..., description="Request for Quote ID")
    from_asset: str = Field(..., description="Source asset ID")
    to_asset: str = Field(..., description="Destination asset ID")
    from_amount: int = Field(..., description="Source amount in atomic units", ge=0)
    to_amount: int = Field(..., description="Destination amount in atomic units", ge=0)

class InitMakerSwapResponse(BaseModel):
    """Model for maker swap initialization response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    payment_hash: str = Field(..., description="Payment hash")
    payment_secret: Optional[str] = Field(default=None, description="Payment secret")
    swapstring: str = Field(..., description="Swap string")

class ExecuteMakerSwapRequest(BaseModel):
    """Model for executing a maker swap."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    swapstring: str = Field(..., description="Swap string from initialization")
    payment_hash: str = Field(..., description="Payment hash from initialization")
    taker_pubkey: str = Field(..., description="Taker's public key")

class ExecuteMakerSwapResponse(BaseModel):
    """Model for maker swap execution response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    status: Optional[int] = Field(default=None, description="HTTP status code")
    message: Optional[str] = Field(default=None, description="Response message")
    error: Optional[str] = Field(default=None, description="Error message if execution failed")

class GetSwapStatusRequest(BaseModel):
    """Model for getting swap status."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    payment_hash: str = Field(..., description="Payment hash")

class SwapStatus(BaseModel):
    """Model for swap status."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    qty_from: int = Field(..., description="Source quantity")
    qty_to: int = Field(..., description="Destination quantity")
    from_asset: Optional[str] = Field(default=None, description="Source asset ID")
    to_asset: Optional[str] = Field(default=None, description="Destination asset ID")
    payment_hash: str = Field(..., description="Payment hash")
    status: str = Field(..., description="Swap status")
    requested_at: int = Field(..., description="Request timestamp")
    initiated_at: Optional[int] = Field(default=None, description="Initiation timestamp")
    expires_at: int = Field(..., description="Expiration timestamp")
    completed_at: Optional[int] = Field(default=None, description="Completion timestamp")

class GetSwapStatusResponse(BaseModel):
    """Model for swap status response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    swap: SwapStatus = Field(..., description="Swap status information")

# Node Models
class NodeInfoResponse(BaseModel):
    """Model for node information response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    pubkey: str = Field(..., description="Node public key")
    num_channels: int = Field(..., description="Number of channels")
    num_usable_channels: int = Field(..., description="Number of usable channels")
    local_balance_sat: int = Field(..., description="Local balance in satoshis")
    eventual_close_fees_sat: int = Field(..., description="Eventual close fees in satoshis")
    pending_outbound_payments_sat: int = Field(..., description="Pending outbound payments in satoshis")
    num_peers: int = Field(..., description="Number of peers")
    account_xpub_vanilla: str = Field(..., description="Vanilla account extended public key")
    account_xpub_colored: str = Field(..., description="Colored account extended public key")
    max_media_upload_size_mb: int = Field(..., description="Maximum media upload size in MB")
    rgb_htlc_min_msat: int = Field(..., description="Minimum RGB HTLC amount in millisats")
    rgb_channel_capacity_min_sat: int = Field(..., description="Minimum RGB channel capacity in satoshis")
    channel_capacity_min_sat: int = Field(..., description="Minimum channel capacity in satoshis")
    channel_capacity_max_sat: int = Field(..., description="Maximum channel capacity in satoshis")
    channel_asset_min_amount: int = Field(..., description="Minimum channel asset amount")
    channel_asset_max_amount: int = Field(..., description="Maximum channel asset amount")
    network_nodes: int = Field(..., description="Number of network nodes")
    network_channels: int = Field(..., description="Number of network channels")

class WhitelistTradeRequest(BaseModel):
    """Model for whitelisting a trade."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    swapstring: str = Field(..., description="Swap string from maker")

class ConnectPeerRequest(BaseModel):
    """Model for connecting to a peer."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    peer_pubkey_and_addr: str = Field(..., description="Peer public key and address")

class GetAssetMetadataRequest(BaseModel):
    """Model for getting asset metadata."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    asset_id: str = Field(..., description="Asset ID")

class AssetMetadataResponse(BaseModel):
    """Model for asset metadata response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    asset_iface: Optional[str] = Field(default=None, description="Asset interface")
    asset_schema: str = Field(..., description="Asset schema")
    issued_supply: int = Field(..., description="Issued supply")
    timestamp: int = Field(..., description="Timestamp")
    name: str = Field(..., description="Asset name")
    precision: int = Field(..., description="Precision")
    ticker: Optional[str] = Field(default=None, description="Asset ticker")
    details: Optional[str] = Field(default=None, description="Asset details")
    token: Optional[dict] = Field(default=None, description="Token information")

# Order Models
class GetOrderRequest(BaseModel):
    """Model for getting an order."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    order_id: str = Field(..., description="Order ID")

class OrderState(str, Enum):
    """Order state enumeration."""
    CREATED = "CREATED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class PaymentState(str, Enum):
    """Payment state enumeration."""
    EXPECT_PAYMENT = "EXPECT_PAYMENT"
    HOLD = "HOLD"
    PAID = "PAID"
    REFUNDED = "REFUNDED"

class PaymentBolt11(BaseModel):
    """Model for Bolt11 payment details."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    state: PaymentState = Field(..., description="Payment state")
    expires_at: datetime = Field(..., description="Payment expiration time")
    fee_total_sat: int = Field(..., description="Total fee in satoshis")
    order_total_sat: int = Field(..., description="Order total in satoshis")
    invoice: str = Field(..., description="Bolt11 invoice")

class PaymentOnchain(BaseModel):
    """Model for onchain payment details."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    state: PaymentState = Field(..., description="Payment state")
    expires_at: datetime = Field(..., description="Payment expiration time")
    fee_total_sat: int = Field(..., description="Total fee in satoshis")
    order_total_sat: int = Field(..., description="Order total in satoshis")
    address: str = Field(..., description="Payment address")
    min_fee_for_0conf: int = Field(..., description="Minimum fee for 0-conf")
    min_onchain_payment_confirmations: int = Field(..., description="Minimum onchain payment confirmations")
    refund_onchain_address: Optional[str] = Field(default=None, description="Refund onchain address")

class PaymentDetails(BaseModel):
    """Model for payment details."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    bolt11: PaymentBolt11 = Field(..., description="Bolt11 payment details")
    onchain: PaymentOnchain = Field(..., description="Onchain payment details")

class ChannelDetails(BaseModel):
    """Model for channel details."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    channel_id: Optional[str] = Field(default=None, description="Channel ID")
    temporary_channel_id: Optional[str] = Field(default=None, description="Temporary channel ID")
    funded_at: Optional[datetime] = Field(default=None, description="Funding timestamp")
    funding_outpoint: Optional[str] = Field(default=None, description="Funding outpoint")
    expires_at: Optional[datetime] = Field(default=None, description="Channel expiration time")

class OrderResponse(BaseModel):
    """Complete order response model with all details."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True,
        arbitrary_types_allowed=True
    )
    
    order_id: str = Field(..., description="Order ID")
    client_pubkey: str = Field(..., description="Client public key")
    lsp_balance_sat: int = Field(..., description="LSP balance in satoshis")
    client_balance_sat: int = Field(..., description="Client balance in satoshis")
    required_channel_confirmations: int = Field(..., description="Required channel confirmations")
    funding_confirms_within_blocks: int = Field(..., description="Funding confirms within blocks")
    channel_expiry_blocks: int = Field(..., description="Channel expiry blocks")
    token: Optional[str] = Field(default="", description="Token")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Creation timestamp")
    announce_channel: bool = Field(..., description="Whether to announce channel")
    order_state: OrderState = Field(..., description="Order state")
    payment: PaymentDetails = Field(..., description="Payment details")
    channel: Optional[ChannelDetails] = Field(default=None, description="Channel details")
    asset_id: Optional[str] = Field(default=None, description="Asset ID")
    lsp_asset_amount: Optional[int] = Field(default=None, description="LSP asset amount")
    client_asset_amount: Optional[int] = Field(default=None, description="Client asset amount")

# Network Info Models
class NetworkInfoResponse(BaseModel):
    """Model for network information response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    network: str = Field(..., description="Network identifier")
    height: int = Field(..., description="Current block height")

# Address Models
class AddressResponse(BaseModel):
    """Model for address response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    address: str = Field(..., description="Onchain address")

# Peer Models
class Peer(BaseModel):
    """Model for a peer."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    pubkey: str = Field(..., description="Peer public key")

class ListPeersResponse(BaseModel):
    """Model for listing peers response."""
    
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True 
    )
    
    peers: List[Peer] = Field(..., description="List of connected peers")
