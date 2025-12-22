//! UniFFI bindings for the Kaleidoswap SDK.
//!
//! This crate provides language bindings through UniFFI for Python, Swift, and Kotlin.

#![allow(clippy::empty_line_after_doc_comments)]

use kaleidoswap_core::{models::Layer, KaleidoClient as CoreClient, KaleidoConfig as CoreConfig};
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Runtime;

/// JSON value wrapper for passing complex data across FFI boundary.
#[derive(Debug, Clone)]
pub struct JsonValue {
    pub json: String,
}

impl JsonValue {
    pub fn new<T: serde::Serialize>(value: T) -> Self {
        Self {
            json: serde_json::to_string(&value).unwrap_or_default(),
        }
    }

    pub fn from_value(value: serde_json::Value) -> Self {
        Self {
            json: serde_json::to_string(&value).unwrap_or_default(),
        }
    }

    pub fn parse<T: serde::de::DeserializeOwned>(&self) -> Result<T, KaleidoError> {
        serde_json::from_str(&self.json).map_err(|e| KaleidoError::ValidationError {
            message: format!("Invalid JSON: {}", e),
        })
    }
}

/// SDK configuration.
#[derive(Debug, Clone)]
pub struct KaleidoConfig {
    pub base_url: String,
    pub node_url: Option<String>,
    pub api_key: Option<String>,
    pub timeout: f64,
    pub max_retries: u32,
    pub cache_ttl: u64,
}

impl Default for KaleidoConfig {
    fn default() -> Self {
        Self {
            base_url: "https://api.regtest.kaleidoswap.com".to_string(),
            node_url: None,
            api_key: None,
            timeout: 30.0,
            max_retries: 3,
            cache_ttl: 300,
        }
    }
}

impl From<KaleidoConfig> for CoreConfig {
    fn from(config: KaleidoConfig) -> Self {
        let mut core = CoreConfig::new(config.base_url);
        if let Some(url) = config.node_url {
            core = core.with_node_url(url);
        }
        if let Some(key) = config.api_key {
            core = core.with_api_key(key);
        }
        core = core
            .with_timeout(config.timeout)
            .with_max_retries(config.max_retries)
            .with_cache_ttl(config.cache_ttl);
        core
    }
}

/// Error types exposed to bindings.
#[derive(Debug, thiserror::Error)]
pub enum KaleidoError {
    #[error("Network error: {message}")]
    NetworkError { message: String },

    #[error("API error: {message}")]
    ApiError { message: String },

    #[error("Validation error: {message}")]
    ValidationError { message: String },

    #[error("Timeout error")]
    TimeoutError,

    #[error("WebSocket error: {message}")]
    WebSocketError { message: String },

    #[error("Not found: {message}")]
    NotFoundError { message: String },

    #[error("Node not configured")]
    NodeNotConfigured,

    #[error("Internal error: {message}")]
    InternalError { message: String },
}

impl From<kaleidoswap_core::KaleidoError> for KaleidoError {
    fn from(err: kaleidoswap_core::KaleidoError) -> Self {
        match err {
            kaleidoswap_core::KaleidoError::NetworkError { message, .. } => {
                KaleidoError::NetworkError { message }
            }
            kaleidoswap_core::KaleidoError::ApiError { message, .. } => {
                KaleidoError::ApiError { message }
            }
            kaleidoswap_core::KaleidoError::ValidationError { message } => {
                KaleidoError::ValidationError { message }
            }
            kaleidoswap_core::KaleidoError::TimeoutError { .. } => KaleidoError::TimeoutError,
            kaleidoswap_core::KaleidoError::WebSocketError { message, .. } => {
                KaleidoError::WebSocketError { message }
            }
            kaleidoswap_core::KaleidoError::NotFoundError {
                resource_type,
                identifier,
            } => KaleidoError::NotFoundError {
                message: format!("{} not found: {}", resource_type, identifier),
            },
            kaleidoswap_core::KaleidoError::NodeNotConfigured => KaleidoError::NodeNotConfigured,
            _ => KaleidoError::InternalError {
                message: err.to_string(),
            },
        }
    }
}

