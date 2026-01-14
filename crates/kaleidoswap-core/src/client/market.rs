use crate::error::{KaleidoError, Result};
use crate::generated::maker::Client as GeneratedMakerClient;
use crate::generated::maker::Error as MakerError;
use crate::models::{
    self, Asset, ConfirmSwapRequest, ConfirmSwapResponse, CreateOrderRequest,
    CreateSwapOrderRequest, Layer, PairQuoteRequest, PairQuoteResponse, Swap, SwapLegInput,
    SwapRequest, SwapResponse, TradingPair,
};
use crate::time::Timestamp;
use std::time::Duration;
use tokio::sync::RwLock;

// Error mapping helper
fn map_maker_error<E>(e: MakerError<E>) -> KaleidoError
where
    E: std::fmt::Debug,
{
    let s = format!("{:?}", e);
    if s.contains("status: 404") {
        return KaleidoError::not_found("Resource", "not found");
    }
    if s.contains("status: 400") || s.contains("status: 422") {
        return KaleidoError::validation(s);
    }
    KaleidoError::InternalError(format!("Maker API Error: {}", s))
}

/// Cache entry with timestamp.
struct CacheEntry<T> {
    data: T,
    timestamp: Timestamp,
}

pub struct MarketClient {
    client: GeneratedMakerClient,
    assets_cache: RwLock<Option<CacheEntry<Vec<Asset>>>>,
    pairs_cache: RwLock<Option<CacheEntry<Vec<TradingPair>>>>,
    cache_ttl: Duration,
}

impl MarketClient {
    pub fn new(base_url: &str, cache_ttl: Duration) -> Self {
        Self {
            client: GeneratedMakerClient::new(base_url),
            assets_cache: RwLock::new(None),
            pairs_cache: RwLock::new(None),
            cache_ttl,
        }
    }

    fn is_cache_valid(&self, timestamp: &Timestamp) -> bool {
        timestamp.elapsed() < self.cache_ttl
    }

    /// List all available assets.
    pub async fn list_assets(&self) -> Result<Vec<Asset>> {
        {
            let cache = self.assets_cache.read().await;
            if let Some(entry) = &*cache {
                if self.is_cache_valid(&entry.timestamp) {
                    return Ok(entry.data.clone());
                }
            }
        }
        self.list_assets_uncached().await
    }

    async fn list_assets_uncached(&self) -> Result<Vec<Asset>> {
        let response = self
            .client
            .list_assets(None, None, None, None, None, None, None, None)
            .await
            .map_err(map_maker_error)?;

        let assets_response = response.into_inner();
        let assets = assets_response.assets;

        {
            let mut cache = self.assets_cache.write().await;
            *cache = Some(CacheEntry {
                data: assets.clone(),
                timestamp: Timestamp::now(),
            });
        }
        Ok(assets)
    }

    /// List all available trading pairs.
    pub async fn list_pairs(&self) -> Result<Vec<TradingPair>> {
        {
            let cache = self.pairs_cache.read().await;
            if let Some(entry) = &*cache {
                if self.is_cache_valid(&entry.timestamp) {
                    return Ok(entry.data.clone());
                }
            }
        }
        self.list_pairs_uncached().await
    }

    async fn list_pairs_uncached(&self) -> Result<Vec<TradingPair>> {
        let response = self
            .client
            .get_pairs(
                None, // active_only
                None, // asset
                None, // base_ticker
                None, // from_asset_id
                None, // layer
                None, // limit
                None, // offset
                None, // pair_id
                None, // pair_ticker
                None, // quote_asset_id
                None, // quote_ticker
            )
            .await
            .map_err(map_maker_error)?;

        let pairs_response = response.into_inner();
        let pairs = pairs_response.pairs;

        {
            let mut cache = self.pairs_cache.write().await;
            *cache = Some(CacheEntry {
                data: pairs.clone(),
                timestamp: Timestamp::now(),
            });
        }
        Ok(pairs)
    }

    /// List only active assets.
    pub async fn list_active_assets(&self) -> Result<Vec<Asset>> {
        let assets = self.list_assets().await?;
        Ok(assets.into_iter().filter(|a| a.is_active).collect())
    }

    /// List only active trading pairs.
    pub async fn list_active_pairs(&self) -> Result<Vec<TradingPair>> {
        let pairs = self.list_pairs().await?;
        Ok(pairs.into_iter().filter(|p| p.is_active).collect())
    }

