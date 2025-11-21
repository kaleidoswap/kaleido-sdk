# Kaleidoswap SDK Unification Proposal

## Executive Summary

This document outlines a comprehensive plan to unify the Kaleidoswap SDK interface across TypeScript, Python, and Rust, while significantly improving developer experience through intuitive convenience methods.

**Current State:**
- TypeScript SDK: ~50+ methods, most feature-complete
- Python SDK: ~50+ methods, similar to TypeScript
- Rust SDK: 18 methods, significantly lacking

**Goals:**
1. Achieve feature parity across all three languages
2. Standardize method names and patterns
3. Add high-level convenience methods for common workflows
4. Improve developer experience with intuitive APIs
5. Maintain backward compatibility where possible

---

## 1. Current State Analysis

### 1.1 Feature Comparison Matrix

| Feature Category | TypeScript | Python | Rust | Priority |
|-----------------|------------|--------|------|----------|
| **Core Trading** |
| Get quotes (HTTP) | ✅ `quoteRequest` | ✅ `get_quote` | ✅ `get_quote` | HIGH |
| Get quotes (WebSocket) | ✅ `quoteRequestWS` | ✅ `get_quote_websocket` | ❌ | HIGH |
| List assets | ✅ `assetList` | ✅ `list_assets` | ✅ `list_assets` | HIGH |
| List pairs | ✅ `pairList` | ✅ `list_pairs` | ✅ `list_pairs` | HIGH |
| **Atomic Swaps** |
| Init maker swap | ✅ `initMakerSwap` | ✅ `init_maker_swap` | ✅ `init_maker_swap` | HIGH |
| Execute maker swap | ✅ `executeMakerSwap` | ✅ `execute_maker_swap` | ✅ `execute_maker_swap` | HIGH |
| Whitelist trade | ✅ `whitelistTrade` | ✅ `whitelist_trade` | ✅ `whitelist_trade` | HIGH |
| Get swap status | ✅ `atomicSwapStatus` | ✅ `get_swap_status` | ✅ `get_swap_status` | HIGH |
| Wait for completion | ✅ `waitForSwapCompletion` | ✅ `wait_for_swap_completion` | ❌ | HIGH |
| Complete swap (one call) | ❌ | ✅ `complete_maker_swap` | ❌ | HIGH |
| **Swap Orders** |
| Create order | ✅ `createOrder` | ✅ `create_swap_order` | ❌ | MEDIUM |
| Order status | ✅ `swapOrderStatus` | ✅ `get_swap_order_status` | ❌ | MEDIUM |
| Order history | ❌ | ✅ `get_order_history` | ❌ | MEDIUM |
| Order analytics | ✅ `swapOrderAnalytic` | ✅ `get_order_analytics` | ❌ | LOW |
| **LSP Operations** |
| Get LSP info | ✅ `getLspInfo` | ✅ `get_lsp_info` | ❌ | MEDIUM |
| Get connection URL | ✅ `getLspConnectionUrl` | ✅ `get_lsp_connection_url` | ❌ | MEDIUM |
| Get network info | ✅ `getLspNetworkInfo` | ✅ `get_lsp_network_info` | ❌ | MEDIUM |
| **Node Operations** |
| Get node info | ✅ `getNodeInfo` | ✅ `get_node_info` | ✅ `get_node_info` | HIGH |
| Get node pubkey | ✅ `getNodePubkey` | ✅ `get_node_pubkey` | ✅ `get_node_pubkey` | HIGH |
| Init node | ✅ `initNode` | ✅ `init_wallet` | ❌ | MEDIUM |
| Unlock node | ✅ `unlockNode` | ✅ `unlock_wallet` | ❌ | MEDIUM |
| Lock node | ✅ `lockNode` | ❌ | ❌ | LOW |
| Backup node | ✅ `backupNode` | ✅ `backup_wallet` | ❌ | MEDIUM |
| Restore node | ✅ `restoreNode` | ✅ `restore_wallet` | ❌ | MEDIUM |
| **Channel Management** |
| List channels | ✅ `listChannels` | ✅ `list_channels` | ❌ | MEDIUM |
| Open channel | ✅ `openChannel` | ✅ `open_channel` | ❌ | MEDIUM |
| Close channel | ✅ `closeChannel` | ✅ `close_channel` | ❌ | MEDIUM |
| **Payment Operations** |
| Send payment | ✅ `sendPayment` | ✅ `send_payment` | ❌ | MEDIUM |
| List payments | ✅ `listPayments` | ✅ `list_payments` | ❌ | MEDIUM |
| Get payment | ✅ `getPayment` | ✅ `get_payment` | ❌ | MEDIUM |
| Keysend | ✅ `keysend` | ✅ `keysend` | ❌ | MEDIUM |
| **Invoice Operations** |
| Create LN invoice | ✅ `createLNInvoice` | ✅ `generate_ln_invoice` | ❌ | MEDIUM |
| Decode LN invoice | ✅ `decodeLNInvoice` | ✅ `decode_ln_invoice` | ❌ | MEDIUM |
| Get invoice status | ✅ `getInvoiceStatus` | ✅ `get_invoice_status` | ❌ | MEDIUM |
| **RGB Operations** |
| List RGB assets | ✅ `listAssets` | ✅ `list_node_assets` | ❌ | MEDIUM |
| Get asset balance | ✅ `getAssetBalance` | ✅ `get_asset_balance` | ❌ | MEDIUM |
| Send RGB asset | ✅ `sendAsset` | ✅ `send_asset` | ❌ | MEDIUM |
| Issue NIA asset | ✅ `issueAssetNIA` | ✅ `issue_asset_nia` | ❌ | LOW |
| Create RGB invoice | ✅ `createRgbInvoice` | ✅ `rgb_invoice` | ❌ | MEDIUM |
| Decode RGB invoice | ✅ `decodeRgbInvoice` | ✅ `decode_rgb_invoice` | ❌ | MEDIUM |
| **Bitcoin Operations** |
| Get address | ✅ `getAddress` | ✅ `get_onchain_address` | ❌ | MEDIUM |
| Get BTC balance | ✅ `getBtcBalance` | ✅ `get_btc_balance` | ❌ | MEDIUM |
| Send BTC | ✅ `sendBtc` | ✅ `send_btc` | ❌ | MEDIUM |
| Estimate fee | ✅ `estimateFee` | ✅ `estimate_fee` | ❌ | MEDIUM |
| **Utilities** |
| Precision handler | ✅ TypeScript only | ❌ | ❌ | HIGH |
| Asset mapper | ✅ TypeScript only | ❌ | ❌ | HIGH |
| Retry utility | ✅ Built-in | ❌ | ✅ Built-in | HIGH |

