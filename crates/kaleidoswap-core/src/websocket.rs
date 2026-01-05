//! WebSocket client for real-time quotes and updates.
//!
//! This module provides WebSocket functionality for both browser and native environments:
//! - Browser: Uses web-sys::WebSocket (via browser.rs)
//! - Native: Uses tokio-tungstenite (current implementation)

// Conditional module declarations
pub mod trait_def;

#[cfg(target_arch = "wasm32")]
pub mod browser;

#[cfg(not(target_arch = "wasm32"))]
pub mod native;

// Re-export the trait
pub use trait_def::WebSocketConnection;

// Re-export browser implementation for WASM
#[cfg(target_arch = "wasm32")]
pub use browser::BrowserWebSocket;

use crate::error::{KaleidoError, Result};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

// Only import these for native targets
#[cfg(not(target_arch = "wasm32"))]
use futures::{SinkExt, StreamExt};
#[cfg(not(target_arch = "wasm32"))]
use std::collections::HashMap;
#[cfg(not(target_arch = "wasm32"))]
use std::time::Duration;
#[cfg(not(target_arch = "wasm32"))]
use tokio::sync::{mpsc, RwLock};
#[cfg(not(target_arch = "wasm32"))]
use tokio::time;
#[cfg(not(target_arch = "wasm32"))]
use tokio_tungstenite::{connect_async, tungstenite::Message};
#[cfg(not(target_arch = "wasm32"))]
use url::Url;

/// WebSocket event types.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum WsEvent {
    /// Price update event
    PriceUpdate,
    /// Quote response event
    QuoteResponse,
    /// Swap status update
    SwapUpdate,
    /// Order status update
    OrderUpdate,
    /// Connection established
    Connected,
    /// Connection lost
    Disconnected,
    /// Error occurred
    Error,
}

/// Event handler callback type.
pub type EventHandler = Arc<dyn Fn(serde_json::Value) + Send + Sync>;

/// WebSocket message types.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WsMessage {
    /// Subscribe to a trading pair
    #[serde(rename = "subscribe")]
    Subscribe { pair_id: String },
    /// Unsubscribe from a trading pair
    #[serde(rename = "unsubscribe")]
    Unsubscribe { pair_id: String },
    /// Request a quote
    #[serde(rename = "quote_request")]
    QuoteRequest {
        from_asset: String,
        to_asset: String,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    },
    /// Price update event
    #[serde(rename = "price_update")]
    PriceUpdate { data: serde_json::Value },
    /// Quote response
    #[serde(rename = "quote_response")]
    QuoteResponse { data: serde_json::Value },
    /// Swap status update
    #[serde(rename = "swap_update")]
    SwapUpdate { data: serde_json::Value },
    /// Order status update
    #[serde(rename = "order_update")]
    OrderUpdate { data: serde_json::Value },
    /// Error message
    #[serde(rename = "error")]
    Error {
        message: String,
        code: Option<String>,
    },
    /// Ping for keepalive
    #[serde(rename = "ping")]
    Ping,
    /// Pong response
    #[serde(rename = "pong")]
    Pong,
}

/// WebSocket connection state.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectionState {
    /// Not connected
    Disconnected,
    /// Currently connecting
    Connecting,
    /// Connected and ready
    Connected,
    /// Reconnecting after disconnect
    Reconnecting,
}

/// WebSocket client configuration.
#[derive(Debug, Clone)]
pub struct WebSocketConfig {
    /// Ping interval in seconds
    pub ping_interval: u64,
    /// Reconnect automatically on disconnect
    pub auto_reconnect: bool,
    /// Maximum reconnection attempts (0 = infinite)
    pub max_reconnect_attempts: u32,
    /// Initial reconnection delay in seconds
    pub reconnect_delay: u64,
    /// Maximum reconnection delay in seconds
    pub max_reconnect_delay: u64,
}

impl Default for WebSocketConfig {
    fn default() -> Self {
        Self {
            ping_interval: 30,
            auto_reconnect: true,
            max_reconnect_attempts: 10,
            reconnect_delay: 2,
            max_reconnect_delay: 60,
        }
    }
}

