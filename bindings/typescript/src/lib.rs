//! WebAssembly bindings for the Kaleidoswap SDK using wasm-bindgen.
//!
//! This crate provides browser and Node.js compatible JavaScript bindings for the Kaleidoswap SDK.
//! All methods are async and return Promises in JavaScript.
//!
//! ## Features
//! - **Number support**: All amounts use JavaScript numbers for better developer experience
//! - **Typed returns**: Objects are returned directly, no JSON parsing needed
//! - **Structured errors**: Errors contain code, message, and status for proper exception mapping

mod error;

use error::to_js_error;
use kaleidoswap_core::{
    client::KaleidoClient as CoreClient, models::*, KaleidoConfig as CoreConfig,
};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::Serializer;
use std::sync::Arc;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

// Set up panic hook for better error messages in development
#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Serializer configuration - use regular JavaScript numbers for better UX
/// Numbers are safe up to 2^53 (9 quadrillion), which is sufficient for satoshi amounts
fn serializer() -> Serializer {
    Serializer::new().serialize_large_number_types_as_bigints(false)
}

/// Helper to serialize Rust types to JavaScript objects directly (no JSON)
fn to_js_value<T: serde::Serialize>(value: &T) -> Result<JsValue, JsValue> {
    value
        .serialize(&serializer())
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Log to browser console
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// ============================================================================
// Configuration
// ============================================================================

/// Configuration for the Kaleidoswap client
#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KaleidoConfig {
    base_url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    node_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    api_key: Option<String>,
    timeout: f64,
    max_retries: u32,
    cache_ttl: u32, // Use u32 to avoid BigInt conversion
}

#[wasm_bindgen]
impl KaleidoConfig {
    /// Create a new configuration
    #[wasm_bindgen(constructor)]
    pub fn new(
        base_url: String,
        node_url: Option<String>,
        api_key: Option<String>,
        timeout: f64,
        max_retries: u32,
        cache_ttl: u32,
    ) -> KaleidoConfig {
        KaleidoConfig {
            base_url,
            node_url,
            api_key,
            timeout,
            max_retries,
            cache_ttl,
        }
    }

    /// Create a default configuration with a base URL
    #[wasm_bindgen(js_name = withDefaults)]
    pub fn with_defaults(base_url: String) -> KaleidoConfig {
        KaleidoConfig {
            base_url,
            node_url: None,
            api_key: None,
            timeout: 30.0,
            max_retries: 3,
            cache_ttl: 60,
        }
    }

    /// Set node URL
    #[wasm_bindgen(js_name = setNodeUrl)]
    pub fn set_node_url(&mut self, node_url: Option<String>) {
        self.node_url = node_url;
    }

    /// Set API key
    #[wasm_bindgen(js_name = setApiKey)]
    pub fn set_api_key(&mut self, api_key: Option<String>) {
        self.api_key = api_key;
    }

    /// Get base URL
    #[wasm_bindgen(js_name = getBaseUrl)]
    pub fn get_base_url(&self) -> String {
        self.base_url.clone()
    }
}

impl From<KaleidoConfig> for CoreConfig {
    fn from(config: KaleidoConfig) -> Self {
        let mut cfg = CoreConfig::new(config.base_url);
        cfg.node_url = config.node_url;
        cfg.api_key = config.api_key;
        cfg.timeout = config.timeout;
        cfg.max_retries = config.max_retries;
        cfg.cache_ttl = config.cache_ttl as u64;
        cfg
    }
}

// ============================================================================
// Main Client
// ============================================================================

/// Kaleidoswap client for browser and Node.js environments
#[wasm_bindgen]
pub struct KaleidoClient {
    inner: Arc<CoreClient>,
}

#[wasm_bindgen]
impl KaleidoClient {
    /// Create a new Kaleidoswap client
    #[wasm_bindgen(constructor)]
    pub fn new(config: KaleidoConfig) -> Result<KaleidoClient, JsValue> {
        let core_config: CoreConfig = config.into();
        let inner = CoreClient::new(core_config).map_err(to_js_error)?;
        Ok(KaleidoClient {
            inner: Arc::new(inner),
        })
    }