### 1.2 Method Naming Inconsistencies

| Operation | TypeScript | Python | Rust | Proposed Unified |
|-----------|------------|--------|------|------------------|
| Get quote | `quoteRequest` | `get_quote` | `get_quote` | `getQuote` / `get_quote` |
| Get quote (WS) | `quoteRequestWS` | `get_quote_websocket` | N/A | `getQuoteWebSocket` / `get_quote_websocket` |
| List assets | `assetList` | `list_assets` | `list_assets` | `listAssets` / `list_assets` |
| List pairs | `pairList` | `list_pairs` | `list_pairs` | `listPairs` / `list_pairs` |
| Init maker | `initMakerSwap` | `init_maker_swap` | `init_maker_swap` | `initMakerSwap` / `init_maker_swap` |
| Execute maker | `executeMakerSwap` | `execute_maker_swap` | `execute_maker_swap` | `executeMakerSwap` / `execute_maker_swap` |
| Swap status | `atomicSwapStatus` | `get_swap_status` | `get_swap_status` | `getSwapStatus` / `get_swap_status` |
| Node pubkey | `getNodePubkey` | `get_node_pubkey` | `get_node_pubkey` | ✅ Consistent |

### 1.3 Developer Experience Pain Points

#### Current Workflow (Too Complex)
```typescript
// TypeScript - Getting a quote by ticker requires too much boilerplate
const client = new KaleidoClient({ baseUrl: API_URL });
const pairs = await client.pairList();
const assetMapper = createAssetPairMapper(pairs);
const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());

const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');
const validation = precisionHandler.validateOrderSize(10000, usdt);

const quote = await client.quoteRequest(
  btc.asset_id,
  usdt.asset_id,
  validation.asset_amount
);
```

#### Desired Workflow (Simplified)
```typescript
// Much simpler!
const client = new KaleidoClient({ baseUrl: API_URL });

const quote = await client.getQuoteByPair("BTC/USDT", { fromAmount: 10000 });
// or
const quote = await client.getQuoteByPair("BTC/USDT", { toAmount: 5000 });
```

---

## 2. Proposed Unified Interface

### 2.1 Core Principles

1. **Naming Convention**: Use language idioms (camelCase for TS, snake_case for Python/Rust)
2. **Method Parity**: All three SDKs should expose the same functionality
3. **Progressive Disclosure**: Simple methods for common use cases, detailed methods for advanced usage
4. **Type Safety**: Leverage each language's type system
5. **Async by Default**: All I/O operations should be async

### 2.2 Unified Method Categories

#### A. High-Level Convenience Methods (NEW)

These methods should be added to ALL three SDKs:

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getQuoteByPair` / `get_quote_by_pair` | `ticker: string, amount: number, side?: 'from'\|'to'` | Get quote using human-readable ticker (e.g., "BTC/USDT") |
| `getQuoteByAssets` / `get_quote_by_assets` | `from: string, to: string, amount: number, side?: 'from'\|'to'` | Get quote using asset symbols |
| `executeSwap` / `execute_swap` | `quote: Quote, options?: SwapOptions` | Complete atomic swap in one call |
| `executeSwapByPair` / `execute_swap_by_pair` | `ticker: string, amount: number, options?: SwapOptions` | Get quote and execute swap in one call |
| `createSwapOrder` / `create_swap_order` | `ticker: string, amount: number, options?: OrderOptions` | Create swap order using ticker |
| `getSwapStatus` / `get_swap_status` | `swapId: string` | Get swap status (unified method name) |
| `waitForSwap` / `wait_for_swap` | `swapId: string, timeout?: number` | Wait for swap completion |
| `getAssetByTicker` / `get_asset_by_ticker` | `ticker: string` | Find asset by ticker symbol |
| `getAssetById` / `get_asset_by_id` | `assetId: string` | Find asset by ID |
| `getPairByTicker` / `get_pair_by_ticker` | `ticker: string` | Find pair by ticker (e.g., "BTC/USDT") |
| `validateAmount` / `validate_amount` | `amount: number, asset: string` | Validate amount against min/max limits |
| `convertAmount` / `convert_amount` | `amount: number, from: string, to: 'raw'\|'display'` | Convert between raw amount and display amount |

#### B. Core Trading Methods (Standardized)

| Unified Name | TypeScript | Python | Rust | Notes |
|--------------|------------|--------|------|-------|
| `getQuote` / `get_quote` | `quoteRequest` | `get_quote` | `get_quote` | Rename TS |
| `getQuoteWebSocket` / `get_quote_websocket` | `quoteRequestWS` | `get_quote_websocket` | Add to Rust | Rename TS |
| `listAssets` / `list_assets` | `assetList` | `list_assets` | `list_assets` | Rename TS |
| `listPairs` / `list_pairs` | `pairList` | `list_pairs` | `list_pairs` | Rename TS |

#### C. Atomic Swap Methods (Standardized)

| Unified Name | Status |
|--------------|--------|
| `initMakerSwap` / `init_maker_swap` | ✅ Consistent |
| `executeMakerSwap` / `execute_maker_swap` | ✅ Consistent |
| `whitelistTrade` / `whitelist_trade` | ✅ Consistent |
| `getSwapStatus` / `get_swap_status` | Rename TS: `atomicSwapStatus` → `getSwapStatus` |
| `waitForSwapCompletion` / `wait_for_swap_completion` | Add to Rust |
| `completeSwap` / `complete_swap` | Add to TS/Rust (exists in Python) |

---

## 3. Detailed Recommendations by Language

### 3.1 TypeScript SDK Changes

#### High Priority (Core Interface)

**1. Rename methods for consistency:**
```typescript
// OLD → NEW
quoteRequest → getQuote
quoteRequestWS → getQuoteWebSocket
assetList → listAssets
pairList → listPairs
atomicSwapStatus → getSwapStatus
swapOrderStatus → getSwapOrderStatus
swapOrderAnalytic → getSwapOrderAnalytics
```

**2. Add high-level convenience methods:**
```typescript
class KaleidoClient {
  // Get quote by ticker pair (e.g., "BTC/USDT")
  async getQuoteByPair(
    ticker: string,
    options: {
      fromAmount?: number;
      toAmount?: number;
    }
  ): Promise<Quote>