impl KaleidoError {
    /// Get the error code for programmatic error handling.
    pub fn code(&self) -> String {
        match self {
            Self::NetworkError { .. } => "NETWORK_ERROR".to_string(),
            Self::ApiError { .. } => "API_ERROR".to_string(),
            Self::ValidationError { .. } => "VALIDATION_ERROR".to_string(),
            Self::TimeoutError => "TIMEOUT_ERROR".to_string(),
            Self::WebSocketError { .. } => "WEBSOCKET_ERROR".to_string(),
            Self::NotFoundError { .. } => "NOT_FOUND".to_string(),
            Self::NodeNotConfigured => "NODE_NOT_CONFIGURED".to_string(),
            Self::InternalError { .. } => "INTERNAL_ERROR".to_string(),
        }
    }

    /// Check if this error is retryable.
    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            Self::NetworkError { .. } | Self::TimeoutError | Self::WebSocketError { .. }
        )
    }
}

/// The main SDK client.
/// Uses Arc internally for thread-safe sharing across async contexts.
#[derive(Clone)]
pub struct KaleidoClient {
    inner: Arc<CoreClient>,
    runtime: Arc<Runtime>,
}

impl KaleidoClient {
    /// Create a new client with the given configuration.
    pub fn new(config: KaleidoConfig) -> Result<Self, KaleidoError> {
        let runtime = Runtime::new().map_err(|e| KaleidoError::InternalError {
            message: format!("Failed to create runtime: {}", e),
        })?;

        let core_config: CoreConfig = config.into();
        let inner = CoreClient::new(core_config)?;

        Ok(Self {
            inner: Arc::new(inner),
            runtime: Arc::new(runtime),
        })
    }

    /// Check if RGB Lightning Node is configured.
    pub fn has_node(&self) -> bool {
        self.inner.has_node()
    }

    // === Market Operations ===