/// WebSocket client for real-time updates (native platforms only).
#[cfg(not(target_arch = "wasm32"))]
pub struct WebSocketClient {
    url: Url,
    config: WebSocketConfig,
    sender: Option<mpsc::Sender<WsMessage>>,
    receiver: Arc<RwLock<Option<mpsc::Receiver<WsMessage>>>>,
    state: Arc<RwLock<ConnectionState>>,
    event_handlers: Arc<RwLock<HashMap<WsEvent, Vec<EventHandler>>>>,
    reconnect_attempts: Arc<RwLock<u32>>,
}

/// WebSocket client stub for WASM (uses BrowserWebSocket instead).
#[cfg(target_arch = "wasm32")]
pub struct WebSocketClient;

#[cfg(target_arch = "wasm32")]
impl WebSocketClient {
    /// Create a new WebSocket client (stub for WASM).
    pub fn new(_base_url: &str) -> Result<Self> {
        Ok(Self)
    }

    /// Create a new WebSocket client with custom configuration (stub for WASM).
    pub fn with_config(_base_url: &str, _config: WebSocketConfig) -> Result<Self> {
        Ok(Self)
    }

    /// Register an event handler (stub for WASM).
    pub async fn on<F>(&self, _event: WsEvent, _handler: F)
    where
        F: Fn(serde_json::Value) + Send + Sync + 'static,
    {
        // No-op for WASM
    }

    /// Connect to the WebSocket server (stub for WASM).
    pub async fn connect(&mut self) -> Result<()> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }

    /// Disconnect from the WebSocket server (stub for WASM).
    pub async fn disconnect(&mut self) -> Result<()> {
        Ok(())
    }

    /// Check if the client is connected (stub for WASM).
    pub async fn is_connected(&self) -> bool {
        false
    }

    /// Subscribe to market updates (stub for WASM).
    pub async fn subscribe<T>(&self, _subscription: T) -> Result<()> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }

    /// Unsubscribe from market updates (stub for WASM).
    pub async fn unsubscribe<T>(&self, _subscription: T) -> Result<()> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }

    /// Request a quote (stub for WASM).
    pub async fn request_quote(
        &self,
        _from_asset: &str,
        _to_asset: &str,
        _from_amount: Option<i64>,
        _to_amount: Option<i64>,
    ) -> Result<()> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }

    /// Wait for a specific event (stub for WASM).
    #[cfg(target_arch = "wasm32")]
    pub async fn wait_for_event(
        &self,
        _event: WsEvent,
        _timeout: u64,
    ) -> Result<serde_json::Value> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }

    /// Wait for a specific event (stub for non-WASM, shouldn't be called).
    #[cfg(not(target_arch = "wasm32"))]
    pub async fn wait_for_event(
        &self,
        _event: WsEvent,
        _timeout: Duration,
    ) -> Result<serde_json::Value> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }

    /// Reconnect to the WebSocket server (stub for WASM).
    pub async fn reconnect(&mut self) -> Result<()> {
        Err(KaleidoError::websocket(
            "WebSocketClient is not available on WASM. Use BrowserWebSocket instead.",
        ))
    }
}

#[cfg(not(target_arch = "wasm32"))]
impl WebSocketClient {
    /// Create a new WebSocket client with default configuration.
    pub fn new(base_url: &str) -> Result<Self> {
        Self::with_config(base_url, WebSocketConfig::default())
    }

    /// Create a new WebSocket client with custom configuration.
    pub fn with_config(base_url: &str, config: WebSocketConfig) -> Result<Self> {
        // Convert HTTP URL to WebSocket URL
        let ws_url = base_url
            .replace("https://", "wss://")
            .replace("http://", "ws://");

        // Generate a random client ID for this connection
        let client_id = uuid::Uuid::new_v4().to_string();

        // Use the correct Kaleidoswap WebSocket endpoint path
        let url = Url::parse(&format!("{}/api/v1/market/ws/{}", ws_url, client_id))
            .map_err(|e| KaleidoError::config(format!("Invalid WebSocket URL: {}", e)))?;

        Ok(Self {
            url,
            config,
            sender: None,
            receiver: Arc::new(RwLock::new(None)),
            state: Arc::new(RwLock::new(ConnectionState::Disconnected)),
            event_handlers: Arc::new(RwLock::new(HashMap::new())),
            reconnect_attempts: Arc::new(RwLock::new(0)),
        })
    }

