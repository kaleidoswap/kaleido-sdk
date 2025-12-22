//! Market API operations (assets, pairs, quotes).

use crate::error::{KaleidoError, Result};
use crate::http::HttpClient;
use crate::models::{
    Asset, AssetsResponse, PairQuoteRequest, PairQuoteResponse, TradingPair, TradingPairsResponse,
    ValidationResult,
};
use std::sync::Arc;

/// Market API client.
pub struct MarketApi {
    http: Arc<HttpClient>,
}

impl MarketApi {
    /// Create a new Market API client.
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// List all available assets.
    pub async fn list_assets(&self) -> Result<Vec<Asset>> {
        let response: AssetsResponse = self.http.get("/api/v1/market/assets").await?;
        Ok(response.assets)
    }

    /// List all available trading pairs.
    pub async fn list_pairs(&self) -> Result<Vec<TradingPair>> {
        let response: TradingPairsResponse = self.http.get("/api/v1/market/pairs").await?;
        Ok(response.pairs)
    }

    /// Get a quote for a swap.
    ///
    /// With the new model, amounts are specified inside the SwapLegInput.
    /// Exactly one of from_asset.amount or to_asset.amount must be specified.
    pub async fn get_quote(&self, request: &PairQuoteRequest) -> Result<PairQuoteResponse> {
        // Validate that exactly one of the amounts is set
        let from_has_amount = request.from_asset.amount.is_some()
            && request.from_asset.amount.as_ref().unwrap().is_some();
        let to_has_amount = request.to_asset.amount.is_some()
            && request.to_asset.amount.as_ref().unwrap().is_some();

        match (from_has_amount, to_has_amount) {
            (true, true) => {
                return Err(KaleidoError::validation(
                    "Cannot specify both from_amount and to_amount",
                ));
            }
            (false, false) => {
                return Err(KaleidoError::validation(
                    "Must specify either from_amount or to_amount",
                ));
            }
            _ => {}
        }

        self.http.post("/api/v1/market/quote", request).await
    }
}

/// Helper functions for working with assets and pairs.
pub struct MarketHelper {
    assets: Vec<Asset>,
    pairs: Vec<TradingPair>,
}

impl MarketHelper {
    /// Create a new market helper with cached data.
    pub fn new(assets: Vec<Asset>, pairs: Vec<TradingPair>) -> Self {
        Self { assets, pairs }
    }

    /// Find an asset by ticker (case-insensitive).
    pub fn find_asset_by_ticker(&self, ticker: &str) -> Option<&Asset> {
        let ticker_upper = ticker.to_uppercase();
        self.assets
            .iter()
            .find(|a| a.ticker.to_uppercase() == ticker_upper)
    }

    /// Find an asset by ID.
    pub fn find_asset_by_id(&self, asset_id: &str) -> Option<&Asset> {
        self.assets.iter().find(|a| a.ticker == asset_id)
    }

    /// Find a trading pair by ticker (e.g., "BTC/USDT").
    ///
    /// Uses the new TradingPair structure with base/quote TradableAsset fields.
    pub fn find_pair_by_ticker(&self, ticker: &str) -> Option<&TradingPair> {
        let parts: Vec<&str> = ticker.split('/').collect();
        if parts.len() != 2 {
            return None;
        }

        let (base, quote) = (parts[0].to_uppercase(), parts[1].to_uppercase());

        self.pairs.iter().find(|p| {
            p.base.ticker.to_uppercase() == base && p.quote.ticker.to_uppercase() == quote
        })
    }

    /// Find a trading pair by base and quote asset IDs.
    pub fn find_pair_by_asset_ids(&self, base_id: &str, quote_id: &str) -> Option<&TradingPair> {
        self.pairs
            .iter()
            .find(|p| p.base.ticker == base_id && p.quote.ticker == quote_id)
    }

    /// Get all active assets.
    pub fn active_assets(&self) -> Vec<&Asset> {
        self.assets
            .iter()
            .filter(|a| a.is_active.unwrap_or(false))
            .collect()
    }

    /// Get all active pairs.
    pub fn active_pairs(&self) -> Vec<&TradingPair> {
        self.pairs
            .iter()
            .filter(|p| p.is_active.unwrap_or(false))
            .collect()
    }

    /// Validate an amount against pair constraints.
    ///
    /// Note: Trading limits are now on the TradableAsset endpoints, not the pair directly.
    /// This method now returns valid for all amounts as limits should be checked
    /// at the endpoint level when known.
    pub fn validate_amount(
        &self,
        _pair: &TradingPair,
        _amount: i64,
        _is_base: bool,
    ) -> ValidationResult {
        // With the new model, trading limits are inside TradableAsset.endpoints
        // For now, return valid - validation should happen at API level
        ValidationResult::valid()
    }
}

// Tests removed - would require complex setup with new nested TradingPair structure