    /// List all available assets.
    pub fn list_assets(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_assets())?;
        Ok(JsonValue::new(result))
    }

    /// List all available trading pairs.
    pub fn list_pairs(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_pairs())?;
        Ok(JsonValue::new(result))
    }

    /// Get a quote for a swap.
    /// Uses BTC/LN layer as default.
    pub fn get_quote_by_pair(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_quote_by_pair(
            &ticker,
            from_amount,
            to_amount,
            Layer::BtcLn,
        ))?;
        Ok(JsonValue::new(result))
    }

    // === Swap Operations ===

    /// Get node information.
    pub fn get_node_info(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_node_info())?;
        Ok(JsonValue::new(result))
    }

    /// Get swap status.
    pub fn get_swap_status(&self, payment_hash: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.get_swap_status(&payment_hash))?;
        Ok(JsonValue::new(result))
    }

    /// Wait for swap completion.
    pub fn wait_for_swap_completion(
        &self,
        payment_hash: String,
        timeout_secs: f64,
        poll_interval_secs: f64,
    ) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.wait_for_swap_completion(
            &payment_hash,
            Duration::from_secs_f64(timeout_secs),
            Duration::from_secs_f64(poll_interval_secs),
        ))?;
        Ok(JsonValue::new(result))
    }

    // === Swap Order Operations ===

    /// Get swap order status.
    pub fn get_swap_order_status(&self, order_id: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.get_swap_order_status(&order_id))?;
        Ok(JsonValue::new(result))
    }

    /// Get order history.
    pub fn get_order_history(
        &self,
        status: Option<String>,
        limit: i32,
        skip: i32,
    ) -> Result<JsonValue, KaleidoError> {
        let result =
            self.runtime
                .block_on(self.inner.get_order_history(status.as_deref(), limit, skip))?;
        Ok(JsonValue::new(result))
    }

    /// Get order analytics.
    pub fn get_order_analytics(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_order_analytics())?;
        Ok(JsonValue::new(result))
    }

    /// Submit rate decision for a swap order.
    pub fn swap_order_rate_decision(
        &self,
        order_id: String,
        accept: bool,
    ) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.swap_order_rate_decision(&order_id, accept))?;
        Ok(JsonValue::new(result))
    }

    // === LSP Operations ===

    /// Get LSP information.
    pub fn get_lsp_info(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_lsp_info())?;
        Ok(JsonValue::new(result))
    }

    /// Get LSP network information.
    pub fn get_lsp_network_info(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_lsp_network_info())?;
        Ok(JsonValue::new(result))
    }

    /// Get an LSPS1 order.
    pub fn get_lsp_order(&self, order_id: String) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_lsp_order(&order_id))?;
        Ok(JsonValue::new(result))
    }

    /// Estimate fees for an LSPS1 order.
    pub fn estimate_lsp_fees(&self, channel_size: i64) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.estimate_lsp_fees(channel_size))?;
        Ok(JsonValue::new(result))
    }

    // === RGB Lightning Node Operations ===

    /// Get RGB node information.
    pub fn get_rgb_node_info(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_rgb_node_info())?;
        Ok(JsonValue::new(result))
    }

    /// List channels.
    pub fn list_channels(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_channels())?;
        Ok(JsonValue::new(result))
    }

    /// List peers.
    pub fn list_peers(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_peers())?;
        Ok(JsonValue::new(result))
    }

    /// Connect to a peer.
    pub fn connect_peer(&self, request_json: String) -> Result<JsonValue, KaleidoError> {
        let request: kaleidoswap_core::api::node::ConnectPeerRequest =
            serde_json::from_str(&request_json).map_err(|e| KaleidoError::ValidationError {
                message: format!("Invalid request JSON: {}", e),
            })?;
        let result = self.runtime.block_on(self.inner.connect_peer(&request))?;
        Ok(JsonValue::from_value(result))
    }

    /// List node assets.
    pub fn list_node_assets(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_node_assets())?;
        Ok(JsonValue::new(result))
    }

    /// Get asset balance.
    pub fn get_asset_balance(&self, asset_id: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.get_asset_balance(&asset_id))?;
        Ok(JsonValue::new(result))
    }

    /// Get onchain address.
    pub fn get_onchain_address(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_onchain_address())?;
        Ok(JsonValue::new(result))
    }

    /// Get BTC balance.
    pub fn get_btc_balance(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.get_btc_balance())?;
        Ok(JsonValue::new(result))
    }

    /// Whitelist a trade.
    pub fn whitelist_trade(&self, swapstring: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.whitelist_trade(&swapstring))?;
        Ok(JsonValue::from_value(result))
    }

    /// Decode a Lightning invoice.
    pub fn decode_ln_invoice(&self, invoice: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.decode_ln_invoice(&invoice))?;
        Ok(JsonValue::from_value(result))
    }

    /// List payments.
    pub fn list_payments(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_payments())?;
        Ok(JsonValue::new(result))
    }

    /// Initialize wallet.
    pub fn init_wallet(&self, password: String) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.init_wallet(&password))?;
        Ok(JsonValue::from_value(result))
    }

    /// Unlock wallet.
    pub fn unlock_wallet(&self, password: String) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.unlock_wallet(&password))?;
        Ok(JsonValue::from_value(result))
    }

    /// Lock wallet.
    pub fn lock_wallet(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.lock_wallet())?;
        Ok(JsonValue::from_value(result))
    }

    // === Convenience Methods ===

    /// Get an asset by its ticker (e.g., "BTC", "USDT").
    /// Returns the asset details if found.
    pub fn get_asset_by_ticker(&self, ticker: String) -> Result<JsonValue, KaleidoError> {
        let assets = self.runtime.block_on(self.inner.list_assets())?;
        let ticker_upper = ticker.to_uppercase();

        let asset = assets
            .into_iter()
            .find(|a| a.ticker.to_uppercase() == ticker_upper)
            .ok_or_else(|| KaleidoError::NotFoundError {
                message: format!("Asset not found: {}", ticker),
            })?;

        Ok(JsonValue::new(asset))
    }

    /// Get a quote by asset tickers (e.g., "BTC", "USDT").
    /// Automatically resolves asset IDs from tickers.
    /// Uses BTC/LN layer as default.
    pub fn get_quote_by_assets(
        &self,
        from_ticker: String,
        to_ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<JsonValue, KaleidoError> {
        let ticker = format!("{}/{}", from_ticker, to_ticker);
        let result = self.runtime.block_on(self.inner.get_quote_by_pair(
            &ticker,
            from_amount,
            to_amount,
            Layer::BtcLn,
        ))?;
        Ok(JsonValue::new(result))
    }

    /// Complete a swap in one call using a quote response.
    /// This initializes and executes the swap atomically.
    pub fn complete_swap_from_quote(&self, quote_json: String) -> Result<JsonValue, KaleidoError> {
        let quote: kaleidoswap_core::models::PairQuoteResponse = serde_json::from_str(&quote_json)
            .map_err(|e| KaleidoError::ValidationError {
                message: format!("Invalid quote JSON: {}", e),
            })?;

        let result = self.runtime.block_on(self.inner.complete_swap(&quote))?;
        Ok(JsonValue::new(result))
    }

    /// Get a trading pair by ticker (e.g., "BTC/USDT").
    pub fn get_pair_by_ticker(&self, ticker: String) -> Result<JsonValue, KaleidoError> {
        let pairs = self.runtime.block_on(self.inner.list_pairs())?;
        let ticker_upper = ticker.to_uppercase();

        // With new model, pair has base/quote TradableAsset fields
        let pair = pairs
            .into_iter()
            .find(|p| {
                let pair_ticker = format!("{}/{}", p.base.ticker, p.quote.ticker).to_uppercase();
                pair_ticker == ticker_upper
            })
            .ok_or_else(|| KaleidoError::NotFoundError {
                message: format!("Trading pair not found: {}", ticker),
            })?;

        Ok(JsonValue::new(pair))
    }

    // === Convenience Methods ===

    /// List only active assets.
    pub fn list_active_assets(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_active_assets())?;
        Ok(JsonValue::new(result))
    }

    /// List only active trading pairs.
    pub fn list_active_pairs(&self) -> Result<JsonValue, KaleidoError> {
        let result = self.runtime.block_on(self.inner.list_active_pairs())?;
        Ok(JsonValue::new(result))
    }

    /// Estimate swap fees for a given pair and amount.
    pub fn estimate_swap_fees(&self, ticker: String, amount: i64) -> Result<i64, KaleidoError> {
        let result =
            self.runtime
                .block_on(self.inner.estimate_swap_fees(&ticker, amount, Layer::BtcLn))?;
        Ok(result)
    }

    /// Get the best quote by trying multiple layers.
    pub fn get_best_quote(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<JsonValue, KaleidoError> {
        let result =
            self.runtime
                .block_on(self.inner.get_best_quote(&ticker, from_amount, to_amount))?;
        Ok(JsonValue::new(result))
    }

    /// Find an asset by ticker.
    pub fn find_asset_by_ticker(&self, ticker: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.find_asset_by_ticker(&ticker))?;
        Ok(JsonValue::new(result))
    }

    /// Find a trading pair by ticker.
    pub fn find_pair_by_ticker(&self, ticker: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.find_pair_by_ticker(&ticker))?;
        Ok(JsonValue::new(result))
    }

    // === Legacy Support Methods ===

    /// Create an LSPS1 order (Legacy).
    pub fn create_lsp_order(&self, request_json: String) -> Result<JsonValue, KaleidoError> {
        let request: kaleidoswap_core::models::CreateOrderRequest =
            serde_json::from_str(&request_json).map_err(|e| KaleidoError::ValidationError {
                message: format!("Invalid request JSON: {}", e),
            })?;
        let result = self
            .runtime
            .block_on(self.inner.create_lsp_order(&request))?;
        Ok(JsonValue::new(result))
    }

    /// Create a swap order (Legacy).
    pub fn create_swap_order(&self, request_json: String) -> Result<JsonValue, KaleidoError> {
        let request: kaleidoswap_core::models::CreateSwapOrderRequest =
            serde_json::from_str(&request_json).map_err(|e| KaleidoError::ValidationError {
                message: format!("Invalid request JSON: {}", e),
            })?;
        let result = self
            .runtime
            .block_on(self.inner.create_swap_order(&request))?;
        Ok(JsonValue::new(result))
    }

    /// Initialize a swap (Legacy).
    pub fn init_swap(&self, request_json: String) -> Result<JsonValue, KaleidoError> {
        let request: kaleidoswap_core::models::SwapRequest = serde_json::from_str(&request_json)
            .map_err(|e| KaleidoError::ValidationError {
                message: format!("Invalid request JSON: {}", e),
            })?;
        let result = self.runtime.block_on(self.inner.init_swap(&request))?;
        Ok(JsonValue::new(result))
    }

    /// Execute a swap (Legacy).
    pub fn execute_swap(&self, request_json: String) -> Result<JsonValue, KaleidoError> {
        let request: kaleidoswap_core::models::ConfirmSwapRequest =
            serde_json::from_str(&request_json).map_err(|e| KaleidoError::ValidationError {
                message: format!("Invalid request JSON: {}", e),
            })?;
        let result = self.runtime.block_on(self.inner.execute_swap(&request))?;
        Ok(JsonValue::new(result))
    }

    /// Retry asset delivery (Legacy).
    pub fn retry_delivery(&self, order_id: String) -> Result<JsonValue, KaleidoError> {
        let result = self
            .runtime
            .block_on(self.inner.retry_delivery(&order_id))?;
        Ok(JsonValue::from_value(result))
    }
}

