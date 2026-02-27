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
await client.maker.list_assets() -> AssetsResponse
```

**Returns**: `AssetsResponse` containing:
- `assets`: List of `Asset` objects

**Example**:
```python
assets = await client.maker.list_assets()
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
await client.maker.list_pairs() -> TradingPairsResponse
```

**Returns**: `TradingPairsResponse` containing:
- `pairs`: List of `TradingPair` objects

**Example**:
```python
pairs = await client.maker.list_pairs()
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

### Get Pair Routes

Get available swap routes for a trading pair.

#### Python

```python
await client.maker.get_pair_routes(pair_ticker: str) -> list[SwapRoute]
```

**Parameters**:
- `pair_ticker`: Trading pair ticker (e.g. `"BTC/USDT"`)

**Returns**: `list[SwapRoute]` — available routes for the pair

**Example**:
```python
routes = await client.maker.get_pair_routes("BTC/USDT")
for route in routes:
    print(f"Route: {route}")
```

### Get Quote

Get a price quote for a trade.

#### Python

```python
await client.maker.get_quote(body: PairQuoteRequest) -> PairQuoteResponse
```

**Parameters**: `PairQuoteRequest` containing:
- `from_asset`: `SwapLegInput` — source asset details (asset_id, layer, amount)
- `to_asset`: `SwapLegInput` — destination asset details (asset_id, layer)

**Returns**: `PairQuoteResponse` with quote details

**Example**:
```python
from kaleidoswap_sdk import PairQuoteRequest, SwapLegInput, Layer

quote = await client.maker.get_quote(PairQuoteRequest(
    from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=100000),
    to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN),
))
print(f"Quote received: {quote}")
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

### Stream Quotes via WebSocket

Stream real-time quotes using WebSocket. See [WebSocket Operations](#websocket-operations) for setup.

#### Python

```python
ws = client.maker.enable_websocket("ws://localhost:8000/ws")
await ws.connect()
ws.on("quote_response", handle_quote)
await ws.disconnect()
```

**Example**:
```python
async def handle_quote(data):
    print(f"Quote update: {data}")

ws = client.maker.enable_websocket("ws://localhost:8000/ws")
await ws.connect()
ws.on("quote_response", handle_quote)
```

## Swap Operations

### Swap Orders

#### Create Swap Order

Create a new swap order.

##### Python

```python
await client.maker.create_swap_order(body: CreateSwapOrderRequest) -> CreateSwapOrderResponse
```

**Parameters**: `CreateSwapOrderRequest` with swap order details.

**Returns**: `CreateSwapOrderResponse`

**Example**:
```python
from kaleidoswap_sdk import CreateSwapOrderRequest

order = await client.maker.create_swap_order(CreateSwapOrderRequest(
    # ... order parameters
))
print(f"Order created: {order}")
```

#### Get Swap Order Status

Check the status of a swap order.

##### Python

```python
await client.maker.get_swap_order_status(body: SwapOrderStatusRequest) -> SwapOrderStatusResponse
```

**Parameters**: `SwapOrderStatusRequest` with order identification.

**Returns**: `SwapOrderStatusResponse`

**Example**:
```python
from kaleidoswap_sdk import SwapOrderStatusRequest

status = await client.maker.get_swap_order_status(SwapOrderStatusRequest(
    # ... order identification
))
print(f"Order status: {status}")
```

#### Get Order History

Retrieve historical swap orders with filtering.

##### Python

```python
await client.maker.get_order_history(status=..., limit=..., skip=...) -> OrderHistoryResponse
```

**Parameters**:
- `status`: Filter by order status (optional)
- `limit`: Maximum number of results (optional)
- `skip`: Number of results to skip (optional)

**Returns**: `OrderHistoryResponse`

**Example**:
```python
history = await client.maker.get_order_history(status="completed", limit=10, skip=0)
print(f"Orders: {history}")
```

#### Wait for Swap Completion

Poll for swap completion with configurable options.

##### Python

```python
await client.maker.wait_for_swap_completion(order_id, options) -> SwapOrder
```

**Parameters**:
- `order_id`: The swap order ID to monitor
- `options`: Polling options (timeout, interval, etc.)

**Returns**: `SwapOrder` — the final completed swap order

**Example**:
```python
final_order = await client.maker.wait_for_swap_completion(
    order_id="order_123",
    options={"timeout": 1800, "poll_interval": 10}
)
print(f"Swap completed: {final_order}")
```

### Atomic Swaps

#### Initialize Swap

Initialize an atomic swap.

##### Python

```python
await client.maker.init_swap(body: SwapRequest) -> SwapResponse
```

**Parameters**: `SwapRequest` with swap details.

**Returns**: `SwapResponse`

**Example**:
```python
from kaleidoswap_sdk import SwapRequest

