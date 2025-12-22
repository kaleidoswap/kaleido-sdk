//! Python bindings for the Kaleidoswap SDK.
//!
//! This crate generates Python bindings using UniFFI + PyO3.
//! Uses std::thread::spawn for async operations to avoid runtime nesting issues.

#![allow(non_local_definitions)] // Suppress PyO3 macro warning - this is a known issue with older pyo3_macros

use kaleidoswap_uniffi::{JsonValue, KaleidoClient, KaleidoConfig};
use pyo3::prelude::*;
use std::sync::Arc;

// Re-export core types for Python
#[pyclass]
#[derive(Clone)]
struct PyKaleidoConfig {
    inner: KaleidoConfig,
}

#[pymethods]
impl PyKaleidoConfig {
    #[new]
    #[pyo3(signature = (base_url, node_url=None, api_key=None, timeout=30.0, max_retries=3, cache_ttl=300))]
    fn new(
        base_url: String,
        node_url: Option<String>,
        api_key: Option<String>,
        timeout: f64,
        max_retries: u32,
        cache_ttl: u64,
    ) -> Self {
        PyKaleidoConfig {
            inner: KaleidoConfig {
                base_url,
                node_url,
                api_key,
                timeout,
                max_retries,
                cache_ttl,
            },
        }
    }
}

#[pyclass]
struct PyKaleidoClient {
    inner: Arc<KaleidoClient>,
}