// Helper functions
/// Convert display units to smallest units.
pub fn to_smallest_units(amount: f64, precision: u8) -> i64 {
    kaleidoswap_core::AmountConverter::to_smallest_units(amount, precision)
}

/// Convert smallest units to display units.
pub fn to_display_units(amount: i64, precision: u8) -> f64 {
    kaleidoswap_core::AmountConverter::to_display_units(amount, precision)
}

// ============================================================================
// WebSocket Quote Streaming
// ============================================================================

use std::sync::Mutex;
use tokio::sync::mpsc;

/// A stream for receiving real-time quote updates via WebSocket.
pub struct QuoteStream {
    runtime: Arc<Runtime>,
    receiver: Arc<Mutex<Option<mpsc::Receiver<String>>>>,
    connected: Arc<std::sync::atomic::AtomicBool>,
}

impl QuoteStream {
    /// Receive the next quote update.
    /// Returns None if timeout is reached or stream is closed.
    /// The quote is returned as a JSON string.
    pub fn recv(&self, timeout_secs: f64) -> Option<String> {
        let receiver = self.receiver.clone();
        let timeout = Duration::from_secs_f64(timeout_secs);

        self.runtime.block_on(async {
            // Extract the receiver from the mutex before awaiting
            // to avoid holding the lock across an await point
            let mut rx = {
                let mut guard = receiver.lock().ok()?;
                guard.take()?
            };

            let result = match tokio::time::timeout(timeout, rx.recv()).await {
                Ok(Some(quote)) => Some(quote),
                Ok(None) => None, // Channel closed
                Err(_) => None,   // Timeout
            };

            // Put the receiver back if we got a result
            if result.is_some() {
                if let Ok(mut guard) = receiver.lock() {
                    *guard = Some(rx);
                }
            }

            result
        })
    }