    /// Check if the client has a node URL configured
    #[wasm_bindgen(js_name = hasNode)]
    pub fn has_node(&self) -> bool {
        self.inner.has_node()
    }

    // === Market Operations ===

    /// List all available assets
    /// Returns a Promise that resolves to an array of Asset objects
    #[wasm_bindgen(js_name = listAssets)]
    pub fn list_assets(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_assets()
                .await
                .and_then(|assets| {
                    to_js_value(&assets).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// List all available trading pairs
    /// Returns a Promise that resolves to an array of TradingPair objects
    #[wasm_bindgen(js_name = listPairs)]
    pub fn list_pairs(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_pairs()
                .await
                .and_then(|pairs| {
                    to_js_value(&pairs).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// List only active assets
    #[wasm_bindgen(js_name = listActiveAssets)]
    pub fn list_active_assets(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_active_assets()
                .await
                .and_then(|assets| {
                    to_js_value(&assets).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// List only active trading pairs
    #[wasm_bindgen(js_name = listActivePairs)]
    pub fn list_active_pairs(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_active_pairs()
                .await
                .and_then(|pairs| {
                    to_js_value(&pairs).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get an asset by ticker
    #[wasm_bindgen(js_name = getAssetByTicker)]
    pub fn get_asset_by_ticker(&self, ticker: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .find_asset_by_ticker(&ticker)
                .await
                .and_then(|asset| {
                    to_js_value(&asset).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get a trading pair by ticker (e.g., "BTC/USDT")
    #[wasm_bindgen(js_name = getPairByTicker)]
    pub fn get_pair_by_ticker(&self, ticker: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .find_pair_by_ticker(&ticker)
                .await
                .and_then(|pair| {
                    to_js_value(&pair).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get a quote by trading pair ticker
    /// from_layer and to_layer should be "BTC_LN", "BTC_L1", "RGB_LN", "RGB_L1", etc.
    #[wasm_bindgen(js_name = getQuoteByPair)]
    pub fn get_quote_by_pair(
        &self,
        ticker: String,
        from_amount: Option<f64>,
        to_amount: Option<f64>,
        from_layer: String,
        to_layer: String,
    ) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            // Parse layer strings
            let from_layer_enum = parse_layer(&from_layer)?;
            let to_layer_enum = parse_layer(&to_layer)?;

            // Convert f64 to i64 for the core client
            let from_amount_i64 = from_amount.map(|v| v as i64);
            let to_amount_i64 = to_amount.map(|v| v as i64);

            inner
                .get_quote_by_pair(
                    &ticker,
                    from_amount_i64,
                    to_amount_i64,
                    from_layer_enum,
                    to_layer_enum,
                )
                .await
                .and_then(|quote| {
                    to_js_value(&quote).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get a quote by asset tickers (convenience method)
    #[wasm_bindgen(js_name = getQuoteByAssets)]
    pub fn get_quote_by_assets(
        &self,
        from_ticker: String,
        to_ticker: String,
        from_amount: Option<f64>,
        to_amount: Option<f64>,
        from_layer: String,
        to_layer: String,
    ) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            // Parse layer strings
            let from_layer_enum = parse_layer(&from_layer)?;
            let to_layer_enum = parse_layer(&to_layer)?;

            // Construct pair ticker
            let pair_ticker = format!("{}/{}", from_ticker, to_ticker);

            // Convert f64 to i64 for the core client
            let from_amount_i64 = from_amount.map(|v| v as i64);
            let to_amount_i64 = to_amount.map(|v| v as i64);

            inner
                .get_quote_by_pair(
                    &pair_ticker,
                    from_amount_i64,
                    to_amount_i64,
                    from_layer_enum,
                    to_layer_enum,
                )
                .await
                .and_then(|quote| {
                    to_js_value(&quote).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    // === Swap Operations ===

    /// Get node information
    #[wasm_bindgen(js_name = getNodeInfo)]
    pub fn get_node_info(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_node_info()
                .await
                .and_then(|info| {
                    to_js_value(&info).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get swap status by payment hash
    #[wasm_bindgen(js_name = getSwapStatus)]
    pub fn get_swap_status(&self, payment_hash: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_swap_status(&payment_hash)
                .await
                .and_then(|status| {
                    to_js_value(&status).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Initialize a swap directly with the Maker
    #[wasm_bindgen(js_name = initSwap)]
    pub fn init_swap(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: SwapRequest = serde_wasm_bindgen::from_value(request).map_err(|e| {
                to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                    e.to_string(),
                ))
            })?;

            inner
                .init_swap(&req)
                .await
                .and_then(|res| {
                    to_js_value(&res).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Whitelist a trade (if using a User Node)
    #[wasm_bindgen(js_name = whitelistTrade)]
    pub fn whitelist_trade(&self, swapstring: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .whitelist_trade(&swapstring)
                .await
                .map(|_| JsValue::NULL)
                .map_err(to_js_error)
        })
    }

    /// Execute/Confirm a swap
    #[wasm_bindgen(js_name = executeSwap)]
    pub fn execute_swap(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: ConfirmSwapRequest = serde_wasm_bindgen::from_value(request).map_err(|e| {
                to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                    e.to_string(),
                ))
            })?;

            inner
                .execute_swap(&req)
                .await
                .and_then(|res| {
                    to_js_value(&res).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    // === Swap Order Operations ===

    /// Create a swap order
    /// Request should be a CreateSwapOrderRequest object
    #[wasm_bindgen(js_name = createSwapOrder)]
    pub fn create_swap_order(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: CreateSwapOrderRequest =
                serde_wasm_bindgen::from_value(request).map_err(|e| {
                    to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                        e.to_string(),
                    ))
                })?;

            inner
                .create_swap_order(&req)
                .await
                .and_then(|response| {
                    to_js_value(&response).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get swap order status
    #[wasm_bindgen(js_name = getSwapOrderStatus)]
    pub fn get_swap_order_status(&self, order_id: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_swap_order_status(&order_id)
                .await
                .and_then(|status| {
                    to_js_value(&status).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get order history
    #[wasm_bindgen(js_name = getOrderHistory)]
    pub fn get_order_history(
        &self,
        status: Option<String>,
        limit: i32,
        skip: i32,
    ) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_order_history(status.as_deref(), limit, skip)
                .await
                .and_then(|history| {
                    to_js_value(&history).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get order analytics
    #[wasm_bindgen(js_name = getOrderAnalytics)]
    pub fn get_order_analytics(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_order_analytics()
                .await
                .and_then(|stats| {
                    to_js_value(&stats).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    // === LSP Operations ===

    /// Get LSP information
    #[wasm_bindgen(js_name = getLspInfo)]
    pub fn get_lsp_info(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_lsp_info()
                .await
                .and_then(|info| {
                    to_js_value(&info).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Get LSP network information
    #[wasm_bindgen(js_name = getLspNetworkInfo)]
    pub fn get_lsp_network_info(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_lsp_network_info()
                .await
                .and_then(|info| {
                    to_js_value(&info).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    /// Estimate LSP fees
    #[wasm_bindgen(js_name = estimateLspFees)]
    pub fn estimate_lsp_fees(&self, channel_size: f64) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let channel_size_i64 = channel_size as i64;
            inner
                .estimate_lsp_fees(channel_size_i64)
                .await
                .and_then(|fees| {
                    to_js_value(&fees).map_err(|e| {
                        kaleidoswap_core::error::KaleidoError::validation(
                            e.as_string().unwrap_or_default(),
                        )
                    })
                })
                .map_err(to_js_error)
        })
    }

    // === RGB Lightning Node Operations ===

    /// Get RGB node information from the taker's local RGB Lightning Node.
    /// Returns pubkey and other node info needed for swap execution.
    #[wasm_bindgen(js_name = getRgbNodeInfo)]
    pub fn get_rgb_node_info(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_rgb_node_info()
                .await
                .map(|info| {
                    // Return the JSON value directly
                    serde_wasm_bindgen::to_value(&info)
                        .unwrap_or_else(|_| JsValue::from_str(&info.to_string()))
                })
                .map_err(to_js_error)
        })
    }

    /// Get the taker's pubkey from the local RGB Lightning Node.
    /// This is a convenience method that extracts just the pubkey from getRgbNodeInfo.
    #[wasm_bindgen(js_name = getTakerPubkey)]
    pub fn get_taker_pubkey(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let info = inner.get_rgb_node_info().await.map_err(to_js_error)?;
            let pubkey = info
                .get("pubkey")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string())
                .unwrap_or_default();
            Ok(JsValue::from_str(&pubkey))
        })
    }

    /// List channels on the RGB node
    #[wasm_bindgen(js_name = listChannels)]
    pub fn list_channels(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_channels()
                .await
                .map(|channels| serde_wasm_bindgen::to_value(&channels).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Open a channel on the RGB node
    #[wasm_bindgen(js_name = openChannel)]
    pub fn open_channel(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: kaleidoswap_core::models::rln::OpenChannelRequest =
                serde_wasm_bindgen::from_value(request).map_err(|e| {
                    to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                        e.to_string(),
                    ))
                })?;
            inner
                .open_channel(&req)
                .await
                .map(|res| serde_wasm_bindgen::to_value(&res).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Close a channel on the RGB node
    #[wasm_bindgen(js_name = closeChannel)]
    pub fn close_channel(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: kaleidoswap_core::models::rln::CloseChannelRequest =
                serde_wasm_bindgen::from_value(request).map_err(|e| {
                    to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                        e.to_string(),
                    ))
                })?;
            inner
                .close_channel(&req)
                .await
                .map(|res| serde_wasm_bindgen::to_value(&res).unwrap())
                .map_err(to_js_error)
        })
    }

    /// List peers on the RGB node
    #[wasm_bindgen(js_name = listPeers)]
    pub fn list_peers(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_peers()
                .await
                .map(|peers| serde_wasm_bindgen::to_value(&peers).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Connect to a peer on the RGB node
    #[wasm_bindgen(js_name = connectPeer)]
    pub fn connect_peer(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: kaleidoswap_core::models::rln::ConnectPeerRequest =
                serde_wasm_bindgen::from_value(request).map_err(|e| {
                    to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                        e.to_string(),
                    ))
                })?;
            inner
                .connect_peer(&req)
                .await
                .map(|res| serde_wasm_bindgen::to_value(&res).unwrap())
                .map_err(to_js_error)
        })
    }

    /// List RGB assets on the node
    #[wasm_bindgen(js_name = listNodeAssets)]
    pub fn list_node_assets(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_node_assets()
                .await
                .map(|assets| serde_wasm_bindgen::to_value(&assets).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Get asset balance from the node
    #[wasm_bindgen(js_name = getAssetBalance)]
    pub fn get_asset_balance(&self, asset_id: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_asset_balance(&asset_id)
                .await
                .map(|balance| serde_wasm_bindgen::to_value(&balance).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Get a Bitcoin address from the node
    #[wasm_bindgen(js_name = getOnchainAddress)]
    pub fn get_onchain_address(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_onchain_address()
                .await
                .map(|addr| serde_wasm_bindgen::to_value(&addr).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Get BTC balance from the node
    #[wasm_bindgen(js_name = getBtcBalance)]
    pub fn get_btc_balance(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .get_btc_balance()
                .await
                .map(|balance| serde_wasm_bindgen::to_value(&balance).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Create a Lightning invoice on the node
    #[wasm_bindgen(js_name = createLnInvoice)]
    pub fn create_ln_invoice(
        &self,
        amt_msat: Option<f64>,
        expiry_sec: Option<f64>,
        asset_amount: Option<f64>,
        asset_id: Option<String>,
    ) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let amt_msat_i64 = amt_msat.map(|v| v as i64);
            let expiry_sec_i64 = expiry_sec.map(|v| v as i64);
            let asset_amount_i64 = asset_amount.map(|v| v as i64);
            inner
                .create_ln_invoice(amt_msat_i64, expiry_sec_i64, asset_amount_i64, asset_id)
                .await
                .map(|invoice| serde_wasm_bindgen::to_value(&invoice).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Decode a Lightning invoice
    #[wasm_bindgen(js_name = decodeLnInvoice)]
    pub fn decode_ln_invoice(&self, invoice: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .decode_ln_invoice(&invoice)
                .await
                .map(|decoded| serde_wasm_bindgen::to_value(&decoded).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Send a keysend payment
    #[wasm_bindgen(js_name = keysend)]
    pub fn keysend(&self, request: JsValue) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            let req: kaleidoswap_core::models::rln::KeysendRequest =
                serde_wasm_bindgen::from_value(request).map_err(|e| {
                    to_js_error(kaleidoswap_core::error::KaleidoError::validation(
                        e.to_string(),
                    ))
                })?;
            inner
                .keysend(&req)
                .await
                .map(|res| serde_wasm_bindgen::to_value(&res).unwrap())
                .map_err(to_js_error)
        })
    }

    /// List payments on the node
    #[wasm_bindgen(js_name = listPayments)]
    pub fn list_payments(&self) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .list_payments()
                .await
                .map(|payments| serde_wasm_bindgen::to_value(&payments).unwrap())
                .map_err(to_js_error)
        })
    }

    /// Initialize the node wallet
    #[wasm_bindgen(js_name = initWallet)]
    pub fn init_wallet(&self, password: String) -> js_sys::Promise {
        let inner = Arc::clone(&self.inner);
        future_to_promise(async move {
            inner
                .init_wallet(&password)
                .await
                .map(|res| serde_wasm_bindgen::to_value(&res).unwrap())
                .map_err(to_js_error)
        })
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Parse layer string to Layer enum
fn parse_layer(layer: &str) -> Result<Layer, JsValue> {
    match layer {
        "BTC_L1" | "Onchain" => Ok(Layer::BtcL1),
        "BTC_LN" | "Lightning" => Ok(Layer::BtcLn),
        "BTC_SPARK" | "Spark" => Ok(Layer::BtcSpark),
        "BTC_ARKADE" => Ok(Layer::BtcArkade),
        "BTC_LIQUID" => Ok(Layer::BtcLiquid),
        "BTC_CASHU" => Ok(Layer::BtcCashu),
        "RGB_L1" => Ok(Layer::RgbL1),
        "RGB_LN" => Ok(Layer::RgbLn),
        "TAPASS_L1" => Ok(Layer::TapassL1),
        "TAPASS_LN" => Ok(Layer::TapassLn),
        "LIQUID_LIQUID" => Ok(Layer::LiquidLiquid),
        "ARKADE_ARKADE" => Ok(Layer::ArkadeArkade),
        "SPARK_SPARK" => Ok(Layer::SparkSpark),
        _ => Err(to_js_error(kaleidoswap_core::error::KaleidoError::validation(
            format!("Invalid layer: {}. Expected one of: BTC_L1, BTC_LN, BTC_SPARK, RGB_L1, RGB_LN, etc.", layer)
        ))),
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/// Convert display units to smallest units
#[wasm_bindgen(js_name = toSmallestUnits)]
pub fn to_smallest_units(amount: f64, precision: u32) -> f64 {
    amount * 10_f64.powi(precision as i32)
}

/// Convert smallest units to display units
#[wasm_bindgen(js_name = toDisplayUnits)]
pub fn to_display_units(amount: f64, precision: u32) -> f64 {
    amount / 10_f64.powi(precision as i32)
}

// ============================================================================
// Module Info
// ============================================================================

/// Get SDK version
#[wasm_bindgen(js_name = getVersion)]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Get SDK name
#[wasm_bindgen(js_name = getSdkName)]
pub fn get_sdk_name() -> String {
    "kaleidoswap-sdk".to_string()
}
