use serde::{Deserialize, Serialize};

/// Asset information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub asset_id: String,
    pub ticker: String,
    pub name: String,
    pub precision: u8,
}

/// Trading pair information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingPair {
    pub pair_id: String,
    pub base_asset: Asset,
    pub quote_asset: Asset,
    pub ticker: String, // e.g., "BTC/USDT"
}

/// Quote response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quote {
    pub rfq_id: String,
    pub from_asset_id: String,
    pub to_asset_id: String,
    pub from_amount: f64,
    pub to_amount: f64,
    pub rate: f64,
    pub expires_at: String,
}

/// Quote request parameters
#[derive(Debug, Clone)]
pub struct QuoteRequest {
    pub from_asset_id: String,
    pub to_asset_id: String,
    pub from_amount: Option<f64>,
    pub to_amount: Option<f64>,
}

/// Client configuration
#[derive(Debug, Clone)]
pub struct ClientConfig {
    pub base_url: String,
    pub api_key: Option<String>,
    pub timeout_secs: Option<u64>,
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            base_url: "https://api.staging.kaleidoswap.com/api/v1".to_string(),
            api_key: None,
            timeout_secs: Some(30),
        }
    }
}