    /// Register an event handler.
    pub async fn on<F>(&self, event: WsEvent, handler: F)
    where
        F: Fn(serde_json::Value) + Send + Sync + 'static,
    {
        let mut handlers = self.event_handlers.write().await;
        handlers
            .entry(event)
            .or_insert_with(Vec::new)
            .push(Arc::new(handler));
    }

    /// Emit an event to registered handlers.
    async fn emit_event(&self, event: WsEvent, data: serde_json::Value) {
        let handlers = self.event_handlers.read().await;
        if let Some(event_handlers) = handlers.get(&event) {
            for handler in event_handlers {
                handler(data.clone());
            }
        }
    }

    /// Get current connection state.
    pub async fn state(&self) -> ConnectionState {
        *self.state.read().await
    }

    /// Set connection state.
    async fn set_state(&self, new_state: ConnectionState) {
        let mut state = self.state.write().await;
        *state = new_state;
    }

    /// Connect to the WebSocket server.
    pub async fn connect(&mut self) -> Result<()> {
        self.set_state(ConnectionState::Connecting).await;

        match self.try_connect().await {
            Ok(()) => {
                self.set_state(ConnectionState::Connected).await;
                *self.reconnect_attempts.write().await = 0;
                self.emit_event(WsEvent::Connected, serde_json::json!({}))
                    .await;
                Ok(())
            }
            Err(e) => {
                self.set_state(ConnectionState::Disconnected).await;
                Err(e)
            }
        }
    }

    /// Try to establish WebSocket connection.
    async fn try_connect(&mut self) -> Result<()> {
        let (ws_stream, _) = connect_async(self.url.as_str())
            .await
            .map_err(|e| KaleidoError::websocket(format!("Connection failed: {}", e)))?;

        let (mut write, mut read) = ws_stream.split();

        // Create channels for communication
        let (tx_to_ws, mut rx_from_client) = mpsc::channel::<WsMessage>(32);
        let (tx_to_client, rx_from_ws) = mpsc::channel::<WsMessage>(32);

        self.sender = Some(tx_to_ws);
        *self.receiver.write().await = Some(rx_from_ws);

        // Clone necessary data for tasks
        let event_handlers = self.event_handlers.clone();
        let state = self.state.clone();
        let ping_interval = self.config.ping_interval;

        // Spawn task to handle outgoing messages
        tokio::spawn(async move {
            while let Some(msg) = rx_from_client.recv().await {
                let json = match serde_json::to_string(&msg) {
                    Ok(j) => j,
                    Err(e) => {
                        log::error!("Failed to serialize message: {}", e);
                        continue;
                    }
                };

                if let Err(e) = write.send(Message::Text(json)).await {
                    log::error!("Failed to send message: {}", e);
                    break;
                }
            }
        });

        // Spawn task to handle incoming messages
        let tx_to_client_clone = tx_to_client.clone();
        tokio::spawn(async move {
            while let Some(msg_result) = read.next().await {
                match msg_result {
                    Ok(Message::Text(text)) => match serde_json::from_str::<WsMessage>(&text) {
                        Ok(ws_msg) => {
                            if let Err(e) = tx_to_client_clone.send(ws_msg).await {
                                log::error!("Failed to forward message: {}", e);
                                break;
                            }
                        }
                        Err(e) => {
                            log::warn!("Failed to parse WebSocket message: {}", e);
                        }
                    },
                    Ok(Message::Ping(_)) => {
                        log::debug!("Received ping");
                    }
                    Ok(Message::Pong(_)) => {
                        log::debug!("Received pong");
                    }
                    Ok(Message::Close(frame)) => {
                        log::info!("WebSocket connection closed by server: {:?}", frame);
                        break;
                    }
                    Ok(_) => {}
                    Err(e) => {
                        log::error!("WebSocket error: {}", e);
                        break;
                    }
                }
            }

            // Connection lost
            *state.write().await = ConnectionState::Disconnected;

            // Emit disconnect event
            let handlers = event_handlers.read().await;
            if let Some(event_handlers) = handlers.get(&WsEvent::Disconnected) {
                for handler in event_handlers {
                    handler(serde_json::json!({"reason": "connection_lost"}));
                }
            }
        });

        // Spawn ping task
        let tx_ping = tx_to_client.clone();
        tokio::spawn(async move {
            let mut interval = time::interval(Duration::from_secs(ping_interval));
            loop {
                interval.tick().await;
                if tx_ping.send(WsMessage::Ping).await.is_err() {
                    break;
                }
            }
        });

        // Spawn message dispatcher task
        let receiver = self.receiver.clone();
        let event_handlers_clone = self.event_handlers.clone();
        tokio::spawn(async move {
            loop {
                let msg = {
                    let mut rx = receiver.write().await;
                    if let Some(ref mut rx) = *rx {
                        rx.recv().await
                    } else {
                        break;
                    }
                };

                if let Some(msg) = msg {
                    Self::dispatch_message(msg, &event_handlers_clone).await;
                } else {
                    break;
                }
            }
        });

        Ok(())
    }