  // Get quote by asset symbols
  async getQuoteByAssets(
    fromAsset: string,
    toAsset: string,
    options: {
      fromAmount?: number;
      toAmount?: number;
    }
  ): Promise<Quote>

  // Execute complete atomic swap in one call
  async executeSwap(
    quote: Quote,
    options?: {
      timeout?: number;
      pollInterval?: number;
    }
  ): Promise<SwapResult>

  // Get quote and execute swap in one call
  async executeSwapByPair(
    ticker: string,
    amount: number,
    options?: {
      side?: 'from' | 'to';
      timeout?: number;
    }
  ): Promise<SwapResult>

  // Create swap order using ticker
  async createSwapOrderByPair(
    ticker: string,
    amount: number,
    options: {
      fromType: SwapSettlement;
      toType: SwapSettlement;
      side?: 'from' | 'to';
      minOnchainConf?: number;
      destBolt11?: string;
      destRgbInvoice?: string;
      destOnchainAddress?: string;
      refundAddress?: string;
    }
  ): Promise<SwapOrder>

  // Find asset by ticker
  async getAssetByTicker(ticker: string): Promise<Asset>

  // Find asset by ID
  async getAssetById(assetId: string): Promise<Asset>

  // Find pair by ticker
  async getPairByTicker(ticker: string): Promise<TradingPair>

  // Validate amount for asset
  async validateAmount(
    amount: number,
    asset: string
  ): Promise<ValidationResult>

  // Convert between raw amount and display amount
  convertAmount(
    amount: number,
    asset: Asset,
    to: 'raw' | 'display'
  ): number
}
```

**3. Integrate utilities into main client:**
```typescript
// Instead of separate factory functions, integrate into client
class KaleidoClient {
  private assetMapper?: AssetPairMapper;
  private precisionHandler?: PrecisionHandler;

  // Auto-initialize helpers on first use
  private async ensureHelpersInitialized() {
    if (!this.assetMapper) {
      const pairs = await this.listPairs();
      this.assetMapper = createAssetPairMapper(pairs);
      this.precisionHandler = createPrecisionHandler(
        this.assetMapper.getAllAssets()
      );
    }
  }

  // Public methods use helpers internally
  async getQuoteByPair(ticker: string, options: any) {
    await this.ensureHelpersInitialized();
    const pair = this.assetMapper!.findByTicker(ticker);
    // ... implementation
  }
}
```

**4. Add builder pattern for complex operations:**
```typescript
// Fluent API for swap operations
const result = await client.swap()
  .from('BTC')
  .to('USDT')
  .amount(1.5)
  .execute();

// Or using ticker
const result = await client.swap()
  .pair('BTC/USDT')
  .fromAmount(10000)
  .execute();
