//! # Kaleidoswap Core SDK
//!
//! This is the core Rust library for interacting with the Kaleidoswap protocol.
//! It provides a high-level client for trading RGB assets on Lightning Network.
//!
//! ## Features
//!
//! - **Market Operations**: List assets, pairs, and get quotes
//! - **Atomic Swaps**: Initialize and execute maker swaps
//! - **Swap Orders**: Create and manage swap orders
//! - **LSP Operations**: Interact with Lightning Service Providers
//! - **Node Operations**: Manage RGB Lightning Node (when connected)
//!
//! ## Example
//!
//! ```rust,no_run
//! use kaleidoswap_core::{KaleidoClient, KaleidoConfig};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let config = KaleidoConfig::new("https://api.regtest.kaleidoswap.com");
//!     let client = KaleidoClient::new(config)?;
//!
//!     let assets = client.list_assets().await?;
//!     println!("Found {} assets", assets.len());
//!
//!     Ok(())
//! }
//! ```

pub mod api;
pub mod client;
pub mod error;
pub mod generated;
pub mod http;
pub mod models;
pub mod retry;
pub mod websocket;

// Re-exports for convenience
pub use client::KaleidoClient;
pub use error::{KaleidoError, Result};
pub use models::*;

// Export API modules for bindings
pub use api::{LspApi, MarketApi, NodeApi, OrdersApi, SwapsApi};

/// Configuration for the Kaleidoswap client.
#[derive(Debug, Clone)]
pub struct KaleidoConfig {
    /// Base URL for the Kaleidoswap Maker API
    pub base_url: String,
    /// Optional URL for the RGB Lightning Node
    pub node_url: Option<String>,
    /// Optional API key for authentication
    pub api_key: Option<String>,
    /// Request timeout in seconds
    pub timeout: f64,
    /// Maximum number of retries for failed requests
    pub max_retries: u32,
    /// Cache TTL in seconds
    pub cache_ttl: u64,
}

impl KaleidoConfig {
    /// Create a new configuration with the given base URL.
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            node_url: None,
            api_key: None,
            timeout: 30.0,
            max_retries: 3,
            cache_ttl: 300,
        }
    }

    /// Set the RGB Lightning Node URL.
    pub fn with_node_url(mut self, url: impl Into<String>) -> Self {
        self.node_url = Some(url.into());
        self
    }

    /// Set the API key.
    pub fn with_api_key(mut self, key: impl Into<String>) -> Self {
        self.api_key = Some(key.into());
        self
    }

    /// Set the request timeout in seconds.
    pub fn with_timeout(mut self, timeout: f64) -> Self {
        self.timeout = timeout;
        self
    }

    /// Set the maximum number of retries.
    pub fn with_max_retries(mut self, retries: u32) -> Self {
        self.max_retries = retries;
        self
    }

    /// Set the cache TTL in seconds.
    pub fn with_cache_ttl(mut self, ttl: u64) -> Self {
        self.cache_ttl = ttl;
        self
    }
}

impl Default for KaleidoConfig {
    fn default() -> Self {
        Self::new("https://api.regtest.kaleidoswap.com")
    }
}