    /// Dispatch incoming message to appropriate event handlers.
    async fn dispatch_message(
        msg: WsMessage,
        event_handlers: &Arc<RwLock<HashMap<WsEvent, Vec<EventHandler>>>>,
    ) {
        let (event, data) = match msg {
            WsMessage::PriceUpdate { data } => (WsEvent::PriceUpdate, data),
            WsMessage::QuoteResponse { data } => (WsEvent::QuoteResponse, data),
            WsMessage::SwapUpdate { data } => (WsEvent::SwapUpdate, data),
            WsMessage::OrderUpdate { data } => (WsEvent::OrderUpdate, data),
            WsMessage::Error { message, code } => (
                WsEvent::Error,
                serde_json::json!({"message": message, "code": code}),
            ),
            WsMessage::Pong => return,
            WsMessage::Ping => return,
            _ => return,
        };

        let handlers = event_handlers.read().await;
        if let Some(event_handlers) = handlers.get(&event) {
            for handler in event_handlers {
                handler(data.clone());
            }
        }
    }

    /// Reconnect with exponential backoff.
    pub async fn reconnect(&mut self) -> Result<()> {
        if !self.config.auto_reconnect {
            return Err(KaleidoError::websocket("Auto-reconnect is disabled"));
        }

        let current_attempts = {
            let mut attempts = self.reconnect_attempts.write().await;

            if self.config.max_reconnect_attempts > 0
                && *attempts >= self.config.max_reconnect_attempts
            {
                return Err(KaleidoError::websocket(format!(
                    "Max reconnection attempts ({}) exceeded",
                    self.config.max_reconnect_attempts
                )));
            }

            *attempts += 1;
            *attempts
        };

        self.set_state(ConnectionState::Reconnecting).await;

        // Calculate backoff delay
        let delay = std::cmp::min(
            self.config.reconnect_delay * 2_u64.pow(current_attempts - 1),
            self.config.max_reconnect_delay,
        );

        log::info!(
            "Reconnecting... (attempt {}/{}, delay: {}s)",
            current_attempts,
            if self.config.max_reconnect_attempts == 0 {
                "∞".to_string()
            } else {
                self.config.max_reconnect_attempts.to_string()
            },
            delay
        );

        time::sleep(Duration::from_secs(delay)).await;

        match self.try_connect().await {
            Ok(()) => {
                self.set_state(ConnectionState::Connected).await;
                *self.reconnect_attempts.write().await = 0;
                self.emit_event(WsEvent::Connected, serde_json::json!({}))
                    .await;
                Ok(())
            }
            Err(e) => {
                self.set_state(ConnectionState::Disconnected).await;
                Err(e)
            }
        }
    }

    /// Send a message to the WebSocket server.
    async fn send(&self, msg: WsMessage) -> Result<()> {
        let sender = self
            .sender
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        sender
            .send(msg)
            .await
            .map_err(|e| KaleidoError::websocket(format!("Failed to send message: {}", e)))?;

        Ok(())
    }