```

#### Medium Priority

**5. Add backward compatibility aliases:**
```typescript
// Maintain old names as deprecated aliases
/** @deprecated Use getQuote instead */
async quoteRequest(...args: any[]) {
  return this.getQuote(...args);
}
```

**6. Improve error messages:**
```typescript
// Add helpful error messages for common mistakes
if (!ticker.includes('/')) {
  throw new ValidationError(
    `Invalid ticker format: "${ticker}". Expected format: "BASE/QUOTE" (e.g., "BTC/USDT")`
  );
}
```

### 3.2 Python SDK Changes

#### High Priority

**1. Add high-level convenience methods:**
```python
class KaleidoClient:
    async def get_quote_by_pair(
        self,
        ticker: str,
        *,
        from_amount: Optional[float] = None,
        to_amount: Optional[float] = None
    ) -> QuoteResponse:
        """Get quote using human-readable ticker pair.

        Args:
            ticker: Trading pair ticker (e.g., "BTC/USDT")
            from_amount: Amount of from asset (mutually exclusive with to_amount)
            to_amount: Amount of to asset (mutually exclusive with from_amount)

        Example:
            quote = await client.get_quote_by_pair("BTC/USDT", from_amount=10000)
        """
        pass

    async def get_quote_by_assets(
        self,
        from_asset: str,
        to_asset: str,
        *,
        from_amount: Optional[float] = None,
        to_amount: Optional[float] = None
    ) -> QuoteResponse:
        """Get quote using asset symbols."""
        pass

    async def execute_swap(
        self,
        quote: QuoteResponse,
        *,
        timeout: int = 3600,
        poll_interval: int = 5
    ) -> SwapStatus:
        """Execute complete atomic swap from quote in one call."""
        pass

    async def execute_swap_by_pair(
        self,
        ticker: str,
        amount: float,
        *,
        side: Literal["from", "to"] = "from",
        timeout: int = 3600
    ) -> SwapStatus:
        """Get quote and execute swap in one call."""
        pass

    async def create_swap_order_by_pair(
        self,
        ticker: str,
        amount: float,
        *,
        from_type: SwapSettlement,
        to_type: SwapSettlement,
        side: Literal["from", "to"] = "from",
        **options
    ) -> CreateSwapOrderResponse:
        """Create swap order using ticker."""
        pass

    async def get_asset_by_ticker(self, ticker: str) -> Asset:
        """Find asset by ticker symbol."""
        pass

    async def get_asset_by_id(self, asset_id: str) -> Asset:
        """Find asset by ID."""
        pass

    async def get_pair_by_ticker(self, ticker: str) -> TradingPair:
        """Find trading pair by ticker."""
        pass

    async def validate_amount(
        self,
        amount: float,
        asset: str
    ) -> ValidationResult:
        """Validate amount against asset constraints."""
        pass

    def convert_amount(
        self,
        amount: float,
        asset: Asset,
        to: Literal["raw", "display"]
    ) -> float:
        """Convert between raw amount and display amount."""
        pass
```

**2. Add internal caching for assets/pairs:**
```python
class KaleidoClient:
    def __init__(self, ...):
        self._assets_cache: Optional[List[Asset]] = None
        self._pairs_cache: Optional[List[TradingPair]] = None
        self._cache_ttl = 300  # 5 minutes

    async def _get_cached_assets(self) -> List[Asset]:
        """Get assets with caching."""
        if self._assets_cache is None:
            response = await self.list_assets()
            self._assets_cache = response.assets
        return self._assets_cache

    async def _get_cached_pairs(self) -> List[TradingPair]:
        """Get pairs with caching."""
        if self._pairs_cache is None:
            response = await self.list_pairs()
            self._pairs_cache = response.pairs
        return self._pairs_cache
```

**3. Add builder/fluent API:**
```python
# Fluent API for swaps
result = await (
    client.swap()
    .from_asset('BTC')
    .to_asset('USDT')
    .from_amount(1.5)
    .execute()
)

# Or using ticker
result = await (
    client.swap()
    .pair('BTC/USDT')
    .from_amount(10000)
    .execute()
)
```

**4. Improve type hints:**
```python
from typing import Literal, TypedDict, Unpack

class QuoteOptions(TypedDict, total=False):
    from_amount: float
    to_amount: float

async def get_quote_by_pair(
    self,
    ticker: str,
    **options: Unpack[QuoteOptions]
) -> QuoteResponse:
    pass
```

#### Medium Priority

**5. Add validation decorators:**
```python
def validate_ticker(func):
    """Decorator to validate ticker format."""
    async def wrapper(self, ticker: str, *args, **kwargs):
        if '/' not in ticker:
            raise ValidationError(
                f"Invalid ticker format: '{ticker}'. "
                f"Expected format: 'BASE/QUOTE' (e.g., 'BTC/USDT')"
            )
        return await func(self, ticker, *args, **kwargs)
    return wrapper

@validate_ticker
async def get_quote_by_pair(self, ticker: str, **options):
    pass
```

### 3.3 Rust SDK Changes

#### Critical Priority (Feature Parity)

**1. Add all missing core functionality:**

The Rust SDK needs significant expansion. Priority order:

```rust
// Phase 1: Core Trading (CRITICAL)
impl KaleidoClient {
    // Already exists, keep as-is
    pub async fn list_assets(&self) -> Result<Vec<Asset>> { }
    pub async fn list_pairs(&self) -> Result<Vec<TradingPair>> { }
    pub async fn get_quote(&self, request: QuoteRequest) -> Result<Quote> { }

    // ADD: WebSocket quote
    pub async fn get_quote_websocket(&self, request: QuoteRequest) -> Result<Quote> { }

    // ADD: Wait for swap completion
    pub async fn wait_for_swap_completion(
        &self,
        swap_id: &str,
        timeout_secs: Option<u64>
    ) -> Result<SwapStatus> { }

    // ADD: Complete swap in one call
    pub async fn complete_swap(
        &self,
        request: InitMakerSwapRequest,
        timeout_secs: Option<u64>
    ) -> Result<SwapStatus> { }
}

// Phase 2: Swap Orders (HIGH PRIORITY)
impl KaleidoClient {
    pub async fn create_swap_order(
        &self,
        request: CreateSwapOrderRequest
    ) -> Result<SwapOrder> { }

    pub async fn get_swap_order_status(
        &self,
        order_id: &str
    ) -> Result<SwapOrderStatus> { }

    pub async fn get_order_history(
        &self,
        request: OrderHistoryRequest
    ) -> Result<OrderHistory> { }
}