#[pymethods]
impl PyKaleidoClient {
    #[new]
    fn new(config: PyKaleidoConfig) -> PyResult<Self> {
        KaleidoClient::new(config.inner)
            .map(|client| PyKaleidoClient {
                inner: Arc::new(client),
            })
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    fn has_node(&self) -> bool {
        self.inner.has_node()
    }

    /// List all available assets - runs on blocking thread to avoid runtime nesting
    fn list_assets(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_assets().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// List all available trading pairs - runs on blocking thread to avoid runtime nesting
    fn list_pairs(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_pairs().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get a quote by trading pair ticker - runs on blocking thread
    fn get_quote_by_pair(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_quote_by_pair(ticker, from_amount, to_amount)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === Swap Operations ===

    /// Get node information
    fn get_node_info(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.get_node_info().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get swap status by payment hash
    fn get_swap_status(&self, payment_hash: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_swap_status(payment_hash)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Wait for swap completion
    fn wait_for_swap_completion(
        &self,
        payment_hash: String,
        timeout_secs: f64,
        poll_interval_secs: f64,
    ) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .wait_for_swap_completion(payment_hash, timeout_secs, poll_interval_secs)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === Swap Order Operations ===

    /// Get swap order status
    fn get_swap_order_status(&self, order_id: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_swap_order_status(order_id)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get order history
    #[pyo3(signature = (status=None, limit=10, skip=0))]
    fn get_order_history(&self, status: Option<String>, limit: i32, skip: i32) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_order_history(status, limit, skip)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get order analytics
    fn get_order_analytics(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_order_analytics()
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Submit rate decision for a swap order
    fn swap_order_rate_decision(&self, order_id: String, accept: bool) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .swap_order_rate_decision(order_id, accept)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === LSP Operations ===

    /// Get LSP information
    fn get_lsp_info(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.get_lsp_info().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get LSP network information
    fn get_lsp_network_info(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_lsp_network_info()
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get an LSPS1 order
    fn get_lsp_order(&self, order_id: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_lsp_order(order_id)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Estimate fees for an LSPS1 order
    fn estimate_lsp_fees(&self, channel_size: i64) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .estimate_lsp_fees(channel_size)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === RGB Lightning Node Operations ===

    /// Get RGB node information
    fn get_rgb_node_info(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.get_rgb_node_info().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// List channels
    fn list_channels(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_channels().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// List peers
    fn list_peers(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_peers().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Connect to a peer
    fn connect_peer(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .connect_peer(request_json)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// List node assets
    fn list_node_assets(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_node_assets().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get asset balance
    fn get_asset_balance(&self, asset_id: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_asset_balance(asset_id)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get onchain address
    fn get_onchain_address(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_onchain_address()
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get BTC balance
    fn get_btc_balance(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.get_btc_balance().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Whitelist a trade
    fn whitelist_trade(&self, swapstring: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .whitelist_trade(swapstring)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Decode a Lightning invoice
    fn decode_ln_invoice(&self, invoice: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .decode_ln_invoice(invoice)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// List payments
    fn list_payments(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_payments().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === Wallet Operations ===

    /// Initialize wallet
    fn init_wallet(&self, password: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .init_wallet(password)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Unlock wallet
    fn unlock_wallet(&self, password: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .unlock_wallet(password)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Lock wallet
    fn lock_wallet(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.lock_wallet().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === Convenience Methods ===

    /// Get an asset by its ticker (e.g., "BTC", "USDT")
    fn get_asset_by_ticker(&self, ticker: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_asset_by_ticker(ticker)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get a quote by asset tickers (e.g., "BTC", "USDT")
    fn get_quote_by_assets(
        &self,
        from_ticker: String,
        to_ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_quote_by_assets(from_ticker, to_ticker, from_amount, to_amount)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Complete a swap using a quote JSON string
    fn complete_swap_from_quote(&self, quote_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .complete_swap_from_quote(quote_json)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Create a new LSPS1 order (LEGACY)
    fn create_order(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .create_lsp_order(request_json)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Create a new swap order (LEGACY)
    fn create_swap_order(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .create_swap_order(request_json)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Initialize a maker swap (LEGACY)
    fn init_maker_swap(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .init_swap(request_json)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Execute a maker swap (LEGACY)
    fn execute_maker_swap(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .execute_swap(request_json)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Retry asset delivery for an order (LEGACY)
    fn retry_delivery(&self, order_id: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .retry_delivery(order_id)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get a trading pair by ticker (e.g., "BTC/USDT")
    fn get_pair_by_ticker(&self, ticker: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_pair_by_ticker(ticker)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    // === New Convenience Methods ===

    /// List only active assets
    fn list_active_assets(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_active_assets().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// List only active trading pairs
    fn list_active_pairs(&self) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.list_active_pairs().map(|json_value| json_value.json))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Estimate swap fees for a given pair and amount
    fn estimate_swap_fees(&self, ticker: String, amount: i64) -> PyResult<i64> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.estimate_swap_fees(ticker, amount))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Get the best quote by trying multiple layers
    fn get_best_quote(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .get_best_quote(ticker, from_amount, to_amount)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Find an asset by ticker
    fn find_asset_by_ticker(&self, ticker: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .find_asset_by_ticker(ticker)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Find a trading pair by ticker
    fn find_pair_by_ticker(&self, ticker: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || {
            inner
                .find_pair_by_ticker(ticker)
                .map(|json_value| json_value.json)
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Create a real-time quote stream for a trading pair
    /// The pair_ticker should be in format "BTC/USDT"
    fn create_quote_stream(&self, pair_ticker: String) -> PyResult<PyQuoteStream> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.create_quote_stream(pair_ticker))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map(|stream| PyQuoteStream { inner: stream })
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }
}

// ============================================================================
// WebSocket Quote Streaming
// ============================================================================

use kaleidoswap_uniffi::QuoteStream;

/// Real-time quote stream for receiving WebSocket updates
#[pyclass]
struct PyQuoteStream {
    inner: Arc<QuoteStream>,
}

#[pymethods]
impl PyQuoteStream {
    /// Receive the next quote update (blocking with timeout)
    /// Returns None if timeout expires without receiving a quote
    fn recv(&self, timeout_secs: f64) -> PyResult<Option<String>> {
        let inner = Arc::clone(&self.inner);
        std::thread::spawn(move || inner.recv(timeout_secs))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))
    }

    /// Check if the stream is still connected
    fn is_connected(&self) -> bool {
        self.inner.is_connected()
    }

    /// Close the stream and clean up resources
    fn close(&self) {
        self.inner.close()
    }
}

#[pyclass]
#[derive(Clone)]
struct PyJsonValue {
    inner: JsonValue,
}

#[pymethods]
impl PyJsonValue {
    #[getter]
    fn json(&self) -> String {
        self.inner.json.clone()
    }
}

#[pymodule]
fn kaleidoswap(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyKaleidoConfig>()?;
    m.add_class::<PyKaleidoClient>()?;
    m.add_class::<PyJsonValue>()?;
    m.add_class::<PyQuoteStream>()?;

    // Add utility functions
    m.add_function(wrap_pyfunction!(to_smallest_units_py, m)?)?;
    m.add_function(wrap_pyfunction!(to_display_units_py, m)?)?;

    Ok(())
}

#[pyfunction]
fn to_smallest_units_py(amount: f64, precision: u8) -> i64 {
    kaleidoswap_uniffi::to_smallest_units(amount, precision)
}

#[pyfunction]
fn to_display_units_py(amount: i64, precision: u8) -> f64 {
    kaleidoswap_uniffi::to_display_units(amount, precision)
}