swap = await client.maker.init_swap(SwapRequest(
    # ... swap parameters
))
print(f"Swap initialized: {swap}")
```

#### Execute Swap

Execute (confirm) an atomic swap.

##### Python

```python
await client.maker.execute_swap(body: ConfirmSwapRequest) -> ConfirmSwapResponse
```

**Parameters**: `ConfirmSwapRequest` with confirmation details.

**Returns**: `ConfirmSwapResponse`

**Example**:
```python
from kaleidoswap_sdk import ConfirmSwapRequest

result = await client.maker.execute_swap(ConfirmSwapRequest(
    # ... confirmation parameters
))
print(f"Swap executed: {result}")
```

#### Get Atomic Swap Status

Check the status of an atomic swap.

##### Python

```python
await client.maker.get_atomic_swap_status(body: SwapStatusRequest) -> SwapStatusResponse
```

**Parameters**: `SwapStatusRequest` with swap identification.

**Returns**: `SwapStatusResponse`

**Example**:
```python
from kaleidoswap_sdk import SwapStatusRequest

status = await client.maker.get_atomic_swap_status(SwapStatusRequest(
    # ... swap identification
))
print(f"Atomic swap status: {status}")
```

#### Get Swap Node Info

Get information about the swap node.

##### Python

```python
await client.maker.get_swap_node_info() -> SwapNodeInfoResponse
```

**Returns**: `SwapNodeInfoResponse`

**Example**:
```python
info = await client.maker.get_swap_node_info()
print(f"Swap node info: {info}")
```

## LSP Operations

### Get LSP Information

Get Lightning Service Provider information.

#### Python

```python
await client.maker.get_lsp_info() -> GetInfoResponseModel
```

**Returns**: `GetInfoResponseModel` with LSP configuration and supported assets.

**Example**:
```python
lsp_info = await client.maker.get_lsp_info()
print(f"LSP info: {lsp_info}")
```

#### TypeScript

```typescript
async getLspInfo(): Promise<any>
```

### Get LSP Network Information

Get network information from the LSP.

#### Python

```python
await client.maker.get_lsp_network_info() -> NetworkInfoResponse
```

**Returns**: `NetworkInfoResponse` containing:
- `network`: Network identifier
- `height`: Current block height

#### TypeScript

```typescript
async getLspNetworkInfo(): Promise<any>
```

### Create LSP Order

Create a new channel order with the LSP.

#### Python

```python
await client.maker.create_lsp_order(body: CreateOrderRequest) -> ChannelOrderResponse
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

**Returns**: `ChannelOrderResponse` with complete order details

**Example**:
```python
from kaleidoswap_sdk import CreateOrderRequest

order = await client.maker.create_lsp_order(CreateOrderRequest(
    client_pubkey="your_pubkey",
    lsp_balance_sat=1000000,
    client_balance_sat=500000,
    required_channel_confirmations=3,
    funding_confirms_within_blocks=144,
    channel_expiry_blocks=2016,
    refund_onchain_address="your_address",
    announce_channel=True,
))

print(f"Order: {order}")
```

#### TypeScript

```typescript
async createLspOrder(order: any): Promise<any>
```

### Get LSP Order

Retrieve an existing LSP order.

#### Python

```python
await client.maker.get_lsp_order(body: GetOrderRequest) -> ChannelOrderResponse
```

**Parameters**: `GetOrderRequest` with order identification.

**Returns**: `ChannelOrderResponse`

#### TypeScript

```typescript
async getLspOrder(orderId: string): Promise<any>
```

