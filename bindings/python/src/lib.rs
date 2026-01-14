//! Python bindings for the Kaleidoswap SDK.
//!
//! This crate uses PyO3 for direct Python bindings with pythonize for
//! efficient serialization, bypassing JSON string conversion.

#![allow(non_local_definitions)] // Suppress PyO3 macro warning

use kaleidoswap_core::{
    KaleidoClient as CoreKaleidoClient, KaleidoConfig as CoreKaleidoConfig,
    MarketClient as CoreMarketClient, NodeClient as CoreNodeClient,
};
use kaleidoswap_uniffi::JsonValue; // Still needed for PyQuoteStream
use pyo3::prelude::*;
use pythonize::pythonize;
use std::sync::Arc;
use tokio::runtime::Runtime;

// Re-export core types for Python
#[pyclass]
#[derive(Clone)]
struct PyKaleidoConfig {
    inner: CoreKaleidoConfig,
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
        let mut config = CoreKaleidoConfig::new(base_url);
        config.node_url = node_url;
        config.api_key = api_key;
        config.timeout = timeout;
        config.max_retries = max_retries;
        config.cache_ttl = cache_ttl;

        PyKaleidoConfig { inner: config }
    }
}

// === Market Client ===
#[pyclass]
struct PyMarketClient {
    inner: Arc<CoreMarketClient>,
    runtime: Arc<Runtime>,
}

#[pymethods]
impl PyMarketClient {
    /// List all available assets - returns Python dict/list directly
    fn list_assets(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_assets()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List only active assets
    fn list_active_assets(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_active_assets()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List all available trading pairs
    fn list_pairs(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_pairs()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List only active trading pairs
    fn list_active_pairs(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_active_pairs()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get a quote by trading pair ticker with explicit layers
    #[pyo3(signature = (ticker, from_amount=None, to_amount=None, from_layer="BTC_LN".to_string(), to_layer="RGB_LN".to_string()))]
    fn get_quote_by_pair(
        &self,
        py: Python,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
        from_layer: String,
        to_layer: String,
    ) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse layers with proper error handling
        let from_layer_enum = from_layer.parse().map_err(|_| {
            PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                "Invalid from_layer: '{}'. Expected BTC_LN, RGB_LN, etc.",
                from_layer
            ))
        })?;
        let to_layer_enum = to_layer.parse().map_err(|_| {
            PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                "Invalid to_layer: '{}'. Expected BTC_LN, RGB_LN, etc.",
                to_layer
            ))
        })?;

