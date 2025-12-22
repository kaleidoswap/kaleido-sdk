//! Node.js bindings for the Kaleidoswap SDK using napi-rs.
//!
//! This crate provides TypeScript/JavaScript bindings using napi-rs.
//! All methods are async and return Promises in JavaScript.

use kaleidoswap_uniffi::{KaleidoClient as UniffiClient, KaleidoConfig as UniffiConfig};
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::sync::Arc;

#[napi(object)]
#[derive(Debug, Clone)]
pub struct KaleidoConfig {
    pub base_url: String,
    pub node_url: Option<String>,
    pub api_key: Option<String>,
    pub timeout: f64,
    pub max_retries: u32,
    pub cache_ttl: i64,
}

impl From<KaleidoConfig> for UniffiConfig {
    fn from(config: KaleidoConfig) -> Self {
        UniffiConfig {
            base_url: config.base_url,
            node_url: config.node_url,
            api_key: config.api_key,
            timeout: config.timeout,
            max_retries: config.max_retries,
            cache_ttl: config.cache_ttl as u64,
        }
    }
}

// ============================================================================
// Typed Response Structs
// ============================================================================

/// Asset balance information
#[napi(object)]
#[derive(Debug, Clone)]
pub struct AssetBalance {
    pub settled: i64,
    pub future: i64,
    pub spendable: i64,
    pub offchain_outbound: i64,
    pub offchain_inbound: i64,
}

/// Asset information (typed response)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct Asset {
    pub asset_id: String,
    pub ticker: String,
    pub name: String,
    pub details: Option<String>,
    pub precision: i64,
    pub issued_supply: i64,
    pub timestamp: i64,
    pub added_at: i64,
    pub balance: AssetBalance,
    pub is_active: Option<bool>,
}

/// Trading pair information (typed response)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct TradingPair {
    pub id: Option<String>,
    pub base_asset: String,
    pub base_asset_id: String,
    pub base_precision: i64,
    pub quote_asset: String,
    pub quote_asset_id: String,
    pub quote_precision: i64,
    pub is_active: bool,
    pub min_base_order_size: i64,
    pub max_base_order_size: i64,
    pub min_quote_order_size: i64,
    pub max_quote_order_size: i64,
}

/// Fee information (typed response)  
#[napi(object)]
#[derive(Debug, Clone)]
pub struct Fee {
    pub base_fee: i64,
    pub variable_fee: i64,
    pub fee_rate: f64,
    pub final_fee: i64,
    pub fee_asset: String,
    pub fee_asset_precision: i64,
}

/// Quote information (typed response)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct Quote {
    pub rfq_id: String,
    pub from_asset: String,
    pub from_amount: i64,
    pub to_asset: String,
    pub to_amount: i64,
    pub price: i64,
    pub fee: Fee,
    pub timestamp: i64,
    pub expires_at: i64,
}

/// Node information (typed response)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct NodeInfo {
    pub pubkey: Option<String>,
    pub network: Option<String>,
    pub block_height: Option<i64>,
}

/// Kaleidoswap client with async methods
#[napi]
pub struct KaleidoClient {
    inner: Arc<UniffiClient>,
}

#[napi]
impl KaleidoClient {
    /// Create a new Kaleidoswap client
    #[napi(constructor)]
    pub fn new(config: KaleidoConfig) -> Result<Self> {
        let uniffi_config: UniffiConfig = config.into();
        let inner =
            UniffiClient::new(uniffi_config).map_err(|e| Error::from_reason(format!("{:?}", e)))?;
        Ok(Self {
            inner: Arc::new(inner),
        })
    }

    /// Check if the client has a node URL configured
    #[napi]
    pub fn has_node(&self) -> bool {
        self.inner.has_node()
    }

    // === Market Operations ===

