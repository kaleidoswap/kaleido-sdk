use crate::{
    error::{KaleidoError, Result},
    http::HttpClient,
    types::*,
};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Main Kaleidoswap client
pub struct KaleidoClient {
    http: Arc<HttpClient>,
    assets_cache: Arc<RwLock<Option<Vec<Asset>>>>,
    pairs_cache: Arc<RwLock<Option<Vec<TradingPair>>>>,
}

impl KaleidoClient {
    /// Create a new Kaleidoswap client
    pub fn new(config: ClientConfig) -> Self {
        Self {
            http: Arc::new(HttpClient::new(
                config.base_url,
                config.timeout_secs,
            )),
            assets_cache: Arc::new(RwLock::new(None)),
            pairs_cache: Arc::new(RwLock::new(None)),
        }
    }

    /// List all available assets
    pub async fn list_assets(&self) -> Result<Vec<Asset>> {
        #[derive(serde::Deserialize)]
        struct Response {
            assets: Vec<Asset>,
        }

        let resp: Response = self.http.get("/assets").await?;

        // Update cache
        *self.assets_cache.write().await = Some(resp.assets.clone());

        Ok(resp.assets)
    }

    /// List all trading pairs
    pub async fn list_pairs(&self) -> Result<Vec<TradingPair>> {
        #[derive(serde::Deserialize)]
        struct Response {
            pairs: Vec<TradingPair>,
        }

        let resp: Response = self.http.get("/pairs").await?;

        // Update cache
        *self.pairs_cache.write().await = Some(resp.pairs.clone());

        Ok(resp.pairs)
    }

    /// Get a quote (low-level API)
    pub async fn get_quote(&self, request: QuoteRequest) -> Result<Quote> {
        #[derive(serde::Serialize)]
        struct Request {
            from_asset_id: String,
            to_asset_id: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            from_amount: Option<f64>,
            #[serde(skip_serializing_if = "Option::is_none")]
            to_amount: Option<f64>,
        }

        // Validate that exactly one amount is specified
        match (&request.from_amount, &request.to_amount) {
            (None, None) | (Some(_), Some(_)) => {
                return Err(KaleidoError::InvalidAmount);
            }
            _ => {}
        }

        let req = Request {
            from_asset_id: request.from_asset_id,
            to_asset_id: request.to_asset_id,
            from_amount: request.from_amount,
            to_amount: request.to_amount,
        };

        self.http.post("/quote", &req).await
    }

    /// Get quote by ticker pair (high-level convenience API)
    /// 
    /// # Arguments
    /// 
    /// * `ticker` - Trading pair ticker (e.g., "BTC/USDT")
    /// * `from_amount` - Amount of base asset (mutually exclusive with to_amount)
    /// * `to_amount` - Amount of quote asset (mutually exclusive with from_amount)
    /// 
    /// # Example
    /// 
    /// ```no_run
    /// # use kaleidoswap_core::{KaleidoClient, ClientConfig};
    /// # #[tokio::main]
    /// # async fn main() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = KaleidoClient::new(ClientConfig::default());
    /// let quote = client.get_quote_by_pair("BTC/USDT", Some(10000.0), None).await?;
    /// println!("Rate: {}", quote.rate);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn get_quote_by_pair(
        &self,
        ticker: &str,
        from_amount: Option<f64>,
        to_amount: Option<f64>,
    ) -> Result<Quote> {
        // Validate ticker format
        if !ticker.contains('/') {
            return Err(KaleidoError::InvalidTicker(format!(
                "Expected format: 'BASE/QUOTE' (e.g., 'BTC/USDT'), got: '{}'",
                ticker
            )));
        }

        // Find pair by ticker
        let pair = self.get_pair_by_ticker(ticker).await?;

        // Create quote request
        let request = QuoteRequest {
            from_asset_id: pair.base_asset.asset_id,
            to_asset_id: pair.quote_asset.asset_id,
            from_amount,
            to_amount,
        };

        self.get_quote(request).await
    }

    /// Get asset by ticker symbol
    pub async fn get_asset_by_ticker(&self, ticker: &str) -> Result<Asset> {
        // Try cache first
        if let Some(assets) = self.assets_cache.read().await.as_ref() {
            if let Some(asset) = assets.iter().find(|a| a.ticker == ticker) {
                return Ok(asset.clone());
            }
        }

        // Fetch and search
        let assets = self.list_assets().await?;
        assets
            .into_iter()
            .find(|a| a.ticker == ticker)
            .ok_or_else(|| KaleidoError::AssetNotFound(ticker.to_string()))
    }

    /// Get asset by asset ID
    pub async fn get_asset_by_id(&self, asset_id: &str) -> Result<Asset> {
        // Try cache first
        if let Some(assets) = self.assets_cache.read().await.as_ref() {
            if let Some(asset) = assets.iter().find(|a| a.asset_id == asset_id) {
                return Ok(asset.clone());
            }
        }

        // Fetch and search
        let assets = self.list_assets().await?;
        assets
            .into_iter()
            .find(|a| a.asset_id == asset_id)
            .ok_or_else(|| KaleidoError::AssetNotFound(asset_id.to_string()))
    }

    /// Get pair by ticker
    pub async fn get_pair_by_ticker(&self, ticker: &str) -> Result<TradingPair> {
        // Try cache first
        if let Some(pairs) = self.pairs_cache.read().await.as_ref() {
            if let Some(pair) = pairs.iter().find(|p| p.ticker == ticker) {
                return Ok(pair.clone());
            }
        }

        // Fetch and search
        let pairs = self.list_pairs().await?;
        pairs
            .into_iter()
            .find(|p| p.ticker == ticker)
            .ok_or_else(|| KaleidoError::PairNotFound(ticker.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let config = ClientConfig::default();
        let _client = KaleidoClient::new(config);
    }

    #[test]
    fn test_invalid_ticker_format() {
        let ticker = "BTCUSDT"; // Missing slash
        assert!(!ticker.contains('/'));
    }
}
