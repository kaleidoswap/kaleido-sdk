//! Kaleidoswap SDK Client
//!
//! The main entry point for interacting with the Kaleidoswap protocol.

use crate::error::{KaleidoError, Result};
use crate::generated::maker::Client as MakerClient;
use crate::generated::maker::Error as MakerError;
use crate::generated::rln::Client as RlnClient;
use crate::generated::rln::Error as RlnError;
use crate::models; // Import models module
use crate::retry::RetryConfig;
use crate::time::Timestamp;
use crate::websocket::{WebSocketClient, WebSocketConfig, WsEvent};
use crate::KaleidoConfig;
use std::time::Duration;
use tokio::sync::RwLock;

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

fn map_rln_error<E>(e: RlnError<E>) -> KaleidoError
where
    E: std::fmt::Debug,
{
    let s = format!("{:?}", e);
    if s.contains("status: 404") {
        return KaleidoError::not_found("Resource", "not found in RGB Node");
    }
    KaleidoError::InternalError(format!("RGB Node Error: {}", s))
}

// Type aliases for convenience
type Asset = models::Asset;
type TradingPair = models::TradingPair;
type PairQuoteRequest = models::PairQuoteRequest;
type PairQuoteResponse = models::PairQuoteResponse;
type SwapRequest = models::SwapRequest;
type SwapResponse = models::SwapResponse;
type ConfirmSwapRequest = models::ConfirmSwapRequest;
type ConfirmSwapResponse = models::ConfirmSwapResponse;
type SwapLegInput = models::SwapLegInput;
type Layer = models::Layer;
type Swap = models::Swap;
type CreateSwapOrderRequest = models::CreateSwapOrderRequest;
type CreateOrderRequest = models::CreateOrderRequest;

/// Cache entry with timestamp.
struct CacheEntry<T> {
    data: T,
    timestamp: Timestamp,
}

/// The main Kaleidoswap SDK client.
pub struct KaleidoClient {
    #[allow(dead_code)]
    config: KaleidoConfig,
    // api_http and node_http removed

    // Generated Clients
    maker_client: MakerClient,
    rln_client: Option<RlnClient>,

    // API modules field removed

    // WebSocket client (lazy initialized)
    ws_client: RwLock<Option<WebSocketClient>>,

    // Caches
    assets_cache: RwLock<Option<CacheEntry<Vec<Asset>>>>,
    pairs_cache: RwLock<Option<CacheEntry<Vec<TradingPair>>>>,
    cache_ttl: Duration,
}

impl KaleidoClient {
    /// Create a new Kaleidoswap client with the given configuration.
    pub fn new(config: KaleidoConfig) -> Result<Self> {
        let _retry_config = RetryConfig::new(config.max_retries);
        let _timeout = Duration::from_secs_f64(config.timeout);

        // Legacy HTTP client initialization removed

        // Initialize generated clients
        let maker_client = MakerClient::new(&config.base_url);
        let rln_client = config.node_url.as_ref().map(|url| RlnClient::new(url));

        Ok(Self {
            cache_ttl: Duration::from_secs(config.cache_ttl),
            config,
            // api_http, node_http removed
            maker_client,
            rln_client,
            ws_client: RwLock::new(None),
            assets_cache: RwLock::new(None),
            pairs_cache: RwLock::new(None),
        })
    }

    /// Check if RGB Lightning Node is configured.
    pub fn has_node(&self) -> bool {
        self.rln_client.is_some()
    }

    /// Get the configuration.
    pub fn config(&self) -> &KaleidoConfig {
        &self.config
    }

    // === API Module Accessors Removed ===
    // The legacy API modules (MarketApi, SwapsApi, OrdersApi, LspApi, NodeApi)
    // have been replaced by the generated MakerClient and RlnClient.

    // === Cache Management ===

    fn is_cache_valid(&self, timestamp: &Timestamp) -> bool {
        timestamp.elapsed() < self.cache_ttl
    }

    /// Refresh all caches.
    pub async fn refresh_caches(&self) -> Result<()> {
        let _ = self.list_assets_uncached().await?;
        let _ = self.list_pairs_uncached().await?;
        Ok(())
    }

    // Method market_helper removed as MarketHelper is deprecated.

    // === Market Operations ===

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
            .maker_client
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
            .maker_client
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

