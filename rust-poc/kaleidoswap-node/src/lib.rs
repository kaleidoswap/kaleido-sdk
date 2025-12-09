use kaleidoswap_core::{
    Asset as CoreAsset, ClientConfig, KaleidoClient as CoreClient, Quote as CoreQuote,
    TradingPair as CoreTradingPair,
};
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::sync::Arc;

/// Kaleidoswap API client
#[napi]
pub struct KaleidoClient {
    inner: Arc<CoreClient>,
}

#[napi]
impl KaleidoClient {
    /// Create a new KaleidoClient
    /// 
    /// @param baseUrl - API base URL (default: https://api.staging.kaleidoswap.com/api/v1)
    /// @param apiKey - Optional API key for authenticated requests
    #[napi(constructor)]
    pub fn new(base_url: Option<String>, api_key: Option<String>) -> Self {
        let mut config = ClientConfig::default();
        if let Some(url) = base_url {
            config.base_url = url;
        }
        config.api_key = api_key;

        Self {
            inner: Arc::new(CoreClient::new(config)),
        }
    }

    /// List all available assets
    /// 
    /// @returns Promise<Asset[]> - List of available assets
    #[napi]
    pub async fn list_assets(&self) -> Result<Vec<Asset>> {
        self.inner
            .list_assets()
            .await
            .map(|assets| assets.into_iter().map(Asset::from).collect())
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    /// List all trading pairs
    /// 
    /// @returns Promise<TradingPair[]> - List of available trading pairs
    #[napi]
    pub async fn list_pairs(&self) -> Result<Vec<TradingPair>> {
        self.inner
            .list_pairs()
            .await
            .map(|pairs| pairs.into_iter().map(TradingPair::from).collect())
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    /// Get a quote by ticker pair (convenience method)
    /// 
    /// @param ticker - Trading pair ticker (e.g., "BTC/USDT")
    /// @param fromAmount - Amount of base asset (optional, mutually exclusive with toAmount)
    /// @param toAmount - Amount of quote asset (optional, mutually exclusive with fromAmount)
    /// @returns Promise<Quote> - Quote information
    /// 
    /// @example
    /// ```typescript
    /// const client = new KaleidoClient();
    /// const quote = await client.getQuoteByPair('BTC/USDT', 10000.0, null);
    /// console.log(`Rate: ${quote.rate}`);
    /// ```
    #[napi]
    pub async fn get_quote_by_pair(
        &self,
        ticker: String,
        from_amount: Option<f64>,
        to_amount: Option<f64>,
    ) -> Result<Quote> {
        self.inner
            .get_quote_by_pair(&ticker, from_amount, to_amount)
            .await
            .map(Quote::from)
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    /// Get asset by ticker symbol
    /// 
    /// @param ticker - Asset ticker symbol (e.g., "BTC")
    /// @returns Promise<Asset> - Asset information
    #[napi]
    pub async fn get_asset_by_ticker(&self, ticker: String) -> Result<Asset> {
        self.inner
            .get_asset_by_ticker(&ticker)
            .await
            .map(Asset::from)
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    /// Get trading pair by ticker
    /// 
    /// @param ticker - Trading pair ticker (e.g., "BTC/USDT")
    /// @returns Promise<TradingPair> - Trading pair information
    #[napi]
    pub async fn get_pair_by_ticker(&self, ticker: String) -> Result<TradingPair> {
        self.inner
            .get_pair_by_ticker(&ticker)
            .await
            .map(TradingPair::from)
            .map_err(|e| Error::from_reason(e.to_string()))
    }
}

/// Asset information
#[napi(object)]
pub struct Asset {
    pub asset_id: String,
    pub ticker: String,
    pub name: String,
    pub precision: u8,
}

impl From<CoreAsset> for Asset {
    fn from(asset: CoreAsset) -> Self {
        Self {
            asset_id: asset.asset_id,
            ticker: asset.ticker,
            name: asset.name,
            precision: asset.precision,
        }
    }
}

/// Trading pair information
#[napi(object)]
pub struct TradingPair {
    pub pair_id: String,
    pub ticker: String,
    pub base_asset: Asset,
    pub quote_asset: Asset,
}

impl From<CoreTradingPair> for TradingPair {
    fn from(pair: CoreTradingPair) -> Self {
        Self {
            pair_id: pair.pair_id,
            ticker: pair.ticker,
            base_asset: Asset::from(pair.base_asset),
            quote_asset: Asset::from(pair.quote_asset),
        }
    }
}

/// Quote information
#[napi(object)]
pub struct Quote {
    pub rfq_id: String,
    pub from_asset_id: String,
    pub to_asset_id: String,
    pub from_amount: f64,
    pub to_amount: f64,
    pub rate: f64,
    pub expires_at: String,
}

impl From<CoreQuote> for Quote {
    fn from(quote: CoreQuote) -> Self {
        Self {
            rfq_id: quote.rfq_id,
            from_asset_id: quote.from_asset_id,
            to_asset_id: quote.to_asset_id,
            from_amount: quote.from_amount,
            to_amount: quote.to_amount,
            rate: quote.rate,
            expires_at: quote.expires_at,
        }
    }
}