    /// Check if the stream is still connected.
    pub fn is_connected(&self) -> bool {
        self.connected.load(std::sync::atomic::Ordering::SeqCst)
    }

    /// Close the stream and cleanup resources.
    pub fn close(&self) {
        self.connected
            .store(false, std::sync::atomic::Ordering::SeqCst);
        if let Ok(mut guard) = self.receiver.lock() {
            *guard = None;
        }
    }
}

impl KaleidoClient {
    /// Create a real-time quote stream for a trading pair.
    /// The pair_ticker should be in format "BTC/USDT".
    /// Returns a QuoteStream that can be used to receive quote updates.
    pub fn create_quote_stream(
        &self,
        pair_ticker: String,
    ) -> Result<Arc<QuoteStream>, KaleidoError> {
        let base_url = self.inner.config().base_url.clone();
        let runtime = Arc::clone(&self.runtime);

        // Create WebSocket URL
        let ws_url = base_url
            .replace("https://", "wss://")
            .replace("http://", "ws://");
        let ws_url = format!("{}/ws", ws_url);

        // Create channel for quote updates
        let (tx, rx) = mpsc::channel::<String>(32);
        let connected = Arc::new(std::sync::atomic::AtomicBool::new(true));
        let connected_clone = Arc::clone(&connected);

        // Spawn WebSocket connection task
        let pair = pair_ticker.clone();
        runtime.spawn(async move {
            use futures::{SinkExt, StreamExt};
            use tokio_tungstenite::connect_async;

            // Connect to WebSocket
            let ws_result = connect_async(&ws_url).await;
            let (mut ws_stream, _) = match ws_result {
                Ok(conn) => conn,
                Err(e) => {
                    log::error!("WebSocket connection failed: {}", e);
                    connected_clone.store(false, std::sync::atomic::Ordering::SeqCst);
                    return;
                }
            };

            // Subscribe to trading pair
            let subscribe_msg = serde_json::json!({
                "type": "subscribe",
                "data": { "pair_id": pair }
            });
            if let Err(e) = ws_stream
                .send(tokio_tungstenite::tungstenite::Message::Text(
                    subscribe_msg.to_string(),
                ))
                .await
            {
                log::error!("Failed to subscribe: {}", e);
                connected_clone.store(false, std::sync::atomic::Ordering::SeqCst);
                return;
            }

            // Receive messages and forward to channel
            while connected_clone.load(std::sync::atomic::Ordering::SeqCst) {
                match ws_stream.next().await {
                    Some(Ok(tokio_tungstenite::tungstenite::Message::Text(text))) => {
                        // Parse and forward quote updates
                        if let Ok(msg) = serde_json::from_str::<serde_json::Value>(&text) {
                            if msg.get("type").and_then(|t| t.as_str()) == Some("quote") {
                                if let Some(data) = msg.get("data") {
                                    if tx.send(data.to_string()).await.is_err() {
                                        break; // Channel closed
                                    }
                                }
                            }
                        }
                    }
                    Some(Ok(tokio_tungstenite::tungstenite::Message::Close(_))) => {
                        break;
                    }
                    Some(Err(e)) => {
                        log::error!("WebSocket error: {}", e);
                        break;
                    }
                    None => break,
                    _ => {}
                }
            }

            connected_clone.store(false, std::sync::atomic::Ordering::SeqCst);
        });

        Ok(Arc::new(QuoteStream {
            runtime,
            receiver: Arc::new(Mutex::new(Some(rx))),
            connected,
        }))
    }
}