// Phase 3: Node Operations (MEDIUM PRIORITY)
impl KaleidoClient {
    pub async fn init_wallet(&self, request: InitWalletRequest) -> Result<()> { }
    pub async fn unlock_wallet(&self, request: UnlockWalletRequest) -> Result<()> { }
    pub async fn backup_wallet(&self, request: BackupRequest) -> Result<()> { }
    pub async fn restore_wallet(&self, request: RestoreRequest) -> Result<()> { }
}

// Phase 4: Channel Management (MEDIUM PRIORITY)
impl KaleidoClient {
    pub async fn list_channels(&self) -> Result<Vec<Channel>> { }
    pub async fn open_channel(&self, request: OpenChannelRequest) -> Result<Channel> { }
    pub async fn close_channel(&self, request: CloseChannelRequest) -> Result<()> { }
}

// Phase 5: Payment Operations (MEDIUM PRIORITY)
impl KaleidoClient {
    pub async fn send_payment(&self, request: SendPaymentRequest) -> Result<Payment> { }
    pub async fn list_payments(&self) -> Result<Vec<Payment>> { }
    pub async fn get_payment(&self, payment_hash: &str) -> Result<Payment> { }
    pub async fn keysend(&self, request: KeysendRequest) -> Result<Payment> { }
}

// Phase 6: Invoice Operations (MEDIUM PRIORITY)
impl KaleidoClient {
    pub async fn create_ln_invoice(&self, request: InvoiceRequest) -> Result<Invoice> { }
    pub async fn decode_ln_invoice(&self, invoice: &str) -> Result<DecodedInvoice> { }
    pub async fn get_invoice_status(&self, payment_hash: &str) -> Result<InvoiceStatus> { }
}

// Phase 7: RGB Operations (LOW PRIORITY)
impl KaleidoClient {
    pub async fn list_rgb_assets(&self) -> Result<Vec<RgbAsset>> { }
    pub async fn get_asset_balance(&self, asset_id: &str) -> Result<AssetBalance> { }
    pub async fn send_asset(&self, request: SendAssetRequest) -> Result<Transfer> { }
    pub async fn issue_asset_nia(&self, request: IssueNiaRequest) -> Result<Asset> { }
}

// Phase 8: Bitcoin Operations (MEDIUM PRIORITY)
impl KaleidoClient {
    pub async fn get_onchain_address(&self) -> Result<String> { }
    pub async fn get_btc_balance(&self) -> Result<BtcBalance> { }
    pub async fn send_btc(&self, request: SendBtcRequest) -> Result<Transaction> { }
    pub async fn estimate_fee(&self, request: EstimateFeeRequest) -> Result<FeeEstimate> { }
}
```

**2. Add high-level convenience methods:**
```rust
impl KaleidoClient {
    /// Get quote using human-readable ticker pair
    ///
    /// # Example
    /// ```
    /// let quote = client.get_quote_by_pair(
    ///     "BTC/USDT",
    ///     GetQuoteByPairRequest::from_amount(10000.0)
    /// ).await?;
    /// ```
    pub async fn get_quote_by_pair(
        &self,
        ticker: &str,
        request: GetQuoteByPairRequest
    ) -> Result<Quote> { }

    /// Get quote by asset symbols
    pub async fn get_quote_by_assets(
        &self,
        from_asset: &str,
        to_asset: &str,
        request: GetQuoteByAssetsRequest
    ) -> Result<Quote> { }

    /// Execute complete atomic swap from quote
    pub async fn execute_swap(
        &self,
        quote: &Quote,
        options: Option<SwapOptions>
    ) -> Result<SwapResult> { }

    /// Get quote and execute swap in one call
    pub async fn execute_swap_by_pair(
        &self,
        ticker: &str,
        amount: f64,
        side: AmountSide
    ) -> Result<SwapResult> { }

    /// Create swap order using ticker
    pub async fn create_swap_order_by_pair(
        &self,
        ticker: &str,
        request: CreateSwapOrderByPairRequest
    ) -> Result<SwapOrder> { }

    /// Find asset by ticker symbol
    pub async fn get_asset_by_ticker(&self, ticker: &str) -> Result<Asset> { }

    /// Find asset by ID
    pub async fn get_asset_by_id(&self, asset_id: &str) -> Result<Asset> { }

    /// Find pair by ticker
    pub async fn get_pair_by_ticker(&self, ticker: &str) -> Result<TradingPair> { }

    /// Validate amount for asset
    pub async fn validate_amount(
        &self,
        amount: f64,
        asset: &str
    ) -> Result<ValidationResult> { }

    /// Convert between raw amount and display amount
    pub fn convert_amount(
        &self,
        amount: f64,
        asset: &Asset,
        to: AmountUnit
    ) -> f64 { }
}

#[derive(Debug)]
pub enum GetQuoteByPairRequest {
    FromAmount(f64),
    ToAmount(f64),
}

#[derive(Debug)]
pub enum AmountSide {
    From,
    To,
}

#[derive(Debug)]
pub enum AmountUnit {
    Raw,
    Display,
}
```

**3. Add builder pattern (idiomatic Rust):**
```rust
// Builder for swap operations
let result = client
    .swap_builder()
    .from("BTC")
    .to("USDT")
    .from_amount(1.5)
    .execute()
    .await?;

// Or using ticker
let result = client
    .swap_builder()
    .pair("BTC/USDT")
    .from_amount(10000.0)
    .execute()
    .await?;

// Implementation
pub struct SwapBuilder<'a> {
    client: &'a KaleidoClient,
    from_asset: Option<String>,
    to_asset: Option<String>,
    pair: Option<String>,
    from_amount: Option<f64>,
    to_amount: Option<f64>,
    timeout: Option<Duration>,
}