## Node Operations

### Get Node Information

Get information about the connected node.

#### Python

```python
await client.rln.get_node_info() -> NodeInfoResponse
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
node_info = await client.rln.get_node_info()
print(f"Node pubkey: {node_info.pubkey}")
print(f"Channels: {node_info.num_channels}")
print(f"Balance: {node_info.local_balance_sat} sats")
```

> **Note**: There is no separate `get_node_pubkey()` method. Use `(await client.rln.get_node_info()).pubkey` instead.

#### TypeScript

```typescript
async getNodeInfo(): Promise<{ pubkey: string }>
```

### Connect Peer

Connect to a Lightning Network peer.

#### Python

```python
await client.rln.connect_peer(body: ConnectPeerRequest)
```

**Parameters**: `ConnectPeerRequest` containing:
- `peer_pubkey_and_addr`: Peer public key and address

**Example**:
```python
from kaleidoswap_sdk import ConnectPeerRequest

await client.rln.connect_peer(ConnectPeerRequest(
    peer_pubkey_and_addr="pubkey@host:port"
))
```

#### TypeScript

```typescript
async connectPeer(connectionUrl: string): Promise<any>
```

### List Peers

Get list of connected peers.

#### Python

```python
await client.rln.list_peers() -> ListPeersResponse
```

**Returns**: `ListPeersResponse` containing:
- `peers`: List of `Peer` objects

#### TypeScript

```typescript
async listPeers(): Promise<any>
```

### Get Address

Get a new onchain address.

#### Python

```python
await client.rln.get_address() -> AddressResponse
```

**Returns**: `AddressResponse` containing:
- `address`: Onchain address

#### TypeScript

```typescript
async getAddress(): Promise<any>
```

### Get Asset Metadata

Get metadata for a specific asset.

#### Python

```python
await client.rln.get_asset_metadata(body: AssetMetadataRequest) -> AssetMetadataResponse
```

**Parameters**: `AssetMetadataRequest` containing:
- `asset_id`: Asset ID

**Returns**: `AssetMetadataResponse` containing asset details

**Example**:
```python
from kaleidoswap_sdk import AssetMetadataRequest

metadata = await client.rln.get_asset_metadata(AssetMetadataRequest(
    asset_id="BTC"
))
print(f"Asset metadata: {metadata}")
```

#### TypeScript

```typescript
async getAssetMetadata(assetId: string): Promise<any>
```

## WebSocket Operations

### Enable WebSocket

Create a WebSocket instance via the maker client.

#### Python

```python
ws = client.maker.enable_websocket(url: str)
```

**Parameters**:
- `url`: WebSocket endpoint URL (e.g. `"ws://localhost:8000/ws"`)

**Returns**: WebSocket instance with `connect()`, `disconnect()`, and `on()` methods.

### Connect to WebSocket

Establish WebSocket connection for real-time updates.

#### Python

```python
await ws.connect()
```

### Disconnect from WebSocket

Close WebSocket connection.

#### Python

```python
await ws.disconnect()
```

### Register Event Handlers

Register handlers for WebSocket events.

#### Python

```python
ws.on(action: str, handler: Callable) -> None
```

**Parameters**:
- `action`: Event action to handle (e.g. `"quote_response"`)
- `handler`: Async function to handle the event

**Example**:
```python
async def handle_quote(data):
    print(f"Quote update: {data}")

ws = client.maker.enable_websocket("ws://localhost:8000/ws")
await ws.connect()
ws.on("quote_response", handle_quote)

# When done:
await ws.disconnect()
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

### PairQuoteResponse

```python
class PairQuoteResponse:
    # Response from get_quote containing price and trade details
    ...
```

### SwapLegInput

```python
class SwapLegInput:
    asset_id: str         # Asset identifier (e.g. "BTC", "USDT")
    layer: Layer          # Network layer (e.g. Layer.BTC_LN, Layer.RGB_LN)
    amount: int           # Amount in atomic units (optional on to_asset)
```

### PairQuoteRequest

```python
class PairQuoteRequest:
    from_asset: SwapLegInput   # Source asset details
    to_asset: SwapLegInput     # Destination asset details
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