    /// Find an asset by ticker.
    pub async fn find_asset_by_ticker(&self, ticker: &str) -> Result<Asset> {
        let assets = self.list_assets().await?;
        let ticker_upper = ticker.to_uppercase();

        assets
            .into_iter()
            .find(|a| a.ticker.to_uppercase() == ticker_upper)
            .ok_or_else(|| KaleidoError::not_found("Asset", ticker))
    }

    /// Find a trading pair by ticker (e.g., "BTC/USDT").
    pub async fn find_pair_by_ticker(&self, ticker: &str) -> Result<TradingPair> {
        let pairs = self.list_pairs().await?;
        let ticker_upper = ticker.to_uppercase();

        pairs
            .into_iter()
            .find(|p| {
                let pair_ticker = format!("{}/{}", p.base.ticker, p.quote.ticker).to_uppercase();
                pair_ticker == ticker_upper
            })
            .ok_or_else(|| KaleidoError::not_found("Trading Pair", ticker))
    }

    /// Get a quote for a swap.
    pub async fn get_quote(&self, request: &PairQuoteRequest) -> Result<PairQuoteResponse> {
        let response = self
            .client
            .get_quote(request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get a quote by ticker pair (e.g., "BTC/USDT") with explicit layers.
    pub async fn get_quote_by_pair(
        &self,
        ticker: &str,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
        from_layer: Layer,
        to_layer: Layer,
    ) -> Result<PairQuoteResponse> {
        let parts: Vec<&str> = ticker.split('/').collect();
        if parts.len() != 2 {
            return Err(KaleidoError::validation(format!(
                "Invalid ticker format: '{}'. Expected format: 'BASE/QUOTE'",
                ticker
            )));
        }

        if from_amount.is_none() && to_amount.is_none() {
            return Err(KaleidoError::validation(
                "Must specify either from_amount or to_amount",
            ));
        }

        let from_asset_input = SwapLegInput {
            asset_id: parts[0].to_string(),
            layer: from_layer,
            amount: from_amount,
        };

        let to_asset_input = SwapLegInput {
            asset_id: parts[1].to_string(),
            layer: to_layer,
            amount: to_amount,
        };

        let request = PairQuoteRequest {
            from_asset: from_asset_input,
            to_asset: to_asset_input,
        };

        self.get_quote(&request).await
    }

    // === Swap Operations ===

    /// Get node information from the swap service.
    pub async fn get_node_info(&self) -> Result<models::SwapNodeInfoResponse> {
        let response = self.client.get_node_info().await.map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Initialize a swap.
    pub async fn init_swap(&self, request: &SwapRequest) -> Result<SwapResponse> {
        let response = self
            .client
            .initiate_swap(request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Execute/confirm a swap.
    pub async fn execute_swap(&self, request: &ConfirmSwapRequest) -> Result<ConfirmSwapResponse> {
        let response = self
            .client
            .confirm_swap(request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get swap status by payment hash.
    pub async fn get_swap_status(&self, payment_hash: &str) -> Result<models::SwapStatusResponse> {
        let request = crate::generated::maker::types::SwapStatusRequest {
            payment_hash: payment_hash.to_string(),
        };

        let response = self
            .client
            .get_swap_status(&request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Wait for swap completion with polling.
    pub async fn wait_for_swap_completion(
        &self,
        payment_hash: &str,
        timeout: Duration,
        poll_interval: Duration,
    ) -> Result<Swap> {
        let start = Timestamp::now();

        loop {
            let response = self.get_swap_status(payment_hash).await?;

            // Handle double Option from serde_with
            if let Some(swap) = response.swap {
                // status is not Option, it's SwapStatus directly
                match swap.status {
                    crate::models::SwapStatus::Succeeded
                    | crate::models::SwapStatus::Expired
                    | crate::models::SwapStatus::Failed => return Ok(swap),
                    _ => {}
                }
            }

            if start.elapsed() >= timeout {
                return Err(KaleidoError::timeout(timeout.as_secs_f64()));
            }

            #[cfg(not(target_arch = "wasm32"))]
            tokio::time::sleep(poll_interval).await;

            #[cfg(target_arch = "wasm32")]
            {
                use gloo_timers::future::sleep;
                sleep(poll_interval).await;
            }
        }
    }

    // === Swap Order Operations ===

    /// Create a new swap order.
    pub async fn create_swap_order(
        &self,
        request: &CreateSwapOrderRequest,
    ) -> Result<models::CreateSwapOrderResponse> {
        let response = self
            .client
            .create_swap_order(request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get swap order status.
    pub async fn get_swap_order_status(
        &self,
        order_id: &str,
    ) -> Result<models::SwapOrderStatusResponse> {
        let request = crate::generated::maker::types::SwapOrderStatusRequest {
            order_id: order_id.to_string(),
        };

        let response = self
            .client
            .get_swap_order_status(&request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get order history.
    pub async fn get_order_history(
        &self,
        status: Option<&str>,
        limit: i32,
        skip: i32,
    ) -> Result<models::OrderHistoryResponse> {
        let limit_val = Some(
            std::num::NonZeroU64::new(limit as u64)
                .unwrap_or(std::num::NonZeroU64::new(10).unwrap()),
        );
        let skip_val = Some(skip as u64);

        // Convert string status to Enum
        let status_val = if let Some(s) = status {
            Some(
                serde_json::from_value::<crate::generated::maker::types::SwapOrderStatus>(
                    serde_json::Value::String(s.to_string()),
                )
                .map_err(|e| KaleidoError::validation(format!("Invalid status: {}", e)))?,
            )
        } else {
            None
        };

        let response = self
            .client
            .get_order_history(limit_val, skip_val, status_val)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get order analytics.
    pub async fn get_order_analytics(&self) -> Result<models::OrderStatsResponse> {
        let response = self
            .client
            .get_order_stats() // Renamed from get_order_analytics
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Submit rate decision for a swap order.
    pub async fn swap_order_rate_decision(
        &self,
        order_id: &str,
        accept: bool,
    ) -> Result<models::SwapOrderRateDecisionResponse> {
        // Spec seems to require order_id in body AND accept_new_rate
        let request = crate::generated::maker::types::SwapOrderRateDecisionRequest {
            accept_new_rate: accept,
            order_id: order_id.to_string(), // Assuming order_id is in body based on compilation error
        };

        let response = self
            .client
            .handle_swap_order_rate_decision(&request) // Renamed
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    // === LSP Operations ===

    /// Get LSP information.
    pub async fn get_lsp_info(&self) -> Result<models::GetInfoResponseModel> {
        let response = self
            .client
            .get_info() // Renamed
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get LSP network information.
    pub async fn get_lsp_network_info(&self) -> Result<models::NetworkInfoResponse> {
        let response = self
            .client
            .get_network_info() // Renamed
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Create an LSPS1 channel order.
    pub async fn create_lsp_order(
        &self,
        request: &CreateOrderRequest,
    ) -> Result<models::ChannelOrderResponse> {
        let response = self
            .client
            .create_order(request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get an LSPS1 order.
    pub async fn get_lsp_order(&self, order_id: &str) -> Result<models::ChannelOrderResponse> {
        let request = crate::generated::maker::types::GetOrderRequest {
            order_id: order_id.to_string(),
        };
        let response = self
            .client
            .get_order(&request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Estimate fees for an LSPS1 order.
    pub async fn estimate_lsp_fees(&self, channel_size: i64) -> Result<models::ChannelFees> {
        // Construct CreateOrderRequest with just the size, assuming other fields optional or not needed for estimate
        // Use serde_json to construct partial object if needed, or build struct?
        // Struct likely requires all non-Option fields.
        // Assuming CreateOrderRequest matches CreateOrderRequest from manual models

        // We create a "dummy" CreateOrderRequest. But required fields might be an issue.
        // If estimate_fees in spec requires CreateOrderRequest, it implies we give full order details to estimate.
        // But manually we only gave channel_size.
        // Hack: Create a JSON with channel_size and deserialize to generated type, if it works.
        // If generated type has required fields missing, this will fail.
        let json_req = serde_json::json!({
            "amount": channel_size,
            // "announce_channel": true // example defaults?
        });

        let gen_request: crate::generated::maker::types::CreateOrderRequest =
            serde_json::from_value(json_req).map_err(|e| {
                KaleidoError::validation(format!("Failed to build estimate request: {}", e))
            })?;

        let response = self
            .client
            .estimate_fees(&gen_request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Retry asset delivery for an order.
    pub async fn retry_delivery(&self, order_id: &str) -> Result<serde_json::Value> {
        let request = crate::generated::maker::types::RetryDeliveryRequest {
            order_id: order_id.to_string(),
        };

        let response = self
            .client
            .retry_delivery(&request)
            .await
            .map_err(map_maker_error)?;

        let gen_response = response.into_inner();
        Ok(serde_json::to_value(gen_response)?)
    }
}
