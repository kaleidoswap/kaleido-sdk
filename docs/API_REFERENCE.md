# API Reference

This document provides a comprehensive reference for all available methods in the Kaleidoswap SDK.

## Table of Contents

- [Market Operations](#market-operations)
- [Swap Operations](#swap-operations)
- [LSP Operations](#lsp-operations)
- [Node Operations](#node-operations)
- [WebSocket Operations](#websocket-operations)
- [Data Models](#data-models)

## Market Operations

### List Assets

Get all available assets for trading.

#### Python

```python
async def list_assets() -> ListAssetsResponse
```

**Returns**: `ListAssetsResponse` containing:
- `assets`: List of `Asset` objects
- `network`: Network identifier
- `response_timestamp`: Response generation timestamp

**Example**:
```python
assets = await client.list_assets()
for asset in assets.assets:
    print(f"{asset.ticker}: {asset.name}")
```

#### TypeScript

```typescript
async listAssets(): Promise<AssetResponse>
```

**Returns**: `AssetResponse` with assets array

**Example**:
```typescript
const assets = await client.listAssets();
assets.assets.forEach(asset => {
    console.log(`${asset.ticker}: ${asset.name}`);
});
```

#### Rust

```rust
async fn list_assets(&self) -> Result<AssetResponse>
```

**Returns**: `Result<AssetResponse>`

**Example**:
```rust
let assets = client.list_assets().await?;
for asset in assets.assets {
    println!("{}: {}", asset.ticker, asset.name);
}
```

### List Trading Pairs

Get all available trading pairs.

#### Python

```python
async def list_pairs() -> ListPairsResponse
```

**Returns**: `ListPairsResponse` containing:
- `pairs`: List of `TradingPair` objects

**Example**:
```python
pairs = await client.list_pairs()
for pair in pairs.pairs:
    print(f"{pair.base_asset}/{pair.quote_asset}")
```

#### TypeScript

```typescript
async listPairs(): Promise<PairResponse>
```

**Returns**: `PairResponse` with pairs array

**Example**:
```typescript
const pairs = await client.listPairs();
pairs.pairs.forEach(pair => {
    console.log(`${pair.base_asset}/${pair.quote_asset}`);
});
```

### Get Trading Pair by Assets

Find a specific trading pair by asset IDs.

#### Python

```python
async def get_pair_by_assets(base_asset: str, quote_asset: str) -> Optional[TradingPair]
```

**Parameters**:
- `base_asset`: Base asset ID
- `quote_asset`: Quote asset ID

**Returns**: `TradingPair` object or `None`

**Example**:
```python
pair = await client.get_pair_by_assets("BTC", "USDT")
if pair:
    print(f"Found pair: {pair.id}")
```

#### TypeScript

```typescript
async getPairByAssets(baseAsset: string, quoteAsset: string): Promise<TradingPair | null>
```

### Get Quote

Get a price quote for a trade.

#### Python

```python
async def get_quote(request: QuoteRequest) -> QuoteResponse
# Or convenience method:
async def get_quote(from_asset: str, to_asset: str, from_amount: int) -> QuoteResponse
```

**Parameters**:
- `from_asset`: Source asset ID
- `to_asset`: Destination asset ID  
- `from_amount`: Amount in atomic units

**Returns**: `QuoteResponse` containing:
- `rfq_id`: Request for Quote ID
- `from_asset`: Source asset ID
- `to_asset`: Destination asset ID
- `from_amount`: Source amount
- `to_amount`: Destination amount
- `price`: Human-readable price
- `fee`: Fee information
- `timestamp`: Quote generation timestamp
- `expires_at`: Quote expiration timestamp

**Example**:
```python
quote = await client.get_quote(
    from_asset="BTC",
    to_asset="USDT",
    from_amount=100000000  # 1 BTC in satoshis
)
print(f"1 BTC = {quote.to_amount} USDT")
```

#### TypeScript

```typescript
async getQuote(fromAsset: string, toAsset: string, fromAmount: number): Promise<PairQuoteResponse>
```

**Example**:
```typescript
const quote = await client.getQuote('BTC', 'USDT', 100000000);
console.log(`1 BTC = ${quote.to_amount} USDT`);
```

### Get Quote via WebSocket

Get a quote using WebSocket for real-time pricing.

#### Python

```python
async def get_quote_websocket(request: QuoteRequest) -> QuoteResponse
```

**Example**:
```python
# Connect WebSocket first
await client.connect()

quote = await client.get_quote_websocket(
    QuoteRequest(
        from_asset="BTC",
        to_asset="USDT", 
        from_amount=100000000
    )
)

await client.disconnect()
```

#### TypeScript

```typescript
async getQuoteWS(fromAsset: string, toAsset: string, fromAmount: number): Promise<PairQuoteResponse>
```

## Swap Operations

### Initialize Maker Swap

Initialize a swap as the maker (liquidity provider).

#### Python

```python
async def init_maker_swap(request: InitMakerSwapRequest) -> InitMakerSwapResponse
```

**Parameters**: `InitMakerSwapRequest` containing:
- `rfq_id`: Request for Quote ID
- `from_asset`: Source asset ID
- `to_asset`: Destination asset ID
- `from_amount`: Source amount in atomic units
- `to_amount`: Destination amount in atomic units

**Returns**: `InitMakerSwapResponse` containing:
- `payment_hash`: Payment hash
- `payment_secret`: Payment secret (optional)
- `swapstring`: Swap string for the taker

**Example**:
```python
from kaleidoswap_sdk.models import InitMakerSwapRequest

# First get a quote
quote = await client.get_quote(
    from_asset="BTC",
    to_asset="USDT",
    from_amount=100000000
)

# Initialize maker swap
swap_init = await client.init_maker_swap(
    InitMakerSwapRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset,
        to_asset=quote.to_asset,
        from_amount=quote.from_amount,
        to_amount=quote.to_amount
    )
)

print(f"Swap string: {swap_init.swapstring}")
```

#### TypeScript

```typescript
async initMakerSwap(
    rfqId: string,
    fromAsset: string, 
    toAsset: string,
    fromAmount: number,
    toAmount: number
): Promise<SwapRequest>
```

### Execute Maker Swap

Complete a maker swap after initialization.

#### Python

```python
async def execute_maker_swap(request: ExecuteMakerSwapRequest) -> ExecuteMakerSwapResponse
```

**Parameters**: `ExecuteMakerSwapRequest` containing:
- `swapstring`: Swap string from initialization
- `payment_hash`: Payment hash from initialization
- `taker_pubkey`: Taker's public key

**Example**:
```python
from kaleidoswap_sdk.models import ExecuteMakerSwapRequest

# After taker provides their pubkey
execute_result = await client.execute_maker_swap(
    ExecuteMakerSwapRequest(
        swapstring=swap_init.swapstring,
        payment_hash=swap_init.payment_hash,
        taker_pubkey="taker_pubkey_here"
    )
)
```

### Get Swap Status

Check the status of a swap by payment hash.

#### Python

```python
async def get_swap_status(request: GetSwapStatusRequest) -> GetSwapStatusResponse
```

**Parameters**: `GetSwapStatusRequest` containing:
- `payment_hash`: Payment hash from swap initialization

**Returns**: `GetSwapStatusResponse` containing:
- `swap`: `SwapStatus` object with detailed status information

**Example**:
```python
from kaleidoswap_sdk.models import GetSwapStatusRequest

status = await client.get_swap_status(
    GetSwapStatusRequest(payment_hash=swap_init.payment_hash)
)

print(f"Swap status: {status.swap.status}")
```

#### TypeScript

```typescript
async getSwapStatus(paymentHash: string): Promise<Swap>
```

### Wait for Swap Completion

Poll for swap completion with timeout.

#### Python

```python
async def wait_for_swap_completion(
    request: GetSwapStatusRequest, 
    timeout: int = 3600, 
    poll_interval: int = 5
) -> SwapStatus
```

**Parameters**:
- `request`: `GetSwapStatusRequest` with payment hash
- `timeout`: Maximum wait time in seconds (default: 3600)
- `poll_interval`: Polling interval in seconds (default: 5)

**Returns**: Final `SwapStatus`

**Example**:
```python
final_status = await client.wait_for_swap_completion(
    GetSwapStatusRequest(payment_hash=payment_hash),
    timeout=1800,  # 30 minutes
    poll_interval=10  # Check every 10 seconds
)

if final_status.status == "completed":
    print("Swap completed successfully!")
```

#### TypeScript

```typescript
async waitForSwapCompletion(
    paymentHash: string,
    timeoutSeconds: number = 300,
    pollIntervalSeconds: number = 5
): Promise<Swap>
```

### Complete Maker Swap (End-to-End)

High-level method that handles the complete maker swap flow.

#### Python

```python
async def complete_maker_swap(
    request: InitMakerSwapRequest,
    timeout: int = 3600
) -> SwapStatus
```

**Parameters**:
- `request`: `InitMakerSwapRequest` with swap details
- `timeout`: Maximum wait time for completion

**Returns**: Final `SwapStatus`

**Example**:
```python
# Complete end-to-end maker swap
final_status = await client.complete_maker_swap(
    InitMakerSwapRequest(
        rfq_id=quote.rfq_id,
        from_asset="BTC",
        to_asset="USDT", 
        from_amount=100000000,
        to_amount=quote.to_amount
    ),
    timeout=1800
)
```

### Whitelist Trade

Whitelist a trade for processing.

#### Python

```python
async def whitelist_trade(request: WhitelistTradeRequest) -> Dict[str, Any]
```

**Parameters**: `WhitelistTradeRequest` containing:
- `swapstring`: Swap string from maker

#### TypeScript

```typescript
async whitelistTrade(swapstring: string): Promise<Record<string, never>>
```

## LSP Operations

### Get LSP Information

Get Lightning Service Provider information.

#### Python

```python
async def get_lsp_info() -> GetLspInfoResponse
```

**Returns**: `GetLspInfoResponse` containing:
- `lsp_connection_url`: LSP connection URL
- `options`: `OrderOptions` with LSP configuration
- `assets`: List of supported assets

**Example**:
```python
lsp_info = await client.get_lsp_info()
print(f"LSP URL: {lsp_info.lsp_connection_url}")
print(f"Supported assets: {len(lsp_info.assets)}")
```

#### TypeScript

```typescript
async getLspInfo(): Promise<any>
```

### Get LSP Connection URL

Get the LSP connection URL directly.

#### Python

```python
async def get_lsp_connection_url() -> str
```

#### TypeScript

```typescript
async getLspConnectionUrl(): Promise<any>
```

### Get LSP Network Information

Get network information from the LSP.

#### Python

```python
async def get_lsp_network_info() -> NetworkInfoResponse
```

**Returns**: `NetworkInfoResponse` containing:
- `network`: Network identifier
- `height`: Current block height

#### TypeScript

```typescript
async getLspNetworkInfo(): Promise<any>
```

### Create Order

Create a new order with the LSP.

#### Python

```python
async def create_order(request: CreateOrderRequest) -> OrderResponse
```

**Parameters**: `CreateOrderRequest` containing:
- `client_pubkey`: Client's public key
- `lsp_balance_sat`: LSP balance in satoshis
- `client_balance_sat`: Client balance in satoshis
- `required_channel_confirmations`: Required confirmations
- `funding_confirms_within_blocks`: Funding confirmation blocks
- `channel_expiry_blocks`: Channel expiry in blocks
- `refund_onchain_address`: Refund address
- `announce_channel`: Whether to announce channel
- `asset_id`: Asset ID (optional)
- `lsp_asset_amount`: LSP asset amount (optional)
- `client_asset_amount`: Client asset amount (optional)

**Returns**: `OrderResponse` with complete order details

**Example**:
```python
from kaleidoswap_sdk.models import CreateOrderRequest

order = await client.create_order(
    CreateOrderRequest(
        client_pubkey="your_pubkey",
        lsp_balance_sat=1000000,
        client_balance_sat=500000,
        required_channel_confirmations=3,
        funding_confirms_within_blocks=144,
        channel_expiry_blocks=2016,
        refund_onchain_address="your_address",
        announce_channel=True
    )
)

print(f"Order ID: {order.order_id}")
```

#### TypeScript

```typescript
async createOrder(order: any): Promise<any>
```

### Get Order

Retrieve an existing order by ID.

#### Python

```python
async def get_order(request: GetOrderRequest) -> OrderResponse
```

**Parameters**: `GetOrderRequest` containing:
- `order_id`: Order ID

#### TypeScript

```typescript
async getOrder(orderId: string): Promise<any>
```

## Node Operations

### Get Node Information

Get information about the connected node.

#### Python

```python
async def get_node_info() -> NodeInfoResponse
```

**Returns**: `NodeInfoResponse` containing:
- `pubkey`: Node public key
- `num_channels`: Number of channels
- `num_usable_channels`: Number of usable channels
- `local_balance_sat`: Local balance in satoshis
- `num_peers`: Number of connected peers
- Network and capacity information

**Example**:
```python
node_info = await client.get_node_info()
print(f"Node pubkey: {node_info.pubkey}")
print(f"Channels: {node_info.num_channels}")
print(f"Balance: {node_info.local_balance_sat} sats")
```

#### TypeScript

```typescript
async getNodeInfo(): Promise<{ pubkey: string }>
```

### Get Node Public Key

Get just the node's public key.

#### Python

```python
async def get_node_pubkey() -> str
```

#### TypeScript

```typescript
async getNodePubkey(): Promise<string>
```

### Connect Peer

Connect to a Lightning Network peer.

#### Python

```python
async def connect_peer(request: ConnectPeerRequest) -> Dict[str, Any]
```

**Parameters**: `ConnectPeerRequest` containing:
- `peer_pubkey_and_addr`: Peer public key and address

**Example**:
```python
from kaleidoswap_sdk.models import ConnectPeerRequest

result = await client.connect_peer(
    ConnectPeerRequest(
        peer_pubkey_and_addr="pubkey@host:port"
    )
)
```

#### TypeScript

```typescript
async connectPeer(connectionUrl: string): Promise<any>
```

### List Peers

Get list of connected peers.

#### Python

```python
async def list_peers() -> ListPeersResponse
```

**Returns**: `ListPeersResponse` containing:
- `peers`: List of `Peer` objects

#### TypeScript

```typescript
async listPeers(): Promise<any>
```

### Get Onchain Address

Get a new onchain address.

#### Python

```python
async def get_onchain_address() -> AddressResponse
```

**Returns**: `AddressResponse` containing:
- `address`: Onchain address

#### TypeScript

```typescript
async getOnchainAddress(): Promise<any>
```

### Get Asset Metadata

Get metadata for a specific asset.

#### Python

```python
async def get_asset_metadata(request: GetAssetMetadataRequest) -> AssetMetadataResponse
```

**Parameters**: `GetAssetMetadataRequest` containing:
- `asset_id`: Asset ID

**Returns**: `AssetMetadataResponse` containing asset details

#### TypeScript

```typescript
async getAssetMetadata(assetId: string): Promise<any>
```

## WebSocket Operations

### Connect to WebSocket

Establish WebSocket connection for real-time updates.

#### Python

```python
async def connect() -> None
```

**Example**:
```python
await client.connect()
print("WebSocket connected")
```

### Disconnect from WebSocket

Close WebSocket connection.

#### Python

```python
async def disconnect() -> None
```

### Register Event Handlers

Register handlers for WebSocket events.

#### Python

```python
def on(action: str, handler: Callable) -> None
```

**Parameters**:
- `action`: Event action to handle
- `handler`: Async function to handle the event

**Example**:
```python
async def handle_price_update(data):
    print(f"Price update: {data}")

client.on("price_update", handle_price_update)
```

## Data Models

### Asset

```python
class Asset:
    asset_id: str           # Unique asset identifier  
    ticker: str             # Trading symbol
    name: str               # Display name
    precision: int          # Decimal places
    issued_supply: int      # Total supply
    is_active: bool         # Active for trading
    timestamp_added: int    # Addition timestamp
    asset_iface: str        # Asset interface
    details: str            # Asset details
    balance: Dict[str, int] # Balance information
    media: Dict[str, str]   # Media information
```

### TradingPair

```python
class TradingPair:
    id: str                    # Unique pair identifier
    base_asset: str            # Base asset ticker
    base_asset_id: str         # Base asset ID
    quote_asset: str           # Quote asset ticker  
    quote_asset_id: str        # Quote asset ID
    is_active: bool            # Active for trading
    min_base_order_size: int   # Minimum base order size
    max_base_order_size: int   # Maximum base order size
    min_quote_order_size: int  # Minimum quote order size
    max_quote_order_size: int  # Maximum quote order size
    base_precision: int        # Base asset precision
    quote_precision: int       # Quote asset precision
```

### QuoteResponse

```python
class QuoteResponse:
    rfq_id: str           # Request for Quote ID
    from_asset: str       # Source asset ID
    to_asset: str         # Destination asset ID
    from_amount: int      # Source amount (atomic)
    to_amount: int        # Destination amount (atomic)
    price: float          # Human-readable price
    fee: Dict[str, Any]   # Fee information
    timestamp: int        # Quote generation timestamp
    expires_at: int       # Quote expiration timestamp
```

### SwapStatus

```python
class SwapStatus:
    qty_from: int           # Source quantity
    qty_to: int             # Destination quantity
    from_asset: str         # Source asset ID
    to_asset: str           # Destination asset ID
    payment_hash: str       # Payment hash
    status: str             # Swap status
    requested_at: int       # Request timestamp
    initiated_at: int       # Initiation timestamp
    expires_at: int         # Expiration timestamp
    completed_at: int       # Completion timestamp
```

### NodeInfoResponse

```python
class NodeInfoResponse:
    pubkey: str                         # Node public key
    num_channels: int                   # Number of channels
    num_usable_channels: int            # Usable channels
    local_balance_sat: int              # Local balance (sats)
    eventual_close_fees_sat: int        # Close fees (sats)
    pending_outbound_payments_sat: int  # Pending payments (sats)
    num_peers: int                      # Number of peers
    account_xpub_vanilla: str           # Vanilla account xpub
    account_xpub_colored: str           # Colored account xpub
    max_media_upload_size_mb: int       # Max media size (MB)
    rgb_htlc_min_msat: int             # Min RGB HTLC (msats)
    rgb_channel_capacity_min_sat: int   # Min RGB capacity (sats)
    channel_capacity_min_sat: int       # Min capacity (sats)
    channel_capacity_max_sat: int       # Max capacity (sats)
    channel_asset_min_amount: int       # Min asset amount
    channel_asset_max_amount: int       # Max asset amount
    network_nodes: int                  # Network nodes
    network_channels: int               # Network channels
``` 