        let result = std::thread::spawn(move || {
            runtime.block_on(inner.get_quote_by_pair(
                &ticker,
                from_amount,
                to_amount,
                from_layer_enum,
                to_layer_enum,
            ))
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get node information (Swap Service)
    fn get_node_info(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_node_info()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get swap status by payment hash
    fn get_swap_status(&self, py: Python, payment_hash: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.get_swap_status(&payment_hash)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Wait for swap completion
    fn wait_for_swap_completion(
        &self,
        py: Python,
        payment_hash: String,
        timeout_secs: f64,
        poll_interval_secs: f64,
    ) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let timeout = std::time::Duration::from_secs_f64(timeout_secs);
        let poll_interval = std::time::Duration::from_secs_f64(poll_interval_secs);

        let result = std::thread::spawn(move || {
            runtime.block_on(inner.wait_for_swap_completion(&payment_hash, timeout, poll_interval))
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get swap order status
    fn get_swap_order_status(&self, py: Python, order_id: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.get_swap_order_status(&order_id)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get order history
    #[pyo3(signature = (status=None, limit=10, skip=0))]
    fn get_order_history(
        &self,
        py: Python,
        status: Option<String>,
        limit: i32,
        skip: i32,
    ) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || {
            runtime.block_on(inner.get_order_history(status.as_deref(), limit, skip))
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get order analytics
    fn get_order_analytics(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_order_analytics()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Submit rate decision for a swap order
    fn swap_order_rate_decision(
        &self,
        py: Python,
        order_id: String,
        accept: bool,
    ) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || {
            runtime.block_on(inner.swap_order_rate_decision(&order_id, accept))
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get LSP information
    fn get_lsp_info(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_lsp_info()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get LSP network information
    fn get_lsp_network_info(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_lsp_network_info()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get an LSPS1 order
    fn get_lsp_order(&self, py: Python, order_id: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_lsp_order(&order_id)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Estimate fees for an LSPS1 order
    fn estimate_lsp_fees(&self, py: Python, channel_size: i64) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.estimate_lsp_fees(channel_size)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Create a new LSPS1 order (LEGACY)
    fn create_order(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse JSON to CreateOrderRequest
        let request: kaleidoswap_core::models::CreateOrderRequest =
            serde_json::from_str(&request_json).map_err(|e| {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Invalid request JSON: {}",
                    e
                ))
            })?;

        let result = std::thread::spawn(move || runtime.block_on(inner.create_lsp_order(&request)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Create a new swap order (LEGACY)
    fn create_swap_order(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse JSON to CreateSwapOrderRequest
        let request: kaleidoswap_core::models::CreateSwapOrderRequest =
            serde_json::from_str(&request_json).map_err(|e| {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Invalid request JSON: {}",
                    e
                ))
            })?;

        let result =
            std::thread::spawn(move || runtime.block_on(inner.create_swap_order(&request)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Initialize a maker swap (LEGACY)
    fn init_maker_swap(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse JSON to SwapRequest
        let request: kaleidoswap_core::models::SwapRequest = serde_json::from_str(&request_json)
            .map_err(|e| {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Invalid request JSON: {}",
                    e
                ))
            })?;

        let result = std::thread::spawn(move || runtime.block_on(inner.init_swap(&request)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Execute a maker swap (LEGACY)
    fn execute_maker_swap(&self, request_json: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse JSON to ConfirmSwapRequest
        let request: kaleidoswap_core::models::ConfirmSwapRequest =
            serde_json::from_str(&request_json).map_err(|e| {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Invalid request JSON: {}",
                    e
                ))
            })?;

        let result = std::thread::spawn(move || runtime.block_on(inner.execute_swap(&request)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Retry asset delivery for an order (LEGACY)
    fn retry_delivery(&self, order_id: String) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.retry_delivery(&order_id)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Find an asset by ticker
    fn find_asset_by_ticker(&self, py: Python, ticker: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.find_asset_by_ticker(&ticker)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Find a trading pair by ticker
    fn find_pair_by_ticker(&self, py: Python, ticker: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.find_pair_by_ticker(&ticker)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
}

// === Node Client ===
#[pyclass]
struct PyNodeClient {
    inner: Arc<CoreNodeClient>,
    runtime: Arc<Runtime>,
}

#[pymethods]
impl PyNodeClient {
    /// Get RGB node information
    fn get_rgb_node_info(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_rgb_node_info()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List channels
    fn list_channels(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_channels()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List peers
    fn list_peers(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_peers()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Connect to a peer
    fn connect_peer(&self, py: Python, request_json: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse JSON to ConnectPeerRequest
        let request: kaleidoswap_core::rln::ConnectPeerRequest =
            serde_json::from_str(&request_json).map_err(|e| {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Invalid request JSON: {}",
                    e
                ))
            })?;

        let result = std::thread::spawn(move || runtime.block_on(inner.connect_peer(&request)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List node assets
    fn list_node_assets(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_node_assets()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get asset balance
    fn get_asset_balance(&self, py: Python, asset_id: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.get_asset_balance(&asset_id)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get onchain address
    fn get_onchain_address(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_onchain_address()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Get BTC balance
    fn get_btc_balance(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.get_btc_balance()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Whitelist a trade
    fn whitelist_trade(&self, py: Python, swapstring: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.whitelist_trade(&swapstring)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Decode a Lightning invoice
    fn decode_ln_invoice(&self, py: Python, invoice: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result =
            std::thread::spawn(move || runtime.block_on(inner.decode_ln_invoice(&invoice)))
                .join()
                .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
                .map_err(|e| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e))
                })?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// List payments
    fn list_payments(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.list_payments()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Initialize wallet
    fn init_wallet(&self, py: Python, password: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.init_wallet(&password)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Unlock wallet
    fn unlock_wallet(&self, py: Python, password: String) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.unlock_wallet(&password)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    /// Lock wallet
    fn lock_wallet(&self, py: Python) -> PyResult<PyObject> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        let result = std::thread::spawn(move || runtime.block_on(inner.lock_wallet()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        pythonize(py, &result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
}

// === Main Client ===
#[pyclass]
struct PyKaleidoClient {
    inner: Arc<CoreKaleidoClient>,
    runtime: Arc<Runtime>,
}

#[pymethods]
impl PyKaleidoClient {
    #[new]
    fn new(config: PyKaleidoConfig) -> PyResult<Self> {
        let runtime = Runtime::new().map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!(
                "Failed to create runtime: {}",
                e
            ))
        })?;

        CoreKaleidoClient::new(config.inner)
            .map(|client| PyKaleidoClient {
                inner: Arc::new(client),
                runtime: Arc::new(runtime),
            })
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    fn has_node(&self) -> bool {
        self.inner.has_node()
    }

    fn market(&self) -> PyMarketClient {
        PyMarketClient {
            inner: Arc::clone(&self.inner.market),
            runtime: Arc::clone(&self.runtime),
        }
    }

    fn node(&self) -> Option<PyNodeClient> {
        self.inner.node.as_ref().map(|node| PyNodeClient {
            inner: Arc::clone(node),
            runtime: Arc::clone(&self.runtime),
        })
    }

    // === WebSocket Operations ===

    /// Connect to WebSocket with default configuration
    fn connect_websocket(&self) -> PyResult<()> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        std::thread::spawn(move || runtime.block_on(inner.connect_websocket()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Disconnect from WebSocket
    fn disconnect_websocket(&self) -> PyResult<()> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        std::thread::spawn(move || runtime.block_on(inner.disconnect_websocket()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Check if WebSocket is connected
    fn is_websocket_connected(&self) -> PyResult<bool> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        std::thread::spawn(move || runtime.block_on(inner.is_websocket_connected()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))
    }

    /// Request a quote via WebSocket (faster than HTTP)
    #[pyo3(signature = (ticker, from_amount=None, to_amount=None, layer="BTC_LN".to_string()))]
    fn get_quote_websocket(
        &self,
        ticker: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
        layer: String,
    ) -> PyResult<String> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        // Parse layer string
        let layer_enum: kaleidoswap_core::models::Layer =
            serde_json::from_str(&format!("\"{}\"", layer)).map_err(|_| {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Invalid layer: {}", layer))
            })?;

        let result = std::thread::spawn(move || {
            runtime.block_on(inner.get_quote_websocket(&ticker, from_amount, to_amount, layer_enum))
        })
        .join()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Reconnect WebSocket
    fn reconnect_websocket(&self) -> PyResult<()> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        std::thread::spawn(move || runtime.block_on(inner.connect_websocket()))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Subscribe to price updates for a trading pair
    fn subscribe_to_pair(&self, pair_id: String) -> PyResult<()> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        std::thread::spawn(move || runtime.block_on(inner.subscribe_to_pair(&pair_id)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{:?}", e)))
    }

    /// Unsubscribe from price updates for a trading pair
    fn unsubscribe_from_pair(&self, pair_id: String) -> PyResult<()> {
        let inner = Arc::clone(&self.inner);
        let runtime = Arc::clone(&self.runtime);

        std::thread::spawn(move || runtime.block_on(inner.unsubscribe_from_pair(&pair_id)))
            .join()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("Thread panicked"))?
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

// ============================================================================
// WebSocket Event Enum
// ============================================================================

/// WebSocket event types
#[pyclass]
#[derive(Clone, Copy, Debug)]
pub enum WsEvent {
    /// Price update event
    PriceUpdate,
    /// Quote response event
    QuoteResponse,
    /// Swap status update
    SwapUpdate,
    /// Order status update
    OrderUpdate,
    /// Connection established
    Connected,
    /// Connection lost
    Disconnected,
    /// Error occurred
    Error,
}

#[pymodule]
fn kaleidoswap(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<PyKaleidoConfig>()?;
    m.add_class::<PyKaleidoClient>()?;
    m.add_class::<PyMarketClient>()?;
    m.add_class::<PyNodeClient>()?;
    m.add_class::<WsEvent>()?;
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