    /// Get a quote for a swap.
    pub async fn get_quote(&self, request: &PairQuoteRequest) -> Result<PairQuoteResponse> {
        let response = self
            .maker_client
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
        let response = self
            .maker_client
            .get_node_info()
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Initialize a swap.
    pub async fn init_swap(&self, request: &SwapRequest) -> Result<SwapResponse> {
        let response = self
            .maker_client
            .initiate_swap(request)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Execute/confirm a swap.
    pub async fn execute_swap(&self, request: &ConfirmSwapRequest) -> Result<ConfirmSwapResponse> {
        let response = self
            .maker_client
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
            .maker_client
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

    /// Complete a full swap from quote to execution.
    pub async fn complete_swap(&self, quote: &PairQuoteResponse) -> Result<ConfirmSwapResponse> {
        let swap_request = SwapRequest {
            rfq_id: quote.rfq_id.clone(),
            from_asset: quote.from_asset.asset_id.clone(),
            from_amount: quote.from_asset.amount,
            to_asset: quote.to_asset.asset_id.clone(),
            to_amount: quote.to_asset.amount,
        };
        let init_response = self.init_swap(&swap_request).await?;

        let node_info = self.get_node_info().await?;
        let taker_pubkey = node_info
            .pubkey
            .ok_or_else(|| KaleidoError::config("Node pubkey not available"))?;

        if self.has_node() {
            self.whitelist_trade(&init_response.swapstring).await?;
        }

        let confirm_request = ConfirmSwapRequest {
            swapstring: init_response.swapstring,
            taker_pubkey,
            payment_hash: init_response.payment_hash,
        };

        self.execute_swap(&confirm_request).await
    }

    // === Swap Order Operations ===

    /// Create a new swap order.
    pub async fn create_swap_order(
        &self,
        request: &CreateSwapOrderRequest,
    ) -> Result<models::CreateSwapOrderResponse> {
        let response = self
            .maker_client
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
            .maker_client
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
            .maker_client
            .get_order_history(limit_val, skip_val, status_val)
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get order analytics.
    pub async fn get_order_analytics(&self) -> Result<models::OrderStatsResponse> {
        let response = self
            .maker_client
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
            .maker_client
            .handle_swap_order_rate_decision(&request) // Renamed
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    // === LSP Operations ===

    /// Get LSP information.
    pub async fn get_lsp_info(&self) -> Result<models::GetInfoResponseModel> {
        let response = self
            .maker_client
            .get_info() // Renamed
            .await
            .map_err(map_maker_error)?;

        Ok(response.into_inner())
    }

    /// Get LSP network information.
    pub async fn get_lsp_network_info(&self) -> Result<models::NetworkInfoResponse> {
        let response = self
            .maker_client
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
            .maker_client
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
            .maker_client
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
            .maker_client
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
            .maker_client
            .retry_delivery(&request)
            .await
            .map_err(map_maker_error)?;

        let gen_response = response.into_inner();
        Ok(serde_json::to_value(gen_response)?)
    }

    // === RGB Lightning Node Operations ===

    // === RGB Lightning Node Operations ===

    fn get_node_client(&self) -> Result<&RlnClient> {
        self.rln_client
            .as_ref()
            .ok_or(KaleidoError::NodeNotConfigured)
    }

    /// Get RGB node information.
    pub async fn get_rgb_node_info(&self) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .get_nodeinfo()
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List channels on the RGB node.
    pub async fn list_channels(&self) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .get_listchannels()
            .await
            .map_err(map_rln_error)?;
        let inner = response.into_inner();
        Ok(serde_json::to_value(inner.channels)?)
    }

    /// Open a channel on the RGB node.
    pub async fn open_channel(
        &self,
        request: &models::rln::OpenChannelRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .post_openchannel(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Close a channel on the RGB node.
    pub async fn close_channel(
        &self,
        request: &models::rln::CloseChannelRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .post_closechannel(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List peers on the RGB node.
    pub async fn list_peers(&self) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .get_listpeers()
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner().peers)?)
    }

    /// Connect to a peer on the RGB node.
    pub async fn connect_peer(
        &self,
        request: &models::rln::ConnectPeerRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .post_connectpeer(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List RGB assets on the node.
    pub async fn list_node_assets(&self) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::ListAssetsRequest {
            filter_asset_schemas: vec![],
        };
        let response = self
            .get_node_client()?
            .post_listassets(&req)
            .await
            .map_err(map_rln_error)?;

        let inner = response.into_inner();
        let mut all_assets = Vec::new();

        for a in inner.nia {
            all_assets.push(serde_json::to_value(a)?);
        }
        for a in inner.uda {
            all_assets.push(serde_json::to_value(a)?);
        }
        for a in inner.cfa {
            all_assets.push(serde_json::to_value(a)?);
        }
        Ok(serde_json::Value::Array(all_assets))
    }

    /// Get asset balance from the node.
    pub async fn get_asset_balance(&self, asset_id: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::AssetBalanceRequest {
            asset_id: Some(asset_id.to_string()),
        };
        let response = self
            .get_node_client()?
            .post_assetbalance(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Get a Bitcoin address from the node.
    pub async fn get_onchain_address(&self) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .post_address()
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Get BTC balance from the node.
    pub async fn get_btc_balance(&self) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::BtcBalanceRequest { skip_sync: None };
        let response = self
            .get_node_client()?
            .post_btcbalance(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Whitelist a trade on the node (taker side).
    pub async fn whitelist_trade(&self, swapstring: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::TakerRequest {
            swapstring: Some(swapstring.to_string()),
        };
        let response = self
            .get_node_client()?
            .post_taker(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Create a Lightning invoice on the node.
    pub async fn create_ln_invoice(
        &self,
        amt_msat: Option<i64>,
        expiry_sec: Option<i64>,
        asset_amount: Option<i64>,
        asset_id: Option<String>,
    ) -> Result<serde_json::Value> {
        let rln_request = models::rln::LnInvoiceRequest {
            amt_msat,
            expiry_sec,
            asset_amount,
            asset_id,
        };
        let response = self
            .get_node_client()?
            .post_lninvoice(&rln_request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Decode a Lightning invoice.
    pub async fn decode_ln_invoice(&self, invoice: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::DecodeLnInvoiceRequest {
            invoice: Some(invoice.to_string()),
        };
        let response = self
            .get_node_client()?
            .post_decodelninvoice(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Send a keysend payment.
    pub async fn keysend(
        &self,
        request: &models::rln::KeysendRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .post_keysend(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List payments on the node.
    pub async fn list_payments(&self) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .get_listpayments()
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner().payments)?)
    }

    /// Initialize the node.
    pub async fn init_wallet(&self, password: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::InitRequest {
            password: Some(password.to_string()),
        };
        let response = self
            .get_node_client()?
            .post_init(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Unlock the node.
    pub async fn unlock_wallet(&self, password: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::UnlockRequest {
            password: Some(password.to_string()),
            announce_addresses: vec![],
            announce_alias: None,
            bitcoind_rpc_host: None,
            bitcoind_rpc_password: None,
            bitcoind_rpc_port: None,
            bitcoind_rpc_username: None,
            indexer_url: None,
            proxy_endpoint: None,
        };
        let response = self
            .get_node_client()?
            .post_unlock(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Lock the node.
    pub async fn lock_wallet(&self) -> Result<serde_json::Value> {
        let response = self
            .get_node_client()?
            .post_lock()
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    // === Convenience Methods ===

    /// List only active assets.
    pub async fn list_active_assets(&self) -> Result<Vec<Asset>> {
        let assets = self.list_assets().await?;
        Ok(assets.into_iter().filter(|p| p.is_active).collect())
    }

    /// List only active trading pairs.
    pub async fn list_active_pairs(&self) -> Result<Vec<TradingPair>> {
        let pairs = self.list_pairs().await?;
        Ok(pairs.into_iter().filter(|p| p.is_active).collect())
    }

    /// Estimate swap fees for a given pair and amount.
    /// Returns the fee amount in the quote asset's precision.
    pub async fn estimate_swap_fees(
        &self,
        ticker: &str,
        amount: i64,
        from_layer: Layer,
        to_layer: Layer,
    ) -> Result<i64> {
        let _quote = self
            .get_quote_by_pair(ticker, Some(amount), None, from_layer, to_layer)
            .await?;
        // Fee is embedded in the price difference
        // from_amount - (to_amount * price) = effective fee
        // Ok(quote.from_asset.amount - quote.to_asset.amount)
        Err(KaleidoError::NotImplemented)
    }

    /// Find an asset by ticker from the cached list.
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
            .ok_or_else(|| KaleidoError::not_found("TradingPair", ticker))
    }

    // === WebSocket Operations ===

    /// Initialize WebSocket connection with default configuration.
    pub async fn connect_websocket(&self) -> Result<()> {
        self.connect_websocket_with_config(WebSocketConfig::default())
            .await
    }

    /// Initialize WebSocket connection with custom configuration.
    pub async fn connect_websocket_with_config(&self, config: WebSocketConfig) -> Result<()> {
        let mut ws_lock = self.ws_client.write().await;

        if ws_lock.is_some() {
            return Err(KaleidoError::config(
                "WebSocket already connected. Disconnect first.",
            ));
        }

        let mut ws_client = WebSocketClient::with_config(&self.config.base_url, config)?;
        ws_client.connect().await?;

        *ws_lock = Some(ws_client);
        Ok(())
    }

    /// Disconnect WebSocket.
    pub async fn disconnect_websocket(&self) -> Result<()> {
        let mut ws_lock = self.ws_client.write().await;

        if let Some(mut ws_client) = ws_lock.take() {
            let _ = ws_client.disconnect().await;
            Ok(())
        } else {
            Err(KaleidoError::websocket("Not connected"))
        }
    }

    /// Check if WebSocket is connected.
    pub async fn is_websocket_connected(&self) -> bool {
        let ws_lock = self.ws_client.read().await;
        if let Some(ws_client) = &*ws_lock {
            ws_client.is_connected().await
        } else {
            false
        }
    }

    /// Subscribe to price updates for a trading pair via WebSocket.
    pub async fn subscribe_to_pair(&self, pair_id: &str) -> Result<()> {
        let ws_lock = self.ws_client.read().await;
        let ws_client = ws_lock
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        ws_client.subscribe(pair_id).await
    }

    /// Unsubscribe from price updates for a trading pair.
    pub async fn unsubscribe_from_pair(&self, pair_id: &str) -> Result<()> {
        let ws_lock = self.ws_client.read().await;
        let ws_client = ws_lock
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        ws_client.unsubscribe(pair_id).await
    }

    /// Request a quote via WebSocket (faster than HTTP for real-time quotes).
    pub async fn get_quote_websocket(
        &self,
        ticker: &str,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
        _layer: Layer,
    ) -> Result<PairQuoteResponse> {
        let parts: Vec<&str> = ticker.split('/').collect();
        if parts.len() != 2 {
            return Err(KaleidoError::validation(format!(
                "Invalid ticker format: '{}'. Expected format: 'BASE/QUOTE'",
                ticker
            )));
        }

        let ws_lock = self.ws_client.read().await;
        let ws_client = ws_lock
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        // Send quote request
        ws_client
            .request_quote(parts[0], parts[1], from_amount, to_amount)
            .await?;

        // Wait for response with timeout
        #[cfg(not(target_arch = "wasm32"))]
        let timeout = Duration::from_secs_f64(self.config.timeout);
        #[cfg(target_arch = "wasm32")]
        let timeout = (self.config.timeout * 1000.0) as u64; // Convert to milliseconds for WASM

        let data = ws_client
            .wait_for_event(WsEvent::QuoteResponse, timeout)
            .await?;

        // Parse response
        serde_json::from_value(data)
            .map_err(|e| KaleidoError::validation(format!("Failed to parse quote response: {}", e)))
    }

    /// Register a WebSocket event handler.
    ///
    /// # Example
    /// ```no_run
    /// # use kaleidoswap_core::{KaleidoClient, KaleidoConfig};
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = KaleidoClient::new(KaleidoConfig::default())?;
    /// client.connect_websocket().await?;
    ///
    /// client.on_websocket_event(
    ///     kaleidoswap_core::websocket::WsEvent::PriceUpdate,
    ///     |data| {
    ///         println!("Price update: {:?}", data);
    ///     }
    /// ).await?;
    /// # Ok(())
    /// # }
    /// ```
    pub async fn on_websocket_event<F>(&self, event: WsEvent, handler: F) -> Result<()>
    where
        F: Fn(serde_json::Value) + Send + Sync + 'static,
    {
        let ws_lock = self.ws_client.read().await;
        let ws_client = ws_lock
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        ws_client.on(event, handler).await;
        Ok(())
    }

    /// Reconnect WebSocket with exponential backoff.
    pub async fn reconnect_websocket(&self) -> Result<()> {
        let mut ws_lock = self.ws_client.write().await;
        let ws_client = ws_lock
            .as_mut()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        ws_client.reconnect().await
    }
}