impl<'a> SwapBuilder<'a> {
    pub fn from(mut self, asset: &str) -> Self {
        self.from_asset = Some(asset.to_string());
        self
    }

    pub fn to(mut self, asset: &str) -> Self {
        self.to_asset = Some(asset.to_string());
        self
    }

    pub fn pair(mut self, ticker: &str) -> Self {
        self.pair = Some(ticker.to_string());
        self
    }

    pub fn from_amount(mut self, amount: f64) -> Self {
        self.from_amount = Some(amount);
        self
    }

    pub fn to_amount(mut self, amount: f64) -> Self {
        self.to_amount = Some(amount);
        self
    }

    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }

    pub async fn execute(self) -> Result<SwapResult> {
        // Implementation
        unimplemented!()
    }
}
```

**4. Add internal caching:**
```rust
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct KaleidoClient {
    api_client: reqwest::Client,
    node_client: reqwest::Client,
    config: KaleidoConfig,

    // Add caching
    assets_cache: Arc<RwLock<Option<(Vec<Asset>, Instant)>>>,
    pairs_cache: Arc<RwLock<Option<(Vec<TradingPair>, Instant)>>>,
    cache_ttl: Duration,
}

impl KaleidoClient {
    async fn get_cached_assets(&self) -> Result<Vec<Asset>> {
        let cache = self.assets_cache.read().await;
        if let Some((assets, timestamp)) = cache.as_ref() {
            if timestamp.elapsed() < self.cache_ttl {
                return Ok(assets.clone());
            }
        }
        drop(cache);

        // Fetch and update cache
        let assets = self.list_assets().await?;
        let mut cache = self.assets_cache.write().await;
        *cache = Some((assets.clone(), Instant::now()));
        Ok(assets)
    }
}
```

---

## 4. Implementation Examples

### 4.1 TypeScript - New Convenience API

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

// Initialize client
const client = new KaleidoClient({
  baseUrl: 'https://api.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001'
});

// EXAMPLE 1: Simple quote by ticker
const quote = await client.getQuoteByPair('BTC/USDT', {
  fromAmount: 10000  // 10,000 USD worth of BTC
});

console.log(`You'll receive ${quote.toAmount} sats`);

// EXAMPLE 2: Execute complete swap in one line
const result = await client.executeSwapByPair('BTC/USDT', 10000, {
  side: 'from',
  timeout: 300
});

console.log(`Swap completed: ${result.status}`);

// EXAMPLE 3: Using builder pattern
const swapResult = await client.swap()
  .pair('BTC/USDT')
  .fromAmount(10000)
  .timeout(300)
  .execute();

// EXAMPLE 4: Validate before swapping
const validation = await client.validateAmount(10000, 'USDT');
if (!validation.valid) {
  console.error(`Invalid amount: ${validation.reason}`);
  console.log(`Min: ${validation.minAmount}, Max: ${validation.maxAmount}`);
} else {
  const quote = await client.getQuoteByPair('BTC/USDT', {
    fromAmount: validation.normalizedAmount
  });
}

// EXAMPLE 5: Create order using ticker
const order = await client.createSwapOrderByPair('BTC/USDT', 10000, {
  fromType: 'ONCHAIN',
  toType: 'LIGHTNING',
  destBolt11: 'lnbc...'
});

// EXAMPLE 6: Find assets easily
const btc = await client.getAssetByTicker('BTC');
const usdt = await client.getAssetById('rgb:asset:...');
```

### 4.2 Python - New Convenience API

```python
from kaleidoswap_sdk import KaleidoClient

# Initialize client
async with KaleidoClient(
    api_url='https://api.kaleidoswap.com',
    node_url='http://localhost:3001'
) as client:

    # EXAMPLE 1: Simple quote by ticker
    quote = await client.get_quote_by_pair('BTC/USDT', from_amount=10000)
    print(f"You'll receive {quote.to_amount} sats")

    # EXAMPLE 2: Execute complete swap in one line
    result = await client.execute_swap_by_pair(
        'BTC/USDT',
        amount=10000,
        side='from',
        timeout=300
    )
    print(f"Swap completed: {result.status}")

    # EXAMPLE 3: Using builder pattern
    result = await (
        client.swap()
        .pair('BTC/USDT')
        .from_amount(10000)
        .timeout(300)
        .execute()
    )

    # EXAMPLE 4: Validate before swapping
    validation = await client.validate_amount(10000, 'USDT')
    if not validation.valid:
        print(f"Invalid amount: {validation.reason}")
        print(f"Min: {validation.min_amount}, Max: {validation.max_amount}")
    else:
        quote = await client.get_quote_by_pair(
            'BTC/USDT',
            from_amount=validation.normalized_amount
        )

    # EXAMPLE 5: Create order using ticker
    order = await client.create_swap_order_by_pair(
        'BTC/USDT',
        amount=10000,
        from_type=SwapSettlement.ONCHAIN,
        to_type=SwapSettlement.LIGHTNING,
        dest_bolt11='lnbc...'
    )

    # EXAMPLE 6: Find assets easily
    btc = await client.get_asset_by_ticker('BTC')
    usdt = await client.get_asset_by_id('rgb:asset:...')
