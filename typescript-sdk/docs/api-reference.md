# API Reference

This document provides a reference for the main SDK types and interfaces.

## Client Types

### KaleidoClient

The main client for interacting with the Kaleidoswap API.

```typescript
interface KaleidoClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

const client = KaleidoClient.create(options);
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `maker` | `MakerApi` | Access to maker/swap endpoints |
| `node` | `NodeApi` | Access to node management endpoints |

---

## Asset Types

### Asset

Represents a tradeable asset.

```typescript
interface Asset {
  asset_id: string;      // Unique identifier
  ticker: string;        // Display symbol (e.g., "BTC")
  name: string;          // Full name (e.g., "Bitcoin")
  precision: number;     // Decimal places (8 for BTC)
}
```

### TradableAsset

Extended asset information from trading pairs.

```typescript
interface TradableAsset {
  asset_id: string;
  ticker: string;
  name: string;
  precision: number;
  protocol_ids: Record<string, string>;  // Protocol-specific IDs
}
```

---

## Trading Pair Types

### TradingPair

Represents a trading pair with routing information.

```typescript
interface TradingPair {
  base: TradableAsset;           // Base asset
  quote: TradableAsset;          // Quote asset
  routes?: TradingRoute[];       // Available trading routes
  endpoints?: TradingEndpoints;  // Min/max amounts
  is_active?: boolean;           // Pair availability
}
```

### TradingRoute

Available layer-to-layer route for a trading pair.

```typescript
interface TradingRoute {
  from_layer: Layer;
  to_layer: Layer;
}
```

### TradingEndpoints

Trading limits for a pair.

```typescript
interface TradingEndpoints {
  min_amount?: number;  // Minimum trade amount
  max_amount?: number;  // Maximum trade amount
}
```

---

## Layer Types

### Layer

Network layer for asset transfers.

```typescript
type Layer = 
  | 'BTC_L1'    // Bitcoin mainchain
  | 'BTC_LN'    // Bitcoin Lightning Network
  | 'RGB_L1'    // RGB on Bitcoin L1
  | 'RGB_LN';   // RGB on Lightning Network
```

### Layer Usage Guide

| Layer | Description | Use Case |
|-------|-------------|----------|
| `BTC_L1` | Bitcoin mainchain | Large amounts, long settlement |
| `BTC_LN` | Lightning Network BTC | Fast, small-medium amounts |
| `RGB_L1` | RGB assets on L1 | Token transfers on-chain |
| `RGB_LN` | RGB assets on LN | Fast token transfers |

---

## Quote Types

### QuoteRequest

Request body for getting a swap quote.

```typescript
interface QuoteRequest {
  from_asset: SwapLeg;
  to_asset: SwapLeg;
}
```

### SwapLeg

One side of a swap (either from or to).

```typescript
interface SwapLeg {
  asset_id: string;
  layer: Layer;
  amount?: number;        // Required for from_asset
  ticker?: string;        // Optional display ticker
  name?: string;          // Asset name
  precision?: number;     // Decimal precision
}
```

### Quote

Response from quote request.

```typescript
interface Quote {
  rfq_id: string;              // Request for quote ID
  from_asset: SwapLegResponse;
  to_asset: SwapLegResponse;
  price: number;               // Exchange rate
  expires_at: string;          // ISO timestamp
}
```

### SwapLegResponse

Quote response leg with calculated amounts.

```typescript
interface SwapLegResponse {
  asset_id: string;
  ticker: string;
  layer: Layer;
  amount: number;
}
```

---

## Order Types

### SwapOrderRequest

Request to create a swap order.

```typescript
interface SwapOrderRequest {
  rfq_id: string;                    // From quote response
  from_asset: SwapLegFull;
  to_asset: SwapLegFull;
  receiver_address: ReceiverAddress;
  min_onchain_conf?: number;         // Default: 1
}
```

### SwapLegFull

Full swap leg with all asset details.

```typescript
interface SwapLegFull {
  asset_id: string;
  name: string;
  ticker: string;
  layer: Layer;
  amount: number;
  precision: number;
}
```

### ReceiverAddress

Address to receive the swap output.

```typescript
interface ReceiverAddress {
  address: string;
  format: ReceiverAddressFormat;
}

type ReceiverAddressFormat = 
  | 'RGB_INVOICE'
  | 'BITCOIN_ADDRESS'
  | 'LIGHTNING_INVOICE';
```

### SwapOrder

Created swap order.

```typescript
interface SwapOrder {
  id: string;
  status: SwapStatus;
  from_asset: SwapLegFull;
  to_asset: SwapLegFull;
  created_at: string;
  updated_at: string;
}

type SwapStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';
```

---

## Utility Types

### AssetPairMapper

Helper for asset and pair lookups.

```typescript
class AssetPairMapper {
  constructor(pairsResponse: { pairs: TradingPair[] });
  
  findByTicker(ticker: string): TradableAsset | undefined;
  findByAssetId(assetId: string): TradableAsset | undefined;
  canTrade(baseId: string, quoteId: string): boolean;
  canTradeByTicker(baseTicker: string, quoteTicker: string): boolean;
  getTradingPartners(assetId: string): TradableAsset[];
  findPairByTickers(baseTicker: string, quoteTicker: string): TradingPair | undefined;
  getAllAssets(): TradableAsset[];
  getAllPairs(): TradingPair[];
}
```

### PrecisionHandler

Converts between display and raw amounts.

```typescript
class PrecisionHandler {
  constructor(assets: TradableAsset[]);
  
  toRawAmount(displayAmount: number, assetId: string): number;
  toDisplayAmount(rawAmount: number, assetId: string): number;
  getPrecision(assetId: string): number;
  validateOrderSize(amount: number, asset: TradableAsset): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  rawAmount: number;
  error?: string;
}
```

---

## Error Types

### Error Hierarchy

```
KaleidoError (base)
├── APIError
│   ├── ValidationError (4xx)
│   ├── NotFoundError (404)
│   ├── RateLimitError (429)
│   └── ServerError (5xx)
├── NetworkError
├── QuoteExpiredError
├── WebSocketError
└── TimeoutError
```

### KaleidoError

Base error class.

```typescript
class KaleidoError extends Error {
  code: string;
  originalError?: unknown;
}
```

### APIError

HTTP API errors.

```typescript
class APIError extends KaleidoError {
  statusCode: number;
  endpoint: string;
  requestId?: string;
  
  isRetryable(): boolean;
}
```

### QuoteExpiredError

Thrown when using an expired quote.

```typescript
class QuoteExpiredError extends KaleidoError {
  rfqId: string;
  expiredAt: Date;
}
```

---

## WebSocket Types

### StreamQuoteOptions

Options for quote streaming.

```typescript
interface StreamQuoteOptions {
  preferredFromLayer?: Layer;
  preferredToLayer?: Layer;
}
```

### QuoteCallback

Callback for streamed quotes.

```typescript
type QuoteCallback = (quote: StreamedQuote) => void;

interface StreamedQuote {
  price: number;
  from_amount: number;
  to_amount: number;
  expires_at: string;
}
```

---

## Wait Options

### WaitForSwapOptions

Options for `waitForSwapCompletion()`.

```typescript
interface WaitForSwapOptions {
  timeout?: number;           // Max wait time (ms)
  pollInterval?: number;      // Check frequency (ms)
  onStatusUpdate?: (status: SwapStatus) => void;
}
```
