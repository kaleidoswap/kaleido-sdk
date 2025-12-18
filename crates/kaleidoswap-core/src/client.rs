//! Kaleidoswap SDK Client
//!
//! The main entry point for interacting with the Kaleidoswap protocol.

use crate::api::{
    lsp::LspApi,
    market::{MarketApi, MarketHelper},
    node::NodeApi,
    orders::OrdersApi,
    swaps::SwapsApi,
};
use crate::error::{KaleidoError, Result};
use crate::http::HttpClient;
use crate::models::{
    Asset, ChannelFees, ChannelOrderResponse, CreateOrderRequest, CreateSwapOrderRequest,
    CreateSwapOrderResponse, ConfirmSwapRequest, ConfirmSwapResponse, GetInfoResponseModel,
    Layer, NetworkInfoResponse, NodeInfoResponse, OrderHistoryResponse, OrderStatsResponse,
    PairQuoteRequest, PairQuoteResponse, Swap, SwapLegInput, SwapOrderRateDecisionResponse,
    SwapOrderStatusResponse, SwapRequest, SwapResponse, SwapStatusResponse, TradingPair,
    rgb_node,
};
use crate::retry::RetryConfig;
use crate::websocket::WebSocketClient;
use crate::KaleidoConfig;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Cache entry with timestamp.
struct CacheEntry<T> {
    data: T,
    timestamp: Instant,
}

/// The main Kaleidoswap SDK client.
pub struct KaleidoClient {
    #[allow(dead_code)]
    config: KaleidoConfig,
    #[allow(dead_code)]
    api_http: Arc<HttpClient>,
    #[allow(dead_code)]
    node_http: Option<Arc<HttpClient>>,

    // API modules
    market: MarketApi,
    swaps: SwapsApi,
    orders: OrdersApi,
    lsp: LspApi,
    node: Option<NodeApi>,

    // WebSocket client (lazy initialized)
    #[allow(dead_code)]
    ws_client: RwLock<Option<WebSocketClient>>,

    // Caches
    assets_cache: RwLock<Option<CacheEntry<Vec<Asset>>>>,
    pairs_cache: RwLock<Option<CacheEntry<Vec<TradingPair>>>>,
    cache_ttl: Duration,
}

impl KaleidoClient {
    /// Create a new Kaleidoswap client with the given configuration.
    pub fn new(config: KaleidoConfig) -> Result<Self> {
        let retry_config = RetryConfig::new(config.max_retries);
        let timeout = Duration::from_secs_f64(config.timeout);

        let api_http = Arc::new(HttpClient::new(&config.base_url, timeout, retry_config.clone())?);

        let node_http = config
            .node_url
            .as_ref()
            .map(|url| HttpClient::new(url, timeout, retry_config.clone()))
            .transpose()?
            .map(Arc::new);

        let market = MarketApi::new(api_http.clone());
        let swaps = SwapsApi::new(api_http.clone());
        let orders = OrdersApi::new(api_http.clone());
        let lsp = LspApi::new(api_http.clone());
        let node = node_http.as_ref().map(|h| NodeApi::new(h.clone()));

        Ok(Self {
            cache_ttl: Duration::from_secs(config.cache_ttl),
            config,
            api_http,
            node_http,
            market,
            swaps,
            orders,
            lsp,
            node,
            ws_client: RwLock::new(None),
            assets_cache: RwLock::new(None),
            pairs_cache: RwLock::new(None),
        })
    }

    /// Check if RGB Lightning Node is configured.
    pub fn has_node(&self) -> bool {
        self.node.is_some()
    }

    /// Get the configuration.
    pub fn config(&self) -> &KaleidoConfig {
        &self.config
    }

    // === Cache Management ===

    fn is_cache_valid(&self, timestamp: &Instant) -> bool {
        timestamp.elapsed() < self.cache_ttl
    }

    /// Refresh all caches.
    pub async fn refresh_caches(&self) -> Result<()> {
        let _ = self.list_assets_uncached().await?;
        let _ = self.list_pairs_uncached().await?;
        Ok(())
    }

