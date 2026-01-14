use crate::error::{KaleidoError, Result};
use crate::websocket::WebSocketClient;
use crate::KaleidoConfig;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;

pub mod market;
pub mod node;

pub use market::MarketClient;
pub use node::NodeClient;

pub struct KaleidoClient {
    pub config: KaleidoConfig,
    pub market: Arc<MarketClient>,
    pub node: Option<Arc<NodeClient>>,
    pub ws_client: RwLock<Option<WebSocketClient>>,
}

impl KaleidoClient {
    pub fn new(config: KaleidoConfig) -> Result<Self> {
        let market = Arc::new(MarketClient::new(
            &config.base_url,
            Duration::from_secs(config.cache_ttl),
        ));

        let node = config
            .node_url
            .as_ref()
            .map(|url| Arc::new(NodeClient::new(url)));

        Ok(Self {
            config,
            market,
            node,
            ws_client: RwLock::new(None),
        })
    }

    pub fn has_node(&self) -> bool {
        self.node.is_some()
    }

    // Helper to get cached/live assets via MarketClient
    pub async fn list_assets(&self) -> Result<Vec<crate::models::Asset>> {
        self.market.list_assets().await
    }

    // Helper to get cached/live pairs via MarketClient
    pub async fn list_pairs(&self) -> Result<Vec<crate::models::TradingPair>> {
        self.market.list_pairs().await
    }

    pub async fn refresh_caches(&self) -> Result<()> {
        let _ = self.market.list_assets().await?;
        let _ = self.market.list_pairs().await?;
        Ok(())
    }

    // Re-expose complete_swap as it composes operations
    pub async fn complete_swap(
        &self,
        quote: &crate::models::PairQuoteResponse,
    ) -> Result<crate::models::ConfirmSwapResponse> {
        let swap_request = crate::models::SwapRequest {
            rfq_id: quote.rfq_id.clone(),
            from_asset: quote.from_asset.asset_id.clone(),
            from_amount: quote.from_asset.amount,
            to_asset: quote.to_asset.asset_id.clone(),
            to_amount: quote.to_asset.amount,
        };
        let init_response = self.market.init_swap(&swap_request).await?;

        let node_info = self.market.get_node_info().await?;
        let taker_pubkey = node_info
            .pubkey
            .ok_or_else(|| KaleidoError::config("Node pubkey not available"))?;

        if let Some(node) = &self.node {
            node.whitelist_trade(&init_response.swapstring).await?;
        }

        let confirm_request = crate::models::ConfirmSwapRequest {
            swapstring: init_response.swapstring,
            taker_pubkey,
            payment_hash: init_response.payment_hash,
        };

        self.market.execute_swap(&confirm_request).await
    }

    // === WebSocket Operations ===

    /// Initialize WebSocket connection with default configuration.
    pub async fn connect_websocket(&self) -> Result<()> {
        self.connect_websocket_with_config(crate::websocket::WebSocketConfig::default())
            .await
    }

    /// Initialize WebSocket connection with custom configuration.
    pub async fn connect_websocket_with_config(
        &self,
        config: crate::websocket::WebSocketConfig,
    ) -> Result<()> {
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
        _layer: crate::models::Layer,
    ) -> Result<crate::models::PairQuoteResponse> {
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
        let timeout = std::time::Duration::from_secs_f64(self.config.timeout);
        #[cfg(target_arch = "wasm32")]
        let timeout = (self.config.timeout * 1000.0) as u64; // Convert to milliseconds for WASM

        let data = ws_client
            .wait_for_event(crate::websocket::WsEvent::QuoteResponse, timeout)
            .await?;

        // Parse response
        serde_json::from_value(data)
            .map_err(|e| KaleidoError::validation(format!("Failed to parse quote response: {}", e)))
    }

    /// Register a WebSocket event handler.
    pub async fn on_websocket_event<F>(
        &self,
        event: crate::websocket::WsEvent,
        handler: F,
    ) -> Result<()>
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