// Generate bindings from UDL

uniffi::include_scaffolding!("kaleidoswap");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_json_value_creation() {
        let value = serde_json::json!({"test": "data"});
        let json_value = JsonValue::from_value(value);
        assert!(json_value.json.contains("test"));
        assert!(json_value.json.contains("data"));
    }

    #[test]
    fn test_json_value_parse() {
        let json_value = JsonValue {
            json: r#"{"count":42}"#.to_string(),
        };

        #[derive(serde::Deserialize)]
        struct TestStruct {
            count: i32,
        }

        let parsed: TestStruct = json_value.parse().expect("Failed to parse");
        assert_eq!(parsed.count, 42);
    }

    #[test]
    fn test_to_smallest_units() {
        assert_eq!(to_smallest_units(1.0, 8), 100_000_000);
        assert_eq!(to_smallest_units(0.5, 8), 50_000_000);
        assert_eq!(to_smallest_units(1.23456789, 8), 123_456_789);
    }

    #[test]
    fn test_to_display_units() {
        assert_eq!(to_display_units(100_000_000, 8), 1.0);
        assert_eq!(to_display_units(50_000_000, 8), 0.5);
        assert_eq!(to_display_units(123_456_789, 8), 1.23456789);
    }

    #[test]
    fn test_config_default() {
        let config = KaleidoConfig::default();
        assert!(!config.base_url.is_empty());
        assert_eq!(config.timeout, 30.0);
        assert_eq!(config.max_retries, 3);
    }

    #[test]
    fn test_error_conversion() {
        let err = kaleidoswap_core::KaleidoError::validation("test error");
        let uniffi_err: KaleidoError = err.into();

        match uniffi_err {
            KaleidoError::ValidationError { message } => {
                assert!(message.contains("test error"));
            }
            _ => panic!("Expected ValidationError"),
        }
    }
}