```

### 4.3 Rust - New Convenience API

```rust
use kaleidoswap_sdk::{KaleidoClient, KaleidoConfig, GetQuoteByPairRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client
    let config = KaleidoConfig {
        base_url: "https://api.kaleidoswap.com".to_string(),
        node_url: "http://localhost:3001".to_string(),
        api_key: None,
        retry_config: None,
        ws_config: None,
    };
    let client = KaleidoClient::new(config)?;

    // EXAMPLE 1: Simple quote by ticker
    let quote = client.get_quote_by_pair(
        "BTC/USDT",
        GetQuoteByPairRequest::FromAmount(10000.0)
    ).await?;
    println!("You'll receive {} sats", quote.to_amount);

    // EXAMPLE 2: Execute complete swap in one line
    let result = client.execute_swap_by_pair(
        "BTC/USDT",
        10000.0,
        AmountSide::From
    ).await?;
    println!("Swap completed: {:?}", result.status);

    // EXAMPLE 3: Using builder pattern
    let result = client
        .swap_builder()
        .pair("BTC/USDT")
        .from_amount(10000.0)
        .timeout(Duration::from_secs(300))
        .execute()
        .await?;

    // EXAMPLE 4: Validate before swapping
    let validation = client.validate_amount(10000.0, "USDT").await?;
    if !validation.valid {
        eprintln!("Invalid amount: {}", validation.reason);
        eprintln!("Min: {}, Max: {}", validation.min_amount, validation.max_amount);
    } else {
        let quote = client.get_quote_by_pair(
            "BTC/USDT",
            GetQuoteByPairRequest::FromAmount(validation.normalized_amount)
        ).await?;
    }

    // EXAMPLE 5: Create order using ticker
    let order = client.create_swap_order_by_pair(
        "BTC/USDT",
        CreateSwapOrderByPairRequest {
            amount: 10000.0,
            from_type: SwapSettlement::Onchain,
            to_type: SwapSettlement::Lightning,
            dest_bolt11: Some("lnbc...".to_string()),
            ..Default::default()
        }
    ).await?;

    // EXAMPLE 6: Find assets easily
    let btc = client.get_asset_by_ticker("BTC").await?;
    let usdt = client.get_asset_by_id("rgb:asset:...").await?;

    Ok(())
}
```

---

## 5. Migration Guide

### 5.1 TypeScript Migration

#### Breaking Changes
```typescript
// OLD (deprecated but still works)
const quote = await client.quoteRequest(fromAsset, toAsset, amount);
const assets = await client.assetList();
const pairs = await client.pairList();

// NEW (recommended)
const quote = await client.getQuote(fromAsset, toAsset, amount);
const assets = await client.listAssets();
const pairs = await client.listPairs();
```

#### New Simplified API
```typescript
// BEFORE: Required boilerplate
const pairs = await client.pairList();
const assetMapper = createAssetPairMapper(pairs);
const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());
const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');
const validation = precisionHandler.validateOrderSize(10000, usdt);
const quote = await client.quoteRequest(btc.asset_id, usdt.asset_id, validation.asset_amount);

// AFTER: One line
const quote = await client.getQuoteByPair('BTC/USDT', { fromAmount: 10000 });
```

### 5.2 Python Migration

#### No Breaking Changes
All existing methods remain unchanged. New convenience methods are additions only.

```python
# OLD (still works)
quote_request = QuoteRequest(from_asset=btc_id, to_asset=usdt_id, from_amount=10000)
quote = await client.get_quote(quote_request)

# NEW (simpler)
quote = await client.get_quote_by_pair('BTC/USDT', from_amount=10000)
```

### 5.3 Rust Migration

#### Significant Expansion
Most changes are additions, not breaking changes. Existing code continues to work.

```rust
// OLD (still works)
let quote = client.get_quote("pair-id", 10000.0, true).await?;

// NEW (more intuitive)
let quote = client.get_quote_by_pair(
    "BTC/USDT",
    GetQuoteByPairRequest::FromAmount(10000.0)
).await?;
```

---

## 6. Implementation Roadmap

### Phase 1: Core Unification (Weeks 1-2)
**Goal**: Standardize naming and add critical convenience methods

- [ ] **TypeScript**:
  - [ ] Rename core methods (quoteRequest → getQuote, etc.)
  - [ ] Add getQuoteByPair, getQuoteByAssets
  - [ ] Add executeSwap, executeSwapByPair
  - [ ] Add getAssetByTicker, getPairByTicker
  - [ ] Update documentation

- [ ] **Python**:
  - [ ] Add get_quote_by_pair, get_quote_by_assets
  - [ ] Add execute_swap, execute_swap_by_pair
  - [ ] Add get_asset_by_ticker, get_pair_by_ticker
  - [ ] Add internal caching for assets/pairs
  - [ ] Update documentation

- [ ] **Rust**:
  - [ ] Add get_quote_by_pair, get_quote_by_assets
  - [ ] Add execute_swap, execute_swap_by_pair
  - [ ] Add get_asset_by_ticker, get_pair_by_ticker
  - [ ] Add wait_for_swap_completion
  - [ ] Add complete_swap
  - [ ] Update documentation

### Phase 2: Feature Parity (Weeks 3-4)
**Goal**: Rust SDK catches up to TypeScript/Python

- [ ] **Rust**:
  - [ ] Add swap order methods (create, status, history)
  - [ ] Add LSP methods
  - [ ] Add node operations (init, unlock, backup, restore)
  - [ ] Add channel management
  - [ ] Add payment operations
  - [ ] Add invoice operations

### Phase 3: Enhanced DX (Weeks 5-6)
**Goal**: Improve developer experience across all SDKs

- [ ] **All SDKs**:
  - [ ] Add builder/fluent API patterns
  - [ ] Add validation helpers (validateAmount, etc.)
  - [ ] Add conversion utilities (raw amount ↔ display amount)
  - [ ] Add comprehensive examples
  - [ ] Add integration tests for new methods

### Phase 4: Advanced Features (Weeks 7-8)
**Goal**: Add advanced convenience features

- [ ] **All SDKs**:
  - [ ] Add smart retry strategies
  - [ ] Add automatic slippage handling
  - [ ] Add batch operations (multi-swap)
  - [ ] Add real-time price feeds
  - [ ] Add order book helpers

### Phase 5: Documentation & Testing (Week 9)
**Goal**: Complete documentation and testing

- [ ] **All SDKs**:
  - [ ] Complete API reference documentation
  - [ ] Write comprehensive guides
  - [ ] Add more code examples
  - [ ] Complete integration test coverage
  - [ ] Performance benchmarks

### Phase 6: Release (Week 10)
**Goal**: Coordinated release of unified SDKs

- [ ] Version bump to 1.0.0 (semver major)
- [ ] Publish to package registries (npm, PyPI, crates.io)
- [ ] Announce unified interface
- [ ] Migration guide publication
- [ ] Community feedback collection

---

## 7. Backward Compatibility Strategy

### 7.1 TypeScript
- Keep deprecated methods as aliases for 2 major versions
- Add `@deprecated` JSDoc tags with migration instructions
- Console warnings for deprecated methods in development mode
- Gradual removal: v1.0 (deprecated) → v2.0 (warning) → v3.0 (removed)

### 7.2 Python
- No breaking changes, only additions
- Use `warnings.warn()` for any future deprecations
- Follow semantic versioning strictly

### 7.3 Rust
- Most changes are additions
- Use `#[deprecated]` attribute for any future deprecations
- Follow semantic versioning strictly
- Provide clear migration path in deprecation messages