    /// Subscribe to a trading pair for price updates.
    pub async fn subscribe(&self, pair_id: &str) -> Result<()> {
        self.send(WsMessage::Subscribe {
            pair_id: pair_id.to_string(),
        })
        .await
    }

    /// Unsubscribe from a trading pair.
    pub async fn unsubscribe(&self, pair_id: &str) -> Result<()> {
        self.send(WsMessage::Unsubscribe {
            pair_id: pair_id.to_string(),
        })
        .await
    }

    /// Request a quote via WebSocket (faster than HTTP).
    pub async fn request_quote(
        &self,
        from_asset: &str,
        to_asset: &str,
        from_amount: Option<i64>,
        to_amount: Option<i64>,
    ) -> Result<()> {
        self.send(WsMessage::QuoteRequest {
            from_asset: from_asset.to_string(),
            to_asset: to_asset.to_string(),
            from_amount,
            to_amount,
        })
        .await
    }

    /// Disconnect from the WebSocket server.
    pub async fn disconnect(&mut self) {
        self.sender = None;
        *self.receiver.write().await = None;
        self.set_state(ConnectionState::Disconnected).await;
        self.emit_event(
            WsEvent::Disconnected,
            serde_json::json!({"reason": "manual"}),
        )
        .await;
    }

    /// Check if connected.
    pub async fn is_connected(&self) -> bool {
        *self.state.read().await == ConnectionState::Connected
    }

    /// Wait for a specific event with timeout.
    pub async fn wait_for_event(
        &self,
        event: WsEvent,
        timeout: Duration,
    ) -> Result<serde_json::Value> {
        let (tx, mut rx) = mpsc::channel(1);

        // Register temporary handler
        self.on(event.clone(), move |data| {
            let tx = tx.clone();
            tokio::spawn(async move {
                let _ = tx.send(data).await;
            });
        })
        .await;

        // Wait with timeout
        match time::timeout(timeout, rx.recv()).await {
            Ok(Some(data)) => Ok(data),
            Ok(None) => Err(KaleidoError::websocket("Channel closed")),
            Err(_) => Err(KaleidoError::timeout(timeout.as_secs_f64())),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_url_conversion() {
        let client = WebSocketClient::new("https://api.example.com").unwrap();
        assert!(client.url.as_str().starts_with("wss://"));
        assert!(client.url.as_str().contains("/api/v1/market/ws/"));

        let client2 = WebSocketClient::new("http://localhost:8000").unwrap();
        assert!(client2.url.as_str().starts_with("ws://"));
    }

    #[test]
    fn test_message_serialization() {
        let msg = WsMessage::Subscribe {
            pair_id: "BTC/USDT".to_string(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("subscribe"));
        assert!(json.contains("BTC/USDT"));
    }

    #[test]
    fn test_quote_request_serialization() {
        let msg = WsMessage::QuoteRequest {
            from_asset: "BTC".to_string(),
            to_asset: "USDT".to_string(),
            from_amount: Some(100000000),
            to_amount: None,
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("quote_request"));
        assert!(json.contains("BTC"));
        assert!(json.contains("USDT"));
    }

    #[test]
    fn test_config_default() {
        let config = WebSocketConfig::default();
        assert_eq!(config.ping_interval, 30);
        assert!(config.auto_reconnect);
        assert_eq!(config.max_reconnect_attempts, 10);
    }

    #[tokio::test]
    async fn test_event_handler_registration() {
        let client = WebSocketClient::new("https://api.example.com").unwrap();

        client
            .on(WsEvent::PriceUpdate, |data| {
                println!("Price update: {:?}", data);
            })
            .await;

        let handlers = client.event_handlers.read().await;
        assert!(handlers.contains_key(&WsEvent::PriceUpdate));
        assert_eq!(handlers.get(&WsEvent::PriceUpdate).unwrap().len(), 1);
    }

    #[tokio::test]
    async fn test_connection_state() {
        let client = WebSocketClient::new("https://api.example.com").unwrap();
        assert_eq!(client.state().await, ConnectionState::Disconnected);

        // Note: Actual connection will fail since it's just a test URL
        // This just tests the state management
        client.set_state(ConnectionState::Connecting).await;
        assert_eq!(client.state().await, ConnectionState::Connecting);
    }
}