    /// List all available assets
    #[napi]
    pub async fn list_assets(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_assets().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// List all available trading pairs
    #[napi]
    pub async fn list_pairs(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_pairs().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get a quote by trading pair ticker
    #[napi]
    pub async fn get_quote_by_pair(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner
                .get_quote_by_pair(ticker, from_amount, to_amount)
                .map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === Swap Operations ===

    /// Get node information
    #[napi]
    pub async fn get_node_info(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_node_info().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get swap status by payment hash
    #[napi]
    pub async fn get_swap_status(&self, payment_hash: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_swap_status(payment_hash).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Wait for swap completion
    #[napi]
    pub async fn wait_for_swap_completion(
        &self,
        payment_hash: String,
        timeout_secs: f64,
        poll_interval_secs: f64,
    ) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner
                .wait_for_swap_completion(payment_hash, timeout_secs, poll_interval_secs)
                .map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === Swap Order Operations ===

    /// Get swap order status
    #[napi]
    pub async fn get_swap_order_status(&self, order_id: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_swap_order_status(order_id).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get order history
    #[napi]
    pub async fn get_order_history(
        &self,
        status: Option<String>,
        limit: i32,
        skip: i32,
    ) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner.get_order_history(status, limit, skip).map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get order analytics
    #[napi]
    pub async fn get_order_analytics(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_order_analytics().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Submit rate decision for a swap order
    #[napi]
    pub async fn swap_order_rate_decision(&self, order_id: String, accept: bool) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner
                .swap_order_rate_decision(order_id, accept)
                .map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === LSP Operations ===

    /// Get LSP information
    #[napi]
    pub async fn get_lsp_info(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_lsp_info().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get LSP network information
    #[napi]
    pub async fn get_lsp_network_info(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_lsp_network_info().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get an LSPS1 order
    #[napi]
    pub async fn get_lsp_order(&self, order_id: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_lsp_order(order_id).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Estimate fees for an LSPS1 order
    #[napi]
    pub async fn estimate_lsp_fees(&self, channel_size: i64) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.estimate_lsp_fees(channel_size).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === RGB Lightning Node Operations ===

    /// Get RGB node information
    #[napi]
    pub async fn get_rgb_node_info(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_rgb_node_info().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// List channels
    #[napi]
    pub async fn list_channels(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_channels().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// List peers
    #[napi]
    pub async fn list_peers(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_peers().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// List node assets
    #[napi]
    pub async fn list_node_assets(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_node_assets().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get asset balance
    #[napi]
    pub async fn get_asset_balance(&self, asset_id: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_asset_balance(asset_id).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get onchain address
    #[napi]
    pub async fn get_onchain_address(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_onchain_address().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get BTC balance
    #[napi]
    pub async fn get_btc_balance(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_btc_balance().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Whitelist a trade
    #[napi]
    pub async fn whitelist_trade(&self, swapstring: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.whitelist_trade(swapstring).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Decode a Lightning invoice
    #[napi]
    pub async fn decode_ln_invoice(&self, invoice: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.decode_ln_invoice(invoice).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// List payments
    #[napi]
    pub async fn list_payments(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_payments().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === Wallet Operations ===

    /// Initialize wallet
    #[napi]
    pub async fn init_wallet(&self, password: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.init_wallet(password).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Unlock wallet
    #[napi]
    pub async fn unlock_wallet(&self, password: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.unlock_wallet(password).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Lock wallet
    #[napi]
    pub async fn lock_wallet(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.lock_wallet().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === Convenience Methods ===

    /// Get an asset by its ticker (e.g., "BTC", "USDT")
    #[napi]
    pub async fn get_asset_by_ticker(&self, ticker: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_asset_by_ticker(ticker).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get a quote by asset tickers (e.g., "BTC", "USDT")
    #[napi]
    pub async fn get_quote_by_assets(
        &self,
        from_ticker: String,
        to_ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner
                .get_quote_by_assets(from_ticker, to_ticker, from_amount, to_amount)
                .map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Complete a swap using a quote JSON string
    #[napi]
    pub async fn complete_swap_from_quote(&self, quote_json: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner.complete_swap_from_quote(quote_json).map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get a trading pair by ticker (e.g., "BTC/USDT")
    #[napi]
    pub async fn get_pair_by_ticker(&self, ticker: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.get_pair_by_ticker(ticker).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    // === New Convenience Methods ===

    /// List only active assets
    #[napi]
    pub async fn list_active_assets(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_active_assets().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// List only active trading pairs
    #[napi]
    pub async fn list_active_pairs(&self) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.list_active_pairs().map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Estimate swap fees for a given pair and amount
    #[napi]
    pub async fn estimate_swap_fees(&self, ticker: String, amount: i64) -> Result<i64> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.estimate_swap_fees(ticker, amount))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Get the best quote by trying multiple layers
    #[napi]
    pub async fn get_best_quote(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            inner
                .get_best_quote(ticker, from_amount, to_amount)
                .map(|v| v.json)
        })
        .await
        .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
        .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Find an asset by ticker
    #[napi]
    pub async fn find_asset_by_ticker(&self, ticker: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.find_asset_by_ticker(ticker).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Find a trading pair by ticker
    #[napi]
    pub async fn find_pair_by_ticker(&self, ticker: String) -> Result<String> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.find_pair_by_ticker(ticker).map(|v| v.json))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }

    /// Create a real-time quote stream for a trading pair
    /// The pair_ticker should be in format "BTC/USDT"
    #[napi]
    pub async fn create_quote_stream(&self, pair_ticker: String) -> Result<QuoteStream> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.create_quote_stream(pair_ticker))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))?
            .map(|stream| QuoteStream { inner: stream })
            .map_err(|e| Error::from_reason(format!("{:?}", e)))
    }
}

// ============================================================================
// WebSocket Quote Streaming
// ============================================================================

use kaleidoswap_uniffi::QuoteStream as UniffiQuoteStream;

/// Real-time quote stream for receiving WebSocket updates
#[napi]
pub struct QuoteStream {
    inner: Arc<UniffiQuoteStream>,
}

#[napi]
impl QuoteStream {
    /// Receive the next quote update (blocking with timeout)
    /// Returns null if timeout expires without receiving a quote
    #[napi]
    pub async fn recv(&self, timeout_secs: f64) -> Result<Option<String>> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || inner.recv(timeout_secs))
            .await
            .map_err(|e| Error::from_reason(format!("Task failed: {:?}", e)))
    }

    /// Check if the stream is still connected
    #[napi]
    pub fn is_connected(&self) -> bool {
        self.inner.is_connected()
    }

    /// Close the stream and clean up resources
    #[napi]
    pub fn close(&self) {
        self.inner.close()
    }
}

/// Convert display units to smallest units
#[napi]
pub fn to_smallest_units(amount: f64, precision: u32) -> i64 {
    kaleidoswap_uniffi::to_smallest_units(amount, precision as u8)
}

/// Convert smallest units to display units
#[napi]
pub fn to_display_units(amount: i64, precision: u32) -> f64 {
    kaleidoswap_uniffi::to_display_units(amount, precision as u8)
}