---

## 8. Testing Strategy

### 8.1 Unit Tests
Each SDK should have unit tests for:
- [ ] All convenience methods
- [ ] Ticker parsing and validation
- [ ] Amount conversion
- [ ] Asset/pair lookup
- [ ] Error handling for invalid inputs

### 8.2 Integration Tests
- [ ] End-to-end swap using getQuoteByPair + executeSwap
- [ ] Order creation using ticker
- [ ] Asset discovery methods
- [ ] Cross-language consistency tests (same input → same behavior)

### 8.3 Compatibility Tests
- [ ] Deprecated methods still work
- [ ] Old code continues functioning
- [ ] New methods produce correct results

---

## 9. Documentation Requirements

### 9.1 API Reference
- [ ] Complete method documentation with examples
- [ ] Parameter descriptions with types
- [ ] Return value documentation
- [ ] Error cases and exceptions
- [ ] Code examples for each method

### 9.2 Guides
- [ ] Quick start guide (5-minute integration)
- [ ] Common patterns and recipes
- [ ] Migration guide from old API
- [ ] Best practices
- [ ] Performance optimization tips

### 9.3 Examples
- [ ] Simple quote + swap
- [ ] Order book trading
- [ ] Channel management
- [ ] Error handling
- [ ] WebSocket usage
- [ ] Batch operations

---

## 10. Success Metrics

### 10.1 Developer Experience
- Time to first successful swap: < 5 minutes
- Lines of code for common operations: < 5 lines
- API discoverability: intuitive method names

### 10.2 Code Quality
- Test coverage: > 90%
- Type safety: 100% typed interfaces
- Documentation coverage: 100% public API

### 10.3 Performance
- No significant performance regression
- Caching reduces redundant API calls by > 50%
- WebSocket latency < 100ms

---

## 11. Open Questions & Decisions Needed

1. **Versioning**: Should we bump to v1.0.0 or v2.0.0?
   - **Recommendation**: v1.0.0 (signifies production-ready unified interface)

2. **Deprecation Timeline**: How long to support old methods?
   - **Recommendation**: 2 major versions (approx. 12 months)

3. **Ticker Format**: Support alternative formats like BTC_USDT or BTC-USDT?
   - **Recommendation**: Primary format BTC/USDT, but accept alternatives internally

4. **Caching Strategy**: How to handle cache invalidation?
   - **Recommendation**: 5-minute TTL, optional force refresh parameter

5. **Error Messages**: How detailed should validation errors be?
   - **Recommendation**: Very detailed with suggested fixes

6. **Builder API**: Required for all SDKs or optional?
   - **Recommendation**: Required for TypeScript/Python, strongly encouraged for Rust

---

## 12. Conclusion

This proposal outlines a comprehensive plan to:

1. **Unify** the interface across TypeScript, Python, and Rust SDKs
2. **Simplify** common operations with intuitive convenience methods
3. **Achieve** feature parity across all three languages
4. **Improve** developer experience significantly

### Key Improvements Summary

- **Simpler API**: `getQuoteByPair("BTC/USDT", { fromAmount: 10000 })` vs. 10+ lines of boilerplate
- **Feature Parity**: All SDKs expose the same functionality
- **Consistent Naming**: Predictable method names across languages
- **Better DX**: Builder patterns, validation helpers, smart defaults
- **Comprehensive**: Full coverage of all Kaleidoswap features

### Next Steps

1. Review and approve this proposal
2. Prioritize implementation phases
3. Assign engineering resources
4. Begin Phase 1 development
5. Set up cross-language CI/CD testing
6. Coordinate release timeline

### Estimated Timeline

- **Total Duration**: 10 weeks
- **Phase 1 (Critical)**: 2 weeks
- **Phase 2 (Parity)**: 2 weeks
- **Phase 3 (DX)**: 2 weeks
- **Phase 4 (Advanced)**: 2 weeks
- **Phase 5 (Docs)**: 1 week
- **Phase 6 (Release)**: 1 week

This unified SDK will significantly improve developer adoption and satisfaction, making Kaleidoswap the easiest Lightning/RGB swap platform to integrate with.