    /// Get a market helper with cached asset and pair data.
    pub async fn market_helper(&self) -> Result<MarketHelper> {
        let assets = self.list_assets().await?;
        let pairs = self.list_pairs().await?;
        Ok(MarketHelper::new(assets, pairs))
    }

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
        let assets = self.market.list_assets().await?;
        {
            let mut cache = self.assets_cache.write().await;
            *cache = Some(CacheEntry {
                data: assets.clone(),
                timestamp: Instant::now(),
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
        let pairs = self.market.list_pairs().await?;
        {
            let mut cache = self.pairs_cache.write().await;
            *cache = Some(CacheEntry {
                data: pairs.clone(),
                timestamp: Instant::now(),
            });
        }
        Ok(pairs)
    }

    /// Get a quote for a swap.
    pub async fn get_quote(&self, request: &PairQuoteRequest) -> Result<PairQuoteResponse> {
        self.market.get_quote(request).await
    }

    /// Get a quote by ticker pair (e.g., "BTC/USDT").
    pub async fn get_quote_by_pair(
        &self,
        ticker: &str,
        from_amount: Option<i32>,
        to_amount: Option<i32>,
        layer: Layer,
    ) -> Result<PairQuoteResponse> {
        let parts: Vec<&str> = ticker.split('/').collect();
        if parts.len() != 2 {
            return Err(KaleidoError::validation(format!(
                "Invalid ticker format: '{}'. Expected format: 'BASE/QUOTE'",
                ticker
            )));
        }

        let assets = self.list_assets().await?;

        let find_asset_id = |ticker: &str| -> Result<String> {
            let ticker_upper = ticker.to_uppercase();
            assets
                .iter()
                .find(|a| a.ticker.to_uppercase() == ticker_upper)
                .map(|a| a.asset_id.clone())
                .ok_or_else(|| KaleidoError::not_found("Asset", ticker))
        };

        let from_id = find_asset_id(parts[0])?;
        let to_id = find_asset_id(parts[1])?;

        let from_asset = SwapLegInput {
            asset_id: from_id,
            layer: layer.clone(),
            amount: from_amount.map(Some),
        };

        let to_asset = SwapLegInput {
            asset_id: to_id,
            layer,
            amount: to_amount.map(Some),
        };

        let request = PairQuoteRequest {
            from_asset: Box::new(from_asset),
            to_asset: Box::new(to_asset),
        };

        if from_amount.is_none() && to_amount.is_none() {
            return Err(KaleidoError::validation(
                "Must specify either from_amount or to_amount",
            ));
        }

        self.get_quote(&request).await
    }

    // === Swap Operations ===

    /// Get node information from the swap service.
    pub async fn get_node_info(&self) -> Result<NodeInfoResponse> {
        self.swaps.get_node_info().await
    }

    /// Initialize a swap.
    pub async fn init_swap(&self, request: &SwapRequest) -> Result<SwapResponse> {
        self.swaps.init_swap(request).await
    }

    /// Execute/confirm a swap.
    pub async fn execute_swap(&self, request: &ConfirmSwapRequest) -> Result<ConfirmSwapResponse> {
        self.swaps.execute_swap(request).await
    }

    /// Get swap status by payment hash.
    pub async fn get_swap_status(&self, payment_hash: &str) -> Result<SwapStatusResponse> {
        self.swaps.get_swap_status(payment_hash).await
    }

    /// Wait for swap completion with polling.
    pub async fn wait_for_swap_completion(
        &self,
        payment_hash: &str,
        timeout: Duration,
        poll_interval: Duration,
    ) -> Result<Swap> {
        let start = Instant::now();

        loop {
            let response = self.get_swap_status(payment_hash).await?;

            // Handle double Option from serde_with
            if let Some(Some(swap)) = response.swap {
                // status is not Option, it's SwapStatus directly
                match swap.status {
                    crate::models::SwapStatus::Succeeded
                    | crate::models::SwapStatus::Expired
                    | crate::models::SwapStatus::Failed => return Ok(*swap),
                    _ => {}
                }
            }

            if start.elapsed() >= timeout {
                return Err(KaleidoError::timeout(timeout.as_secs_f64()));
            }

            tokio::time::sleep(poll_interval).await;
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
        let taker_pubkey = node_info.pubkey.ok_or_else(|| {
            KaleidoError::config("Node pubkey not available")
        })?;

        if self.has_node() {
            self.swaps.whitelist_trade(&init_response.swapstring).await?;
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
    ) -> Result<CreateSwapOrderResponse> {
        self.orders.create_order(request).await
    }

    /// Get swap order status.
    pub async fn get_swap_order_status(&self, order_id: &str) -> Result<SwapOrderStatusResponse> {
        self.orders.get_order_status(order_id).await
    }

    /// Get order history.
    pub async fn get_order_history(
        &self,
        status: Option<&str>,
        limit: i32,
        skip: i32,
    ) -> Result<OrderHistoryResponse> {
        self.orders.get_order_history(status, limit, skip).await
    }

    /// Get order analytics.
    pub async fn get_order_analytics(&self) -> Result<OrderStatsResponse> {
        self.orders.get_order_analytics().await
    }

    /// Submit rate decision for a swap order.
    pub async fn swap_order_rate_decision(
        &self,
        order_id: &str,
        accept: bool,
    ) -> Result<SwapOrderRateDecisionResponse> {
        self.orders.rate_decision(order_id, accept).await
    }

    // === LSP Operations ===

    /// Get LSP information.
    pub async fn get_lsp_info(&self) -> Result<GetInfoResponseModel> {
        self.lsp.get_info().await
    }

    /// Get LSP network information.
    pub async fn get_lsp_network_info(&self) -> Result<NetworkInfoResponse> {
        self.lsp.get_network_info().await
    }

    /// Create an LSPS1 channel order.
    pub async fn create_lsp_order(&self, request: &CreateOrderRequest) -> Result<ChannelOrderResponse> {
        self.lsp.create_order(request).await
    }

    /// Get an LSPS1 order.
    pub async fn get_lsp_order(&self, order_id: &str) -> Result<ChannelOrderResponse> {
        self.lsp.get_order(order_id).await
    }

    /// Estimate fees for an LSPS1 order.
    pub async fn estimate_lsp_fees(&self, channel_size: i64) -> Result<ChannelFees> {
        self.lsp.estimate_fees(channel_size).await
    }

    // === RGB Lightning Node Operations ===

    fn ensure_node(&self) -> Result<&NodeApi> {
        self.node.as_ref().ok_or(KaleidoError::NodeNotConfigured)
    }

    /// Get RGB node information.
    pub async fn get_rgb_node_info(&self) -> Result<crate::api::node::RgbNodeInfo> {
        self.ensure_node()?.get_info().await
    }

    /// List channels on the RGB node.
    pub async fn list_channels(&self) -> Result<Vec<crate::api::node::Channel>> {
        self.ensure_node()?.list_channels().await
    }

    /// Open a channel on the RGB node.
    pub async fn open_channel(&self, request: &crate::api::node::OpenChannelRequest) -> Result<serde_json::Value> {
        self.ensure_node()?.open_channel(request).await
    }

    /// Close a channel on the RGB node.
    pub async fn close_channel(&self, request: &crate::api::node::CloseChannelRequest) -> Result<serde_json::Value> {
        self.ensure_node()?.close_channel(request).await
    }

    /// List peers on the RGB node.
    pub async fn list_peers(&self) -> Result<Vec<crate::api::node::Peer>> {
        self.ensure_node()?.list_peers().await
    }

    /// Connect to a peer on the RGB node.
    pub async fn connect_peer(&self, request: &crate::api::node::ConnectPeerRequest) -> Result<serde_json::Value> {
        self.ensure_node()?.connect_peer(request).await
    }

    /// List RGB assets on the node.
    pub async fn list_node_assets(&self) -> Result<Vec<crate::api::node::RgbAsset>> {
        self.ensure_node()?.list_assets().await
    }

    /// Get asset balance from the node.
    pub async fn get_asset_balance(&self, asset_id: &str) -> Result<crate::api::node::RgbAssetBalance> {
        self.ensure_node()?.get_asset_balance(asset_id).await
    }

    /// Get a Bitcoin address from the node.
    pub async fn get_onchain_address(&self) -> Result<crate::api::node::AddressResponse> {
        self.ensure_node()?.get_address().await
    }

    /// Get BTC balance from the node.
    pub async fn get_btc_balance(&self) -> Result<crate::api::node::BtcBalance> {
        self.ensure_node()?.get_btc_balance().await
    }

    /// Whitelist a trade on the node (taker side).
    pub async fn whitelist_trade(&self, swapstring: &str) -> Result<serde_json::Value> {
        self.ensure_node()?.whitelist_trade(swapstring).await
    }

    /// Create a Lightning invoice on the node.
    pub async fn create_ln_invoice(&self, request: &crate::api::node::CreateInvoiceRequest) -> Result<crate::api::node::Invoice> {
        self.ensure_node()?.create_invoice(request).await
    }

    /// Decode a Lightning invoice.
    pub async fn decode_ln_invoice(&self, invoice: &str) -> Result<serde_json::Value> {
        self.ensure_node()?.decode_invoice(invoice).await
    }

    /// Send a keysend payment.
    pub async fn keysend(&self, request: &crate::api::node::KeysendRequest) -> Result<crate::api::node::Payment> {
        self.ensure_node()?.keysend(request).await
    }

    /// List payments on the node.
    pub async fn list_payments(&self) -> Result<Vec<crate::api::node::Payment>> {
        self.ensure_node()?.list_payments().await
    }

    /// Initialize the node.
    pub async fn init_wallet(&self, password: &str) -> Result<serde_json::Value> {
        self.ensure_node()?.init(password).await
    }

    /// Unlock the node.
    pub async fn unlock_wallet(&self, password: &str) -> Result<serde_json::Value> {
        self.ensure_node()?.unlock(password).await
    }

    /// Lock the node.
    pub async fn lock_wallet(&self) -> Result<serde_json::Value> {
        self.ensure_node()?.lock().await
    }
}
